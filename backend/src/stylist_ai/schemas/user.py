# backend/src/stylist_ai/schemas/user.py
from pydantic import BaseModel, EmailStr

# --- Схемы для API ---
# Pydantic-модели определяют, какие данные мы ожидаем от клиента
# и какие данные мы отправляем в ответе. Это наш "контракт".

class UserBase(BaseModel):
    """Общие поля для всех схем пользователя."""
    email: EmailStr

class UserCreate(UserBase):
    """Схема, которую мы ожидаем от клиента при регистрации."""
    password: str

class User(UserBase):
    """Схема, которую мы будем возвращать клиенту из API."""
    id: int

    class Config:
        from_attributes = True
