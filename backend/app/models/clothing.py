from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class ClothingItem(Base):
    __tablename__ = "clothing_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_url = Column(String, nullable=False)
    category = Column(String, nullable=True)
    color = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="clothing_items")
    analyses = relationship("AIAnalysis", back_populates="clothing_item", cascade="all, delete-orphan")

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    clothing_item_id = Column(Integer, ForeignKey("clothing_items.id"), nullable=True)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    model_used = Column(String, default="gemini-pro")
    detected_category = Column(String, nullable=True)
    detected_colors = Column(String, nullable=True)
    detected_style = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="analyses")
    clothing_item = relationship("ClothingItem", back_populates="analyses")
