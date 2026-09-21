package com.finvest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FinvestApplication {
    public static void main(String[] args) {
        SpringApplication.run(FinvestApplication.class, args);
    }
}
