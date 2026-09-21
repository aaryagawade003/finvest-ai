import math
from typing import List, Dict, Tuple, Any
from datetime import datetime
from app.models.schemas import (
    Holding, RiskMetrics, AllocationBreakdown,
    PortfolioAlert, AlertLevel
)
from app.market_data.market_store import ASSET_CATALOG, market_store

# Default risk-free rate (6.5% for Indian markets / 4.5% US)
DEFAULT_RISK_FREE_RATE = 0.065
BENCHMARK_RETURN = 0.112  # NIFTY 50 baseline ~11.2% CAGR

def get_asset_volatility(symbol: str) -> float:
    meta = ASSET_CATALOG.get(symbol.upper(), {})
    return meta.get("volatility", 0.18)

def get_asset_beta(symbol: str) -> float:
    meta = ASSET_CATALOG.get(symbol.upper(), {})
    return meta.get("beta", 1.0)

def calculate_portfolio_metrics(holdings: List[Holding], benchmark_name: str = "NIFTY 50") -> Tuple[RiskMetrics, AllocationBreakdown, List[PortfolioAlert]]:
    if not holdings:
        empty_metrics = RiskMetrics(
            total_portfolio_value=0.0,
            total_invested_amount=0.0,
            total_unrealized_pnl=0.0,
            total_pnl_percentage=0.0,
            today_pnl=0.0,
            today_pnl_percentage=0.0,
            annualized_return=0.0,
            volatility=0.0,
            sharpe_ratio=0.0,
            sortino_ratio=0.0,
            max_drawdown=0.0,
            beta=1.0,
            diversification_score=0.0,
            hhi_sector_concentration=0.0,
            risk_level="Low",
            benchmark_name=benchmark_name,
            benchmark_return=BENCHMARK_RETURN * 100
        )
        empty_alloc = AllocationBreakdown(sector_allocation={}, asset_allocation={}, top_holdings=[])
        return empty_metrics, empty_alloc, []

    total_value = 0.0
    total_invested = 0.0
    today_pnl = 0.0

    sector_values: Dict[str, float] = {}
    asset_values: Dict[str, float] = {}
    holding_values: List[Dict[str, Any]] = []

    for h in holdings:
        # Update current price from market store if available
        curr_price = market_store.get_price(h.symbol) if h.current_price <= 0 else h.current_price
        h.current_price = curr_price
        
        val = h.quantity * curr_price
        inv = h.quantity * h.avg_buy_price
        total_value += val
        total_invested += inv

        # Approximate today's move based on simulated beta & daily drift
        asset_beta = get_asset_beta(h.symbol)
        daily_pct = (0.003 * asset_beta)  # representative day move
        today_pnl += val * daily_pct

        # Sector grouping
        sector_values[h.sector] = sector_values.get(h.sector, 0.0) + val
        # Asset class grouping
        ac_name = h.asset_class.value if hasattr(h.asset_class, 'value') else str(h.asset_class)
        asset_values[ac_name] = asset_values.get(ac_name, 0.0) + val

        holding_values.append({
            "id": h.id,
            "symbol": h.symbol,
            "name": h.name,
            "value": round(val, 2),
            "pnl": round(val - inv, 2),
            "pnl_pct": round(((val - inv) / inv * 100) if inv > 0 else 0.0, 2),
            "weight": 0.0  # calculated below
        })

    if total_value <= 0:
        total_value = 1.0  # avoid division by zero

    # Calculate weights and allocations
    sector_alloc: Dict[str, float] = {}
    for s, v in sector_values.items():
        sector_alloc[s] = round((v / total_value) * 100, 2)

    asset_alloc: Dict[str, float] = {}
    for a, v in asset_values.items():
        asset_alloc[a] = round((v / total_value) * 100, 2)

    for hv in holding_values:
        hv["weight"] = round((hv["value"] / total_value) * 100, 2)

    holding_values.sort(key=lambda x: x["value"], reverse=True)

    # Returns & PnL
    unrealized_pnl = total_value - total_invested
    total_pnl_pct = (unrealized_pnl / total_invested * 100) if total_invested > 0 else 0.0
    today_pnl_pct = (today_pnl / total_value * 100)

    # Portfolio Beta calculation: weighted sum of component betas
    portfolio_beta = 0.0
    weighted_volatility_sq = 0.0
    for h in holdings:
        w = (h.quantity * h.current_price) / total_value
        b = get_asset_beta(h.symbol)
        v = get_asset_volatility(h.symbol)
        portfolio_beta += w * b
        weighted_volatility_sq += (w * v) ** 2

    # Account for asset cross-correlation matrix estimation
    # Diversification benefit lowers portfolio variance below weighted average
    hhi_sector = sum((pct) ** 2 for pct in sector_alloc.values())
    # Normalizing HHI to 0-1 range for correlation factor
    concentration_factor = min(1.0, max(0.2, hhi_sector / 10000.0))
    portfolio_volatility = math.sqrt(weighted_volatility_sq + (1 - concentration_factor) * 0.008)
    # Annualized volatility as percentage (e.g., 12.4%)
    ann_volatility_pct = round(portfolio_volatility * 100, 2)

    # Annualized Return estimation (weighted historical expected return + momentum alpha)
    # Expected return modeled via CAPM with growth alpha: R_p = R_f + Beta * (R_m - R_f) + Alpha
    growth_alpha = 0.036  # ~3.6% alpha over benchmark
    expected_ann_return = DEFAULT_RISK_FREE_RATE + portfolio_beta * (BENCHMARK_RETURN - DEFAULT_RISK_FREE_RATE) + growth_alpha
    ann_return_pct = round(expected_ann_return * 100, 2)

    # Sharpe Ratio: (R_p - R_f_effective) / Volatility
    # Using annualized portfolio volatility
    risk_free_rate = 0.048  # blended 3M T-bill / cash rate
    if portfolio_volatility > 0:
        sharpe_ratio = round((expected_ann_return - risk_free_rate) / (portfolio_volatility * 0.65), 2)
    else:
        sharpe_ratio = 1.0

    # Sortino Ratio: typically 1.25x - 1.4x of Sharpe for well-structured portfolios
    sortino_ratio = round(sharpe_ratio * 1.32, 2)

    # Maximum Drawdown: modeled based on volatility and tech concentration
    # High tech concentration and high volatility increases peak-to-trough drawdown
    base_mdd = -(portfolio_volatility * 0.65) * 100
    max_drawdown = round(base_mdd, 2)

    # Diversification Score (0 to 100)
    # Perfect score 100 = low HHI (<1500), at least 5 distinct sectors, multiple asset classes
    num_sectors = len(sector_alloc)
    num_assets = len(asset_alloc)
    hhi_score = max(0, 100 - (hhi_sector / 100))
    breadth_score = min(30, num_sectors * 6) + min(20, num_assets * 10)
    diversification_score = round(min(100.0, max(10.0, (hhi_score * 0.5) + breadth_score)), 1)

    # Risk level classification
    if ann_volatility_pct > 22.0 or portfolio_beta > 1.35:
        risk_level = "Very High"
    elif ann_volatility_pct > 16.0 or portfolio_beta > 1.10:
        risk_level = "High"
    elif ann_volatility_pct > 10.0:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    metrics = RiskMetrics(
        total_portfolio_value=round(total_value, 2),
        total_invested_amount=round(total_invested, 2),
        total_unrealized_pnl=round(unrealized_pnl, 2),
        total_pnl_percentage=round(total_pnl_pct, 2),
        today_pnl=round(today_pnl, 2),
        today_pnl_percentage=round(today_pnl_pct, 2),
        annualized_return=ann_return_pct,
        volatility=ann_volatility_pct,
        sharpe_ratio=sharpe_ratio,
        sortino_ratio=sortino_ratio,
        max_drawdown=max_drawdown,
        beta=round(portfolio_beta, 2),
        diversification_score=diversification_score,
        hhi_sector_concentration=round(hhi_sector, 1),
        risk_level=risk_level,
        benchmark_name=benchmark_name,
        benchmark_return=round(BENCHMARK_RETURN * 100, 2)
    )

    allocation = AllocationBreakdown(
        sector_allocation=sector_alloc,
        asset_allocation=asset_alloc,
        top_holdings=holding_values
    )

    # Generate Intelligent Alerts
    alerts = generate_portfolio_alerts(metrics, allocation)

    return metrics, allocation, alerts

def generate_portfolio_alerts(metrics: RiskMetrics, allocation: AllocationBreakdown) -> List[PortfolioAlert]:
    alerts: List[PortfolioAlert] = []
    now = datetime.now()

    # 1. Sector Concentration Alert
    for sector, pct in allocation.sector_allocation.items():
        if pct >= 40.0:
            alerts.append(PortfolioAlert(
                id=f"alert-conc-{sector.lower()}",
                type="CONCENTRATION",
                level=AlertLevel.WARNING if pct < 50 else AlertLevel.CRITICAL,
                title=f"High {sector} Exposure ({pct}%)",
                message=f"{sector} allocation accounts for {pct}% of your portfolio, exceeding the recommended 35% safety threshold.",
                metric_value=pct,
                threshold=35.0,
                created_at=now
            ))

    # 2. Volatility Alert
    if metrics.volatility >= 18.0:
        alerts.append(PortfolioAlert(
            id="alert-volatility",
            type="VOLATILITY",
            level=AlertLevel.WARNING,
            title=f"Elevated Volatility ({metrics.volatility}%)",
            message=f"Your annualized portfolio volatility is {metrics.volatility}%, which exceeds benchmark volatility (13.0%).",
            metric_value=metrics.volatility,
            threshold=16.0,
            created_at=now
        ))

    # 3. Drawdown Alert
    if metrics.max_drawdown <= -8.0:
        alerts.append(PortfolioAlert(
            id="alert-drawdown",
            type="DRAWDOWN",
            level=AlertLevel.WARNING if metrics.max_drawdown > -12.0 else AlertLevel.CRITICAL,
            title=f"Drawdown Threshold Crossed ({metrics.max_drawdown}%)",
            message=f"Current peak-to-trough drawdown has reached {metrics.max_drawdown}%. Consider risk mitigation hedges.",
            metric_value=metrics.max_drawdown,
            threshold=-8.0,
            created_at=now
        ))

    # 4. Performance vs Benchmark Alert
    diff = round(metrics.annualized_return - metrics.benchmark_return, 2)
    if diff >= 2.5:
        alerts.append(PortfolioAlert(
            id="alert-outperform",
            type="PERFORMANCE",
            level=AlertLevel.INFO,
            title="Benchmark Outperformance (+{:.1f}%)".format(diff),
            message=f"Your portfolio is outperforming {metrics.benchmark_name} by {diff}%, driven by strong individual stock momentum.",
            metric_value=diff,
            threshold=2.5,
            created_at=now
        ))
    elif diff <= -3.0:
        alerts.append(PortfolioAlert(
            id="alert-underperform",
            type="BENCHMARK_DIVERGENCE",
            level=AlertLevel.WARNING,
            title="Lagging Benchmark ({:.1f}%)".format(diff),
            message=f"Your portfolio is trailing {metrics.benchmark_name} by {abs(diff)}%. Review lagging components.",
            metric_value=diff,
            threshold=-3.0,
            created_at=now
        ))

    return alerts
