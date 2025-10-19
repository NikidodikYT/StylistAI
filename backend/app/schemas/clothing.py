from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ClothingItemBase(BaseModel):
    category: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None


class ClothingItemCreate(ClothingItemBase):
    pass


class ClothingItemUpdate(ClothingItemBase):
    pass


class ClothingItemResponse(ClothingItemBase):
    id: int
    user_id: int
    image_url: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class AIAnalysisBase(BaseModel):
    prompt: str


class AIAnalysisCreate(AIAnalysisBase):
    clothing_item_id: Optional[int] = None


class AIAnalysisResponse(BaseModel):
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
