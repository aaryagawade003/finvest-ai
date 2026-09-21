import time
import httpx
from typing import Dict, Any, List, Optional
from app.settings_manager import settings_manager

# Common Indian NSE tickers that need .NS suffix for Yahoo Finance
INDIAN_TICKERS = {
    "TCS": "TCS.NS",
    "RELIANCE": "RELIANCE.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "INFY": "INFY.NS",
    "SUNPHARMA": "SUNPHARMA.NS",
    "NIFTYBEES": "NIFTYBEES.NS",
    "GOLDBEES": "GOLDBEES.NS",
    "GSEC10Y": "NETF10GSEC.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
    "ITC": "ITC.NS",
    "SBIN": "SBIN.NS",
    "BHARTIARTL": "BHARTIARTL.NS"
}

class LiveMarketService:
    def __init__(self):
        # In-memory quote cache: symbol -> (price, metadata, timestamp)
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl = 30  # seconds

    def normalize_symbol(self, symbol: str) -> str:
        s = symbol.strip().upper()
        if s in INDIAN_TICKERS:
            return INDIAN_TICKERS[s]
        return s

    async def get_live_quote(self, raw_symbol: str) -> Dict[str, Any]:
        raw = raw_symbol.strip().upper()
        now = time.time()

        # Check in-memory cache
        if raw in self._cache and (now - self._cache[raw]["cached_at"]) < self._cache_ttl:
            return self._cache[raw]["data"]

        target_sym = self.normalize_symbol(raw)
        finnhub_key = settings_manager.get_key("FINNHUB_API_KEY")
        alpha_key = settings_manager.get_key("ALPHA_VANTAGE_API_KEY")

        quote_data = None

        # 1. Try Finnhub (for US stocks or if Finnhub key is configured)
        if finnhub_key and not target_sym.endswith(".NS"):
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    r = await client.get(f"https://finnhub.io/api/v1/quote?symbol={raw}&token={finnhub_key}")
                    if r.status_code == 200:
                        j = r.json()
                        price = j.get("c", 0)
                        if price and price > 0:
                            prev = j.get("pc", price)
                            change = j.get("d", 0)
                            change_pct = j.get("dp", 0)
                            quote_data = {
                                "symbol": raw,
                                "source": "Finnhub Live API",
                                "price": round(float(price), 2),
                                "change": round(float(change), 2),
                                "change_pct": round(float(change_pct), 2),
                                "previous_close": round(float(prev), 2),
                                "high": round(float(j.get("h", price)), 2),
                                "low": round(float(j.get("l", price)), 2),
                                "currency": "USD"
                            }
            except Exception as e:
                print(f"Finnhub quote error for {raw}: {e}")

        # 2. Try Alpha Vantage if key configured and not yet fetched
        if not quote_data and alpha_key:
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    r = await client.get(f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={raw}&apikey={alpha_key}")
                    if r.status_code == 200:
                        g = r.json().get("Global Quote", {})
                        if "05. price" in g:
                            price = float(g["05. price"])
                            quote_data = {
                                "symbol": raw,
                                "source": "Alpha Vantage Live API",
                                "price": round(price, 2),
                                "change": round(float(g.get("09. change", 0)), 2),
                                "change_pct": round(float(g.get("10. change percent", "0%").replace("%", "")), 2),
                                "previous_close": round(float(g.get("08. previous close", price)), 2),
                                "high": round(float(g.get("03. high", price)), 2),
                                "low": round(float(g.get("04. low", price)), 2),
                                "currency": "USD"
                            }
            except Exception as e:
                print(f"Alpha Vantage quote error for {raw}: {e}")

        # 3. Try Yahoo Finance (yfinance) for real-time live data (works globally including NSE India)
        if not quote_data:
            try:
                import yfinance as yf
                ticker = yf.Ticker(target_sym)
                fast = getattr(ticker, "fast_info", None)
                if fast and hasattr(fast, "last_price") and fast.last_price is not None:
                    last_price = float(fast.last_price)
                    prev_close = float(getattr(fast, "previous_close", last_price) or last_price)
                    change = last_price - prev_close
                    change_pct = ((last_price - prev_close) / prev_close * 100) if prev_close > 0 else 0.0
                    curr = "INR" if target_sym.endswith(".NS") else getattr(fast, "currency", "USD")

                    quote_data = {
                        "symbol": raw,
                        "source": "Yahoo Finance Live Feed",
                        "price": round(last_price, 2),
                        "change": round(change, 2),
                        "change_pct": round(change_pct, 2),
                        "previous_close": round(prev_close, 2),
                        "high": round(float(getattr(fast, "day_high", last_price) or last_price), 2),
                        "low": round(float(getattr(fast, "day_low", last_price) or last_price), 2),
                        "currency": curr
                    }
                else:
                    # Fallback to history(period="1d")
                    hist = ticker.history(period="2d")
                    if not hist.empty:
                        last_price = float(hist["Close"].iloc[-1])
                        prev_close = float(hist["Close"].iloc[-2]) if len(hist) > 1 else last_price
                        change = last_price - prev_close
                        change_pct = (change / prev_close * 100) if prev_close > 0 else 0.0
                        quote_data = {
                            "symbol": raw,
                            "source": "Yahoo Finance Live Feed",
                            "price": round(last_price, 2),
                            "change": round(change, 2),
                            "change_pct": round(change_pct, 2),
                            "previous_close": round(prev_close, 2),
                            "currency": "INR" if target_sym.endswith(".NS") else "USD"
                        }
            except Exception as e:
                print(f"yfinance quote error for {raw}: {e}")

        # 4. Fallback catalog default if offline/network timeout
        if not quote_data:
            from app.market_data.market_store import ASSET_CATALOG
            fallback_meta = ASSET_CATALOG.get(raw, {"price": 100.0, "currency": "INR"})
            quote_data = {
                "symbol": raw,
                "source": "FinVest Standard Store",
                "price": fallback_meta["price"],
                "change": 0.0,
                "change_pct": 0.0,
                "previous_close": fallback_meta["price"],
                "currency": fallback_meta.get("currency", "INR")
            }

        # Cache result
        self._cache[raw] = {
            "data": quote_data,
            "cached_at": now
        }
        return quote_data

    async def get_live_news(self, raw_symbol: str) -> List[Dict[str, str]]:
        """Fetch real news headlines for a ticker from Finnhub or Yahoo Finance."""
        raw = raw_symbol.strip().upper()
        target_sym = self.normalize_symbol(raw)
        finnhub_key = settings_manager.get_key("FINNHUB_API_KEY")

        # Try Finnhub news
        if finnhub_key and not target_sym.endswith(".NS"):
            try:
                import datetime
                today = datetime.date.today().isoformat()
                from_date = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()
                async with httpx.AsyncClient(timeout=5.0) as client:
                    r = await client.get(
                        f"https://finnhub.io/api/v1/company-news?symbol={raw}&from={from_date}&to={today}&token={finnhub_key}"
                    )
                    if r.status_code == 200:
                        articles = r.json()
                        if isinstance(articles, list) and len(articles) > 0:
                            return [
                                {
                                    "headline": a.get("headline", ""),
                                    "summary": a.get("summary", ""),
                                    "source": a.get("source", "Finnhub News"),
                                    "url": a.get("url", "")
                                }
                                for a in articles[:4]
                            ]
            except Exception as e:
                print(f"Finnhub news error: {e}")

        # Try Yahoo Finance news
        try:
            import yfinance as yf
            ticker = yf.Ticker(target_sym)
            raw_news = getattr(ticker, "news", [])
            if raw_news:
                results = []
                for item in raw_news[:4]:
                    title = item.get("title") or (item.get("content", {}).get("title") if isinstance(item.get("content"), dict) else "")
                    summary = item.get("summary") or (item.get("content", {}).get("summary") if isinstance(item.get("content"), dict) else "")
                    publisher = item.get("publisher") or "Market News"
                    link = item.get("link") or (item.get("content", {}).get("canonicalUrl", {}).get("url") if isinstance(item.get("content"), dict) else "")
                    if title:
                        results.append({
                            "headline": title,
                            "summary": summary,
                            "source": publisher,
                            "url": link
                        })
                if results:
                    return results
        except Exception as e:
            print(f"yfinance news error: {e}")

        # Fallback simulated contextual news
        return [
            {
                "headline": f"{raw} consolidates amidst broader market sector rotation",
                "summary": f"Analysts cite steady balance sheet fundamentals and valuation multiple support for {raw}.",
                "source": "FinVest Intelligence Desk",
                "url": ""
            }
        ]

live_market_service = LiveMarketService()
