# app/models/clothing.py
from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base


class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    image_url = Column(String(500), nullable=False)
    category = Column(String(100))
    color = Column(String(100))
    brand = Column(String(100))
    description = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    # Владелец вещи
    user = relationship("User", back_populates="clothing_items")

    # Связанные AI-анализы этой вещи
    analyses = relationship("AIAnalysis", back_populates="clothing_item")
