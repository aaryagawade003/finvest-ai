import os
from typing import Dict, Any, Optional
from app.settings_manager import settings_manager

class LLMProvider:
    def __init__(self):
        pass

    async def generate_ai_response(self, system_prompt: str, user_query: str) -> Dict[str, Any]:
        """
        FinVest AI Copilot LLM Provider.
        Strictly dedicated to Google Gemini API using the verified user key.
        """
        gemini_key = settings_manager.get_key("GEMINI_API_KEY")

        if not gemini_key:
            return {
                "content": None,
                "provider": "None",
                "is_live": False,
                "status": "NO_KEY"
            }

        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            
            # Use gemini-2.5-flash with fallback to gemini-flash-latest
            model_name = "gemini-2.5-flash"
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_prompt
                )
                response = model.generate_content(user_query)
            except Exception:
                model_name = "gemini-flash-latest"
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_prompt
                )
                response = model.generate_content(user_query)

            if response and response.text:
                return {
                    "content": response.text.strip(),
                    "provider": f"Google Gemini ({model_name})",
                    "is_live": True,
                    "status": "SUCCESS"
                }
            else:
                return {
                    "content": None,
                    "provider": "Google Gemini",
                    "is_live": False,
                    "status": "API_ERROR",
                    "error": "Empty response from Gemini API"
                }
        except Exception as e:
            err_msg = str(e)
            print(f"Gemini generation error: {err_msg}")
            return {
                "content": None,
                "provider": "Google Gemini",
                "is_live": False,
                "status": "API_ERROR",
                "error": err_msg
            }

llm_provider = LLMProvider()
