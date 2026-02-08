"""
Marketplace Service - агрегатор поиска
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional

from app.services.serper_provider import serper_provider
from app.services.pricescout_provider import pricescout_provider
from app.services.asos_provider import asos_provider
from app.services.hm_provider import hm_provider

logger = logging.getLogger(__name__)


def _dedupe_by_url(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    out: List[Dict[str, Any]] = []
    for p in products:
        url = (p.get("url") or "").strip().lower()
        key = url if url else (p.get("marketplace"), (p.get("name") or "").strip().lower(), p.get("price"))
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out


class MarketplaceService:
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
        try:
            if hasattr(provider, "search_products"):
                results = await provider.search_products(search_query, max_results)
                logger.info(f"[{mp}] returned {len(results)} products")
                return results

            if hasattr(provider, "search"):
                # Serper provider now enforces "cards only" internally (как у тебя было задумано)
                results = await provider.search(search_query, max_results, strict_mode=True)
                logger.info(f"[{mp}] returned {len(results)} products")
                return results

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
        # ДЕМО/МВП: не включай pricescout по умолчанию, если он таймаутит.
        # Лучше вернуть быстро 2-5 результатов, чем ждать и получить 0.
        if not marketplaces:
            marketplaces = ["asos", "google_shopping", "hm", "pricescout"]

        logger.info(f"Searching in: {marketplaces}")

        tasks = []
        for mp in marketplaces:
            provider = self.providers.get(mp)
            if not provider:
                logger.warning(f"Unknown marketplace: {mp}")
                continue

            if hasattr(provider, "enabled") and not provider.enabled:
                logger.warning(f"Provider {mp} is disabled")
                continue

            tasks.append(self._run_provider(mp, provider, search_query, max_results_per_marketplace))

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

        all_products = _dedupe_by_url(all_products)

        logger.info(f"Total products found (deduped): {len(all_products)}")
        return all_products


marketplace_service = MarketplaceService()
