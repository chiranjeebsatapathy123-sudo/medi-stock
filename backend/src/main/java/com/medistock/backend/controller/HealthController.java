package com.medistock.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "UP");
        res.put("version", "1.0.0");
        res.put("service", "medistock-backend");
        res.put("uptimeMs", ManagementFactory.getRuntimeMXBean().getUptime());
        return res;
    }

    @GetMapping("/health/live")
    public Map<String, Object> liveness() {
        // Indicates the application process is running and thread pool is responsive
        return Map.of("status", "UP");
    }

    @GetMapping("/health/ready")
    public ResponseEntity<Map<String, Object>> readiness() {
        Map<String, Object> response = new HashMap<>();
        boolean dbUp = false;
        long dbLatencyMs = -1;
        String dbError = null;

        long start = System.currentTimeMillis();
        try (Connection conn = dataSource.getConnection()) {
            dbUp = conn.isValid(2);
            dbLatencyMs = System.currentTimeMillis() - start;
        } catch (Exception e) {
            dbError = e.getMessage();
            dbLatencyMs = System.currentTimeMillis() - start;
        }

        Runtime runtime = Runtime.getRuntime();
        long usedMemoryMb = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024);
        long totalMemoryMb = runtime.totalMemory() / (1024 * 1024);
        long maxMemoryMb = runtime.maxMemory() / (1024 * 1024);

        Map<String, Object> memory = new HashMap<>();
        memory.put("usedMb", usedMemoryMb);
        memory.put("totalMb", totalMemoryMb);
        memory.put("maxMb", maxMemoryMb);

        response.put("service", "medistock-backend");
        response.put("database", dbUp ? "UP" : "DOWN");
        response.put("dbLatencyMs", dbLatencyMs);
        if (dbError != null) {
            response.put("databaseError", dbError);
        }
        response.put("memory", memory);
        response.put("uptimeMs", ManagementFactory.getRuntimeMXBean().getUptime());

        if (dbUp) {
            response.put("status", "UP");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "DOWN");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}
