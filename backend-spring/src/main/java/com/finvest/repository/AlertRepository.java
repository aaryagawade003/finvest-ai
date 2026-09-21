package com.finvest.repository;

import com.finvest.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByPortfolioIdOrderByCreatedAtDesc(Long portfolioId);
    List<Alert> findByPortfolioIdAndIsAcknowledgedFalse(Long portfolioId);
}
