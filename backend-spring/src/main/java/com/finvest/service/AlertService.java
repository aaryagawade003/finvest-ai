package com.finvest.service;

import com.finvest.kafka.EventProducer;
import com.finvest.kafka.EventType;
import com.finvest.kafka.PortfolioEvent;
import com.finvest.model.Alert;
import com.finvest.model.Portfolio;
import com.finvest.repository.AlertRepository;
import com.finvest.repository.PortfolioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private EventProducer eventProducer;

    public List<Alert> getPortfolioAlerts(Long portfolioId) {
        return alertRepository.findByPortfolioIdOrderByCreatedAtDesc(portfolioId);
    }

    public Alert createAlert(Long portfolioId, String type, String level, String title, String message, Double metricValue, Double threshold) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        Alert alert = new Alert(portfolio, type, level, title, message, metricValue, threshold);
        alert = alertRepository.save(alert);

        // Publish ALERT_CREATED event
        PortfolioEvent event = new PortfolioEvent(
                "evt-alert-" + alert.getId(),
                EventType.ALERT_CREATED,
                portfolioId,
                null,
                Map.of("alertId", alert.getId(), "type", type, "title", title)
        );
        eventProducer.publishEvent("alert-events", event);

        return alert;
    }

    public Alert acknowledgeAlert(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setAcknowledged(true);
        return alertRepository.save(alert);
    }
}
