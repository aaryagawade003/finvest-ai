package com.finvest.kafka;

import java.time.LocalDateTime;
import java.util.Map;

public class PortfolioEvent {
    private String eventId;
    private EventType eventType;
    private Long portfolioId;
    private String symbol;
    private LocalDateTime timestamp;
    private Map<String, Object> payload;

    public PortfolioEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public PortfolioEvent(String eventId, EventType eventType, Long portfolioId, String symbol, Map<String, Object> payload) {
        this();
        this.eventId = eventId;
        this.eventType = eventType;
        this.portfolioId = portfolioId;
        this.symbol = symbol;
        this.payload = payload;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }
    public Long getPortfolioId() { return portfolioId; }
    public void setPortfolioId(Long portfolioId) { this.portfolioId = portfolioId; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Map<String, Object> getPayload() { return payload; }
    public void setPayload(Map<String, Object> payload) { this.payload = payload; }
}
