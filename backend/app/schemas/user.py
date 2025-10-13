from pydantic import BaseModel, EmailStr, constr
from typing import Optional

class UserCreate(BaseModel):
    """Схема для создания пользователя"""
    email: EmailStr
    password: constr(min_length=8)
    username: Optional[str] = None
    full_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    style_preferences: Optional[str] = None
    favorite_brands: Optional[str] = None

class UserResponse(BaseModel):
    """Схема для ответа с данными пользователя"""
    id: int
    email: EmailStr
    username: Optional[str]
    full_name: Optional[str]
    is_active: bool
    gender: Optional[str]
    age: Optional[int]
    
    class Config:
        from_attributes = True  # Для Pydantic v2 (раньше было orm_mode)
