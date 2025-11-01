import os
import aiohttp
import asyncio
import json
import re
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup
from urllib.parse import quote, urlencode

class MarketplaceService:
    """Реальный парсинг Wildberries через ScraperAPI + HTML parsing"""
    
    def __init__(self):
        self.scraper_api_key = os.getenv('SCRAPER_API_KEY')
        
        # Категории
        self.category_translation = {
            "bottom": "брюки", "pants": "брюки", "jeans": "джинсы",
            "top": "верх", "shirt": "рубашка", "t-shirt": "футболка",
            "dress": "платье", "skirt": "юбка", "shorts": "шорты",
            "jacket": "куртка", "sweater": "свитер", "coat": "пальто",
            "shoes": "обувь", "sneakers": "кроссовки", "boots": "ботинки"
        }
        
        # Цвета
        self.color_translation = {
            "blue": "синий", "red": "красный", "black": "черный",
            "white": "белый", "green": "зеленый", "yellow": "желтый",
            "gray": "серый", "brown": "коричневый", "pink": "розовый"
        }
        
        print("✅ Marketplace service initialized")
        if self.scraper_api_key:
            print(f"   Mode: LIVE (ScraperAPI + HTML parsing)")
            print(f"   API Key: {self.scraper_api_key[:10]}...{self.scraper_api_key[-4:]}")
        else:
            print(f"   ❌ SCRAPER_API_KEY not found in .env")
            print(f"   Add it to enable real data!")

    def _translate(self, category: str, color: str) -> tuple:
        """Перевод на русский"""
        cat = self.category_translation.get(category.lower(), category) if category else "одежда"
        col = self.color_translation.get(color.lower(), color) if color else ""
        return cat, col

    async def search_wildberries(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """РЕАЛЬНЫЙ поиск WB через ScraperAPI"""
        
        if not self.scraper_api_key:
            print(f"\n❌ WB: No API key")
            return {"success": False, "products": []}
        
        print(f"\n🔍 WB: Searching for '{query}'")
        
        try:
            # URL страницы поиска WB
            wb_url = f"https://www.wildberries.ru/catalog/0/search.aspx?search={quote(query)}"
            
            # Запрос через ScraperAPI с JS рендерингом
            scraper_params = {
                'api_key': self.scraper_api_key,
                'url': wb_url,
                'render': 'true',  # ВАЖНО: рендерим JS
                'country_code': 'ru'
            }
            
            scraper_url = f"http://api.scraperapi.com/?{urlencode(scraper_params)}"
            
            print(f"   📡 Requesting: {wb_url[:60]}...")
            print(f"   ⏳ Rendering JS (may take 10-30 sec)...")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(scraper_url, timeout=aiohttp.ClientTimeout(total=120)) as response:
                    
                    if response.status != 200:
                        print(f"   ❌ HTTP {response.status}")
                        return {"success": False, "products": []}
                    
                    html = await response.text()
                    print(f"   ✅ Got HTML: {len(html)} chars")
                    
                    # Парсим HTML
                    soup = BeautifulSoup(html, 'lxml')
                    
                    # WB встраивает данные в script tag с __NUXT_JSONP__
                    products = []
                    
                    # Метод 1: Ищем product-card элементы
                    product_cards = soup.find_all('article', class_='product-card')
                    
                    if product_cards:
                        print(f"   🎯 Found {len(product_cards)} product cards")
                        
                        for card in product_cards[:limit]:
                            try:
                                product = self._parse_wb_card(card)
                                if product:
                                    products.append(product)
                            except Exception as e:
                                print(f"   ⚠️  Parse error: {e}")
                                continue
                    
                    # Метод 2: Ищем JSON в script tags
                    if not products:
                        print(f"   🔎 Trying JSON extraction...")
                        products = self._extract_wb_json(html, limit)
                    
                    print(f"   ✅ Parsed {len(products)} products")
                    
                    for i, p in enumerate(products[:3], 1):
                        print(f"      {i}. {p['name'][:40]} - ₽{p['price']}")
                    
                    return {"success": len(products) > 0, "products": products}
                    
        except asyncio.TimeoutError:
            print(f"   ❌ Timeout (120s)")
            return {"success": False, "products": []}
        except Exception as e:
            print(f"   ❌ Error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return {"success": False, "products": []}

    def _parse_wb_card(self, card) -> Optional[Dict]:
        """Парсинг одной карточки товара WB"""
        try:
            # ID товара
            product_id = None
            link = card.find('a', class_='product-card__link')
            if link and link.get('href'):
                match = re.search(r'/catalog/(\d+)/', link['href'])
                if match:
                    product_id = match.group(1)
            
            if not product_id:
                return None
            
            # Название
            name_elem = card.find('span', class_='product-card__name')
            name = name_elem.get_text(strip=True) if name_elem else f"Товар {product_id}"
            
            # Бренд
            brand_elem = card.find('span', class_='product-card__brand')
            brand = brand_elem.get_text(strip=True) if brand_elem else ""
            
            # Цена
            price_elem = card.find('ins', class_='price__lower-price')
            if not price_elem:
                price_elem = card.find('span', class_='price__lower-price')
            
            price = 0
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price = int(''.join(filter(str.isdigit, price_text)))
            
            # Старая цена (если есть скидка)
            old_price = None
            old_price_elem = card.find('del', class_='price__del')
            if old_price_elem:
                old_price_text = old_price_elem.get_text(strip=True)
                old_price = int(''.join(filter(str.isdigit, old_price_text)))
            
            # Рейтинг
            rating = 0.0
            rating_elem = card.find('span', class_='product-card__rating')
            if rating_elem:
                rating_text = rating_elem.get_text(strip=True)
                try:
                    rating = float(rating_text)
                except:
                    pass
            
            # Отзывы
            feedbacks = 0
            reviews_elem = card.find('span', class_='product-card__count')
            if reviews_elem:
                reviews_text = reviews_elem.get_text(strip=True)
                feedbacks = int(''.join(filter(str.isdigit, reviews_text)))
            
            return {
                "marketplace": "wildberries",
                "id": product_id,
                "name": name,
                "brand": brand,
                "price": price,
                "old_price": old_price,
                "discount": self._calc_discount(old_price, price),
                "image": self._get_wb_image(int(product_id)),
                "rating": rating,
                "feedbacks": feedbacks,
                "url": f"https://www.wildberries.ru/catalog/{product_id}/detail.aspx"
            }
            
        except Exception as e:
            print(f"      Parse error: {e}")
            return None

    def _extract_wb_json(self, html: str, limit: int) -> List[Dict]:
        """Извлечение товаров из JSON в HTML"""
        products = []
        
        try:
            # Ищем __NUXT_JSONP__
            matches = re.findall(r'__NUXT_JSONP__\(".*?",\s*({.*?})\)', html, re.DOTALL)
            
            for match in matches:
                try:
                    data = json.loads(match)
                    
                    # Ищем товары в разных местах структуры
                    if 'data' in data:
                        items = self._find_products_in_dict(data['data'])
                        products.extend(items)
                    
                    if len(products) >= limit:
                        break
                        
                except json.JSONDecodeError:
                    continue
            
            return products[:limit]
            
        except Exception as e:
            print(f"      JSON extraction error: {e}")
            return []

    def _find_products_in_dict(self, obj, depth=0) -> List[Dict]:
        """Рекурсивный поиск товаров в JSON"""
        if depth > 10:  # Защита от бесконечной рекурсии
            return []
        
        products = []
        
        if isinstance(obj, dict):
            # Проверяем, это товар?
            if 'id' in obj and 'name' in obj and isinstance(obj.get('id'), int):
                try:
                    product = {
                        "marketplace": "wildberries",
                        "id": str(obj['id']),
                        "name": obj.get('name', ''),
                        "brand": obj.get('brand', ''),
                        "price": obj.get('salePriceU', 0) // 100,
                        "old_price": obj.get('priceU', 0) // 100 if obj.get('priceU', 0) > obj.get('salePriceU', 0) else None,
                        "rating": obj.get('rating', 0),
                        "feedbacks": obj.get('feedbacks', 0),
                        "image": self._get_wb_image(obj['id']),
                        "url": f"https://www.wildberries.ru/catalog/{obj['id']}/detail.aspx"
                    }
                    product['discount'] = self._calc_discount(product['old_price'], product['price'])
                    products.append(product)
                except:
                    pass
            
            # Рекурсивно ищем дальше
            for value in obj.values():
                products.extend(self._find_products_in_dict(value, depth + 1))
        
        elif isinstance(obj, list):
            for item in obj:
                products.extend(self._find_products_in_dict(item, depth + 1))
        
        return products

    def _get_wb_image(self, product_id: int) -> str:
        """URL изображения WB"""
        try:
            vol = product_id // 100000
            part = product_id // 1000
            basket = vol % 10 + 1
            return f"https://basket-{basket:02d}.wbbasket.ru/vol{vol}/part{part}/{product_id}/images/big/1.webp"
        except:
            return ""

    def _calc_discount(self, old_price: Optional[int], new_price: int) -> Optional[int]:
        """Расчёт скидки"""
        if not old_price or not new_price or old_price <= new_price:
            return None
        return int((1 - new_price / old_price) * 100)

    async def search_all_marketplaces(
        self,
        category: str,
        color: str = "",
        limit_per_marketplace: int = 10
    ) -> Dict[str, Any]:
        """Поиск на маркетплейсах"""
        
        cat, col = self._translate(category, color)
        query = f"{col} {cat}".strip()
        
        print(f"\n{'='*60}")
        print(f"🛍️  REAL MARKETPLACE SEARCH")
        print(f"   Query: '{query}'")
        print(f"   ScraperAPI: {'ENABLED' if self.scraper_api_key else 'DISABLED'}")
        print(f"{'='*60}")
        
        # Только WB пока (Ozon сложнее парсится)
        wb_result = await self.search_wildberries(query, limit_per_marketplace)
        
        products = wb_result.get("products", [])
        products.sort(key=lambda x: x.get("price", 999999))
        
        print(f"\n{'='*60}")
        print(f"📊 RESULTS: {len(products)} REAL products from WB")
        print(f"{'='*60}\n")
        
        return {
            "success": len(products) > 0,
            "products": products,
            "total": len(products),
            "by_marketplace": {
                "wildberries": {
                    "count": len(products),
                    "success": wb_result.get("success", False)
                }
            }
        }

# Singleton
marketplace_service = MarketplaceService()