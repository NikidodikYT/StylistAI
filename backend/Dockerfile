# 1. Используем официальный образ Python как основу
FROM python:3.11-slim

# 2. Устанавливаем Poetry
RUN pip install poetry

# 3. Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# 4. Копируем файлы проекта
COPY pyproject.toml poetry.lock ./
COPY src/ /app/src/
COPY migrations/ /app/migrations/
COPY alembic.ini /app/alembic.ini

# 5. Устанавливаем зависимости, не создавая виртуальное окружение
RUN poetry config virtualenvs.create false && poetry install --no-root --no-dev

# 6. Указываем команду, которая будет запускаться при старте контейнера
CMD ["uvicorn", "stylist_ai.main:app", "--host", "0.0.0.0", "--port", "8000"]