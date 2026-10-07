from typing import Dict, List, Any, Optional
from app.models.schemas import (
    KnowledgeGraphNode, KnowledgeGraphEdge, KnowledgeGraphData
)

NODES = [
    # Companies
    {"id": "NVDA", "label": "NVIDIA Corp.", "type": "Company", "properties": {"ticker": "NVDA", "cap": "Mega-Cap", "beta": 1.65}},
    {"id": "MSFT", "label": "Microsoft Corp.", "type": "Company", "properties": {"ticker": "MSFT", "cap": "Mega-Cap", "beta": 1.10}},
    {"id": "AAPL", "label": "Apple Inc.", "type": "Company", "properties": {"ticker": "AAPL", "cap": "Mega-Cap", "beta": 1.15}},
    {"id": "TCS", "label": "Tata Consultancy Services", "type": "Company", "properties": {"ticker": "TCS.NS", "cap": "Large-Cap", "beta": 0.85}},
    {"id": "INFY", "label": "Infosys Ltd.", "type": "Company", "properties": {"ticker": "INFY.NS", "cap": "Large-Cap", "beta": 0.95}},
    {"id": "RELIANCE", "label": "Reliance Industries", "type": "Company", "properties": {"ticker": "RELIANCE.NS", "cap": "Mega-Cap", "beta": 0.98}},
    {"id": "HDFCBANK", "label": "HDFC Bank Ltd.", "type": "Company", "properties": {"ticker": "HDFCBANK.NS", "cap": "Large-Cap", "beta": 1.08}},
    {"id": "ICICIBANK", "label": "ICICI Bank Ltd.", "type": "Company", "properties": {"ticker": "ICICIBANK.NS", "cap": "Large-Cap", "beta": 1.12}},
    {"id": "SUNPHARMA", "label": "Sun Pharma Ltd.", "type": "Company", "properties": {"ticker": "SUNPHARMA.NS", "cap": "Large-Cap", "beta": 0.65}},
    {"id": "GOLDBEES", "label": "Nippon Gold ETF", "type": "AssetClass", "properties": {"ticker": "GOLDBEES.NS", "type": "Commodity", "beta": 0.12}},
    {"id": "GSEC10Y", "label": "GOI 10Y Sovereign Bond", "type": "AssetClass", "properties": {"ticker": "NETF10GSEC.NS", "type": "Fixed Income", "beta": 0.05}},
    {"id": "NIFTYBEES", "label": "Nifty 50 ETF", "type": "AssetClass", "properties": {"ticker": "NIFTYBEES.NS", "type": "Broad Index", "beta": 1.00}},

    # Sectors & Sub-Industries
    {"id": "SEC_TECH", "label": "Technology Sector", "type": "Sector", "properties": {"cyclicality": "High", "avg_pe": 32.5}},
    {"id": "SUB_SEMI", "label": "AI Semiconductors", "type": "SubIndustry", "properties": {"supply_chain": "TSMC / Fab"}},
    {"id": "SUB_IT_SERV", "label": "IT Services & Consulting", "type": "SubIndustry", "properties": {"currency_exposure": "USD/EUR"}},
    {"id": "SEC_FIN", "label": "Financial Services", "type": "Sector", "properties": {"interest_sensitivity": "Positive"}},
    {"id": "SEC_ENERGY", "label": "Energy & Petrochemicals", "type": "Sector", "properties": {"commodity_linked": "Brent Crude"}},
    {"id": "SEC_HEALTH", "label": "Healthcare & Pharmaceuticals", "type": "Sector", "properties": {"defensive": True}},

    # Macro Factors
    {"id": "MACRO_RATES", "label": "Benchmark Interest Rates (RBI / Fed)", "type": "MacroFactor", "properties": {"current_regime": "Hawkish Hold"}},
    {"id": "MACRO_SEMI_CYCLE", "label": "Global Semiconductor Inventory Cycle", "type": "MacroFactor", "properties": {"phase": "Peak Expansion"}},
    {"id": "MACRO_AI_CAPEX", "label": "Hyperscaler Cloud AI CapEx", "type": "MacroFactor", "properties": {"trend": "Strong Growth"}},
    {"id": "MACRO_CRUDE", "label": "Brent Crude Oil Prices ($82/bbl)", "type": "MacroFactor", "properties": {"geopolitical_risk": "Elevated"}},
    {"id": "MACRO_USD_INR", "label": "USD/INR Exchange Rate (₹83.5)", "type": "MacroFactor", "properties": {"volatility": "Low"}},
    {"id": "MACRO_INFLATION", "label": "Core CPI Inflation (4.8%)", "type": "MacroFactor", "properties": {"target": "4.0%"}},

    # Financial Events
    {"id": "EVT_AI_BOOM", "label": "Enterprise Generative AI Adoption Wave", "type": "FinancialEvent", "properties": {"impact": "Revenue Surge for Hardware"}},
    {"id": "EVT_RATE_HIKE", "label": "Hawkish Central Bank Tightening", "type": "FinancialEvent", "properties": {"impact": "Duration Risk for Fixed Income"}},
    {"id": "EVT_OPEC_CUT", "label": "OPEC+ Supply Restraint", "type": "FinancialEvent", "properties": {"impact": "Refining Margin Expansion"}},
]

EDGES = [
    # Belongs to
    {"source": "NVDA", "target": "SUB_SEMI", "relation": "belongs_to", "weight": 1.0},
    {"source": "SUB_SEMI", "target": "SEC_TECH", "relation": "belongs_to", "weight": 1.0},
    {"source": "MSFT", "target": "SEC_TECH", "relation": "belongs_to", "weight": 1.0},
    {"source": "AAPL", "target": "SEC_TECH", "relation": "belongs_to", "weight": 1.0},
    {"source": "TCS", "target": "SUB_IT_SERV", "relation": "belongs_to", "weight": 1.0},
    {"source": "INFY", "target": "SUB_IT_SERV", "relation": "belongs_to", "weight": 1.0},
    {"source": "SUB_IT_SERV", "target": "SEC_TECH", "relation": "belongs_to", "weight": 1.0},
    {"source": "HDFCBANK", "target": "SEC_FIN", "relation": "belongs_to", "weight": 1.0},
    {"source": "ICICIBANK", "target": "SEC_FIN", "relation": "belongs_to", "weight": 1.0},
    {"source": "RELIANCE", "target": "SEC_ENERGY", "relation": "belongs_to", "weight": 1.0},
    {"source": "SUNPHARMA", "target": "SEC_HEALTH", "relation": "belongs_to", "weight": 1.0},

    # Affected by Macro Factors
    {"source": "NVDA", "target": "MACRO_AI_CAPEX", "relation": "affected_by", "weight": 0.95},
    {"source": "NVDA", "target": "MACRO_SEMI_CYCLE", "relation": "affected_by", "weight": 0.88},
    {"source": "SEC_TECH", "target": "MACRO_RATES", "relation": "affected_by", "weight": -0.80},
    {"source": "TCS", "target": "MACRO_USD_INR", "relation": "affected_by", "weight": 0.75},
    {"source": "INFY", "target": "MACRO_USD_INR", "relation": "affected_by", "weight": 0.72},
    {"source": "SEC_FIN", "target": "MACRO_RATES", "relation": "affected_by", "weight": 0.65},
    {"source": "SEC_ENERGY", "target": "MACRO_CRUDE", "relation": "affected_by", "weight": 0.85},
    {"source": "GSEC10Y", "target": "MACRO_RATES", "relation": "affected_by", "weight": -0.92},

    # Hedges
    {"source": "GOLDBEES", "target": "MACRO_INFLATION", "relation": "hedges", "weight": 0.85},
    {"source": "GOLDBEES", "target": "SEC_TECH", "relation": "hedges", "weight": 0.70},
    {"source": "GSEC10Y", "target": "SEC_TECH", "relation": "hedges", "weight": 0.65},

    # Financial Events
    {"source": "NVDA", "target": "EVT_AI_BOOM", "relation": "reported", "weight": 0.90},
    {"source": "MACRO_RATES", "target": "EVT_RATE_HIKE", "relation": "reported", "weight": 0.85},
    {"source": "SEC_ENERGY", "target": "EVT_OPEC_CUT", "relation": "reported", "weight": 0.80},

    # Correlated with
    {"source": "TCS", "target": "INFY", "relation": "correlated_with", "weight": 0.82},
    {"source": "HDFCBANK", "target": "ICICIBANK", "relation": "correlated_with", "weight": 0.78},
    {"source": "NVDA", "target": "MSFT", "relation": "correlated_with", "weight": 0.68},
]

class FinancialKnowledgeGraph:
    def __init__(self):
        self.nodes = [KnowledgeGraphNode(**n) for n in NODES]
        self.edges = [KnowledgeGraphEdge(**e) for e in EDGES]
        self._node_map = {n.id: n for n in self.nodes}

    def get_full_graph(self) -> KnowledgeGraphData:
        return KnowledgeGraphData(
            nodes=self.nodes,
            edges=self.edges,
            entity_insights={
                "total_entities": len(self.nodes),
                "total_relations": len(self.edges),
                "key_hubs": ["SEC_TECH", "MACRO_RATES", "NVDA", "GOLDBEES"]
            }
        )

    def query_relationships_for_symbols(self, symbols: List[str]) -> str:
        """Extracts structured graph-walk triples for RAG context injection."""
        lines = []
        sym_set = set(s.upper() for s in symbols)
        
        for edge in self.edges:
            src = edge.source
            tgt = edge.target
            rel = edge.relation
            
            if src in sym_set or tgt in sym_set:
                src_label = self._node_map.get(src, KnowledgeGraphNode(id=src, label=src, type="Entity")).label
                tgt_label = self._node_map.get(tgt, KnowledgeGraphNode(id=tgt, label=tgt, type="Entity")).label
                lines.append(f"• ({src_label}) --[{rel.upper()}]--> ({tgt_label})")

        if not lines:
            return "No specific relational graph dependencies detected."
        return "\n".join(lines[:8])

financial_knowledge_graph = FinancialKnowledgeGraph()
