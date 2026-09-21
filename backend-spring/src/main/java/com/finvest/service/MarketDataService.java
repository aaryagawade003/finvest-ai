package com.finvest.service;

import com.finvest.kafka.EventProducer;
import com.finvest.kafka.EventType;
import com.finvest.kafka.PortfolioEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MarketDataService {
    private static final Logger log = LoggerFactory.getLogger(MarketDataService.class);

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    @Autowired
    private EventProducer eventProducer;

    // In-memory cache fallback if Redis container is not active
    private final Map<String, BigDecimal> localCache = new ConcurrentHashMap<>();

    public MarketDataService() {
        // Seed default prices
        localCache.put("AAPL", new BigDecimal("185.50"));
        localCache.put("MSFT", new BigDecimal("420.25"));
        localCache.put("NVDA", new BigDecimal("122.80"));
        localCache.put("RELIANCE", new BigDecimal("2985.40"));
        localCache.put("TCS", new BigDecimal("4210.00"));
        localCache.put("HDFCBANK", new BigDecimal("1640.50"));
        localCache.put("ICICIBANK", new BigDecimal("1215.30"));
        localCache.put("SUNPHARMA", new BigDecimal("1810.00"));
        localCache.put("NIFTYBEES", new BigDecimal("268.40"));
        localCache.put("GOLDBEES", new BigDecimal("62.80"));
        localCache.put("GSEC10Y", new BigDecimal("105.20"));
    }

    public BigDecimal getPrice(String symbol) {
        String sym = symbol.toUpperCase();

        // 1. Try Redis
        if (redisTemplate != null) {
            try {
                String cached = redisTemplate.opsForValue().get("price:" + sym);
                if (cached != null) {
                    return new BigDecimal(cached);
                }
            } catch (Exception e) {
                log.debug("Redis cache miss or connection error: {}", e.getMessage());
            }
        }

        // 2. Local fallback
        return localCache.getOrDefault(sym, new BigDecimal("100.00"));
    }

    public void updatePrice(String symbol, BigDecimal newPrice) {
        String sym = symbol.toUpperCase();
        localCache.put(sym, newPrice);

        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set("price:" + sym, newPrice.toString());
            } catch (Exception e) {
                log.debug("Could not write to Redis: {}", e.getMessage());
            }
        }

        // Emit PRICE_UPDATED event
        Map<String, Object> payload = new HashMap<>();
        payload.put("symbol", sym);
        payload.put("price", newPrice);
        
        PortfolioEvent event = new PortfolioEvent(
                "evt-price-" + System.currentTimeMillis(),
                EventType.PRICE_UPDATED,
                null,
                sym,
                payload
        );
        eventProducer.publishEvent("market-events", event);
    }
}
