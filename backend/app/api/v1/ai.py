# app/api/v1/ai.py

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import Optional, List, Set
import os
import uuid
import logging

import re

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
    OutfitFromItemRequest,
    OutfitFromStyleRequest,
    BuildOutfitResponse,
    SingleOutfit,
    OutfitSlot,
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
    result = await db.execute(
        select(AIAnalysis)
        .where(AIAnalysis.clothing_item_id == item.id)
        .order_by(AIAnalysis.created_at.desc())
    )
    existing = result.scalar_one_or_none()
    if existing and existing.analysis_data:
        logger.info(f"Found existing analysis for item {item.id}")
        return existing.analysis_data

    if not item.image_url or not os.path.exists(item.image_url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item image not found",
        )

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

    ai_analysis = AIAnalysis(
        user_id=user_id,
        clothing_item_id=item.id,
        prompt=f"Auto-analyze: {item.image_url}",
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
    await db.refresh(item)
    return analysis_data


def build_search_query(item: ClothingItem, analysis_data: dict = None) -> str:
    """Строит умный поисковый запрос с минус-словами."""
    if not analysis_data:
        parts = [p for p in [item.category, item.color] if p]
        return " ".join(parts) if parts else "clothing"

    category = (analysis_data.get("category") or item.category or "").lower()
    subcategory = (analysis_data.get("subcategory") or "").lower()
    desc = ((analysis_data.get("description") or "") + " " + (item.description or "")).lower()
    analysis_text = " ".join([category, subcategory, desc])

    query_parts: List[str] = []

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

        query = " ".join(query_parts).strip()
        query += " -hoodie -sweatshirt -sweater -pullover"
        logger.info(f"[VARSITY MODE] Built search query: '{query}'")
        return query

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

    if "jacket" in category:
        query += " -hoodie -sweatshirt -sweater -pullover -cardigan"

    logger.info(f"[DEFAULT MODE] Built search query: '{query}'")
    return query if query else "clothing"



# ------------------------------
# Search query minus-words helpers
# ------------------------------

_MINUS_TOKEN_RE = re.compile(r"(?<!\S)-([a-zA-Z0-9][a-zA-Z0-9_-]{1,})")


def extract_minus_terms(search_query: str) -> List[str]:
    """Извлекает минус-слова из строки запроса (например: -hoodie -sweater)."""
    if not search_query:
        return []
    return [m.group(1).lower() for m in _MINUS_TOKEN_RE.finditer(search_query)]


def name_contains_any_term(name: str, terms: List[str]) -> bool:
    """True, если название содержит любой из terms (case-insensitive)."""
    n = (name or "").lower()
    return any(t in n for t in terms)

# ------------------------------
# Search query minus-words helpers + dedupe
# ------------------------------

_MINUS_TOKEN_RE = re.compile(r"(?<!\S)-([a-zA-Z0-9][a-zA-Z0-9_-]{1,})")


def extract_minus_terms(search_query: str) -> List[str]:
    """Извлекает минус-слова из строки запроса (например: -hoodie -sweater)."""
    if not search_query:
        return []
    return [m.group(1).lower() for m in _MINUS_TOKEN_RE.finditer(search_query)]


def name_contains_any_term(name: str, terms: List[str]) -> bool:
    """True, если название содержит любой из terms (case-insensitive)."""
    n = (name or "").lower()
    return any(t in n for t in terms)


def dedupe_by_url(products: List[dict]) -> List[dict]:
    seen = set()
    out = []
    for p in products:
        url = (p.get("url") or "").strip()
        key = url.lower() if url else (p.get("marketplace"), (p.get("name") or "").lower(), p.get("price"))
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out


def is_category_mismatch(product_name: str, source_category: str) -> bool:
    """Проверяет категорийное соответствие."""
    product_lower = product_name.lower()
    category_lower = source_category.lower()

    if "jacket" in category_lower:
        wrong_items = [
            "hoodie", "sweatshirt", "sweater", "pullover",
            "cardigan", "tshirt", "t-shirt", "shirt",
            "pants", "jeans", "shorts", "skirt"
        ]
        if any(word in product_lower for word in wrong_items):
            return True

    if any(x in category_lower for x in ["pants", "jeans", "trousers"]):
        if any(x in product_lower for x in ["jacket", "coat", "shirt", "hoodie"]):
            return True

    if "shirt" in category_lower and "shirt" not in product_lower:
        if any(x in product_lower for x in ["jacket", "coat", "pants", "jeans"]):
            return True

    return False


def calculate_similarity_score(
    product: dict,
    analysis_data: dict,
    item: ClothingItem
) -> float:
    """Считает similarity score 0-100."""
    score = 0.0
    name = product.get("name", "")
    brand = product.get("brand", "")
    product_text = f"{name} {brand}".lower()

    category = (analysis_data.get("category") or item.category or "").lower()
    subcategory = (analysis_data.get("subcategory") or "").lower()
    desc = ((analysis_data.get("description") or "") + " " + (item.description or "")).lower()
    analysis_text = " ".join([category, subcategory, desc])

    if is_category_mismatch(name, category):
        logger.debug(f"Category mismatch: '{name}' vs category '{category}'")
        return 0.0

    varsity_triggers = {
        "varsity": 18, "letterman": 12, "college": 8, "university": 6,
        "patch": 5, "chenille": 5, "wool": 5, "leather": 5,
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

        if not any(t in product_text for t in ["varsity", "letterman", "college"]):
            score -= 20

    if category:
        cat_words = [w for w in category.split() if len(w) > 3]
        if cat_words:
            matches = sum(1 for w in cat_words if w in product_text)
            if matches > 0:
                score += (matches / len(cat_words)) * 25

    colors = analysis_data.get("colors") or []
    if colors:
        col_matches = sum(1 for c in colors if c.lower() in product_text)
        if col_matches > 0:
            score += (col_matches / len(colors)) * 15

    style = (analysis_data.get("style") or "").lower()
    if style and style in product_text:
        score += 10

    sub = subcategory
    if sub:
        sub_words = [w for w in sub.split() if len(w) > 3]
        if sub_words:
            sub_matches = sum(1 for w in sub_words if w in product_text)
            if sub_matches > 0:
                score += (sub_matches / len(sub_words)) * 10

    material = (analysis_data.get("material") or "").lower()
    if material and len(material) > 3:
        mat_words = [w for w in material.split() if len(w) > 3]
        if any(w in product_text for w in mat_words):
            score += 5

    brand_src = (analysis_data.get("brand") or item.brand or "").lower()
    if brand_src and brand_src not in ["unknown", "unbranded", "none"]:
        if brand_src in product_text:
            score += 5

    return min(max(score, 0.0), 100.0)


def is_base_item_category(slot_type: str, base_category: str) -> bool:
    """Проверяет совпадение слота с базовой категорией."""
    base_lower = base_category.lower()
    slot_lower = slot_type.lower()

    category_to_slot = {
        "jacket": "outerwear", "coat": "outerwear", "blazer": "outerwear",
        "cardigan": "outerwear", "bomber": "outerwear", "varsity": "outerwear",
        "parka": "outerwear", "pants": "bottom", "jeans": "bottom",
        "trousers": "bottom", "shorts": "bottom", "skirt": "bottom",
        "shirt": "top", "t-shirt": "top", "tshirt": "top", "blouse": "top",
        "sweater": "top", "hoodie": "top", "sweatshirt": "top",
    }

    for cat_keyword, expected_slot in category_to_slot.items():
        if cat_keyword in base_lower:
            if expected_slot == slot_lower:
                return True

    return False


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
    """Поиск похожих товаров с автоанализом, фильтрацией и fallback."""

    result = await db.execute(
        select(ClothingItem).where(
            ClothingItem.id == request.item_id,
            ClothingItem.user_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    # последний анализ
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

    if not isinstance(analysis_data, dict) or not analysis_data.get("tags"):
        logger.info(f"Analyzing (or re-analyzing) item {item.id}")
        analysis_data = await auto_analyze_item(db, item, current_user.id)

    if not analysis_data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to analyze item")

    search_query = build_search_query(item, analysis_data)
    logger.info(f"Search query: '{search_query}'")

    # определяем “varsity-режим” для доп. запросов
    category = (analysis_data.get("category") or item.category or "").lower()
    subcategory = (analysis_data.get("subcategory") or "").lower()
    desc = ((analysis_data.get("description") or "") + " " + (item.description or "")).lower()
    analysis_text = " ".join([category, subcategory, desc])
    is_source_varsity = any(t in analysis_text for t in ["varsity", "letterman", "college jacket", "university jacket"])

    try:
        raw_products = await marketplace_service.search_similar(
            search_query=search_query,
            marketplaces=request.marketplaces,
            max_results_per_marketplace=request.max_results_per_marketplace,
        )
        logger.info(f"Found {len(raw_products)} raw products")

        fallback_used = False

        # fallback если прям 0 кандидатов
        if not raw_products:
            logger.warning("No products found, trying fallback with simplified query")
            fallback_query = analysis_data.get("category", "clothing")
            colors = analysis_data.get("colors") or []
            if colors:
                fallback_query = f"{colors[0]} {fallback_query}"

            raw_products = await marketplace_service.search_similar(
                search_query=fallback_query,
                marketplaces=request.marketplaces,
                max_results_per_marketplace=request.max_results_per_marketplace + 10,
            )
            fallback_used = len(raw_products) > 0
            logger.info(f"Fallback returned {len(raw_products)} products")

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

        # чистим мусорные ссылки
        clean_products = [
            p for p in raw_products
            if p.get("url") and "google.com/search" not in (p.get("url") or "")
        ]

        # применяем минус-слова вручную
        minus_terms = extract_minus_terms(search_query)
        if minus_terms and clean_products:
            before = len(clean_products)
            clean_products = [p for p in clean_products if not name_contains_any_term(p.get("name", ""), minus_terms)]
            removed = before - len(clean_products)
            if removed > 0:
                logger.info(f"Removed {removed} products by minus-words: {minus_terms}")

        # скорим
        scored_products = []
        for product in clean_products:
            product.setdefault("rating", None)
            product.setdefault("reviews_count", None)
            product.setdefault("delivery", "")

            score = calculate_similarity_score(product, analysis_data, item)
            product["similarity_score"] = round(score, 1)
            scored_products.append(product)

        scored_products.sort(key=lambda x: x.get("similarity_score", 0), reverse=True)

        effective_min_score = float(request.min_similarity_score)
        passed = [p for p in scored_products if float(p.get("similarity_score", 0) or 0) >= effective_min_score]

        logger.info(f"After filter (>={effective_min_score}): {len(passed)}/{len(scored_products)}")

        # ГЛАВНЫЙ фикс: если никто не прошёл порог — не опускаем порог в 0 сразу,
        # а пробуем 1-3 альтернативных запроса (синонимы varsity).
        if not passed and scored_products:
            logger.warning("No products passed filter; trying alternate queries before relaxing threshold")

            colors = analysis_data.get("colors") or []
            color0 = (colors[0].lower() if colors else "").strip()

            alt_queries = []
            if is_source_varsity:
                alt_queries = [
                    f"{color0} letterman jacket leather sleeves men".strip(),
                    f"{color0} college jacket wool leather men".strip(),
                    f"{color0} varsity jacket leather sleeves men".strip(),
                ]
            else:
                alt_queries = [
                    f"{color0} {category} men".strip(),
                    f"{category} men".strip(),
                ]

            alt_queries = [q for q in alt_queries if q and len(q) > 3]

            extra = []
            for q in alt_queries[:3]:
                more = await marketplace_service.search_similar(
                    search_query=q,
                    marketplaces=request.marketplaces,
                    max_results_per_marketplace=max(request.max_results_per_marketplace, 25),
                )
                extra.extend(more or [])

            merged = dedupe_by_url(scored_products + extra)

            rescored = []
            for p in merged:
                p.setdefault("rating", None)
                p.setdefault("reviews_count", None)
                p.setdefault("delivery", "")
                score = calculate_similarity_score(p, analysis_data, item)
                p["similarity_score"] = round(score, 1)
                rescored.append(p)

            rescored.sort(key=lambda x: x.get("similarity_score", 0), reverse=True)

            passed = [p for p in rescored if float(p.get("similarity_score", 0) or 0) >= effective_min_score]
            scored_products = rescored
            fallback_used = True

            logger.info(f"After ALT SEARCH filter (>={effective_min_score}): {len(passed)}/{len(scored_products)}")

        # только если и ALT SEARCH не помог — делаем relaxed fallback, но не возвращаем score=0
        relaxed_threshold_used = False
        if not passed and scored_products:
            logger.warning("No products passed filter, returning top 5 with relaxed threshold (but skipping score=0)")
            relaxed_threshold_used = True
            nonzero = [p for p in scored_products if float(p.get("similarity_score", 0) or 0) > 0]
            passed = nonzero[:5] if nonzero else scored_products[:5]
            effective_min_score = 0.0

        fallback_used = bool(fallback_used or relaxed_threshold_used)

        filtered_models = [SimilarProduct(**p) for p in passed]

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
            similar_products=filtered_models,
            total_found=len(filtered_models),
            search_query=search_query,
            min_score_filter=effective_min_score,
            fallback_used=fallback_used,
        )

    except Exception as e:
        logger.error(f"Search error: {e}", exc_info=True)
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
    """ПРИНУДИТЕЛЬНО переанализировать вещь."""
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

    logger.info(f"Force re-analyzing item {item_id}")

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

    logger.info(f"Re-analysis complete. Tags: {tags}")

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
    """Удаляет все старые анализы для вещи."""
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

    logger.info(f"Cleared all analyses for item {item_id}")
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


# ============================================================
# OUTFIT GENERATION
# ============================================================

@router.post("/outfits/from-item", response_model=BuildOutfitResponse)
async def build_outfits_from_item(
    request: OutfitFromItemRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Генерирует N образов вокруг конкретной вещи из гардероба."""
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

    result = await db.execute(
        select(AIAnalysis)
        .where(AIAnalysis.clothing_item_id == item.id)
        .order_by(AIAnalysis.created_at.desc())
    )
    existing_analysis = result.scalar_one_or_none()
    if existing_analysis and existing_analysis.analysis_data:
        analysis_data = existing_analysis.analysis_data
        logger.info(f"Loaded existing analysis for item {item.id}")
    else:
        logger.info(f"No analysis, analyzing item {item.id}")
        analysis_data = await auto_analyze_item(db, item, current_user.id)

    if not analysis_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze item"
        )

    style = request.style or analysis_data.get("style", "casual")
    season = analysis_data.get("season")
    gender = analysis_data.get("target_audience", "men").lower()

    logger.info(f"Building {request.outfits_count} outfits around item {item.id}")
    logger.info(f"Style: {style}, Season: {season}, Gender: {gender}")

    if not gemini_service or not gemini_service.model:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini AI service not available",
        )

    outfit_plan = await gemini_service.generate_outfit_plan(
        style=style,
        gender=gender,
        season=season,
        outfits_count=request.outfits_count,
        base_item_analysis=analysis_data,
        budget=request.budget,
    )

    if not outfit_plan or "outfits" not in outfit_plan:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate outfit plan"
        )

    logger.info(f"Gemini generated {len(outfit_plan['outfits'])} outfit plans")

    outfits_result = []
    total_products = 0
    seen_product_urls: Set[str] = set()
    base_category = item.category or ""

    for outfit_idx, outfit_data in enumerate(outfit_plan["outfits"]):
        logger.info(f"Processing outfit {outfit_idx + 1}: {outfit_data.get('outfit_name')}")

        slots_with_products = []

        for slot_data in outfit_data.get("slots", []):
            slot_type = slot_data.get("slot_type")

            if is_base_item_category(slot_type, base_category):
                logger.info(f"Skipping '{slot_type}' slot - base item IS this category")
                slots_with_products.append(
                    OutfitSlot(
                        slot_type=slot_type,
                        description=f"Your {item.category} (base item)",
                        search_query="",
                        must_have=[],
                        must_not_have=[],
                        color_palette=[],
                        products=[],
                    )
                )
                continue

            search_query = slot_data.get("search_query", "")
            must_not = slot_data.get("must_not_have", [])
            must_have = slot_data.get("must_have", [])

            if must_not:
                minus_words = " ".join([f"-{word.replace(' ', '')}" for word in must_not])
                search_query = f"{search_query} {minus_words}"

            logger.info(f"Searching '{slot_type}': {search_query}")

            try:
                raw_products = await marketplace_service.search_similar(
                    search_query=search_query,
                    marketplaces=request.marketplaces,
                    max_results_per_marketplace=request.max_results_per_slot,
                )

                clean_products = [
                    p for p in raw_products
                    if p.get("url") and "google.com/search" not in p["url"]
                ]

                if must_not and clean_products:
                    before_count = len(clean_products)
                    clean_products = [
                        p for p in clean_products
                        if not any(
                            bad_word.lower() in p.get("name", "").lower()
                            for bad_word in must_not
                        )
                    ]
                    if len(clean_products) < before_count:
                        logger.info(f"Filtered out {before_count - len(clean_products)} by must_not_have")

                if not clean_products:
                    logger.warning(f"No products for '{slot_type}', trying fallback")
                    fallback_query = " ".join(search_query.split()[:2]) + f" {gender}"
                    logger.info(f"Fallback: '{fallback_query}'")

                    raw_products = await marketplace_service.search_similar(
                        search_query=fallback_query,
                        marketplaces=["google_shopping"],
                        max_results_per_marketplace=request.max_results_per_slot + 5,
                    )
                    clean_products = [
                        p for p in raw_products
                        if p.get("url") and "google.com/search" not in p["url"]
                    ]
                    if must_not:
                        clean_products = [
                            p for p in clean_products
                            if not any(
                                bad_word.lower() in p.get("name", "").lower()
                                for bad_word in must_not
                            )
                        ]

                if must_have and clean_products:
                    filtered = []
                    for p in clean_products:
                        name_lower = p.get("name", "").lower()
                        if any(keyword.lower() in name_lower for keyword in must_have):
                            filtered.append(p)
                    clean_products = filtered

                unique_products = []
                for p in clean_products:
                    url = p.get("url", "")
                    if url and url not in seen_product_urls:
                        unique_products.append(p)
                        seen_product_urls.add(url)

                products = [
                    SimilarProduct(**p) 
                    for p in unique_products[:request.max_results_per_slot]
                ]

                logger.info(f"Found {len(products)} unique products")

                slots_with_products.append(
                    OutfitSlot(
                        slot_type=slot_type,
                        description=slot_data.get("description"),
                        search_query=search_query,
                        must_have=must_have,
                        must_not_have=must_not,
                        color_palette=slot_data.get("color_palette", []),
                        products=products,
                    )
                )
                total_products += len(products)

            except Exception as e:
                logger.error(f"Search failed for '{slot_type}': {e}")
                slots_with_products.append(
                    OutfitSlot(
                        slot_type=slot_type,
                        description=slot_data.get("description"),
                        search_query=search_query,
                        must_have=must_have,
                        must_not_have=must_not,
                        color_palette=slot_data.get("color_palette", []),
                        products=[],
                    )
                )

        outfit = SingleOutfit(
            outfit_name=outfit_data.get("outfit_name"),
            description=outfit_data.get("description"),
            slots=slots_with_products,
            total_products_found=sum(len(s.products) for s in slots_with_products),
        )
        outfits_result.append(outfit)

    logger.info(f"Built {len(outfits_result)} outfits with {total_products} total unique products")

    return BuildOutfitResponse(
        success=True,
        base_item=ClothingItemInfo(
            id=item.id,
            category=item.category,
            color=item.color,
            brand=item.brand,
            description=item.description,
            image_url=item.image_url,
        ),
        style=style,
        outfits=outfits_result,
        total_outfits=len(outfits_result),
        total_products_found=total_products,
    )


@router.post("/outfits/from-style", response_model=BuildOutfitResponse)
async def build_outfits_from_style(
    request: OutfitFromStyleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Генерирует N образов с нуля по заданному стилю."""
    logger.info(f"Building {request.outfits_count} outfits from scratch")
    logger.info(f"Style: {request.style}, Gender: {request.gender}, Season: {request.season}")

    if not gemini_service or not gemini_service.model:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini AI service not available",
        )

    outfit_plan = await gemini_service.generate_outfit_plan(
        style=request.style,
        gender=request.gender,
        season=request.season,
        outfits_count=request.outfits_count,
        base_item_analysis=None,
        budget=request.budget,
    )

    if not outfit_plan or "outfits" not in outfit_plan:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate outfit plan"
        )

    logger.info(f"Gemini generated {len(outfit_plan['outfits'])} outfit plans")

    outfits_result = []
    total_products = 0
    seen_product_urls: Set[str] = set()

    for outfit_data in outfit_plan["outfits"]:
        slots_with_products = []

        for slot_data in outfit_data.get("slots", []):
            search_query = slot_data.get("search_query", "")
            must_not = slot_data.get("must_not_have", [])
            must_have = slot_data.get("must_have", [])

            if must_not:
                minus_words = " ".join([f"-{word.replace(' ', '')}" for word in must_not])
                search_query = f"{search_query} {minus_words}"

            logger.info(f"Searching '{slot_data.get('slot_type')}': {search_query}")

            try:
                raw_products = await marketplace_service.search_similar(
                    search_query=search_query,
                    marketplaces=request.marketplaces,
                    max_results_per_marketplace=request.max_results_per_slot,
                )

                clean_products = [
                    p for p in raw_products
                    if p.get("url") and "google.com/search" not in p["url"]
                ]

                if must_not and clean_products:
                    clean_products = [
                        p for p in clean_products
                        if not any(
                            bad_word.lower() in p.get("name", "").lower()
                            for bad_word in must_not
                        )
                    ]

                if not clean_products:
                    logger.warning("Empty, trying fallback")
                    fallback_query = " ".join(search_query.split()[:2]) + f" {request.gender}"
                    raw_products = await marketplace_service.search_similar(
                        search_query=fallback_query,
                        marketplaces=["google_shopping"],
                        max_results_per_marketplace=request.max_results_per_slot + 5,
                    )
                    clean_products = [
                        p for p in raw_products
                        if p.get("url") and "google.com/search" not in p["url"]
                    ]
                    if must_not:
                        clean_products = [
                            p for p in clean_products
                            if not any(
                                bad_word.lower() in p.get("name", "").lower()
                                for bad_word in must_not
                            )
                        ]

                if must_have and clean_products:
                    filtered = []
                    for p in clean_products:
                        name_lower = p.get("name", "").lower()
                        if any(keyword.lower() in name_lower for keyword in must_have):
                            filtered.append(p)
                    clean_products = filtered

                unique_products = []
                for p in clean_products:
                    url = p.get("url", "")
                    if url and url not in seen_product_urls:
                        unique_products.append(p)
                        seen_product_urls.add(url)

                products = [
                    SimilarProduct(**p) 
                    for p in unique_products[:request.max_results_per_slot]
                ]

                logger.info(f"Found {len(products)} products")

                slots_with_products.append(
                    OutfitSlot(
                        slot_type=slot_data.get("slot_type"),
                        description=slot_data.get("description"),
                        search_query=search_query,
                        must_have=must_have,
                        must_not_have=must_not,
                        color_palette=slot_data.get("color_palette", []),
                        products=products,
                    )
                )
                total_products += len(products)

            except Exception as e:
                logger.error(f"Search failed: {e}")
                slots_with_products.append(
                    OutfitSlot(
                        slot_type=slot_data.get("slot_type"),
                        description=slot_data.get("description"),
                        search_query=search_query,
                        must_have=must_have,
                        must_not_have=must_not,
                        color_palette=slot_data.get("color_palette", []),
                        products=[],
                    )
                )

        outfit = SingleOutfit(
            outfit_name=outfit_data.get("outfit_name"),
            description=outfit_data.get("description"),
            slots=slots_with_products,
            total_products_found=sum(len(s.products) for s in slots_with_products),
        )
        outfits_result.append(outfit)

    logger.info(f"Built {len(outfits_result)} outfits with {total_products} total products")

    return BuildOutfitResponse(
        success=True,
        base_item=None,
        style=request.style,
        outfits=outfits_result,
        total_outfits=len(outfits_result),
        total_products_found=total_products,
    )
