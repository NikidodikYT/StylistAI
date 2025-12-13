FROM python:3.11-slim

WORKDIR /app

# Устанавливаем системные зависимости для BeautifulSoup и lxml
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libxml2-dev \
    libxslt-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Poetry
RUN pip install poetry

# Копируем файлы зависимостей
COPY pyproject.toml poetry.lock* ./

# Устанавливаем зависимости
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

# Копируем код приложения
COPY . .

# Создаём директории для загрузок (ДОБАВИТЬ)
RUN mkdir -p uploads/temp uploads/clothing

# Открываем порт
EXPOSE 8000

# Запускаем приложение
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
