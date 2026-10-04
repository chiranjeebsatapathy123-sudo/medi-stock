package com.medistock.backend.controller;
import com.medistock.backend.entity.logistics.Shipment;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.LogisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics")
public class LogisticsController {
    private final LogisticsService logisticsService;

    public LogisticsController(LogisticsService logisticsService) {
        this.logisticsService = logisticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(logisticsService.getLogisticsOverview(tenantId));
    }

    @PostMapping("/shipments")
    public ResponseEntity<Shipment> createShipment(@RequestBody Shipment shipment) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(logisticsService.createShipment(shipment, tenantId));
    }

    @PutMapping("/shipments/{id}/status")
    public ResponseEntity<Shipment> updateShipmentStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(logisticsService.updateShipmentStatus(id, body.get("status"), tenantId));
    }
}
