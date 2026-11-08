package com.medistock.backend.controller;

import com.medistock.backend.config.EnterpriseDemoDataSeeder;
import com.medistock.backend.entity.Batch;
import com.medistock.backend.entity.InventoryTransaction;
import com.medistock.backend.entity.Medicine;
import com.medistock.backend.entity.pharmacy.MedicationOrder;
import com.medistock.backend.repository.BatchRepository;
import com.medistock.backend.repository.InventoryTransactionRepository;
import com.medistock.backend.repository.MedicineRepository;
import com.medistock.backend.repository.pharmacy.MedicationOrderRepository;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.StockoutPredictionService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final StockoutPredictionService stockoutPredictionService;
    private final EnterpriseDemoDataSeeder demoDataSeeder;
    private final InventoryTransactionRepository transactionRepository;
    private final MedicationOrderRepository orderRepository;

    public DashboardController(
            MedicineRepository medicineRepository,
            BatchRepository batchRepository,
            StockoutPredictionService stockoutPredictionService,
            EnterpriseDemoDataSeeder demoDataSeeder,
            InventoryTransactionRepository transactionRepository,
            MedicationOrderRepository orderRepository
    ) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.stockoutPredictionService = stockoutPredictionService;
        this.demoDataSeeder = demoDataSeeder;
        this.transactionRepository = transactionRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        List<Medicine> medicines = medicineRepository.findByOrganizationId(tenantId);
        List<Batch> batches = batchRepository.findByMedicineOrganizationId(tenantId);

        int totalStockUnits = 0;
        double inventoryValue = 0.0;
        int expiringItems = 0;
        int expiredItems = 0;
        int quarantinedCount = 0;
        int recalledCount = 0;
        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);

        for (Batch b : batches) {
            totalStockUnits += b.getCurrentQuantity();
            double price = (b.getPurchasePrice() != null) ? b.getPurchasePrice() : 0.0;
            inventoryValue += b.getCurrentQuantity() * price;

            if (b.isRecall() || "RECALLED".equalsIgnoreCase(b.getStatus())) {
                recalledCount++;
            } else if (b.isQuarantine() || "QUARANTINED".equalsIgnoreCase(b.getStatus())) {
                quarantinedCount++;
            }

            if (b.getExpiryDate() != null) {
                if (b.getExpiryDate().isBefore(today)) {
                    expiredItems++;
                } else if (!b.getExpiryDate().isAfter(in30Days)) {
                    expiringItems++;
                }
            }
        }

        int lowStockItems = 0;
        int criticalItems = 0;
        for (Medicine m : medicines) {
            int stock = m.getTotalStock() != null ? m.getTotalStock() : 0;
            if (stock <= m.getSafetyStock()) {
                criticalItems++;
            } else if (stock <= m.getReorderLevel()) {
                lowStockItems++;
            }
        }

        double inventoryHealth = 100.0;
        List<String> healthReasons = new ArrayList<>();
        if (recalledCount > 0) {
            inventoryHealth -= (recalledCount * 12.0);
            healthReasons.add(recalledCount + " batch(es) flagged under FDA Class I recall");
        }
        if (quarantinedCount > 0) {
            inventoryHealth -= (quarantinedCount * 8.0);
            healthReasons.add(quarantinedCount + " cold-chain batch(es) quarantined due to excursion");
        }
        if (criticalItems > 0) {
            inventoryHealth -= (criticalItems * 6.0);
            healthReasons.add(criticalItems + " critical formulation(s) below safety stock");
        }
        if (expiringItems > 0) {
            inventoryHealth -= (expiringItems * 4.0);
            healthReasons.add(expiringItems + " batch(es) nearing 30-day expiration");
        }
        if (healthReasons.isEmpty()) {
            healthReasons.add("All medicine formulations and storage temperatures within compliance thresholds.");
        }
        inventoryHealth = Math.max(15.0, Math.min(100.0, inventoryHealth));

        // Top expiring batches (FEFO)
        List<Batch> expiringBatches = batches.stream()
                .filter(b -> b.getExpiryDate() != null && !b.getExpiryDate().isBefore(today))
                .sorted(Comparator.comparing(Batch::getExpiryDate))
                .limit(5)
                .toList();

        // Recent Movements
        List<InventoryTransaction> recentMovements = transactionRepository
                .findByOrganizationIdOrderByTimestampDesc(tenantId)
                .stream().limit(5).toList();

        // Medication orders requiring review
        int cdssPendingOrdersCount = 0;
        try {
            cdssPendingOrdersCount = orderRepository.findByOrganizationIdAndStatus(tenantId, "RECEIVED").size();
        } catch (Exception ignored) {}

        Map<String, Object> summary = new HashMap<>();
        summary.put("medicines", medicines);
        summary.put("batches", batches);
        summary.put("totalStockUnits", totalStockUnits);
        summary.put("inventoryValue", Math.round(inventoryValue * 100.0) / 100.0);
        summary.put("lowStockItems", lowStockItems);
        summary.put("criticalItems", criticalItems);
        summary.put("expiringItems", expiringItems);
        summary.put("expiredItems", expiredItems);
        summary.put("quarantinedCount", quarantinedCount);
        summary.put("recalledCount", recalledCount);
        summary.put("cdssPendingOrdersCount", cdssPendingOrdersCount);
        summary.put("inventoryHealth", Math.round(inventoryHealth * 10.0) / 10.0);
        summary.put("healthReasons", healthReasons);
        summary.put("expiringBatches", expiringBatches);
        summary.put("recentMovements", recentMovements);

        summary.put("locations", Collections.emptyList());
        summary.put("movements", recentMovements);
        summary.put("suppliers", Collections.emptyList());
        summary.put("users", Collections.emptyList());
        summary.put("notifications", Collections.emptyList());
        summary.put("carriers", Collections.emptyList());
        summary.put("drivers", Collections.emptyList());
        summary.put("vehicles", Collections.emptyList());
        summary.put("shipments", Collections.emptyList());
        summary.put("qualityIncidents", Collections.emptyList());
        summary.put("maintenanceLogs", Collections.emptyList());

        return ResponseEntity.ok(summary);
    }

    @PostMapping("/seed-demo")
    public ResponseEntity<Map<String, Object>> seedDemo() {
        return ResponseEntity.ok(demoDataSeeder.seedDemoData(true));
    }

    @GetMapping("/ai-forecast")
    public ResponseEntity<List<Map<String, Object>>> getAiForecast() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(Collections.emptyList());
    }
}
