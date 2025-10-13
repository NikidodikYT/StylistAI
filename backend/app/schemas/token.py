from pydantic import BaseModel

class Token(BaseModel):
    """Схема ответа с токеном"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Данные внутри токена"""
    user_id: int | None = None
