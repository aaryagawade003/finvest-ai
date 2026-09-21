package com.finvest.service;

import com.finvest.dto.HoldingDto;
import com.finvest.dto.PortfolioDto;
import com.finvest.dto.TransactionRequest;
import com.finvest.kafka.EventProducer;
import com.finvest.kafka.EventType;
import com.finvest.kafka.PortfolioEvent;
import com.finvest.model.*;
import com.finvest.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private HoldingRepository holdingRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MarketDataService marketDataService;

    @Autowired
    private EventProducer eventProducer;

    public List<PortfolioDto> getUserPortfolios(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return portfolioRepository.findByUser(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PortfolioDto getPortfolioById(Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        return mapToDto(portfolio);
    }

    @Transactional
    public PortfolioDto createPortfolio(String username, String name, String description) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Portfolio portfolio = new Portfolio(name, description, user);
        portfolio = portfolioRepository.save(portfolio);

        // Emit PORTFOLIO_UPDATED event
        PortfolioEvent event = new PortfolioEvent(
                "evt-port-" + System.currentTimeMillis(),
                EventType.PORTFOLIO_UPDATED,
                portfolio.getId(),
                null,
                Map.of("action", "CREATED", "name", name)
        );
        eventProducer.publishEvent("portfolio-events", event);

        return mapToDto(portfolio);
    }

    @Transactional
    public HoldingDto executeTransaction(Long portfolioId, TransactionRequest req) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        // Save transaction ledger
        Transaction tx = new Transaction(
                portfolio,
                req.getSymbol().toUpperCase(),
                req.getName(),
                req.getTransactionType().toUpperCase(),
                req.getQuantity(),
                req.getPrice(),
                req.getNotes()
        );
        transactionRepository.save(tx);

        // Update or create holding
        Holding holding = holdingRepository.findByPortfolioIdAndSymbol(portfolioId, req.getSymbol().toUpperCase())
                .orElse(null);

        if ("BUY".equalsIgnoreCase(req.getTransactionType())) {
            if (holding == null) {
                holding = new Holding(
                        req.getSymbol().toUpperCase(),
                        req.getName(),
                        "EQUITY",
                        "Other",
                        req.getQuantity(),
                        req.getPrice(),
                        portfolio
                );
            } else {
                BigDecimal existingTotal = holding.getQuantity().multiply(holding.getAvgBuyPrice());
                BigDecimal newTotal = req.getQuantity().multiply(req.getPrice());
                BigDecimal updatedQty = holding.getQuantity().add(req.getQuantity());
                BigDecimal newAvgPrice = existingTotal.add(newTotal).divide(updatedQty, 4, RoundingMode.HALF_UP);

                holding.setQuantity(updatedQty);
                holding.setAvgBuyPrice(newAvgPrice);
                holding.setUpdatedAt(LocalDateTime.now());
            }
        } else if ("SELL".equalsIgnoreCase(req.getTransactionType())) {
            if (holding == null || holding.getQuantity().compareTo(req.getQuantity()) < 0) {
                throw new RuntimeException("Insufficient shares to sell");
            }
            BigDecimal updatedQty = holding.getQuantity().subtract(req.getQuantity());
            if (updatedQty.compareTo(BigDecimal.ZERO) == 0) {
                holdingRepository.delete(holding);
                holding = null;
            } else {
                holding.setQuantity(updatedQty);
                holding.setUpdatedAt(LocalDateTime.now());
            }
        }

        if (holding != null) {
            holding = holdingRepository.save(holding);
        }

        // Publish Kafka TRANSACTION_CREATED event
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", req.getTransactionType());
        payload.put("symbol", req.getSymbol());
        payload.put("quantity", req.getQuantity());
        payload.put("price", req.getPrice());

        PortfolioEvent event = new PortfolioEvent(
                "evt-tx-" + System.currentTimeMillis(),
                EventType.TRANSACTION_CREATED,
                portfolioId,
                req.getSymbol(),
                payload
        );
        eventProducer.publishEvent("portfolio-events", event);

        return holding != null ? mapHoldingToDto(holding) : null;
    }

    public List<Transaction> getTransactions(Long portfolioId) {
        return transactionRepository.findByPortfolioIdOrderByTimestampDesc(portfolioId);
    }

    public PortfolioDto mapToDto(Portfolio portfolio) {
        PortfolioDto dto = new PortfolioDto();
        dto.setId(portfolio.getId());
        dto.setName(portfolio.getName());
        dto.setDescription(portfolio.getDescription());
        dto.setBenchmark(portfolio.getBenchmark());
        dto.setCurrency(portfolio.getCurrency());

        BigDecimal totalVal = BigDecimal.ZERO;
        BigDecimal totalInv = BigDecimal.ZERO;

        List<HoldingDto> holdingDtos = new ArrayList<>();
        if (portfolio.getHoldings() != null) {
            for (Holding h : portfolio.getHoldings()) {
                HoldingDto hd = mapHoldingToDto(h);
                holdingDtos.add(hd);
                totalVal = totalVal.add(hd.getCurrentValue());
                totalInv = totalInv.add(hd.getInvestedValue());
            }
        }

        dto.setHoldings(holdingDtos);
        dto.setTotalValue(totalVal);
        dto.setTotalInvested(totalInv);
        BigDecimal pnl = totalVal.subtract(totalInv);
        dto.setUnrealizedPnl(pnl);
        dto.setPnlPercentage(totalInv.compareTo(BigDecimal.ZERO) > 0 
                ? pnl.divide(totalInv, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue() 
                : 0.0);

        return dto;
    }

    public HoldingDto mapHoldingToDto(Holding h) {
        BigDecimal livePrice = marketDataService.getPrice(h.getSymbol());
        HoldingDto dto = new HoldingDto();
        dto.setId(h.getId());
        dto.setSymbol(h.getSymbol());
        dto.setName(h.getName());
        dto.setAssetClass(h.getAssetClass());
        dto.setSector(h.getSector());
        dto.setQuantity(h.getQuantity());
        dto.setAvgBuyPrice(h.getAvgBuyPrice());
        dto.setCurrentPrice(livePrice);

        BigDecimal invested = h.getQuantity().multiply(h.getAvgBuyPrice());
        BigDecimal current = h.getQuantity().multiply(livePrice);
        BigDecimal pnl = current.subtract(invested);

        dto.setInvestedValue(invested);
        dto.setCurrentValue(current);
        dto.setPnl(pnl);
        dto.setPnlPercentage(invested.compareTo(BigDecimal.ZERO) > 0 
                ? pnl.divide(invested, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue() 
                : 0.0);

        return dto;
    }
}
