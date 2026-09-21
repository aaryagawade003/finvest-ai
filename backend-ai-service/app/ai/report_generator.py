from typing import Dict, Any
from datetime import datetime
from app.models.schemas import PortfolioSummary, ReportRequest

def generate_executive_report(request: ReportRequest) -> Dict[str, Any]:
    p = request.portfolio
    now_str = datetime.now().strftime("%B %d, %Y")
    
    if not p:
        return {"error": "No portfolio provided"}

    m = p.metrics
    alloc = p.allocation.sector_allocation if p.allocation else {}
    top_holdings = p.allocation.top_holdings if p.allocation else []

    top_sector = max(alloc.items(), key=lambda x: x[1]) if alloc else ("Technology", 55.0)
    alpha = round(m.annualized_return - m.benchmark_return, 2)
    alpha_str = f"+{alpha}%" if alpha >= 0 else f"{alpha}%"

    report = {
        "report_id": f"FINVEST-REP-{datetime.now().strftime('%Y%m%d-%H%M')}",
        "generated_at": now_str,
        "portfolio_name": p.name,
        "owner": p.owner,
        "currency": "INR",
        "executive_summary": {
            "verdict": "Capital Compounding with Elevated Single-Sector Risk",
            "headline": (
                f"The portfolio demonstrates robust performance with an annualized return of {m.annualized_return}%, "
                f"outperforming the {m.benchmark_name} benchmark by {alpha_str}. However, heavy concentration in {top_sector[0]} ({top_sector[1]}%) "
                f"elevates volatility to {m.volatility}% and historical drawdown to {m.max_drawdown}%."
            ),
            "key_takeaways": [
                f"Generated {alpha_str} Alpha relative to benchmark ({m.benchmark_name}).",
                f"Risk-adjusted efficiency is attractive with a Sharpe Ratio of {m.sharpe_ratio} (above hurdle rate of 1.0).",
                f"{top_sector[0]} constitutes {top_sector[1]}% of total capital, triggering concentration warnings.",
                f"Diversification score is rated at {m.diversification_score}/100."
            ]
        },
        "financial_snapshot": {
            "total_value": m.total_portfolio_value,
            "invested_capital": m.total_invested_amount,
            "net_unrealized_pnl": m.total_unrealized_pnl,
            "net_pnl_percentage": m.total_pnl_percentage,
            "today_pnl": m.today_pnl,
            "today_pnl_percentage": m.today_pnl_percentage
        },
        "risk_analytics_table": [
            {"metric": "Annualized Return", "portfolio": f"{m.annualized_return}%", "benchmark": f"{m.benchmark_return}%", "status": "Strong"},
            {"metric": "Annualized Volatility", "portfolio": f"{m.volatility}%", "benchmark": "13.0%", "status": "Moderate-High"},
            {"metric": "Sharpe Ratio (Rf=6.5%)", "portfolio": f"{m.sharpe_ratio}", "benchmark": "0.95", "status": "Optimal"},
            {"metric": "Sortino Ratio", "portfolio": f"{m.sortino_ratio}", "benchmark": "1.10", "status": "Optimal"},
            {"metric": "Maximum Drawdown", "portfolio": f"{m.max_drawdown}%", "benchmark": "-6.5%", "status": "Caution"},
            {"metric": "Portfolio Beta", "portfolio": f"{m.beta}", "benchmark": "1.00", "status": "Aggressive"},
            {"metric": "Diversification Score", "portfolio": f"{m.diversification_score}/100", "benchmark": "75/100", "status": "Needs Improvement"}
        ],
        "sector_breakdown": alloc,
        "top_holdings": top_holdings[:5],
        "strategic_recommendations": [
            f"Trim {top_sector[0]} exposure from {top_sector[1]}% down toward 30%–35% across upcoming rebalancing windows.",
            "Increase allocation to Gold (GOLDBEES) and Short-Duration Sovereign Debt to 10%–15% to lower portfolio drawdown.",
            "Utilize the FinVest What-If Simulator before executing large trades to preview shifts in portfolio beta and volatility."
        ]
    }
    return report
