from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ClothingItemBase(BaseModel):
    """Базовая схема для предмета одежды"""
    category: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None


class ClothingItemCreate(ClothingItemBase):
    """Схема для создания предмета одежды"""
    pass


class ClothingItemUpdate(BaseModel):
    """ПУНКТ 3: Схема для обновления предмета одежды"""
    category: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None


class ClothingItemResponse(ClothingItemBase):
    """Схема ответа с предметом одежды"""
    id: int
    user_id: int
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class AIAnalysisBase(BaseModel):
    """Базовая схема для AI анализа"""
    prompt: str


class AIAnalysisCreate(AIAnalysisBase):
    """Схема для создания AI анализа"""
    clothing_item_id: Optional[int] = None


class AIAnalysisResponse(BaseModel):
    """Схема ответа с AI анализом"""
    id: int
    user_id: int
    clothing_item_id: Optional[int] = None
    prompt: str
    response: str
    model_used: str
    detected_category: Optional[str] = None
    detected_colors: Optional[str] = None
    detected_style: Optional[str] = None
    confidence_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True