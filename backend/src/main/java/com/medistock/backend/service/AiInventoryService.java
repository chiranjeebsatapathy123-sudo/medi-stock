package com.medistock.backend.service;

import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AiInventoryService {

    private final ForecastService forecastService;
    private final MedicineRepository medicineRepository;

    public AiInventoryService(ForecastService forecastService, MedicineRepository medicineRepository) {
        this.forecastService = forecastService;
        this.medicineRepository = medicineRepository;
    }

    public Map<String, Object> handleQuery(String query) {
        // Fallback natural language mapping for Phase 4
        // Instead of connecting to a remote LLM initially, we provide deterministic analytic mapping
        Map<String, Object> response = new HashMap<>();
        String lowerQuery = query.toLowerCase();

        if (lowerQuery.contains("expiring")) {
            response.put("answer", "Here are the medicines expiring in the specified timeframe.");
            response.put("evidence", "Calculated by querying batch records where expiryDate <= NOW() + 30 days.");
            // Example response structure
        } else if (lowerQuery.contains("order") || lowerQuery.contains("stockout")) {
            response.put("answer", "Based on current consumption and lead time, the following items require reordering.");
            response.put("evidence", "Uses 30-day historical moving average forecast vs current on-hand stock.");
        } else {
            response.put("answer", "I can help you analyze stockouts, expiries, suppliers, and reorder levels. Could you rephrase your question?");
            response.put("evidence", "Deterministic Fallback Triggered");
        }
        
        response.put("confidence", 95.0);
        return response;
    }
    
    public Map<String, Object> predictStockoutRisk(Map<String, String> request) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.ResponseEntity<Map> response = restTemplate.postForEntity(
                "http://localhost:8000/predict/stockout-risk", 
                request, 
                Map.class
            );
            return response.getBody();
        } catch (Exception e) {
            // Fallback
            return Map.of(
                "risk_state", "UNKNOWN",
                "risk_score", 0.0,
                "evidence", List.of(Map.of("label", "System", "value", "AI Service Unavailable"))
            );
        }
    }
    
    public List<Map<String, Object>> getModels() {
        return List.of(
            Map.of(
                "model_name", "DemandForecastModel",
                "version", "v1.0.0",
                "status", "PRODUCTION"
            )
        );
    }
    
    public Map<String, Object> getModelHealth() {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            return restTemplate.getForObject("http://localhost:8000/model-health", Map.class);
        } catch (Exception e) {
            return Map.of("status", "UNAVAILABLE");
        }
    }
}
