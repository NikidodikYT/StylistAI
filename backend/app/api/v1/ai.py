# app/api/v1/ai.py

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import Optional, List
import os
import uuid
import logging

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.clothing import ClothingItem
from app.models.ai_analysis import AIAnalysis
from app.services.gemini_service import gemini_service
from app.services.marketplace_service import marketplace_service
from app.schemas.ai import (
    AnalyzeImageResponse,
    ClothingAnalysis,
    FindSimilarRequest,
    FindSimilarResponse,
    SimilarProduct,
    ClothingItemInfo,
    AnalysisListResponse,
    AnalysisListItem,
)

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads/clothing"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

async def save_uploaded_file(file: UploadFile) -> str:
    """Сохраняет загруженный файл."""
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return file_path


async def create_ai_analysis(
    db: AsyncSession,
    user_id: int,
    file_path: str,
    analysis_data: dict,
    item_id: Optional[int] = None,
) -> AIAnalysis:
    """Создаёт запись анализа в БД."""
    ai_analysis = AIAnalysis(
        user_id=user_id,
        prompt=f"Analyze clothing image: {file_path}",
        response=str(analysis_data),
        analysis_data=analysis_data,
        model_used="gemini-2.0-flash",
        clothing_item_id=item_id,
    )
    
    db.add(ai_analysis)
    await db.flush()
    return ai_analysis


async def save_to_wardrobe(
    db: AsyncSession,
    user_id: int,
    file_path: str,
    analysis_data: dict,
) -> Optional[int]:
    """Сохраняет вещь в гардероб."""
    try:
        clothing_item = ClothingItem(
            user_id=user_id,
            category=analysis_data.get("category", "unknown"),
            color=", ".join(analysis_data.get("colors", [])),
            brand=analysis_data.get("brand"),
            description=analysis_data.get("description", ""),
            image_url=file_path,
        )
        
        db.add(clothing_item)
        await db.flush()
        logger.info(f"Saved to wardrobe: user={user_id}, item={clothing_item.id}")
        return clothing_item.id
    except Exception as e:
        logger.error(f"Failed to save to wardrobe: {e}")
        return None


async def auto_analyze_item(
    db: AsyncSession,
    item: ClothingItem,
    user_id: int
) -> dict:
    """Автоанализ вещи через Gemini если анализа нет."""
    
    # Проверяем существующий анализ
    result = await db.execute(
        select(AIAnalysis)
        .where(AIAnalysis.clothing_item_id == item.id)
        .order_by(AIAnalysis.created_at.desc())
    )
    
    existing = result.scalar_one_or_none()
    if existing and existing.analysis_data:
        logger.info(f"Found existing analysis for item {item.id}")
        return existing.analysis_data
    
    # Проверяем файл
    if not item.image_url or not os.path.exists(item.image_url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item image not found",
        )
    
    # Анализируем
    logger.info(f"Auto-analyzing item {item.id}")
    if not gemini_service or not gemini_service.model:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini AI service not available",
        )
    
    analysis_data = await gemini_service.analyze_clothing_image(item.image_url)
    if not analysis_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze image",
        )
    
    # Сохраняем анализ
    ai_analysis = AIAnalysis(
        user_id=user_id,
        clothing_item_id=item.id,
        prompt=f"Auto-analyze: {item.image_url}",
        response=str(analysis_data),
        analysis_data=analysis_data,
        model_used="gemini-2.0-flash",
    )
    
    db.add(ai_analysis)
    
    # Обновляем вещь
    item.category = analysis_data.get("category") or item.category
    item.color = ", ".join(analysis_data.get("colors", [])) or item.color
    item.brand = analysis_data.get("brand") or item.brand
    item.description = analysis_data.get("description") or item.description
    
    await db.commit()
    await db.refresh(item)
    
    return analysis_data


def build_search_query(item: ClothingItem, analysis_data: dict = None) -> str:
    """
    Строит умный поисковый запрос с минус-словами.
    Специальный режим для varsity / letterman / college jackets.
    """
    if not analysis_data:
        parts = [p for p in [item.category, item.color] if p]
        return " ".join(parts) if parts else "clothing"
    
    category = (analysis_data.get("category") or item.category or "").lower()
    subcategory = (analysis_data.get("subcategory") or "").lower()
    desc = ((analysis_data.get("description") or "") + " " + (item.description or "")).lower()
    analysis_text = " ".join([category, subcategory, desc])
    
    query_parts: List[str] = []
    
    # ----- VARSITY SPECIAL MODE -----
    varsity_triggers = ["varsity", "letterman", "college jacket", "university jacket"]
    is_varsity = any(t in analysis_text for t in varsity_triggers)
    
    if is_varsity:
        colors = analysis_data.get("colors") or []
        if colors:
            query_parts.append(colors[0].lower())
        
        query_parts.append("varsity jacket")
        
        material = (analysis_data.get("material") or "").lower()
        details = (analysis_data.get("details") or "").lower()
        combo = material + " " + details
        
        detail_words: List[str] = []
        for w in ["wool", "leather", "patch", "embroidered", "college", "university"]:
            if w in combo and w not in detail_words:
                detail_words.append(w)
        
        if detail_words:
            query_parts.extend(detail_words[:2])
        
        target = (analysis_data.get("target_audience") or "").lower()
        if target in ["men", "women"]:
            query_parts.append(target)
        
        # МИНУС-СЛОВА для varsity: убираем худи, свитшоты
        query = " ".join(query_parts).strip()
        query += " -hoodie -sweatshirt -sweater -pullover"
        
        logger.info(f"[VARSITY MODE] Built search query: '{query}'")
        return query
    
    # ----- DEFAULT MODE -----
    query_parts = []
    
    if category and category not in ["unknown", "none"]:
        query_parts.append(category)
    
    colors = analysis_data.get("colors") or []
    if colors:
        query_parts.insert(0, colors[0].lower())
    elif item.color:
        query_parts.insert(0, item.color.split(",")[0].strip().lower())
    
    style = analysis_data.get("style")
    if style and style.lower() not in ["unknown", "none"]:
        query_parts.append(style.lower())
    
    target = (analysis_data.get("target_audience") or "").lower()
    if target in ["men", "women"]:
        query_parts.append(target)
    
    query = " ".join(query_parts).strip()
    
    # МИНУС-СЛОВА для любых jacket: убираем худи/свитшоты
    if "jacket" in category:
        query += " -hoodie -sweatshirt -sweater -pullover -cardigan"
    
    logger.info(f"[DEFAULT MODE] Built search query: '{query}'")
    return query if query else "clothing"


def is_category_mismatch(product_name: str, source_category: str) -> bool:
    """
    Проверяет, не попал ли товар неправильной категории.
    Например, hoodie когда ищем jacket.
    """
    product_lower = product_name.lower()
    category_lower = source_category.lower()
    
    # Если ищем jacket, а нашли худи/свитшот - это мусор
    if "jacket" in category_lower:
        wrong_items = [
            "hoodie", "sweatshirt", "sweater", "pullover", 
            "cardigan", "tshirt", "t-shirt", "shirt",
            "pants", "jeans", "shorts", "skirt"
        ]
        if any(word in product_lower for word in wrong_items):
            return True
    
    # Если ищем pants/jeans, а нашли jacket/shirt - мусор
    if any(x in category_lower for x in ["pants", "jeans", "trousers"]):
        if any(x in product_lower for x in ["jacket", "coat", "shirt", "hoodie"]):
            return True
    
    # Если ищем shirt, а нашли jacket/pants - мусор
    if "shirt" in category_lower and "shirt" not in product_lower:
        if any(x in product_lower for x in ["jacket", "coat", "pants", "jeans"]):
            return True
    
    return False


def calculate_similarity_score(
    product: dict,
    analysis_data: dict,
    item: ClothingItem
) -> float:
    """
    Считает similarity score 0-100 с жёсткой категорийной проверкой.
    """
    score = 0.0
    
    name = product.get("name", "")
    brand = product.get("brand", "")
    product_text = f"{name} {brand}".lower()
    
    category = (analysis_data.get("category") or item.category or "").lower()
    subcategory = (analysis_data.get("subcategory") or "").lower()
    desc = ((analysis_data.get("description") or "") + " " + (item.description or "")).lower()
    analysis_text = " ".join([category, subcategory, desc])
    
    # ===== КАТЕГОРИЙНАЯ ПРОВЕРКА (ЖЁСТКАЯ) =====
    if is_category_mismatch(name, category):
        logger.debug(f"Category mismatch: '{name}' vs category '{category}'")
        return 0.0  # Сразу режем неподходящую категорию
    
    # ----- 1. Varsity-матрица (до 40 баллов) -----
    varsity_triggers = {
        "varsity": 18,
        "letterman": 12,
        "college": 8,
        "university": 6,
        "patch": 5,
        "chenille": 5,
        "wool": 5,
        "leather": 5,
    }
    
    is_source_varsity = any(
        k in analysis_text
        for k in ["varsity", "letterman", "college jacket", "university jacket"]
    )
    
    if is_source_varsity:
        varsity_score = 0.0
        for word, weight in varsity_triggers.items():
            if word in product_text:
                varsity_score += weight
        varsity_score = min(varsity_score, 40.0)
        score += varsity_score
        
        # Штраф если ищем varsity, но в товаре этого нет
        if not any(t in product_text for t in ["varsity", "letterman", "college"]):
            score -= 20
    
    # ----- 2. Категория (до 25 баллов) -----
    if category:
        cat_words = [w for w in category.split() if len(w) > 3]
        if cat_words:
            matches = sum(1 for w in cat_words if w in product_text)
            if matches > 0:
                score += (matches / len(cat_words)) * 25
    
    # ----- 3. Цвета (до 15 баллов) -----
    colors = analysis_data.get("colors") or []
    if colors:
        col_matches = sum(1 for c in colors if c.lower() in product_text)
        if col_matches > 0:
            score += (col_matches / len(colors)) * 15
    
    # ----- 4. Стиль (до 10 баллов) -----
    style = (analysis_data.get("style") or "").lower()
    if style and style in product_text:
        score += 10
    
    # ----- 5. Subcategory (до 10 баллов) -----
    sub = subcategory
    if sub:
        sub_words = [w for w in sub.split() if len(w) > 3]
        if sub_words:
            sub_matches = sum(1 for w in sub_words if w in product_text)
            if sub_matches > 0:
                score += (sub_matches / len(sub_words)) * 10
    
    # ----- 6. Материал (до 5 баллов) -----
    material = (analysis_data.get("material") or "").lower()
    if material and len(material) > 3:
        mat_words = [w for w in material.split() if len(w) > 3]
        if any(w in product_text for w in mat_words):
            score += 5
    
    # ----- 7. Бренд (до 5 баллов) -----
    brand_src = (analysis_data.get("brand") or item.brand or "").lower()
    if brand_src and brand_src not in ["unknown", "unbranded", "none"]:
        if brand_src in product_text:
            score += 5
    
    return min(max(score, 0.0), 100.0)


# ============================================================
# ENDPOINTS
# ============================================================

@router.post("/analyze-image", response_model=AnalyzeImageResponse)
async def analyze_image(
    file: UploadFile = File(...),
    save_to_wardrobe_flag: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Анализ изображения одежды через Gemini AI."""
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image",
        )
    
    file_path: Optional[str] = None
    try:
        file_path = await save_uploaded_file(file)
        
        if not gemini_service or not gemini_service.model:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Gemini AI service not available",
            )
        
        analysis_data = await gemini_service.analyze_clothing_image(file_path)
        if not analysis_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to analyze image",
            )
        
        item_id: Optional[int] = None
        if save_to_wardrobe_flag:
            item_id = await save_to_wardrobe(
                db, current_user.id, file_path, analysis_data
            )
        
        ai_analysis = await create_ai_analysis(
            db, current_user.id, file_path, analysis_data, item_id
        )
        
        await db.commit()
        
        return AnalyzeImageResponse(
            success=True,
            analysis_id=ai_analysis.id,
            item_id=item_id,
            saved_to_wardrobe=save_to_wardrobe_flag and item_id is not None,
            clothing=ClothingAnalysis(**analysis_data),
            image_path=file_path,
            created_at=ai_analysis.created_at,
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        await db.rollback()
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}",
        )


@router.post("/find-similar", response_model=FindSimilarResponse)
async def find_similar_products(
    request: FindSimilarRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Поиск похожих товаров с автоанализом, фильтрацией и fallback.
    """
    
    # 1. Получаем вещь
    result = await db.execute(
        select(ClothingItem).where(
            ClothingItem.id == request.item_id,
            ClothingItem.user_id == current_user.id,
        )
    )
    
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    
    # 2. ВСЕГДА загружаем или создаём анализ с тегами
    result = await db.execute(
        select(AIAnalysis)
        .where(AIAnalysis.clothing_item_id == item.id)
        .order_by(AIAnalysis.created_at.desc())
    )
    
    existing_analysis = result.scalar_one_or_none()
    analysis_data = None
    
    if existing_analysis and existing_analysis.analysis_data:
        analysis_data = existing_analysis.analysis_data
        logger.info(f"Loaded existing analysis for item {item.id}")
        
        if "tags" not in analysis_data or not analysis_data.get("tags"):
            logger.warning(f"Old analysis without tags, re-analyzing item {item.id}")
            analysis_data = await auto_analyze_item(db, item, current_user.id)
    else:
        logger.info(f"No analysis for item {item.id}, analyzing now")
        analysis_data = await auto_analyze_item(db, item, current_user.id)
    
    if not analysis_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze item"
        )
    
    # 3. Строим запрос
    search_query = build_search_query(item, analysis_data)
    logger.info(f"🔍 Search query: '{search_query}'")
    logger.info(f"📝 Analysis tags: {analysis_data.get('tags', [])}")
    
    # 4. Ищем товары
    try:
        raw_products = await marketplace_service.search_similar(
            search_query=search_query,
            marketplaces=request.marketplaces,
            max_results_per_marketplace=request.max_results_per_marketplace,
        )
        
        logger.info(f"✅ Found {len(raw_products)} raw products")
        
        fallback_used = False
        
        # Если ничего не нашли — пробуем fallback с упрощённым запросом
        if not raw_products:
            logger.warning("❌ No products found, trying fallback with simplified query")
            
            # Упрощённый запрос: только категория + цвет
            fallback_query = analysis_data.get("category", "clothing")
            colors = analysis_data.get("colors") or []
            if colors:
                fallback_query = f"{colors[0]} {fallback_query}"
            
            logger.info(f"🔄 Fallback query: '{fallback_query}'")
            
            raw_products = await marketplace_service.search_similar(
                search_query=fallback_query,
                marketplaces=request.marketplaces,
                max_results_per_marketplace=request.max_results_per_marketplace + 5,
            )
            
            fallback_used = len(raw_products) > 0
            logger.info(f"🔄 Fallback returned {len(raw_products)} products")
        
        # Если всё ещё пусто — отдаём пустой результат
        if not raw_products:
            return FindSimilarResponse(
                success=True,
                item=ClothingItemInfo(
                    id=item.id,
                    category=item.category,
                    color=item.color,
                    brand=item.brand,
                    description=item.description,
                    image_url=item.image_url,
                ),
                similar_products=[],
                total_found=0,
                search_query=search_query,
                min_score_filter=request.min_similarity_score,
                fallback_used=False,
            )
        
        # 5. ПОСТ-ФИЛЬТРАЦИЯ: убираем google.com/search ссылки
        clean_products = [
            p for p in raw_products
            if p.get("url") and "google.com/search" not in p["url"]
        ]
        
        if len(clean_products) < len(raw_products):
            logger.info(
                f"🧹 Removed {len(raw_products) - len(clean_products)} "
                f"products with google.com/search URLs"
            )
        
        # 6. Фильтруем и ранжируем
        scored_products = []
        for product in clean_products:
            score = calculate_similarity_score(product, analysis_data, item)
            product["similarity_score"] = round(score, 1)
            scored_products.append(product)
        
        scored_products.sort(key=lambda x: x.get("similarity_score", 0), reverse=True)
        
        # Логируем топ результатов
        for i, p in enumerate(scored_products[:5]):
            logger.info(
                f"🏆 Top {i+1}: {p.get('name')[:60]} - "
                f"Score: {p.get('similarity_score')}"
            )
        
        # Применяем порог similarity
        filtered = [
            SimilarProduct(**p) for p in scored_products
            if p.get("similarity_score", 0) >= request.min_similarity_score
        ]
        
        logger.info(
            f"✂️ After filter (>={request.min_similarity_score}): "
            f"{len(filtered)}/{len(scored_products)} products"
        )
        
        # Если после фильтра пусто, но есть результаты — отдаём топ-5 с пониженным порогом
        if not filtered and scored_products:
            logger.warning(
                "⚠️ No products passed filter, returning top 5 with lower threshold"
            )
            filtered = [SimilarProduct(**p) for p in scored_products[:5]]
        
        return FindSimilarResponse(
            success=True,
            item=ClothingItemInfo(
                id=item.id,
                category=item.category,
                color=item.color,
                brand=item.brand,
                description=item.description,
                image_url=item.image_url,
            ),
            similar_products=filtered,
            total_found=len(filtered),
            search_query=search_query,
            min_score_filter=request.min_similarity_score,
            fallback_used=fallback_used,
        )
    
    except Exception as e:
        logger.error(f"❌ Search error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}",
        )


@router.post("/re-analyze/{item_id}")
async def re_analyze_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """ПРИНУДИТЕЛЬНО переанализировать вещь (для получения тегов)."""
    
    result = await db.execute(
        select(ClothingItem).where(
            ClothingItem.id == item_id,
            ClothingItem.user_id == current_user.id,
        )
    )
    
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    if not item.image_url or not os.path.exists(item.image_url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image not found"
        )
    
    logger.info(f"🔄 Force re-analyzing item {item_id}")
    
    if not gemini_service or not gemini_service.model:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini AI not available"
        )
    
    analysis_data = await gemini_service.analyze_clothing_image(item.image_url)
    if not analysis_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analysis failed"
        )
    
    ai_analysis = AIAnalysis(
        user_id=current_user.id,
        clothing_item_id=item.id,
        prompt=f"Force re-analyze: {item.image_url}",
        response=str(analysis_data),
        analysis_data=analysis_data,
        model_used="gemini-2.0-flash",
    )
    
    db.add(ai_analysis)
    
    item.category = analysis_data.get("category") or item.category
    item.color = ", ".join(analysis_data.get("colors", [])) or item.color
    item.brand = analysis_data.get("brand") or item.brand
    item.description = analysis_data.get("description") or item.description
    
    await db.commit()
    
    tags = analysis_data.get("tags", [])
    search_query = " ".join(tags[:5]) if tags else "unknown"
    
    logger.info(f"✅ Re-analysis complete. Tags: {tags}")
    
    return {
        "success": True,
        "message": "Re-analyzed successfully",
        "item_id": item_id,
        "category": analysis_data.get("category"),
        "tags": tags,
        "search_query": search_query,
        "colors": analysis_data.get("colors", []),
        "style": analysis_data.get("style"),
    }


@router.delete("/clear-analysis/{item_id}")
async def clear_old_analysis(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Удаляет все старые анализы для вещи (для отладки)."""
    
    result = await db.execute(
        select(ClothingItem).where(
            ClothingItem.id == item_id,
            ClothingItem.user_id == current_user.id,
        )
    )
    
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await db.execute(
        delete(AIAnalysis).where(AIAnalysis.clothing_item_id == item_id)
    )
    
    await db.commit()
    
    logger.info(f"🗑️ Cleared all analyses for item {item_id}")
    
    return {"success": True, "message": f"Cleared analyses for item {item_id}"}


@router.get("/analyses", response_model=AnalysisListResponse)
async def get_user_analyses(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Список анализов пользователя."""
    
    result = await db.execute(
        select(AIAnalysis)
        .where(AIAnalysis.user_id == current_user.id)
        .order_by(AIAnalysis.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    
    analyses = result.scalars().all()
    
    analyses_list = [
        AnalysisListItem(
            id=a.id,
            clothing=ClothingAnalysis(**a.analysis_data) if a.analysis_data else None,
            saved_to_wardrobe=a.clothing_item_id is not None,
            created_at=a.created_at,
        )
        for a in analyses
        if a.analysis_data
    ]
    
    return AnalysisListResponse(total=len(analyses_list), analyses=analyses_list)
