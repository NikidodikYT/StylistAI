from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import os
import uuid
from pathlib import Path

from app.db.session import get_db
from app.models.user import User
from app.schemas.clothing import AIAnalysisResponse, ClothingItemCreate
from app.services.clothing_service import clothing_service
from app.services.gemini_service import gemini_service
from app.api.v1.auth import get_current_user

router = APIRouter()

TEMP_DIR = Path("uploads/temp")
TEMP_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


@router.get("/status")
async def ai_status():
    """Проверка статуса AI сервиса"""
    return gemini_service.get_status()


@router.post("/analyze-image", response_model=AIAnalysisResponse)
async def analyze_clothing_image(
    file: UploadFile = File(...),
    save_to_wardrobe: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Анализ фото одежды через Gemini AI"""
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if file.filename:
        ext = file.filename.split(".")[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    await file.seek(0)
    
    file_extension = file.filename.split(".")[-1] if file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    temp_path = TEMP_DIR / unique_filename
    
    with open(temp_path, "wb") as buffer:
        buffer.write(content)
    
    result = await gemini_service.analyze_clothing_image(str(temp_path))
    
    if not result["success"]:
        os.remove(temp_path)
        error_detail = result.get("error", "Unknown error")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {error_detail}")
    
    analysis_data = result.get("analysis", {})
    raw_response = str(analysis_data) if isinstance(analysis_data, dict) else str(result)
    
    analysis = await clothing_service.create_analysis(
        db=db,
        user_id=current_user.id,
        prompt="Analyze clothing item from image",
        response=raw_response,
        analysis_data=analysis_data,
        model_used=result.get("model", "gemini-2.5-flash-lite")
    )
    
    if save_to_wardrobe and analysis_data:
        perm_dir = Path("uploads/clothing")
        perm_dir.mkdir(parents=True, exist_ok=True)
        perm_path = perm_dir / unique_filename
        os.rename(temp_path, perm_path)
        
        colors_list = analysis_data.get("colors") or analysis_data.get("color", [])
        colors_str = ", ".join(colors_list) if isinstance(colors_list, list) else str(colors_list)
        
        clothing_data = ClothingItemCreate(
            category=analysis_data.get("category", "unknown"),
            color=colors_str,
            description=analysis_data.get("description", "")
        )
        
        item = await clothing_service.create_clothing_item(
            db=db,
            user_id=current_user.id,
            image_url=str(perm_path),
            data=clothing_data
        )
        
        analysis.clothing_item_id = item.id
        await db.commit()
        await db.refresh(analysis)
    else:
        os.remove(temp_path)
    
    return analysis


@router.get("/recommendations")
async def get_outfit_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить AI рекомендации нарядов на основе гардероба"""
    wardrobe = await clothing_service.get_user_wardrobe(
        db=db,
        user_id=current_user.id,
        limit=50
    )
    
    if not wardrobe:
        raise HTTPException(
            status_code=400,
            detail="Wardrobe is empty. Upload some clothing items first!"
        )
    
    wardrobe_dicts = [
        {
            "id": item.id,
            "category": item.category,
            "color": item.color,
            "description": getattr(item, 'description', '')
        }
        for item in wardrobe
    ]
    
    result = await gemini_service.generate_outfit_recommendations(wardrobe_dicts)
    
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "Failed to generate recommendations")
        )
    
    return {
        "recommendations": result.get("recommendations", {}),
        "wardrobe_count": len(wardrobe),
        "based_on_items": [
            {"id": item.id, "category": item.category, "color": item.color}
            for item in wardrobe[:10]
        ]
    }


@router.post("/outfit-for-occasion")
async def outfit_for_occasion(
    occasion: str = Body(..., embed=True),
    weather: str = Body(default="normal", embed=True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Генерация наряда для конкретного случая"""
    wardrobe = await clothing_service.get_user_wardrobe(
        db=db,
        user_id=current_user.id,
        limit=50
    )
    
    if not wardrobe:
        raise HTTPException(status_code=400, detail="Wardrobe is empty")
    
    wardrobe_dicts = [
        {"category": item.category, "color": item.color}
        for item in wardrobe
    ]
    
    result = await gemini_service.generate_outfit_recommendations(
        wardrobe_items=wardrobe_dicts,
        occasion=occasion,
        weather=weather
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "Failed to generate outfit")
        )
    
    return {
        "occasion": occasion,
        "weather": weather,
        "outfit": result.get("recommendations", {}),
        "wardrobe_count": len(wardrobe)
    }


@router.get("/history", response_model=List[AIAnalysisResponse])
async def get_analysis_history(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """История всех AI анализов пользователя"""
    analyses = await clothing_service.get_user_analyses(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    
    return analyses


@router.get("/style-profile")
async def get_style_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Анализ общего стиля пользователя на основе гардероба"""
    wardrobe = await clothing_service.get_user_wardrobe(
        db=db,
        user_id=current_user.id,
        limit=100
    )
    
    if not wardrobe:
        raise HTTPException(status_code=400, detail="Wardrobe is empty")
    
    wardrobe_dicts = [
        {"category": item.category, "color": item.color}
        for item in wardrobe
    ]
    
    result = await gemini_service.analyze_style_profile(wardrobe_dicts)
    
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "Failed to analyze style")
        )
    
    return {
        "total_items": len(wardrobe),
        "style_profile": result.get("profile", {}),
        "wardrobe_summary": {
            "categories": list(set([item.category for item in wardrobe if item.category])),
            "colors": list(set([item.color for item in wardrobe if item.color]))
        }
    }


@router.post("/analyze-item")
async def analyze_wardrobe_item(
    item_id: int = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    НОВОЕ: Анализ одной вещи из гардероба
    AI даёт советы как носить эту вещь
    """
    item = await clothing_service.get_clothing_item(db, item_id, current_user.id)
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    wardrobe = await clothing_service.get_user_wardrobe(
        db=db,
        user_id=current_user.id,
        limit=50
    )
    
    other_items = [
        {"category": w.category, "color": w.color}
        for w in wardrobe if w.id != item_id
    ]
    
    result = await gemini_service.analyze_single_item(
        item={
            "category": item.category,
            "color": item.color,
            "description": item.description or ""
        },
        other_wardrobe=other_items
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "Failed to analyze item")
        )
    
    return {
        "item": {
            "id": item.id,
            "category": item.category,
            "color": item.color,
            "image_url": item.image_url
        },
        "analysis": result.get("analysis", {}),
        "model": result.get("model")
    }


@router.post("/analyze-outfit")
async def analyze_outfit_combination(
    item_ids: List[int] = Body(..., embed=True),
    occasion: str = Body(default=None, embed=True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    НОВОЕ: Анализ комбинации вещей (наряда)
    Пользователь выбирает несколько вещей, AI оценивает комбинацию
    """
    
    if not item_ids or len(item_ids) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please select at least 2 items"
        )
    
    if len(item_ids) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 items per outfit"
        )
    
    items = []
    for item_id in item_ids:
        item = await clothing_service.get_clothing_item(db, item_id, current_user.id)
        
        if not item:
            raise HTTPException(
                status_code=404,
                detail=f"Item {item_id} not found"
            )
        
        if item.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail=f"Not authorized to access item {item_id}"
            )
        
        items.append({
            "id": item.id,
            "category": item.category,
            "color": item.color,
            "description": item.description or "",
            "image_url": item.image_url
        })
    
    result = await gemini_service.analyze_outfit_combination(
        items=items,
        occasion=occasion
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "Failed to analyze outfit")
        )
    
    return {
        "items": items,
        "occasion": occasion,
        "analysis": result.get("analysis", {}),
        "model": result.get("model")
    }