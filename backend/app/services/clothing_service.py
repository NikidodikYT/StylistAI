from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.clothing import ClothingItem, AIAnalysis
from app.schemas.clothing import ClothingItemCreate
from typing import List, Optional


class ClothingService:
    """Сервис для работы с одеждой и AI анализами"""
    
    @staticmethod
    async def create_clothing_item(
        db: AsyncSession,
        user_id: int,
        image_url: str,
        data: Optional[ClothingItemCreate] = None
    ) -> ClothingItem:
        """Создать предмет одежды"""
        item = ClothingItem(
            user_id=user_id,
            image_url=image_url,
            category=data.category if data else None,
            color=data.color if data else None,
            brand=data.brand if data else None,
            description=data.description if data else None
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)
        return item
    
    @staticmethod
    async def get_user_wardrobe(
        db: AsyncSession,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        color: Optional[str] = None
    ) -> List[ClothingItem]:
        """Получить гардероб юзера с фильтрацией"""
        query = select(ClothingItem).where(ClothingItem.user_id == user_id)
        
        if category:
            query = query.where(ClothingItem.category == category)
        if color:
            query = query.where(ClothingItem.color.ilike(f"%{color}%"))
        
        query = query.offset(skip).limit(limit).order_by(ClothingItem.created_at.desc())
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_clothing_item(
        db: AsyncSession,
        item_id: int,
        user_id: int
    ) -> Optional[ClothingItem]:
        """Получить конкретный предмет одежды"""
        result = await db.execute(
            select(ClothingItem).where(
                ClothingItem.id == item_id,
                ClothingItem.user_id == user_id
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def delete_clothing_item(
        db: AsyncSession,
        item_id: int,
        user_id: int
    ) -> bool:
        """Удалить предмет одежды"""
        item = await ClothingService.get_clothing_item(db, item_id, user_id)
        if not item:
            return False
        await db.delete(item)
        await db.commit()
        return True
    
    @staticmethod
    async def create_analysis(
        db: AsyncSession,
        user_id: int,
        prompt: str,
        response: str,
        clothing_item_id: Optional[int] = None,
        analysis_data: Optional[dict] = None
    ) -> AIAnalysis:
        """Сохранить результат AI анализа"""
        analysis = AIAnalysis(
            user_id=user_id,
            clothing_item_id=clothing_item_id,
            prompt=prompt,
            response=response,
            model_used="gemini-1.5-flash",
            detected_category=analysis_data.get("category") if analysis_data else None,
            detected_colors=str(analysis_data.get("colors")) if analysis_data else None,
            detected_style=analysis_data.get("style") if analysis_data else None,
            confidence_score=analysis_data.get("confidence") if analysis_data else None
        )
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)
        return analysis
    
    @staticmethod
    async def get_user_analyses(
        db: AsyncSession,
        user_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> List[AIAnalysis]:
        """Получить историю AI анализов юзера"""
        result = await db.execute(
            select(AIAnalysis)
            .where(AIAnalysis.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(AIAnalysis.created_at.desc())
        )
        return list(result.scalars().all())


clothing_service = ClothingService()
