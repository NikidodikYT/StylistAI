from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid
from pathlib import Path

from app.db.session import get_db
from app.models.user import User
from app.schemas.clothing import ClothingItemResponse, ClothingItemCreate
from app.services.clothing_service import clothing_service
from app.api.v1.auth import get_current_user

router = APIRouter()

UPLOAD_DIR = Path("uploads/clothing")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload", response_model=ClothingItemResponse, status_code=status.HTTP_201_CREATED)
async def upload_clothing(
    file: UploadFile = File(...),
    category: Optional[str] = None,
    color: Optional[str] = None,
    brand: Optional[str] = None,
    description: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Загрузить фото одежды в гардероб"""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    clothing_data = ClothingItemCreate(
        category=category,
        color=color,
        brand=brand,
        description=description
    )
    
    item = await clothing_service.create_clothing_item(
        db=db,
        user_id=current_user.id,
        image_url=str(file_path),
        data=clothing_data
    )
    
    return item


@router.get("/", response_model=List[ClothingItemResponse])
async def get_my_wardrobe(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: Optional[str] = None,
    color: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить мой гардероб с фильтрацией"""
    items = await clothing_service.get_user_wardrobe(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        category=category,
        color=color
    )
    return items


@router.get("/{item_id}", response_model=ClothingItemResponse)
async def get_clothing_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить конкретный предмет одежды"""
    item = await clothing_service.get_clothing_item(
        db=db,
        item_id=item_id,
        user_id=current_user.id
    )
    if not item:
        raise HTTPException(status_code=404, detail="Clothing item not found")
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_clothing_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить предмет одежды"""
    success = await clothing_service.delete_clothing_item(
        db=db,
        item_id=item_id,
        user_id=current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Clothing item not found")
