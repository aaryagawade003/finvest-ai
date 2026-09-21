package com.finvest.controller;

import com.finvest.service.MarketDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    @Autowired
    private MarketDataService marketDataService;

    @GetMapping("/price/{symbol}")
    public ResponseEntity<Map<String, Object>> getPrice(@PathVariable String symbol) {
        BigDecimal price = marketDataService.getPrice(symbol);
        return ResponseEntity.ok(Map.of("symbol", symbol.toUpperCase(), "price", price));
    }

    @PostMapping("/update")
    public ResponseEntity<Map<String, Object>> updatePrice(@RequestBody Map<String, Object> req) {
        String sym = (String) req.get("symbol");
        BigDecimal price = new BigDecimal(req.get("price").toString());
        marketDataService.updatePrice(sym, price);
        return ResponseEntity.ok(Map.of("status", "UPDATED", "symbol", sym, "price", price));
    }
}
