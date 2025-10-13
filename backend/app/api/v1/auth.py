from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token  # Добавили импорт!
from app.services.user_service import UserService
from app.services.auth_service import AuthService  # Добавили импорт!

router = APIRouter()

# ... здесь твой старый эндпоинт /register ...

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    Логин пользователя
    
    - **username**: Email пользователя (OAuth2 использует поле username для email)
    - **password**: Пароль пользователя
    
    Возвращает JWT токен для авторизации
    """
    # Создаём сервис аутентификации
    auth_service = AuthService(db)
    
    # Проверяем пользователя (username == email в OAuth2)
    user = await auth_service.authenticate_user(
        email=form_data.username,
        password=form_data.password
    )
    
    # Если пользователь не найден или пароль неверный
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Генерируем токен
    access_token = auth_service.create_token(user.id)
    
    # Возвращаем токен
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
