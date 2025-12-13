# app/models/user.py
from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Учётные данные
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Профиль
    full_name = Column(String(255), nullable=True)
    gender = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    style_preferences = Column(String, nullable=True)
    favorite_brands = Column(String, nullable=True)

    # Статус
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Связи
    clothing_items = relationship(
        "ClothingItem",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    analyses = relationship(
        "AIAnalysis",
        back_populates="user",
        cascade="all, delete-orphan",
    )
