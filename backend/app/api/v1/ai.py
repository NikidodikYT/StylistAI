from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Body
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


@router.get("/status")
async def ai_status():
    """Проверка статуса AI сервиса"""
    return {
        "status": "online",
        "message": "AI service ready",
        "model": "gemini-1.5-flash"
    }


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
    
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    temp_path = TEMP_DIR / unique_filename
    
    with open(temp_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    result = await gemini_service.analyze_clothing_image(str(temp_path))
    
    if not result["success"]:
        os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {result['error']}")
    
    analysis = await clothing_service.create_analysis(
        db=db,
        user_id=current_user.id,
        prompt="Analyze clothing item from image",
        response=result["raw_response"],
        analysis_data=result["data"]
    )
    
    if save_to_wardrobe and result["data"]:
        perm_dir = Path("uploads/clothing")
        perm_dir.mkdir(parents=True, exist_ok=True)
        perm_path = perm_dir / unique_filename
        os.rename(temp_path, perm_path)
        
        colors_list = result["data"].get("colors", [])
        colors_str = ", ".join(colors_list) if isinstance(colors_list, list) else str(colors_list)
        
        clothing_data = ClothingItemCreate(
            category=result["data"].get("category"),
            color=colors_str,
            description=result["data"].get("description")
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
    
    recommendations = await gemini_service.generate_outfit_recommendations(wardrobe)
    
    return {
        "recommendations": recommendations,
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
    
    outfit = await gemini_service.generate_outfit_for_occasion(
        wardrobe=wardrobe,
        occasion=occasion,
        weather=weather
    )
    
    return {
        "occasion": occasion,
        "weather": weather,
        "outfit": outfit,
        "wardrobe_count": len(wardrobe)
    }


@router.get("/history", response_model=List[AIAnalysisResponse])
async def get_analysis_history(
    skip: int = 0,
    limit: int = 50,
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
    
    style_profile = await gemini_service.analyze_style_profile(wardrobe)
    
    return {
        "total_items": len(wardrobe),
        "style_profile": style_profile,
        "wardrobe_summary": {
            "categories": list(set([item.category for item in wardrobe if item.category])),
            "colors": list(set([item.color for item in wardrobe if item.color]))
        }
    }
