package com.finvest.dto;

import java.math.BigDecimal;
import java.util.List;

public class PortfolioDto {
    private Long id;
    private String name;
    private String description;
    private String benchmark;
    private String currency;
    private BigDecimal totalValue;
    private BigDecimal totalInvested;
    private BigDecimal unrealizedPnl;
    private Double pnlPercentage;
    private List<HoldingDto> holdings;

    public PortfolioDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBenchmark() { return benchmark; }
    public void setBenchmark(String benchmark) { this.benchmark = benchmark; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }
    public BigDecimal getTotalInvested() { return totalInvested; }
    public void setTotalInvested(BigDecimal totalInvested) { this.totalInvested = totalInvested; }
    public BigDecimal getUnrealizedPnl() { return unrealizedPnl; }
    public void setUnrealizedPnl(BigDecimal unrealizedPnl) { this.unrealizedPnl = unrealizedPnl; }
    public Double getPnlPercentage() { return pnlPercentage; }
    public void setPnlPercentage(Double pnlPercentage) { this.pnlPercentage = pnlPercentage; }
    public List<HoldingDto> getHoldings() { return holdings; }
    public void setHoldings(List<HoldingDto> holdings) { this.holdings = holdings; }
}
