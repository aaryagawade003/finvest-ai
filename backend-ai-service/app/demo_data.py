from typing import Dict, List, Any
from app.models.schemas import Holding, AssetClass

def get_demo_profiles() -> Dict[str, Dict[str, Any]]:
    # 1. Growth Investor: ₹15,00,000 portfolio (55% Tech, 20% Financials, 10% Healthcare, 10% ETFs, 5% Gold)
    growth_holdings = [
        Holding(
            id="h-tcs",
            symbol="TCS",
            name="Tata Consultancy Services",
            asset_class=AssetClass.EQUITY,
            sector="Technology",
            quantity=72,
            avg_buy_price=3750.00,
            current_price=4210.00,
            currency="INR"
        ),
        Holding(
            id="h-msft",
            symbol="MSFT",
            name="Microsoft Corp.",
            asset_class=AssetClass.EQUITY,
            sector="Technology",
            quantity=7.5,
            avg_buy_price=31500.00,  # ~USD 375 in INR
            current_price=35090.00,  # ~USD 420.25 in INR
            currency="INR"
        ),
        Holding(
            id="h-nvda",
            symbol="NVDA",
            name="NVIDIA Corp.",
            asset_class=AssetClass.EQUITY,
            sector="Technology",
            quantity=25,
            avg_buy_price=8500.00,   # ~USD 102 in INR
            current_price=10250.00,  # ~USD 122.8 in INR
            currency="INR"
        ),
        Holding(
            id="h-hdfc",
            symbol="HDFCBANK",
            name="HDFC Bank Ltd.",
            asset_class=AssetClass.EQUITY,
            sector="Financial Services",
            quantity=120,
            avg_buy_price=1510.00,
            current_price=1640.50,
            currency="INR"
        ),
        Holding(
            id="h-icici",
            symbol="ICICIBANK",
            name="ICICI Bank Ltd.",
            asset_class=AssetClass.EQUITY,
            sector="Financial Services",
            quantity=85,
            avg_buy_price=1075.00,
            current_price=1215.30,
            currency="INR"
        ),
        Holding(
            id="h-sunpharma",
            symbol="SUNPHARMA",
            name="Sun Pharma Industries",
            asset_class=AssetClass.EQUITY,
            sector="Healthcare",
            quantity=83,
            avg_buy_price=1620.00,
            current_price=1810.00,
            currency="INR"
        ),
        Holding(
            id="h-niftybees",
            symbol="NIFTYBEES",
            name="Nippon India Nifty 50 BeES ETF",
            asset_class=AssetClass.ETF,
            sector="Broad Market Index",
            quantity=560,
            avg_buy_price=245.00,
            current_price=268.40,
            currency="INR"
        ),
        Holding(
            id="h-goldbees",
            symbol="GOLDBEES",
            name="Nippon India Gold BeES ETF",
            asset_class=AssetClass.COMMODITY,
            sector="Precious Metals",
            quantity=1200,
            avg_buy_price=56.00,
            current_price=62.80,
            currency="INR"
        )
    ]

    # 2. Balanced Investor: ₹10,00,000 portfolio (40% Equities, 30% Bonds, 20% ETFs, 10% Gold)
    balanced_holdings = [
        Holding(
            id="h-rel-bal",
            symbol="RELIANCE",
            name="Reliance Industries Ltd.",
            asset_class=AssetClass.EQUITY,
            sector="Energy",
            quantity=70,
            avg_buy_price=2750.00,
            current_price=2985.40,
            currency="INR"
        ),
        Holding(
            id="h-hdfc-bal",
            symbol="HDFCBANK",
            name="HDFC Bank Ltd.",
            asset_class=AssetClass.EQUITY,
            sector="Financial Services",
            quantity=115,
            avg_buy_price=1520.00,
            current_price=1640.50,
            currency="INR"
        ),
        Holding(
            id="h-gsec-bal",
            symbol="GSEC10Y",
            name="GOI 10Y Sovereign Bond ETF",
            asset_class=AssetClass.BOND,
            sector="Sovereign Debt",
            quantity=2850,
            avg_buy_price=101.00,
            current_price=105.20,
            currency="INR"
        ),
        Holding(
            id="h-nifty-bal",
            symbol="NIFTYBEES",
            name="Nippon India Nifty 50 BeES ETF",
            asset_class=AssetClass.ETF,
            sector="Broad Market Index",
            quantity=745,
            avg_buy_price=248.00,
            current_price=268.40,
            currency="INR"
        ),
        Holding(
            id="h-gold-bal",
            symbol="GOLDBEES",
            name="Nippon India Gold BeES ETF",
            asset_class=AssetClass.COMMODITY,
            sector="Precious Metals",
            quantity=1600,
            avg_buy_price=57.50,
            current_price=62.80,
            currency="INR"
        )
    ]

    # 3. Conservative Investor: ₹8,00,000 portfolio (50% Bonds, 20% Blue chips, 20% ETFs, 10% Gold)
    conservative_holdings = [
        Holding(
            id="h-gsec-cons",
            symbol="GSEC10Y",
            name="GOI 10Y Sovereign Bond ETF",
            asset_class=AssetClass.BOND,
            sector="Sovereign Debt",
            quantity=3800,
            avg_buy_price=102.50,
            current_price=105.20,
            currency="INR"
        ),
        Holding(
            id="h-tcs-cons",
            symbol="TCS",
            name="Tata Consultancy Services",
            asset_class=AssetClass.EQUITY,
            sector="Technology",
            quantity=38,
            avg_buy_price=3900.00,
            current_price=4210.00,
            currency="INR"
        ),
        Holding(
            id="h-nifty-cons",
            symbol="NIFTYBEES",
            name="Nippon India Nifty 50 BeES ETF",
            asset_class=AssetClass.ETF,
            sector="Broad Market Index",
            quantity=600,
            avg_buy_price=250.00,
            current_price=268.40,
            currency="INR"
        ),
        Holding(
            id="h-gold-cons",
            symbol="GOLDBEES",
            name="Nippon India Gold BeES ETF",
            asset_class=AssetClass.COMMODITY,
            sector="Precious Metals",
            quantity=1270,
            avg_buy_price=58.00,
            current_price=62.80,
            currency="INR"
        )
    ]

    return {
        "growth": {
            "id": "port-growth-01",
            "name": "Growth Investor Profile",
            "owner": "Aditya Sharma",
            "description": "Aggressive capital compounding oriented portfolio with 55% Technology concentration and high-beta equities.",
            "benchmark_name": "NIFTY 50",
            "holdings": growth_holdings
        },
        "balanced": {
            "id": "port-balanced-02",
            "name": "Balanced Multi-Asset Profile",
            "owner": "Priya Patel",
            "description": "Core-satellite strategy blending Large Cap equities, Sovereign debt (30%), and precious metals hedge (10%).",
            "benchmark_name": "NIFTY 50",
            "holdings": balanced_holdings
        },
        "conservative": {
            "id": "port-conservative-03",
            "name": "Conservative Wealth Preservation Profile",
            "owner": "Vikram Malhotra",
            "description": "Defensive capital preservation portfolio prioritizing low volatility and drawdown mitigation via 50% G-Sec bonds.",
            "benchmark_name": "NIFTY 50",
            "holdings": conservative_holdings
        }
    }
