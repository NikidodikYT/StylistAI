# backend/src/stylist_ai/db/base.py
from sqlalchemy.orm import DeclarativeBase

# Это базовый класс, от которого будут наследоваться все наши
# классы-модели. Он связывает наши классы с SQLAlchemy.
class Base(DeclarativeBase):
    pass
