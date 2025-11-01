import json
import os
from typing import Optional, Dict, Any, List
from pathlib import Path

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class GeminiService:
    def __init__(self):
        self.model_name = "gemini-2.5-flash-lite"
        self.available = False
        self.model = None
        self.api_key = None

    def init_model(self, api_key: Optional[str] = None):
        if not GENAI_AVAILABLE:
            print("Google AI library not installed")
            return

        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            print("GEMINI_API_KEY not found")
            return

        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            self.available = True
            print(f"Gemini AI initialized: {self.model_name}")
        except Exception as e:
            print(f"Gemini init failed: {e}")
            self.available = False

    def clean_text(self, text: str) -> str:
        text = text.strip()
        text = text.replace('``````', '')
        return text.strip()

    async def analyze_clothing_image(self, image_path: str, custom_prompt: Optional[str] = None) -> Dict[str, Any]:
        if not self.available:
            return {"success": False, "error": "Gemini AI service not available"}

        try:
            full_path = Path(image_path)
            if not full_path.exists():
                full_path = Path.cwd() / image_path
            
            if not full_path.exists():
                return {"success": False, "error": f"Image not found: {image_path}"}

            if not custom_prompt:
                custom_prompt = """You are a professional fashion stylist AI. Analyze this clothing item in detail.

Provide analysis in the following categories:
- Category: exact clothing type (shirt, pants, dress, jacket, shoes, etc.)
- Colors: list of colors visible, primary first
- Style: fashion style (casual, formal, sporty, vintage, streetwear, etc.)
- Season: suitable seasons (spring, summer, fall, winter, all-season)
- Occasion: where to wear (work, party, casual, formal, athletic, wedding, etc.)
- Material: fabric type if visible (cotton, polyester, wool, denim, leather, etc.)
- Condition: visual condition (new, excellent, good, worn, damaged)
- Brand: brand name if recognizable
- Description: detailed 2-3 sentences about design, fit, unique features
- Patterns: pattern type (solid, striped, plaid, floral, print, etc.)
- Fit: fit style (regular, slim, oversized, tight, loose, etc.)

Return ONLY valid JSON without any markdown formatting:
{
  "category": "shirt",
  "colors": ["blue", "white"],
  "style": "casual",
  "season": "all-season",
  "occasion": "casual",
  "material": "cotton",
  "condition": "good",
  "brand": "unknown",
  "description": "A stylish blue shirt...",
  "patterns": "solid",
  "fit": "regular"
}"""

            image_file = genai.upload_file(str(full_path))
            response = self.model.generate_content([custom_prompt, image_file])
            
            clean = self.clean_text(response.text)
            
            try:
                parsed = json.loads(clean)
            except json.JSONDecodeError as e:
                print(f"JSON parse error: {e}")
                parsed = {"raw_response": clean, "parse_error": str(e)}

            return {"success": True, "analysis": parsed, "model": self.model_name}

        except Exception as e:
            error_msg = str(e)
            if "quota" in error_msg.lower():
                return {"success": False, "error": "API quota exceeded"}
            elif "auth" in error_msg.lower():
                return {"success": False, "error": "Authentication failed"}
            else:
                return {"success": False, "error": f"Analysis failed: {error_msg}"}

    async def generate_outfit_recommendations(
        self,
        wardrobe_items: List[Dict[str, Any]],
        occasion: Optional[str] = None,
        weather: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.available:
            return {"success": False, "error": "Gemini AI not available"}

        try:
            items_text = []
            for idx, item in enumerate(wardrobe_items, 1):
                cat = item.get('category', 'unknown')
                col = item.get('color', 'unknown')
                items_text.append(f"{idx}. {cat} - {col}")

            wardrobe_desc = "\n".join(items_text) or "No items"
            occ = occasion or "everyday casual"
            weath = weather or "normal"

            prompt = f"""You are a professional fashion stylist. Create outfit recommendations using ONLY the provided wardrobe items.

WARDROBE ITEMS:
{wardrobe_desc}

REQUIREMENTS:
- Occasion: {occ}
- Weather: {weath}

Create 3-5 complete outfit combinations. For each outfit provide:
- outfit_name: creative name
- description: why this combination works well
- items: list of items from wardrobe to use
- style_notes: tips for styling

Return ONLY valid JSON without markdown:
{{
  "outfits": [
    {{
      "outfit_name": "Casual Comfort",
      "description": "Perfect for relaxed weekend...",
      "items": [{{"category": "shirt", "color": "blue"}}, {{"category": "pants", "color": "jeans"}}],
      "style_notes": "Pair with white sneakers..."
    }}
  ]
}}"""

            response = self.model.generate_content(prompt)
            clean = self.clean_text(response.text)
            
            try:
                parsed = json.loads(clean)
            except json.JSONDecodeError:
                parsed = {"raw_response": clean}

            return {"success": True, "recommendations": parsed, "model": self.model_name}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def analyze_style_profile(self, wardrobe_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not self.available:
            return {"success": False, "error": "Gemini AI not available"}

        try:
            items_text = []
            for item in wardrobe_items:
                cat = item.get('category', 'unknown')
                col = item.get('color', 'unknown')
                items_text.append(f"- {cat}: {col}")

            wardrobe_desc = "\n".join(items_text) or "- empty"

            prompt = f"""You are a fashion consultant. Analyze this wardrobe and create a style profile.

WARDROBE:
{wardrobe_desc}

Provide analysis:
- dominant_style: main style direction
- color_palette: most used colors (list)
- strengths: what works well (list)
- recommendations: suggestions for improvement
- style_summary: overall assessment

Return ONLY valid JSON without markdown:
{{
  "dominant_style": "casual",
  "color_palette": ["blue", "white", "gray"],
  "strengths": ["Good basics", "Versatile pieces"],
  "recommendations": "Consider adding...",
  "style_summary": "Your wardrobe shows..."
}}"""

            response = self.model.generate_content(prompt)
            clean = self.clean_text(response.text)
            
            try:
                parsed = json.loads(clean)
            except json.JSONDecodeError:
                parsed = {"raw_response": clean}

            return {"success": True, "profile": parsed, "model": self.model_name}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def analyze_single_item(
        self,
        item: Dict[str, Any],
        other_wardrobe: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not self.available:
            return {"success": False, "error": "Gemini AI not available"}
        
        try:
            wardrobe_desc = "\n".join([
                f"- {w.get('category', 'unknown')}: {w.get('color', 'unknown')}"
                for w in other_wardrobe[:20]
            ]) or "- empty"
            
            prompt = f"""You are a fashion stylist. Analyze this item and provide styling advice.

ITEM:
- Category: {item.get('category', 'unknown')}
- Color: {item.get('color', 'unknown')}
- Description: {item.get('description', 'N/A')}

USER'S OTHER WARDROBE:
{wardrobe_desc}

Provide analysis in JSON:
{{
  "styling_tips": "How to style...",
  "best_combinations": [
    {{"with": "pants", "color": "black", "reason": "Creates contrast"}}
  ],
  "occasions": ["work", "casual"],
  "do_wear": ["Tuck it in", "Roll sleeves"],
  "dont_wear": ["Avoid patterns", "Skip formal"],
  "accessories": ["Belt", "Watch"],
  "overall_rating": 8,
  "style_direction": "smart casual"
}}

Return ONLY valid JSON without markdown."""

            response = self.model.generate_content(prompt)
            clean = self.clean_text(response.text)
            
            try:
                parsed = json.loads(clean)
            except json.JSONDecodeError:
                parsed = {"raw_response": clean}
            
            return {"success": True, "analysis": parsed, "model": self.model_name}
        
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def analyze_outfit_combination(
        self,
        items: List[Dict[str, Any]],
        occasion: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.available:
            return {"success": False, "error": "Gemini AI not available"}
        
        try:
            items_desc = "\n".join([
                f"{i+1}. {item.get('category', 'unknown')} - {item.get('color', 'unknown')}"
                for i, item in enumerate(items)
            ])
            
            occasion_text = f"\nOccasion: {occasion}" if occasion else ""
            
            prompt = f"""You are a fashion stylist. Analyze this outfit combination.

OUTFIT:
{items_desc}{occasion_text}

Provide analysis in JSON:
{{
  "compatibility_score": 8.5,
  "style_type": "casual sporty",
  "color_harmony": "excellent",
  "overall_impression": "Assessment...",
  "pros": ["What works", "Good point"],
  "cons": ["Could improve", "Issue"],
  "suggestions": [
    {{"change": "Replace X", "reason": "Better fit"}}
  ],
  "best_occasions": ["casual", "weekend"],
  "avoid_occasions": ["formal", "business"],
  "missing_pieces": ["Jacket", "Accessory"],
  "accessories_recommendations": ["Watch", "Belt"],
  "footwear_advice": "Best shoes...",
  "final_verdict": "Great combination"
}}

Return ONLY valid JSON without markdown."""

            response = self.model.generate_content(prompt)
            clean = self.clean_text(response.text)
            
            try:
                parsed = json.loads(clean)
            except json.JSONDecodeError:
                parsed = {"raw_response": clean}
            
            return {"success": True, "analysis": parsed, "model": self.model_name}
        
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def generate_shopping_suggestions(
        self,
        category: str,
        color: str,
        description: str
    ) -> Dict[str, Any]:
        if not self.available:
            return {"success": False, "error": "Gemini AI not available"}
        
        try:
            prompt = f"""You are a shopping assistant. Help find where to buy this item in Russia.

ITEM:
- Category: {category}
- Color: {color}
- Description: {description}

Provide shopping recommendations in JSON:
{{
  "recommended_stores": [
    {{"store": "OZON", "reason": "Широкий выбор", "price_range": "₽1000-3000"}},
    {{"store": "Wildberries", "reason": "Хорошие скидки", "price_range": "₽800-2500"}}
  ],
  "search_keywords": ["keyword 1", "keyword 2"],
  "budget_options": "Ищите на WB в распродажах",
  "premium_options": "Для качества - OZON Premium",
  "style_tips": "С чем сочетать при покупке"
}}

Return ONLY valid JSON without markdown."""

            response = self.model.generate_content(prompt)
            clean = self.clean_text(response.text)
            
            try:
                parsed = json.loads(clean)
            except json.JSONDecodeError:
                parsed = {"raw_response": clean}
            
            return {"success": True, "suggestions": parsed}
        
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_status(self) -> Dict[str, Any]:
        return {
            "available": self.available,
            "model": self.model_name if self.available else None,
            "api_key_configured": bool(self.api_key)
        }


gemini_service = GeminiService()