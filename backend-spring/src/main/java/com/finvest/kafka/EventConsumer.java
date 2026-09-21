package com.finvest.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class EventConsumer {
    private static final Logger log = LoggerFactory.getLogger(EventConsumer.class);

    @KafkaListener(topics = "portfolio-events", groupId = "finvest-group", autoStartup = "${spring.kafka.enabled:false}")
    public void handlePortfolioEvent(String message) {
        log.info("[KAFKA EVENT CONSUMED] Received message: {}", message);
    }
}
