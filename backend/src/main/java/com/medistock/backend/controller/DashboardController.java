package com.medistock.backend.controller;

import com.medistock.backend.repository.BatchRepository;
import com.medistock.backend.repository.MedicineRepository;
import com.medistock.backend.security.TenantContext;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;

    public DashboardController(MedicineRepository medicineRepository, BatchRepository batchRepository) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        Map<String, Object> summary = new HashMap<>();
        summary.put("medicines", medicineRepository.findByOrganizationId(tenantId));
        summary.put("batches", batchRepository.findByMedicineOrganizationId(tenantId));
        
        // These can be extended later with real repositories
        summary.put("locations", Collections.emptyList());
        summary.put("movements", Collections.emptyList());
        summary.put("suppliers", Collections.emptyList());
        summary.put("users", Collections.emptyList());
        summary.put("notifications", Collections.emptyList());
        summary.put("carriers", Collections.emptyList());
        summary.put("drivers", Collections.emptyList());
        summary.put("vehicles", Collections.emptyList());
        summary.put("shipments", Collections.emptyList());
        summary.put("qualityIncidents", Collections.emptyList());
        summary.put("maintenanceLogs", Collections.emptyList());

        summary.put("totalStockUnits", 0);
        summary.put("inventoryValue", 0);
        summary.put("lowStockItems", 0);
        summary.put("criticalItems", 0);
        summary.put("expiringItems", 0);
        summary.put("expiredItems", 0);
        summary.put("recentMovements", Collections.emptyList());
        return ResponseEntity.ok(summary);
    }
}
