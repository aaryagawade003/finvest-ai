import random
from typing import Dict, Any, List
from datetime import datetime, timedelta

# Asset master catalog
ASSET_CATALOG = {
    "AAPL": {"name": "Apple Inc.", "asset_class": "EQUITY", "sector": "Technology", "price": 185.50, "currency": "USD", "beta": 1.15, "volatility": 0.22},
    "MSFT": {"name": "Microsoft Corp.", "asset_class": "EQUITY", "sector": "Technology", "price": 420.25, "currency": "USD", "beta": 1.10, "volatility": 0.20},
    "NVDA": {"name": "NVIDIA Corp.", "asset_class": "EQUITY", "sector": "Technology", "price": 122.80, "currency": "USD", "beta": 1.65, "volatility": 0.38},
    "GOOGL": {"name": "Alphabet Inc.", "asset_class": "EQUITY", "sector": "Technology", "price": 178.40, "currency": "USD", "beta": 1.05, "volatility": 0.24},
    "RELIANCE": {"name": "Reliance Industries Ltd.", "asset_class": "EQUITY", "sector": "Energy", "price": 2985.40, "currency": "INR", "beta": 0.98, "volatility": 0.17},
    "TCS": {"name": "Tata Consultancy Services", "asset_class": "EQUITY", "sector": "Technology", "price": 4210.00, "currency": "INR", "beta": 0.85, "volatility": 0.15},
    "HDFCBANK": {"name": "HDFC Bank Ltd.", "asset_class": "EQUITY", "sector": "Financial Services", "price": 1640.50, "currency": "INR", "beta": 1.08, "volatility": 0.18},
    "ICICIBANK": {"name": "ICICI Bank Ltd.", "asset_class": "EQUITY", "sector": "Financial Services", "price": 1215.30, "currency": "INR", "beta": 1.12, "volatility": 0.19},
    "SUNPHARMA": {"name": "Sun Pharma Industries", "asset_class": "EQUITY", "sector": "Healthcare", "price": 1810.00, "currency": "INR", "beta": 0.65, "volatility": 0.14},
    "NIFTYBEES": {"name": "Nippon India Nifty 50 BeES ETF", "asset_class": "ETF", "sector": "Broad Market Index", "price": 268.40, "currency": "INR", "beta": 1.00, "volatility": 0.13},
    "GOLDBEES": {"name": "Nippon India Gold BeES ETF", "asset_class": "COMMODITY", "sector": "Precious Metals", "price": 62.80, "currency": "INR", "beta": 0.12, "volatility": 0.11},
    "GSEC10Y": {"name": "GOI 10Y Sovereign Bond ETF", "asset_class": "BOND", "sector": "Sovereign Debt", "price": 105.20, "currency": "INR", "beta": 0.05, "volatility": 0.05},
}

class MarketStore:
    def __init__(self):
        self._prices = {sym: meta["price"] for sym, meta in ASSET_CATALOG.items()}
        self._last_updated = datetime.now()

    def get_price(self, symbol: str) -> float:
        return self._prices.get(symbol.upper(), 100.0)

    def get_asset_info(self, symbol: str) -> Dict[str, Any]:
        info = ASSET_CATALOG.get(symbol.upper(), {
            "name": symbol,
            "asset_class": "EQUITY",
            "sector": "Other",
            "price": self.get_price(symbol),
            "currency": "INR",
            "beta": 1.0,
            "volatility": 0.18
        })
        info["current_price"] = self.get_price(symbol)
        return info

    def simulate_tick(self, symbol: str, drift: float = 0.0, shock: float = 0.0) -> float:
        """Simulate a tick with optional macro shock for demonstration."""
        sym = symbol.upper()
        if sym in self._prices:
            curr = self._prices[sym]
            random_pct = random.gauss(drift, 0.006) + shock
            new_price = round(curr * (1 + random_pct), 2)
            self._prices[sym] = max(0.1, new_price)
            return self._prices[sym]
        return 100.0

    def trigger_tech_shock(self, percentage_drop: float = -0.045) -> Dict[str, float]:
        """Trigger a technology sector drawdown event for the demo scenario."""
        affected = {}
        for sym, meta in ASSET_CATALOG.items():
            if meta["sector"] == "Technology":
                # Drop tech stocks
                self._prices[sym] = round(self._prices[sym] * (1 + percentage_drop), 2)
                affected[sym] = self._prices[sym]
        return affected

    def get_all_quotes(self) -> Dict[str, Dict[str, Any]]:
        result = {}
        for sym, meta in ASSET_CATALOG.items():
            result[sym] = {
                **meta,
                "current_price": self._prices.get(sym, meta["price"])
            }
        return result

    def generate_historical_series(self, days: int = 180, portfolio_drift: float = 0.0006, bench_drift: float = 0.0004) -> List[Dict[str, Any]]:
        """Generates historical daily performance series for charts."""
        random.seed(42)  # consistent baseline
        base_date = datetime.now() - timedelta(days=days)
        portfolio_val = 1000000.0
        benchmark_val = 1000000.0
        
        series = []
        for i in range(days):
            date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
            # Weekend skip for realistic stock market
            dt = base_date + timedelta(days=i)
            if dt.weekday() >= 5:
                continue

            port_ret = random.gauss(portfolio_drift, 0.009)
            bench_ret = random.gauss(bench_drift, 0.007)

            # Insert an interesting market dip 20 days ago for demonstration
            if days - 22 <= i <= days - 18:
                port_ret -= 0.015
                bench_ret -= 0.008

            portfolio_val *= (1 + port_ret)
            benchmark_val *= (1 + bench_ret)

            series.append({
                "date": date_str,
                "portfolio": round(portfolio_val, 2),
                "benchmark": round(benchmark_val, 2),
                "portfolio_return_pct": round(((portfolio_val / 1000000.0) - 1) * 100, 2),
                "benchmark_return_pct": round(((benchmark_val / 1000000.0) - 1) * 100, 2)
            })
        return series

market_store = MarketStore()
