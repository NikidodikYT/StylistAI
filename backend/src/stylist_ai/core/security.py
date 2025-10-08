# backend/src/stylist_ai/core/security.py
from passlib.context import CryptContext

# Создаем контекст для хэширования. Мы говорим ему использовать
# алгоритм bcrypt, который является индустриальным стандартом.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет, что обычный пароль соответствует хэшированному."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Создает хэш из обычного пароля."""
    return pwd_context.hash(password)
