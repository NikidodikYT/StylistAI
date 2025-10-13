from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

class UserService:
    """Сервис для работы с пользователями"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_email(self, email: str) -> User | None:
        """Получить пользователя по email"""
        result = await self.db.execute(
            select(User).filter(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def create_user(self, user_create: UserCreate) -> User:
        """Создать нового пользователя"""
        # Хешируем пароль
        hashed_password = get_password_hash(user_create.password)
        
        # Создаём объект User
        new_user = User(
            email=user_create.email,
            username=user_create.username,
            full_name=user_create.full_name,
            hashed_password=hashed_password,
            gender=user_create.gender,
            age=user_create.age,
            style_preferences=user_create.style_preferences,
            favorite_brands=user_create.favorite_brands,
            is_active=True,
            is_superuser=False,
        )
        
        # Добавляем в БД
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)
        
        return new_user
