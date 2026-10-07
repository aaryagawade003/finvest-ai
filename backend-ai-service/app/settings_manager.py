import os
import time
from typing import Dict, Any
from pathlib import Path
from dotenv import load_dotenv, set_key

# Path to .env file
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_FILE)

class SettingsManager:
    def __init__(self):
        self._runtime_keys: Dict[str, str] = {
            "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "",
            "DEFAULT_LLM_PROVIDER": "gemini"
        }

    def get_key(self, key_name: str) -> str:
        return self._runtime_keys.get(key_name, "") or os.getenv(key_name, "")

    def set_key(self, key_name: str, key_val: str):
        self._runtime_keys[key_name] = key_val
        os.environ[key_name] = key_val
        try:
            if not ENV_FILE.exists():
                ENV_FILE.touch()
            set_key(str(ENV_FILE), key_name, key_val)
        except Exception as e:
            print(f"Warning: could not persist to .env: {e}")

    def get_status(self) -> Dict[str, Any]:
        gemini = self.get_key("GEMINI_API_KEY")

        def mask(val: str) -> str:
            if not val:
                return "Not Configured"
            if len(val) <= 8:
                return "••••••••"
            return f"{val[:4]}...{val[-4:]}"

        return {
            "active_llm_provider": "Google Gemini (Exclusively for AI Copilot)",
            "providers": {
                "gemini": {
                    "configured": bool(gemini),
                    "masked_key": mask(gemini),
                    "model": "gemini-2.5-flash / gemini-flash-latest",
                    "status": "Active (Dedicated Copilot Intelligence)"
                },
                "yahoo_finance": {
                    "configured": True,
                    "status": "Active (Zero-Key Real-Time Market Feed)",
                    "coverage": "US & Indian NSE/BSE Equities, ETFs & Commodities"
                }
            }
        }

    async def test_key(self, provider: str, key: str) -> Dict[str, Any]:
        p = provider.lower()
        start = time.time()

        if p == "gemini":
            try:
                import google.generativeai as genai
                genai.configure(api_key=key)
                try:
                    model = genai.GenerativeModel("gemini-2.5-flash")
                    resp = model.generate_content("Respond with only the single word: OK")
                except Exception:
                    model = genai.GenerativeModel("gemini-flash-latest")
                    resp = model.generate_content("Respond with only the single word: OK")
                latency = int((time.time() - start) * 1000)
                if resp and resp.text:
                    return {
                        "valid": True,
                        "provider": "Google Gemini",
                        "latency_ms": latency,
                        "message": f"Successfully connected to Gemini API ({latency}ms). Model confirmed live."
                    }
                return {"valid": False, "provider": "Google Gemini", "message": "No text generated"}
            except Exception as e:
                return {"valid": False, "provider": "Google Gemini", "message": str(e)}

        return {"valid": False, "provider": provider, "message": "Only Google Gemini is supported for AI Copilot."}

settings_manager = SettingsManager()
