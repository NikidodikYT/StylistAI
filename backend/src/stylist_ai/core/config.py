from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Мы временно "захардкодили" URL, чтобы быть на 100% уверенными, что используется именно он
    DATABASE_URL: str = "postgresql://stylistai:supersecretpassword@localhost:5432/stylistai_db"

settings = Settings()
