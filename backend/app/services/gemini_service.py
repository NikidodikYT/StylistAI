# app/services/gemini_service.py

import json
import time
import logging
import os
from typing import Optional, Dict, Any

import google.generativeai as genai

from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Gemini AI service с улучшенным промптом для поиска."""

    def __init__(self) -> None:
        # Если GEMINI_MODEL есть в .env — используем его,
        # иначе по умолчанию берём gemini-2.5-flash-lite
        self.model_name = getattr(settings, "GEMINI_MODEL", None) or "gemini-2.5-flash-lite"

        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured")
            self.model = None
            return

        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(self.model_name)
            logger.info(f"✓ Gemini AI initialized: {self.model_name}")
        except Exception as e:
            logger.error(f"Gemini init failed: {e}")
            self.model = None

    def _extract_json_from_text(self, text: str) -> Optional[str]:
        """Извлекает JSON из текста."""
        try:
            start = text.find("{")
            end = text.rfind("}")
            if start == -1 or end == -1:
                return None
            return text[start: end + 1]
        except Exception:
            return None

    async def analyze_clothing_image(
        self,
        image_path: str,
        retries: int = 3,
    ) -> Optional[Dict[str, Any]]:
        """
        Анализирует одежду на изображении с детальными тегами для поиска.
        """
        if not self.model:
            logger.error("Gemini model not available")
            return None

        if not os.path.exists(image_path):
            logger.error(f"Image not found: {image_path}")
            return None

        # НОВЫЙ ПРОМПТ С ТЕГАМИ
        prompt = """You are a professional fashion stylist and product search expert.
Analyze this clothing item in GREAT DETAIL and return valid JSON.
CRITICAL: If this is a specific type like varsity jacket, bomber, letterman jacket,
denim jacket, etc. - you MUST specify that in category AND tags.

Return JSON with these fields:

"category": "SPECIFIC type (e.g. 'varsity jacket', 'bomber jacket', 'denim jacket', 'hoodie')",
"subcategory": "more specific if applicable (e.g. 'college letterman', 'cropped bomber')",
"colors": ["primary", "secondary", "accent"],
"pattern": "pattern description or null",
"material": "fabric description",
"fit": "silhouette (oversized/slim/relaxed)",
"length": "length description",
"collar_type": "collar type or null",
"sleeve_length": "sleeve length or null",
"details": "notable design details (patches, embroidery, buttons, etc.)",
"brand": "brand name or 'unbranded'",
"target_audience": "men/women/unisex",
"style": "style label (streetwear/casual/preppy/vintage/sporty)",
"season": "suitable season",
"description": "3-5 sentences describing the item richly",
"explanation": "2-3 sentences why these style/season choices make sense",
"search_query": "SHORT 4-7 word phrase for marketplace search",
"search_keywords": ["key", "words", "for", "search"],
"tags": ["VERY", "SPECIFIC", "search", "tags", "here"]

TAGS FIELD IS CRITICAL:
- Include the MOST SPECIFIC terms someone would search for THIS exact item
- For varsity jacket example: ["varsity jacket", "college jacket", "letterman jacket",
  "wool body", "leather sleeves", "patch jacket", "university style"]
- For bomber: ["bomber jacket", "flight jacket", "zip bomber", "nylon bomber"]
- For denim: ["denim jacket", "jean jacket", "trucker jacket", "vintage wash"]
- Include 5-10 highly specific tags
- Tags should help distinguish this from similar items

RULES:
- Answer ONLY with JSON, no markdown
- Use double quotes
- If unsure, use null
- Be VERY specific in category and tags
"""

        for attempt in range(retries):
            try:
                logger.info(f"[GEMINI] Attempt {attempt + 1}/{retries} (model={self.model_name})")

                uploaded_file = genai.upload_file(image_path)
                response = await self.model.generate_content_async(
                    [prompt, uploaded_file],
                    generation_config={
                        "response_mime_type": "application/json",
                        "max_output_tokens": 1024,
                        "temperature": 0.6,
                    },
                )

                raw_text = (response.text or "").strip()
                json_str = self._extract_json_from_text(raw_text)

                if not json_str:
                    logger.warning("[GEMINI] No JSON in response")
                    if attempt < retries - 1:
                        time.sleep(1)
                        continue
                    break

                data = json.loads(json_str)

                # Валидация обязательных полей
                required = ["category", "colors", "tags"]
                for field in required:
                    if field not in data:
                        data[field] = [] if field in ["colors", "tags"] else "unknown"

                logger.info(
                    f"[GEMINI] ✓ Category: {data.get('category')}, "
                    f"Tags: {len(data.get('tags', []))}"
                )
                return data

            except json.JSONDecodeError as e:
                logger.error(f"[GEMINI] JSON parse error: {e}")
                if attempt < retries - 1:
                    time.sleep(1)
                    continue

                # Fallback на дефолтный ответ
                return {
                    "category": "unknown",
                    "subcategory": None,
                    "colors": ["unknown"],
                    "pattern": None,
                    "material": "unknown",
                    "fit": None,
                    "length": None,
                    "collar_type": None,
                    "sleeve_length": None,
                    "details": None,
                    "brand": None,
                    "target_audience": None,
                    "style": "casual",
                    "season": "all-season",
                    "description": "Could not analyze image",
                    "explanation": "",
                    "search_query": "casual clothing",
                    "search_keywords": ["casual", "clothing"],
                    "tags": ["clothing"],
                }

            except Exception as e:
                logger.error(f"[GEMINI] Error: {e}")
                # При 429/квоте нет смысла ретраить дальше
                if "429" in str(e) or "quota" in str(e).lower():
                    break
                if attempt < retries - 1:
                    time.sleep(1)
                    continue
                return None

        return None


try:
    gemini_service = GeminiService()
except Exception as e:
    logger.error(f"Failed to create gemini_service: {e}")
    gemini_service = None
