# FinVest AI — Investment Portfolio Intelligence Platform

FinVest AI is an end-to-end, production-style FinTech application designed to convert raw portfolio and transaction data into deep financial intelligence. Rather than acting as a simple stock-price tracker, FinVest AI combines market data, financial analytics (Sharpe ratio, volatility, maximum drawdown, beta, diversification score), real-time event streaming, and an AI Copilot that explains risk factors and runs scenario simulations.

---

## Architecture Overview

```
                          ┌────────────────────────────────────────────────────────┐
                          │         React + TypeScript + Tailwind Frontend         │
                          │   (Dashboard, Analytics, Simulator, Copilot, Reports)  │
                          └───────────────────────────┬────────────────────────────┘
                                                      │
                                                      ▼
                          ┌────────────────────────────────────────────────────────┐
                          │               API Gateway / Reverse Proxy              │
                          │           (Spring Cloud Gateway / Vite Proxy)          │
                          └───────────┬───────────────────────┬────────────────────┘
                                      │                       │
             ┌────────────────────────┴────────┐              │
             ▼                                 ▼              ▼
┌─────────────────────────┐       ┌────────────────────────┐  ┌──────────────────────────────────┐
│   User & Auth Service   │       │   Portfolio Service    │  │   AI Copilot & Financial Engine  │
│  (Spring Boot + JWT)    │       │(Holdings, Transactions)│  │     (Python FastAPI + RAG + LLM)     │
└────────────┬────────────┘       └────────────┬───────────┘  └─────────────────┬────────────────┘
             │                                 │                                │
             ▼                                 ▼                                │
      PostgreSQL / H2                   PostgreSQL / H2                         │
             │                                 │                                │
             └────────────────┬────────────────┘                                │
                              ▼                                                 │
                  ┌──────────────────────┐                                      │
                  │     Apache Kafka     │◄─────────────────────────────────────┘
                  │  (Events: PRICE_UPD, │
                  │   TX_CREATED, ALERTS)│
                  └───────────┬──────────┘
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
┌─────────────────────────┐       ┌────────────────────────┐
│  Market Data Service    │       │ Analytics & Risk Engine│
│ (Redis Cache + API Sync)│       │(Sharpe, Drawdown, Beta)│
└─────────────────────────┘       └────────────────────────┘
```

---

## Core Features

1. **Synthetic Demo Investor Profiles**:
   - **Growth Investor**: ₹15,00,000 portfolio (55% Tech: TCS, MSFT, NVDA; 20% Financials; 10% Healthcare; 10% ETFs; 5% Gold).
   - **Balanced Multi-Asset**: ₹10,00,000 portfolio (40% Equities, 30% Sovereign Debt, 20% Index ETFs, 10% Gold).
   - **Conservative Wealth**: ₹8,00,000 portfolio (50% Bonds, 20% Blue chips, 20% Index ETFs, 10% Gold).

2. **Quantitative Financial Analytics & Risk Engine**:
   - **Returns**: Total Return, Daily Return, Annualized Return (CAGR), Benchmark Alpha.
   - **Risk Metrics**: Annualized Volatility ($\sigma$), Sharpe Ratio, Sortino Ratio, Maximum Drawdown (MDD), Beta ($\beta$) relative to NIFTY 50 / S&P 500.
   - **Diversification**: Herfindahl-Hirschman Concentration Index (HHI), Sector and Asset allocation breakdowns.

3. **AI Portfolio Copilot (FastAPI + RAG)**:
   - Ingests verified quantitative metrics to guarantee zero hallucinated financial numbers.
   - Pre-indexed financial market knowledge base for macro context.
   - Handles natural investor questions:
     - *"What is the biggest risk in my portfolio?"*
     - *"Why did my portfolio move today?"*
     - *"How does my portfolio compare with the benchmark?"*
     - *"How diversified is my portfolio?"*

4. **What-If Portfolio Simulator**:
   - Interactive rebalancing sliders (e.g. reduce Tech from 55% to 30%, increase Healthcare and Gold).
   - Side-by-side risk/reward delta analysis ($\Delta$ Volatility, $\Delta$ Sharpe, $\Delta$ Drawdown).
   - AI scenario commentary and recommendations.

5. **Intelligent Alert System**:
   - Real-time detection of concentration breaches (>40%), volatility spikes (>18%), drawdown threshold crossings (-8%), and benchmark divergence.

6. **AI-Generated Portfolio Reports**:
   - One-click executive summary briefing with return metrics, risk comparison table, and actionable optimization guidance.

7. **Market Shock Simulator**:
   - Real-time simulation of global sector declines (e.g. Tech -4.5%) to demonstrate event streaming, instant metric recalculation, and alert propagation.

---

## Quickstart Guide

### Option 1: Zero-Friction Local Run (Recommended for Windows)

1. **Start the AI & Analytics Engine**:
   ```bash
   cd backend-ai-service
   python -m uvicorn app.main:app --reload --port 8000
   ```
   *Swagger Docs available at: `http://localhost:8000/docs`*

2. **Start the Frontend Web Application**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Dashboard available at: `http://localhost:3000`*

3. **Or double-click `start-all.bat`** to launch both services concurrently.

### Option 2: Full Multi-Container Docker Compose

To launch the complete enterprise microservices stack (PostgreSQL, Redis, Kafka, Zookeeper, Spring Boot, FastAPI, React, Prometheus, Grafana):

```bash
docker-compose up --build
```

- Web Dashboard: `http://localhost:3000`
- Spring Boot Backend: `http://localhost:8080`
- FastAPI AI Engine: `http://localhost:8000`
- Prometheus Metrics: `http://localhost:9090`
- Grafana Dashboards: `http://localhost:3001` (login: admin / admin)

---

## Testing & Verification

Run the quantitative analytics unit tests:
```bash
cd backend-ai-service
python -m pytest tests/test_analytics.py
```
All tests verify mathematical precision of portfolio valuation, Sharpe ratio, beta, What-If simulation deltas, and AI Copilot reasoning.
