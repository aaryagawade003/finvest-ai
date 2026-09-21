package com.finvest.controller;

import com.finvest.model.Alert;
import com.finvest.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<Alert>> getPortfolioAlerts(@PathVariable Long portfolioId) {
        return ResponseEntity.ok(alertService.getPortfolioAlerts(portfolioId));
    }

    @PostMapping("/portfolio/{portfolioId}")
    public ResponseEntity<Alert> createAlert(@PathVariable Long portfolioId, @RequestBody Map<String, Object> req) {
        String type = (String) req.get("type");
        String level = (String) req.get("level");
        String title = (String) req.get("title");
        String message = (String) req.get("message");
        Double val = req.get("metricValue") != null ? Double.valueOf(req.get("metricValue").toString()) : null;
        Double th = req.get("threshold") != null ? Double.valueOf(req.get("threshold").toString()) : null;

        return ResponseEntity.ok(alertService.createAlert(portfolioId, type, level, title, message, val, th));
    }

    @PatchMapping("/{id}/ack")
    public ResponseEntity<Alert> acknowledgeAlert(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(id));
    }
}
