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
            "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY") or "",
            "FINNHUB_API_KEY": os.getenv("FINNHUB_API_KEY") or "",
            "ALPHA_VANTAGE_API_KEY": os.getenv("ALPHA_VANTAGE_API_KEY") or "",
            "DEFAULT_LLM_PROVIDER": os.getenv("DEFAULT_LLM_PROVIDER") or "gemini"
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
        openai = self.get_key("OPENAI_API_KEY")
        finnhub = self.get_key("FINNHUB_API_KEY")
        alpha = self.get_key("ALPHA_VANTAGE_API_KEY")

        def mask(val: str) -> str:
            if not val:
                return "Not Configured"
            if len(val) <= 8:
                return "••••••••"
            return f"{val[:4]}...{val[-4:]}"

        active_llm = "None"
        if gemini:
            active_llm = "Google Gemini"
        elif openai:
            active_llm = "OpenAI"

        return {
            "active_llm_provider": active_llm,
            "providers": {
                "gemini": {
                    "configured": bool(gemini),
                    "masked_key": mask(gemini),
                    "model": "gemini-1.5-flash / gemini-2.0-flash"
                },
                "openai": {
                    "configured": bool(openai),
                    "masked_key": mask(openai),
                    "model": "gpt-4o-mini / gpt-4o"
                },
                "finnhub": {
                    "configured": bool(finnhub),
                    "masked_key": mask(finnhub),
                    "features": "Real-time Quotes & Company News"
                },
                "alpha_vantage": {
                    "configured": bool(alpha),
                    "masked_key": mask(alpha),
                    "features": "Global Quote & Daily Series"
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
                        "message": f"Successfully connected to Gemini API ({latency}ms). Live probe response: {resp.text.strip()}"
                    }
                return {"valid": False, "provider": "Google Gemini", "message": "No text generated"}
            except Exception as e:
                return {"valid": False, "provider": "Google Gemini", "message": str(e)}

        elif p == "openai":
            try:
                import openai
                client = openai.OpenAI(api_key=key)
                models = client.models.list()
                latency = int((time.time() - start) * 1000)
                return {
                    "valid": True,
                    "provider": "OpenAI",
                    "latency_ms": latency,
                    "message": f"Successfully verified OpenAI API key ({latency}ms). Accessible models confirmed."
                }
            except Exception as e:
                return {"valid": False, "provider": "OpenAI", "message": str(e)}

        elif p == "finnhub":
            try:
                import httpx
                async with httpx.AsyncClient(timeout=8.0) as client:
                    r = await client.get(f"https://finnhub.io/api/v1/quote?symbol=AAPL&token={key}")
                    latency = int((time.time() - start) * 1000)
                    if r.status_code == 200 and "c" in r.json() and r.json()["c"] != 0:
                        return {
                            "valid": True,
                            "provider": "Finnhub",
                            "latency_ms": latency,
                            "message": f"Successfully connected to Finnhub API ({latency}ms). Live AAPL price: ${r.json().get('c')}"
                        }
                    elif r.status_code == 401 or r.status_code == 403:
                        return {"valid": False, "provider": "Finnhub", "message": "Invalid API key (HTTP 401/403)"}
                    else:
                        return {"valid": False, "provider": "Finnhub", "message": f"API returned HTTP {r.status_code}: {r.text}"}
            except Exception as e:
                return {"valid": False, "provider": "Finnhub", "message": str(e)}

        elif p == "alpha_vantage":
            try:
                import httpx
                async with httpx.AsyncClient(timeout=8.0) as client:
                    r = await client.get(f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey={key}")
                    latency = int((time.time() - start) * 1000)
                    data = r.json()
                    if "Global Quote" in data and data["Global Quote"]:
                        return {
                            "valid": True,
                            "provider": "Alpha Vantage",
                            "latency_ms": latency,
                            "message": f"Successfully connected to Alpha Vantage API ({latency}ms). IBM Quote verified."
                        }
                    elif "Error Message" in data or "Information" in data:
                        return {"valid": False, "provider": "Alpha Vantage", "message": data.get("Error Message") or data.get("Information")}
                    else:
                        return {"valid": False, "provider": "Alpha Vantage", "message": "Could not retrieve quote"}
            except Exception as e:
                return {"valid": False, "provider": "Alpha Vantage", "message": str(e)}

        return {"valid": False, "provider": provider, "message": "Unknown provider"}

settings_manager = SettingsManager()
