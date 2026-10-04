package com.medistock.backend.controller;

import com.medistock.backend.service.IntelligenceService;
import com.medistock.backend.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/api/intelligence")
public class IntelligenceController {

    private final IntelligenceService intelligenceService;

    public IntelligenceController(IntelligenceService intelligenceService) {
        this.intelligenceService = intelligenceService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getIntelligenceDashboard() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(intelligenceService.getDashboardIntelligence(tenantId));
    }
    
    @GetMapping("/data-quality")
    public ResponseEntity<Map<String, Object>> getDataQuality() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(intelligenceService.calculateDataQuality(tenantId));
    }
    
    @GetMapping("/stockout-risk")
    public ResponseEntity<Map<String, Object>> getStockoutRisk() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(intelligenceService.calculateStockoutRisk(tenantId));
    }
    
    @GetMapping("/expiry-risk")
    public ResponseEntity<Map<String, Object>> getExpiryRisk() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(intelligenceService.calculateExpiryRisk(tenantId));
    }

    @GetMapping("/inventory-health")
    public ResponseEntity<Map<String, Object>> getInventoryHealth() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(intelligenceService.calculateInventoryHealth(tenantId));
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> askMediStock(@RequestBody Map<String, String> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        
        String query = payload.get("query");
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(intelligenceService.processNaturalLanguageQuery(tenantId, query));
    }
}
