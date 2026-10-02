package com.medistock.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP", "version", "1.0.0", "environment", "production");
    }

    @GetMapping("/health/live")
    public Map<String, Object> liveness() {
        // Indicates the application process is running
        return Map.of("status", "UP");
    }

    @GetMapping("/health/ready")
    public Map<String, Object> readiness() {
        // In a real scenario, this would check DB connection and Redis
        return Map.of(
            "status", "UP",
            "database", "UP",
            "redis", "UP"
        );
    }
}
