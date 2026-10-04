package com.medistock.backend.controller;

import com.medistock.backend.entity.Warehouse;
import com.medistock.backend.entity.WarehouseLocation;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {

    private final WarehouseService warehouseService;
    private final com.medistock.backend.service.PutAwayEngine putAwayEngine;

    public WarehouseController(WarehouseService warehouseService, com.medistock.backend.service.PutAwayEngine putAwayEngine) {
        this.warehouseService = warehouseService;
        this.putAwayEngine = putAwayEngine;
    }

    @GetMapping
    public ResponseEntity<List<Warehouse>> getWarehouses() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(warehouseService.getWarehouses(tenantId));
    }

    @GetMapping("/{warehouseId}/locations")
    public ResponseEntity<List<WarehouseLocation>> getLocations(@PathVariable UUID warehouseId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        try {
            return ResponseEntity.ok(warehouseService.getLocationsForWarehouse(tenantId, warehouseId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/scan-barcode")
    public ResponseEntity<WarehouseLocation> scanBarcode(@RequestBody Map<String, String> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        
        String barcode = payload.get("barcode");
        if (barcode == null || barcode.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            WarehouseLocation loc = warehouseService.resolveBarcode(tenantId, barcode);
            return ResponseEntity.ok(loc);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{warehouseId}/put-away")
    public ResponseEntity<com.medistock.backend.service.PutAwayEngine.PutAwayRecommendation> getPutAwayRecommendation(
            @PathVariable UUID warehouseId,
            @RequestBody Map<String, Object> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        String temp = (String) payload.get("temperatureProfile");
        java.math.BigDecimal qty = new java.math.BigDecimal(payload.getOrDefault("quantity", "1").toString());

        try {
            return ResponseEntity.ok(putAwayEngine.recommendLocation(warehouseId, temp, qty));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
