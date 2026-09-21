package com.finvest.controller;

import com.finvest.dto.HoldingDto;
import com.finvest.dto.PortfolioDto;
import com.finvest.dto.TransactionRequest;
import com.finvest.model.Transaction;
import com.finvest.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @GetMapping
    public ResponseEntity<List<PortfolioDto>> getUserPortfolios(Authentication auth) {
        String username = auth != null ? auth.getName() : "demo_user";
        return ResponseEntity.ok(portfolioService.getUserPortfolios(username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioDto> getPortfolio(@PathVariable Long id) {
        return ResponseEntity.ok(portfolioService.getPortfolioById(id));
    }

    @PostMapping
    public ResponseEntity<PortfolioDto> createPortfolio(@RequestBody Map<String, String> body, Authentication auth) {
        String username = auth != null ? auth.getName() : "demo_user";
        String name = body.getOrDefault("name", "New Portfolio");
        String desc = body.getOrDefault("description", "Created via FinVest AI");
        return ResponseEntity.ok(portfolioService.createPortfolio(username, name, desc));
    }

    @PostMapping("/{id}/transactions")
    public ResponseEntity<HoldingDto> addTransaction(@PathVariable Long id, @RequestBody TransactionRequest req) {
        return ResponseEntity.ok(portfolioService.executeTransaction(id, req));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(portfolioService.getTransactions(id));
    }
}
