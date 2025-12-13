# app/schemas/ai.py

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ClothingAnalysis(BaseModel):
    """Детальный анализ одежды от Gemini."""
    
    category: str = Field(..., description="Main clothing category")
    subcategory: Optional[str] = Field(None, description="Specific type")
    colors: List[str] = Field(default_factory=list, description="Dominant colors")
    pattern: Optional[str] = Field(None, description="Pattern description")
    material: Optional[str] = Field(None, description="Fabric description")
    fit: Optional[str] = Field(None, description="Silhouette and fit")
    length: Optional[str] = Field(None, description="Length of item")
    collar_type: Optional[str] = Field(None, description="Neckline/collar type")
    sleeve_length: Optional[str] = Field(None, description="Sleeve length")
    details: Optional[str] = Field(None, description="Design details")
    brand: Optional[str] = Field(None, description="Brand name")
    target_audience: Optional[str] = Field(None, description="Target audience")
    style: Optional[str] = Field(None, description="Style label")
    season: Optional[str] = Field(None, description="Suitable season")
    description: Optional[str] = Field(None, description="Rich description")
    explanation: Optional[str] = Field(None, description="Analysis explanation")
    search_query: Optional[str] = Field(None, description="Marketplace search phrase")
    search_keywords: Optional[List[str]] = Field(None, description="Search keywords")
    tags: Optional[List[str]] = Field(None, description="Specific search tags")


class AnalyzeImageResponse(BaseModel):
    success: bool
    analysis_id: int
    item_id: Optional[int]
    saved_to_wardrobe: bool
    clothing: ClothingAnalysis
    image_path: str
    created_at: datetime


class FindSimilarRequest(BaseModel):
    item_id: int = Field(..., description="ID вещи из гардероба")
    marketplaces: List[str] = Field(
        default=["pricescout", "asos", "hm", "google_shopping"],
        description="Маркетплейсы для поиска",
        json_schema_extra={"example": ["pricescout", "asos", "hm", "google_shopping"]}
    )
    max_results_per_marketplace: int = Field(
        default=15,  # ← Увеличил с 10 до 15 для большего покрытия
        description="Max results per marketplace",
        ge=1,
        le=50
    )
    min_similarity_score: float = Field(
        default=35.0,  # ← Поднял с 20 до 35 для качественной фильтрации
        description="Minimum similarity score (0-100)",
        ge=0,
        le=100
    )


class SimilarProduct(BaseModel):
    """Товар из маркетплейса с similarity score."""
    
    name: str
    price: float
    currency: str
    url: str
    image_url: str
    brand: str
    marketplace: str
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    delivery: Optional[str] = ""
    similarity_score: Optional[float] = Field(
        None,
        description="Similarity score 0-100",
        ge=0,
        le=100
    )


class ClothingItemInfo(BaseModel):
    id: int
    category: Optional[str]
    color: Optional[str]
    brand: Optional[str]
    description: Optional[str]
    image_url: str


class FindSimilarResponse(BaseModel):
    success: bool
    item: ClothingItemInfo
    similar_products: List[SimilarProduct]
    total_found: int
    search_query: str
    min_score_filter: float = Field(description="Minimum score applied")
    fallback_used: Optional[bool] = Field(
        default=False,
        description="Whether fallback search was used"
    )


class AnalysisListItem(BaseModel):
    id: int
    clothing: Optional[ClothingAnalysis]
    saved_to_wardrobe: bool
    created_at: datetime


class AnalysisListResponse(BaseModel):
    total: int
    analyses: List[AnalysisListItem]
