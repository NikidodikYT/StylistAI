from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.core.config import settings
from datetime import timedelta

class AuthService:
    """Сервис для аутентификации"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def authenticate_user(self, email: str, password: str) -> User | None:
        """
        Проверяет email и пароль пользователя
        Возвращает User если всё правильно, иначе None
        """
        # Находим пользователя по email
        result = await self.db.execute(
            select(User).filter(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        # Если пользователь не найден или пароль неверный
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        return user
    
    def create_token(self, user_id: int) -> str:
        """
        Создаёт JWT токен для пользователя
        """
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user_id)},
            expires_delta=access_token_expires
        )
        return access_token
