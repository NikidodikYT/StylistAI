# backend/migrations/env.py

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy import create_engine # <-- ВАЖНО: добавили новый импорт

from alembic import context

# ------------------ НАШИ ИЗМЕНЕНИЯ ------------------

# Добавляем наш 'src' в системный путь, чтобы Python мог найти 'stylist_ai'
# Эту строку нужно поставить ДО импортов из нашего проекта
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from stylist_ai.db.base import Base                  # <-- импортируем "чертежи"
from stylist_ai.core.config import settings         # <-- ВАЖНО: импортируем наш собственный конфиг!

# ----------------------------------------------------


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# Указываем Alembic'у на наши "чертежи" (модели)
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    # Мы не меняем оффлайн режим, он нам не нужен для Docker
    url = settings.DATABASE_URL # Используем наш конфиг
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    
    # <<< ГЛАВНОЕ ИЗМЕНЕНИЕ ЗДЕСЬ
    # Вместо того чтобы читать URL из .ini файла,
    # мы создаем подключение НАПРЯМУЮ из нашего settings объекта,
    # который 100% правильно читает .env файл.
    connectable = create_engine(str(settings.DATABASE_URL))
    # -----------------------------------------------

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
