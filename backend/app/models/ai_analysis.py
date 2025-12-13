# app/models/ai_analysis.py
from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship

from app.db.session import Base


class AIAnalysis(Base):
    """Модель для хранения AI-анализов одежды."""

    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)

    # Связь с пользователем
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Связь с предметом одежды (может быть None, если вещь не сохраняли в гардероб)
    clothing_item_id = Column(Integer, ForeignKey("clothing_items.id"), nullable=True)

    # Данные анализа
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    analysis_data = Column(JSON, nullable=True)
    model_used = Column(String(100), default="gemini-2.5-flash-lite")

    # Метаданные
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ORM-связи
    user = relationship("User", back_populates="analyses")
    clothing_item = relationship("ClothingItem", back_populates="analyses")
