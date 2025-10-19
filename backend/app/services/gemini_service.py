import json
from typing import Optional, Dict, Any, List
from pathlib import Path

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

class GeminiService:
    def __init__(self):
        self.model_name = "gemini-1.5-flash"
        self.available = False
        self.model = None

    def init_model(self, api_key: str):
        if not GENAI_AVAILABLE:
            print("Google AI library not installed")
            return
        if not api_key:
            print("API key not provided")
            return
        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(self.model_name)
            self.available = True
            print("Gemini AI initialized successfully")
        except Exception as e:
            print(f"Gemini init failed: {e}")
            self.available = False

    def clean_text(self, text: str) -> str:
        return text.strip()

    async def analyze_clothing_image(self, image_path: str, custom_prompt: Optional[str] = None) -> Dict[str, Any]:
        if not self.available:
            return {"success": False, "error": "Gemini not available"}
        try:
            full_path = Path(image_path)
            if not full_path.exists():
                full_path = Path.cwd() / image_path
            if not full_path.exists():
                return {"success": False, "error": "Image not found"}

            prompt = custom_prompt or "Analyze this clothing item in JSON format"
            image_file = genai.upload_file(str(full_path))
            response = self.model.generate_content([prompt, image_file])
            clean = self.clean_text(response.text)

            try:
                parsed = json.loads(clean)
            except json.JSONDecodeError:
                parsed = {"raw": clean}

            return {"success": True, "analysis": parsed, "model": self.model_name}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def generate_outfit_recommendations(self, wardrobe_items: List, occasion: Optional[str] = None, weather: Optional[str] = None) -> Dict[str, Any]:
        if not self.available:
            return {"success": False, "error": "Gemini not available"}
        try:
            items = []
            for item in wardrobe_items:
                item_id = getattr(item, "id", "?")
                category = getattr(item, "category", "?")
                color = getattr(item, "color", "?")
                items.append(f"ID {item_id}: {category} {color}")

            text = "\n".join(items)
            occ = occasion or "casual"
            wth = weather or "normal"
            prompt = f"Wardrobe:\n{text}\n\nOccasion: {occ}\nWeather: {wth}\n\nSuggest 3 outfits"

            response = self.model.generate_content(prompt)
            clean = self.clean_text(response.text)

            try:
                recs = json.loads(clean)
            except json.JSONDecodeError:
                recs = {"raw": clean}

            return {"success": True, "recommendations": recs, "model": self.model_name}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def analyze_style_profile(self, wardrobe_items: List) -> Dict[str, Any]:
        if not self.available:
            return {"success": False, "error": "Gemini not available"}
        try:
            items = []
            for item in wardrobe_items:
                cat = getattr(item, "category", "?")
                col = getattr(item, "color", "?")
                items.append(f"{cat} {col}")

            text = ", ".join(items)
            prompt = f"Analyze style based on: {text}. Respond in JSON"

            response = self.model.generate_content(prompt)
            clean = self.clean_text(response.text)

            try:
                profile = json.loads(clean)
            except json.JSONDecodeError:
                profile = {"raw": clean}

            return {"success": True, "profile": profile, "model": self.model_name}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_status(self) -> Dict[str, Any]:
        return {"available": self.available, "model": self.model_name}


gemini_service = GeminiService()
