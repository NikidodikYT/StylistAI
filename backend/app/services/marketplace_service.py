"""
Marketplace Service - агрегатор поиска с fallback стратегией
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional

from app.services.serper_provider import serper_provider
from app.services.pricescout_provider import pricescout_provider
from app.services.asos_provider import asos_provider
from app.services.hm_provider import hm_provider

logger = logging.getLogger(__name__)


class MarketplaceService:
    """Сервис поиска похожих товаров с двухфазной стратегией."""

    def __init__(self):
        self.providers = {
            "google_shopping": serper_provider,
            "pricescout": pricescout_provider,
            "asos": asos_provider,
            "hm": hm_provider,
        }

    async def _run_provider(
        self,
        mp: str,
        provider: Any,
        search_query: str,
        max_results: int,
    ) -> List[Dict[str, Any]]:
        """
        Унифицированный вызов провайдера.
        """
        try:
            # PriceScout / ASOS / H&M
            if hasattr(provider, "search_products"):
                results = await provider.search_products(search_query, max_results)
                logger.info(f"[{mp}] returned {len(results)} products")
                return results
            # Serper
            elif hasattr(provider, "search"):
                # Для Serper используем strict=False (гибридный режим)
                results = await provider.search(
                    search_query, max_results, strict_mode=False
                )
                logger.info(f"[{mp}] returned {len(results)} products")
                return results
            else:
                logger.warning(f"Provider '{mp}' has no search method")
                return []
        except Exception as e:
            logger.error(f"Provider '{mp}' error: {e}", exc_info=True)
            return []

    async def search_similar(
        self,
        search_query: str,
        marketplaces: Optional[List[str]] = None,
        max_results_per_marketplace: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Поиск товаров с двухфазной стратегией:
        
        1. Сначала пробуем прямые магазины (PriceScout, ASOS, H&M)
        2. Если результатов мало - добавляем Google Shopping
        3. Google Shopping работает в гибридном режиме:
           - сначала только прямые ссылки
           - если пусто - fallback на поисковые
        """
        
        # По умолчанию - все источники, приоритет прямым магазинам
        if not marketplaces:
            marketplaces = ["pricescout", "asos", "hm", "google_shopping"]

        logger.info(f"Searching in: {marketplaces}")

        tasks = []
        for mp in marketplaces:
            provider = self.providers.get(mp)
            if not provider:
                logger.warning(f"Unknown marketplace: {mp}")
                continue
            
            # Проверяем enabled только для провайдеров, у которых это есть
            if hasattr(provider, "enabled") and not provider.enabled:
                logger.warning(f"Provider {mp} is disabled")
                continue
            
            tasks.append(
                self._run_provider(mp, provider, search_query, max_results_per_marketplace)
            )

        if not tasks:
            logger.warning("No enabled providers")
            return []

        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_products: List[Dict[str, Any]] = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Provider error: {result}")
                continue
            if isinstance(result, list):
                all_products.extend(result)

        logger.info(f"Total products found: {len(all_products)}")
        return all_products


marketplace_service = MarketplaceService()
