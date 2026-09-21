import copy
from typing import List, Dict, Any
from app.models.schemas import (
    Holding, RiskMetrics, WhatIfRequest, WhatIfResponse, AssetClass
)
from app.analytics.risk_engine import calculate_portfolio_metrics

def simulate_portfolio_scenario(request: WhatIfRequest, baseline_holdings: List[Holding]) -> WhatIfResponse:
    # 1. Compute current baseline metrics
    curr_metrics, curr_alloc, _ = calculate_portfolio_metrics(baseline_holdings)

    # 2. Build simulated holdings
    simulated_holdings = copy.deepcopy(baseline_holdings)
    total_val = curr_metrics.total_portfolio_value
    
    # If target sector weights are specified (e.g. {"Technology": 30.0, "Healthcare": 25.0, ...})
    if request.target_sector_weights and total_val > 0:
        # Group holdings by sector
        sector_holdings: Dict[str, List[Holding]] = {}
        for h in simulated_holdings:
            sector_holdings.setdefault(h.sector, []).append(h)

        # Scale holdings according to desired sector weights
        for sector, target_pct in request.target_sector_weights.items():
            target_value = (target_pct / 100.0) * total_val
            current_sector_val = sum(h.quantity * h.current_price for h in sector_holdings.get(sector, []))

            if current_sector_val > 0 and sector in sector_holdings:
                scale_factor = target_value / current_sector_val
                for h in sector_holdings[sector]:
                    h.quantity = round(h.quantity * scale_factor, 4)
            elif target_value > 0 and sector not in sector_holdings:
                # Add a proxy holding for newly introduced sector
                if sector == "Precious Metals" or sector == "Commodities":
                    simulated_holdings.append(Holding(
                        id="sim-gold",
                        symbol="GOLDBEES",
                        name="Nippon India Gold BeES ETF",
                        asset_class=AssetClass.COMMODITY,
                        sector="Precious Metals",
                        quantity=round(target_value / 62.80, 2),
                        avg_buy_price=62.80,
                        current_price=62.80
                    ))
                elif sector == "Healthcare":
                    simulated_holdings.append(Holding(
                        id="sim-pharma",
                        symbol="SUNPHARMA",
                        name="Sun Pharma Industries",
                        asset_class=AssetClass.EQUITY,
                        sector="Healthcare",
                        quantity=round(target_value / 1810.0, 2),
                        avg_buy_price=1810.0,
                        current_price=1810.0
                    ))
                elif sector == "Fixed Income" or sector == "Bonds":
                    simulated_holdings.append(Holding(
                        id="sim-bond",
                        symbol="GSEC10Y",
                        name="GOI 10Y Sovereign Bond ETF",
                        asset_class=AssetClass.BOND,
                        sector="Sovereign Debt",
                        quantity=round(target_value / 105.20, 2),
                        avg_buy_price=105.20,
                        current_price=105.20
                    ))

    # Calculate simulated metrics
    sim_metrics, sim_alloc, _ = calculate_portfolio_metrics(simulated_holdings)

    # Compute deltas
    deltas = {
        "volatility_delta": round(sim_metrics.volatility - curr_metrics.volatility, 2),
        "sharpe_delta": round(sim_metrics.sharpe_ratio - curr_metrics.sharpe_ratio, 2),
        "drawdown_delta": round(sim_metrics.max_drawdown - curr_metrics.max_drawdown, 2),
        "beta_delta": round(sim_metrics.beta - curr_metrics.beta, 2),
        "diversification_delta": round(sim_metrics.diversification_score - curr_metrics.diversification_score, 1),
        "expected_return_delta": round(sim_metrics.annualized_return - curr_metrics.annualized_return, 2)
    }

    # Generate AI / Quant Explanation
    vol_change = "reduced" if deltas["volatility_delta"] < 0 else "increased"
    sharpe_change = "improves" if deltas["sharpe_delta"] > 0 else "softens"
    mdd_change = "cushioned" if deltas["drawdown_delta"] > 0 else "amplified"

    explanation = (
        f"Hypothetical Scenario Assessment:\n"
        f"By reallocating your portfolio as requested, overall portfolio volatility is {vol_change} by "
        f"{abs(deltas['volatility_delta'])}% (from {curr_metrics.volatility}% to {sim_metrics.volatility}%). "
        f"The peak estimated drawdown is {mdd_change} from {curr_metrics.max_drawdown}% to {sim_metrics.max_drawdown}%. "
        f"Your Diversification Score changes from {curr_metrics.diversification_score}/100 to {sim_metrics.diversification_score}/100 "
        f"({'+' if deltas['diversification_delta'] >= 0 else ''}{deltas['diversification_delta']} pts). "
        f"Risk-adjusted return (Sharpe ratio) {sharpe_change} from {curr_metrics.sharpe_ratio} to {sim_metrics.sharpe_ratio}."
    )

    recommendations = []
    if deltas["diversification_delta"] > 10:
        recommendations.append("The reallocation significantly reduces concentration risk and smooths out equity shocks.")
    if deltas["volatility_delta"] < -2.0:
        recommendations.append("Lower portfolio beta provides superior downside capital preservation during market downturns.")
    if sim_metrics.volatility < 14.0 and sim_metrics.sharpe_ratio >= 1.2:
        recommendations.append("This simulated mix achieves an optimal institutional risk-adjusted efficiency frontier.")

    return WhatIfResponse(
        current_metrics=curr_metrics,
        simulated_metrics=sim_metrics,
        metric_deltas=deltas,
        ai_explanation=explanation,
        recommendations=recommendations or ["Simulation maintains current risk profile with minor asset rebalancing."]
    )
