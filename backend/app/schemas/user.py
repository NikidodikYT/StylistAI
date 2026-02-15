from pydantic import BaseModel, EmailStr, constr
from typing import Optional

class UserCreate(BaseModel):
    """Схема для создания пользователя"""
    email: EmailStr
    password: constr(min_length=8)
    username: str 
    full_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    style_preferences: Optional[str] = None
    favorite_brands: Optional[str] = None

class UserResponse(BaseModel):
    """Схема для ответа с данными пользователя"""
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    is_active: bool
    
    class Config:
        from_attributes = True 

class UserUpdate(BaseModel):
    """Схема для обновления профиля"""
    full_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    style_preferences: Optional[str] = None
    favorite_brands: Optional[str] = None
