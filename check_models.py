import google.generativeai as genai
import os

# Твой API ключ
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "AIzaSy...твой_ключ"))

print("🔍 Список доступных моделей:\n")

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✅ {model.name}")
        print(f"   Описание: {model.display_name}")
        print(f"   Методы: {model.supported_generation_methods}\n")
