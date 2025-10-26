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
                print(f"Raw response: {clean}")
                parsed = {"raw_response": clean, "parse_error": str(e)}

            return {"success": True, "analysis": parsed, "model": self.model_name}

        except Exception as e:
            error_msg = str(e)
            if "quota" in error_msg.lower():
                return {"success": False, "error": "API quota exceeded. Try again later."}
            elif "auth" in error_msg.lower():
                return {"success": False, "error": "Authentication failed. Check API key."}
            elif "file" in error_msg.lower():
                return {"success": False, "error": f"File error: {error_msg}"}
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
            weath = weather or "normal temperature"

            prompt = f"""You are a professional fashion stylist. Create outfit recommendations using ONLY the provided wardrobe items.

WARDROBE ITEMS:
{wardrobe_desc}

REQUIREMENTS:
- Occasion: {occ}
- Weather: {weath}

Create 3-5 complete outfit combinations. For each outfit provide:
- outfit_name: creative name
- description: why this combination works well
- items: list of items from wardrobe to use (with category and color)
- style_notes: tips for styling, accessories, shoes

Return ONLY valid JSON without markdown:
{{
  "outfits": [
    {{
      "outfit_name": "Casual Comfort",
      "description": "Perfect for relaxed weekend...",
      "items": [{{"category": "shirt", "color": "blue"}}, {{"category": "pants", "color": "jeans"}}],
      "occasion": "{occ}",
      "weather": "{weath}",
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

            prompt = f"""You are a fashion consultant. Analyze this wardrobe and create a comprehensive style profile.

WARDROBE:
{wardrobe_desc}

Provide analysis with:
- dominant_style: main style direction
- color_palette: most used colors (list)
- strengths: what works well in this wardrobe (list)
- recommendations: suggestions for improvement
- style_summary: overall style assessment (2-3 sentences)

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
        """НОВОЕ: Анализ одной вещи из гардероба с рекомендациями"""
        if not self.available:
            return {"success": False, "error": "Gemini AI not available"}
        
        try:
            wardrobe_desc = "\n".join([
                f"- {w.get('category', 'unknown')}: {w.get('color', 'unknown')}"
                for w in other_wardrobe[:20]
            ]) or "- empty"
            
            prompt = f"""You are a professional fashion stylist. Analyze this clothing item and provide styling advice.

ITEM TO ANALYZE:
- Category: {item.get('category', 'unknown')}
- Color: {item.get('color', 'unknown')}
- Description: {item.get('description', 'N/A')}

USER'S OTHER WARDROBE ITEMS:
{wardrobe_desc}

Provide detailed analysis in JSON format:
{{
  "styling_tips": "How to style this item (2-3 sentences)...",
  "best_combinations": [
    {{"with": "pants", "color": "black", "reason": "Creates clean contrast"}},
    {{"with": "jeans", "color": "blue", "reason": "Casual versatile look"}}
  ],
  "occasions": ["work", "casual", "party"],
  "do_wear": ["Tuck it in for formal", "Roll sleeves for casual"],
  "dont_wear": ["Avoid with loud patterns", "Skip for very formal events"],
  "accessories": ["Leather belt", "Simple watch", "Minimal jewelry"],
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
            
            return {
                "success": True,
                "analysis": parsed,
                "model": self.model_name
            }
        
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def analyze_outfit_combination(
        self,
        items: List[Dict[str, Any]],
        occasion: Optional[str] = None
    ) -> Dict[str, Any]:
        """НОВОЕ: Анализ комбинации нескольких вещей (наряда)"""
        if not self.available:
            return {"success": False, "error": "Gemini AI not available"}
        
        try:
            items_desc = "\n".join([
                f"{i+1}. {item.get('category', 'unknown')} - {item.get('color', 'unknown')}"
                for i, item in enumerate(items)
            ])
            
            occasion_text = f"\nDesired occasion: {occasion}" if occasion else ""
            
            prompt = f"""You are a professional fashion stylist. Analyze this outfit combination.

OUTFIT ITEMS:
{items_desc}{occasion_text}

Provide comprehensive analysis in JSON format:
{{
  "compatibility_score": 8.5,
  "style_type": "casual sporty",
  "color_harmony": "excellent",
  "overall_impression": "Detailed assessment (2-3 sentences)...",
  "pros": ["What works well point 1", "Good aspect 2", "Strong point 3"],
  "cons": ["What could be improved 1", "Potential issue 2"],
  "suggestions": [
    {{"change": "Replace X with Y", "reason": "Better fit for style"}},
    {{"change": "Add accessory Z", "reason": "Completes the look"}}
  ],
  "best_occasions": ["casual outing", "weekend brunch", "date"],
  "avoid_occasions": ["formal event", "business meeting"],
  "missing_pieces": ["Light jacket", "Statement accessory"],
  "accessories_recommendations": ["Watch", "Belt", "Sunglasses"],
  "footwear_advice": "Best shoes for this outfit...",
  "final_verdict": "Great combination"
}}

Return ONLY valid JSON without markdown."""

            response = self.model.generate_content(prompt)
            clean = self.clean_text(response.text)
            
            try:
                parsed = json.loads(clean)
            except json.JSONDecodeError:
                parsed = {"raw_response": clean}
            
            return {
                "success": True,
                "analysis": parsed,
                "model": self.model_name
            }
        
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_status(self) -> Dict[str, Any]:
        return {
            "available": self.available,
            "model": self.model_name if self.available else None,
            "api_key_configured": bool(self.api_key)
        }


gemini_service = GeminiService()