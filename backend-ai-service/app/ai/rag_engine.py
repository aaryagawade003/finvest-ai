from typing import List, Dict
import re

FINANCIAL_KNOWLEDGE_BASE = [
    {
        "id": "doc-tech-concentration",
        "topic": "Technology Sector Risk & Valuations",
        "keywords": ["tech", "technology", "concentration", "aapl", "msft", "nvda", "tcs", "infy", "risk"],
        "content": "Technology stocks exhibit higher beta (>1.2) and elevated volatility. Portfolios with over 40% tech exposure are vulnerable to sudden multiple compression when interest rates rise or guidance softens. Trimming tech exposure to ~30% and rebalancing into defensive sectors (Healthcare, Consumer Staples) or Gold significantly moderates peak drawdown without sacrificing long-term compounding."
    },
    {
        "id": "doc-sharpe-ratio",
        "topic": "Interpreting Sharpe and Sortino Ratios",
        "keywords": ["sharpe", "sortino", "ratio", "risk-adjusted", "performance", "return"],
        "content": "A Sharpe ratio above 1.0 is considered good; above 1.3 is very strong, indicating the investor is generating adequate excess returns over the risk-free rate (6.5% G-Sec) per unit of total risk. A higher Sortino ratio indicates that downside volatility is well-contained relative to upside capture."
    },
    {
        "id": "doc-drawdown-mitigation",
        "topic": "Maximum Drawdown & Capital Preservation",
        "keywords": ["drawdown", "mdd", "loss", "crash", "fall", "capital", "preservation"],
        "content": "Maximum Drawdown (MDD) measures the peak-to-trough drop before a new peak is reached. Deep drawdowns (>15%) require disproportionately high returns to break even (a 20% loss requires a 25% gain; a 50% loss requires a 100% gain). Asset allocation into Sovereign Gold (GOLDBEES) and Fixed Income buffers drawdown during equity corrections."
    },
    {
        "id": "doc-gold-hedge",
        "topic": "Gold and Commodities as Non-Correlated Hedges",
        "keywords": ["gold", "commodity", "hedge", "inflation", "diversification", "uncorrelated"],
        "content": "Gold typically exhibits near-zero or slightly negative correlation (-0.05 to 0.15) with broad equity markets. Maintaining 5% to 10% allocation in Gold ETFs (such as GOLDBEES) improves portfolio diversification score and provides structural crisis alpha during geopolitical or currency stress."
    },
    {
        "id": "doc-benchmark-comparison",
        "topic": "Alpha Generation vs Benchmark (NIFTY 50 / S&P 500)",
        "keywords": ["benchmark", "nifty", "s&p", "alpha", "beta", "outperform", "underperform"],
        "content": "A portfolio beta near 1.0 moves in tandem with the benchmark. A beta above 1.2 indicates aggressive cyclical exposure. Generating positive alpha (+2% to +4% over NIFTY 50) while keeping volatility within 2% of the index denotes superior stock selection and capital allocation."
    },
    {
        "id": "doc-market-today",
        "topic": "Recent Market Movement & Sector Shifts",
        "keywords": ["today", "recent", "fell", "drop", "why", "market", "decline"],
        "content": "Global technology equities recently underwent valuation consolidation following high chip inventory cycles and bond yield fluctuations. In domestic markets, banking and energy (Reliance, HDFC Bank) have provided defensive stabilization while IT stocks faced margin revisions."
    }
]

class RAGEngine:
    def __init__(self):
        self.documents = FINANCIAL_KNOWLEDGE_BASE

    def retrieve_context(self, query: str, top_k: int = 2) -> List[str]:
        tokens = set(re.findall(r'\w+', query.lower()))
        scored_docs = []
        for doc in self.documents:
            score = 0
            for kw in doc["keywords"]:
                if kw in tokens:
                    score += 2
                elif any(kw in t for t in tokens):
                    score += 1
            if score > 0:
                scored_docs.append((score, doc["content"]))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        if not scored_docs:
            return [self.documents[0]["content"]]
        return [doc[1] for doc in scored_docs[:top_k]]

rag_engine = RAGEngine()
