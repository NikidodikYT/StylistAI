# backend/Dockerfile

FROM python:3.11-slim

# 1. Переменные окружения
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_CACHE_DIR='/var/cache/pypoetry' \
    PYTHONPATH="/app/src"

# 2. Установка зависимостей и Poetry
RUN apt-get update \
 && apt-get install -y curl gcc libpq-dev \
 && rm -rf /var/lib/apt/lists/* \
 && pip install poetry

# 3. Рабочая директория
WORKDIR /app

# 4. Копируем файлы зависимостей
COPY pyproject.toml poetry.lock ./

# 5. Устанавливаем зависимости без создания виртуального окружения
RUN poetry install --only main --no-root

# 6. Копируем исходники приложения
COPY src ./src

# 7. Запуск Uvicorn с логированием и рестартом
CMD ["uvicorn", "stylist_ai.main:app", \
     "--host", "0.0.0.0", "--port", "8000", \
     "--reload", "--log-level", "debug"]
