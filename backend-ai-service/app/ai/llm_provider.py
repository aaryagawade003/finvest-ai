import os
from typing import Dict, Any, Optional
from app.settings_manager import settings_manager

class LLMProvider:
    def __init__(self):
        pass

    async def generate_ai_response(self, system_prompt: str, user_query: str) -> Dict[str, Any]:
        gemini_key = settings_manager.get_key("GEMINI_API_KEY")
        openai_key = settings_manager.get_key("OPENAI_API_KEY")
        preferred = settings_manager.get_key("DEFAULT_LLM_PROVIDER").lower()

        # 1. Try Google Gemini if configured or preferred
        if gemini_key and (preferred == "gemini" or not openai_key):
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                
                # Use gemini-2.5-flash or gemini-flash-latest
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
            except Exception as e:
                err_msg = str(e)
                print(f"Gemini generation error: {err_msg}")
                # If OpenAI is also available, try OpenAI before falling back
                if openai_key:
                    pass
                else:
                    return {
                        "content": None,
                        "provider": "Google Gemini",
                        "is_live": False,
                        "status": "API_ERROR",
                        "error": err_msg
                    }

        # 2. Try OpenAI if configured
        if openai_key:
            try:
                import openai
                client = openai.OpenAI(api_key=openai_key)
                completion = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_query}
                    ],
                    temperature=0.3
                )
                content = completion.choices[0].message.content
                if content:
                    return {
                        "content": content.strip(),
                        "provider": "OpenAI (gpt-4o-mini)",
                        "is_live": True,
                        "status": "SUCCESS"
                    }
            except Exception as e:
                err_msg = str(e)
                print(f"OpenAI generation error: {err_msg}")
                return {
                    "content": None,
                    "provider": "OpenAI",
                    "is_live": False,
                    "status": "API_ERROR",
                    "error": err_msg
                }

        # 3. Neither key configured
        return {
            "content": None,
            "provider": "None",
            "is_live": False,
            "status": "NO_KEY"
        }

llm_provider = LLMProvider()
