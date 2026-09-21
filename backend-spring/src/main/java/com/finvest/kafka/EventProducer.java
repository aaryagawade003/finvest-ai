package com.finvest.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class EventProducer {
    private static final Logger log = LoggerFactory.getLogger(EventProducer.class);

    @Autowired(required = false)
    private KafkaTemplate<String, String> kafkaTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void publishEvent(String topic, PortfolioEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            log.info("[KAFKA EVENT PRODUCED] Topic: {} | EventType: {} | Portfolio: {}", 
                     topic, event.getEventType(), event.getPortfolioId());

            if (kafkaTemplate != null) {
                kafkaTemplate.send(topic, event.getEventId(), json);
            } else {
                log.debug("KafkaTemplate not active; running in standalone mode");
            }
        } catch (Exception e) {
            log.warn("Error publishing event to Kafka: {}", e.getMessage());
        }
    }
}
