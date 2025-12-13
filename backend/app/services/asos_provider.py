import httpx
from typing import List, Dict, Optional
from app.core.config import settings


class AsosProvider:
    """Провайдер для поиска товаров через ASOS API"""
    
    def __init__(self):
        self.base_url = "https://asos2.p.rapidapi.com"
        self.headers = {
            "X-RapidAPI-Key": settings.RAPIDAPI_KEY,
            "X-RapidAPI-Host": settings.ASOS_HOST
        }
    
    async def search_products(
        self,
        query: str,
        max_results: int = 10,
        country: str = "US",
        currency: str = "USD",
        lang: str = "en-US"
    ) -> List[Dict]:
        """
        Поиск товаров по запросу в ASOS
        
        Args:
            query: Поисковый запрос
            max_results: Максимум результатов
            country: Код страны (US, GB, etc.)
            currency: Валюта (USD, EUR, GBP)
            lang: Язык (en-US, en-GB)
        """
        if not settings.RAPIDAPI_KEY:
            print("ERROR: RAPIDAPI_KEY not configured")
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/products/v2/list",
                    headers=self.headers,
                    params={
                        "store": country,
                        "offset": 0,
                        "categoryId": "4209",  # Women's clothing
                        "limit": max_results,
                        "country": country,
                        "sort": "freshness",
                        "q": query,
                        "currency": currency,
                        "sizeSchema": "US",
                        "lang": lang
                    },
                    timeout=15.0
                )
                
                print(f"ASOS Response Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_results(data)
                else:
                    print(f"ASOS API error: {response.status_code} - {response.text}")
                    return []
                    
        except httpx.TimeoutException:
            print("ASOS: Request timeout")
            return []
        except Exception as e:
            print(f"ASOS error: {str(e)}")
            return []
    
    def _parse_results(self, data: Dict) -> List[Dict]:
        """Парсинг ответа API"""
        products = []
        
        items = data.get("products", [])
        
        for item in items:
            try:
                # Извлекаем цену
                price_data = item.get("price", {})
                current_price = price_data.get("current", {}).get("value", 0)
                currency = price_data.get("currency", "USD")
                
                # Формируем URL изображения
                image_url = item.get("imageUrl", "")
                if image_url and not image_url.startswith("http"):
                    image_url = f"https://{image_url}"
                
                # Формируем URL товара
                product_id = item.get("id", "")
                product_url = f"https://www.asos.com/us/prd/{product_id}" if product_id else ""
                
                product = {
                    "name": item.get("name", "Unknown"),
                    "price": float(current_price) if current_price else 0,
                    "currency": currency,
                    "url": product_url,
                    "image_url": image_url,
                    "brand": item.get("brandName", "ASOS"),
                    "marketplace": "asos"
                }
                products.append(product)
            except Exception as e:
                print(f"Error parsing ASOS item: {e}")
                continue
        
        return products


# Singleton
asos_provider = AsosProvider()