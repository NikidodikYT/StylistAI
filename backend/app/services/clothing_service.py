# app/services/clothing_service.py

from typing import Optional, List, Dict, Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.clothing import ClothingItem
from app.models.ai_analysis import AIAnalysis
from app.schemas.clothing import ClothingItemCreate


class ClothingService:
    """
    Сервис для работы с гардеробом пользователя и AI-анализами.
    """

    # ====== Работа с одеждой ======

    async def create_clothing_item(
        self,
        db: AsyncSession,
        user_id: int,
        image_url: str,
        data: ClothingItemCreate,
    ) -> ClothingItem:
        """
        Создать вещь в гардеробе пользователя.
        """
        item = ClothingItem(
            user_id=user_id,
            image_url=image_url,
            category=data.category,
            color=data.color,
            brand=data.brand,
            description=data.description,
        )

        db.add(item)
        await db.commit()
        await db.refresh(item)
        return item

    async def get_clothing_item(
        self,
        db: AsyncSession,
        item_id: int,
        user_id: int,
    ) -> Optional[ClothingItem]:
        """
        Получить вещь по ID, проверяя принадлежность пользователю.
        """
        result = await db.execute(
            select(ClothingItem).where(
                ClothingItem.id == item_id,
                ClothingItem.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_user_clothing(
        self,
        db: AsyncSession,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
    ) -> List[ClothingItem]:
        """
        Базовый метод: получить список вещей пользователя.
        """
        query = (
            select(ClothingItem)
            .where(ClothingItem.user_id == user_id)
            .order_by(ClothingItem.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_user_wardrobe(
        self,
        db: AsyncSession,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        color: Optional[str] = None,
        brand: Optional[str] = None,
    ) -> List[ClothingItem]:
        """
        Метод, который вызывает эндпоинт /wardrobe.
        Поддерживает фильтры категории/цвета/бренда, но они опциональны.
        """
        query = select(ClothingItem).where(ClothingItem.user_id == user_id)

        if category:
            query = query.where(ClothingItem.category == category)
        if color:
            query = query.where(ClothingItem.color == color)
        if brand:
            query = query.where(ClothingItem.brand == brand)

        query = (
            query.order_by(ClothingItem.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        return list(result.scalars().all())

    async def delete_clothing_item(
        self,
        db: AsyncSession,
        item_id: int,
        user_id: int,
    ) -> bool:
        """
        Удалить вещь пользователя. Возвращает True, если вещь была удалена.
        """
        item = await self.get_clothing_item(db=db, item_id=item_id, user_id=user_id)
        if not item:
            return False

        await db.delete(item)
        await db.commit()
        return True

    # ====== Работа с AI-анализами ======

    async def create_analysis(
        self,
        db: AsyncSession,
        user_id: int,
        prompt: str,
        response: str,
        analysis_data: Dict[str, Any],
        model_used: str = "gemini-2.5-flash-lite",
        clothing_item_id: Optional[int] = None,
    ) -> AIAnalysis:
        """
        Создать запись AI-анализа (для истории / логов).
        """
        analysis = AIAnalysis(
            user_id=user_id,
            prompt=prompt,
            response=response,
            analysis_data=analysis_data,
            model_used=model_used,
            clothing_item_id=clothing_item_id,
        )

        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)
        return analysis

    async def get_analysis_by_id(
        self,
        db: AsyncSession,
        analysis_id: int,
        user_id: int,
    ) -> Optional[AIAnalysis]:
        """
        Получить запись анализа по ID, проверяя, что она принадлежит пользователю.
        Можно использовать, если в API передают analysis_id вместо item_id.
        """
        result = await db.execute(
            select(AIAnalysis).where(
                AIAnalysis.id == analysis_id,
                AIAnalysis.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_user_analyses(
        self,
        db: AsyncSession,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
    ) -> List[AIAnalysis]:
        """
        Получить историю AI-анализов пользователя.
        """
        result = await db.execute(
            select(AIAnalysis)
            .where(AIAnalysis.user_id == user_id)
            .order_by(AIAnalysis.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())


clothing_service = ClothingService()
