package com.medistock.backend.service;

import com.medistock.backend.dto.procurement.StockoutRiskAnalysis;
import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.*;

@Service
public class ReorderService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final AuditService auditService;

    public ReorderService(MedicineRepository medicineRepository,
                          BatchRepository batchRepository,
                          InventoryTransactionRepository transactionRepository,
                          SupplierRepository supplierRepository,
                          PurchaseRequestRepository purchaseRequestRepository,
                          PurchaseOrderRepository purchaseOrderRepository,
                          AuditService auditService) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.transactionRepository = transactionRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.auditService = auditService;
    }

    public List<StockoutRiskAnalysis> analyzeStockoutRisk(UUID organizationId) {
        List<Medicine> medicines = medicineRepository.findByOrganizationId(organizationId);
        List<Batch> allBatches = batchRepository.findByMedicineOrganizationId(organizationId);
        List<Supplier> suppliers = supplierRepository.findByOrganizationId(organizationId);
        List<InventoryTransaction> transactions = transactionRepository.findByOrganizationIdOrderByTimestampDesc(organizationId);

        // Find primary supplier fallback
        Supplier defaultSupplier = !suppliers.isEmpty() ? suppliers.get(0) : null;

        List<StockoutRiskAnalysis> analysisList = new ArrayList<>();

        for (Medicine m : medicines) {
            // 1. Calculate active available stock
            int activeStock = allBatches.stream()
                    .filter(b -> b.getMedicine() != null && b.getMedicine().getId().equals(m.getId()))
                    .filter(b -> "ACTIVE".equalsIgnoreCase(b.getStatus()))
                    .mapToInt(Batch::getCurrentQuantity)
                    .sum();

            // 2. Calculate daily burn rate over the last 30 days
            ZonedDateTime thirtyDaysAgo = ZonedDateTime.now().minusDays(30);
            int dispensedTotal = transactions.stream()
                    .filter(tx -> tx.getMedicine() != null && tx.getMedicine().getId().equals(m.getId()))
                    .filter(tx -> tx.getMovementType() != null &&
                            ("DISPENSE".equalsIgnoreCase(tx.getMovementType()) || "ISSUE".equalsIgnoreCase(tx.getMovementType())))
                    .filter(tx -> tx.getTimestamp() != null && tx.getTimestamp().isAfter(thirtyDaysAgo))
                    .mapToInt(tx -> Math.abs(tx.getQuantity()))
                    .sum();

            double dailyBurnRate = dispensedTotal > 0 ? (dispensedTotal / 30.0) : 1.0; // fallback minimal burn

            Integer runoutDays = dailyBurnRate > 0 ? (int) Math.round(activeStock / dailyBurnRate) : 999;

            // 3. Resolve preferred supplier
            Supplier preferredSupplier = defaultSupplier;
            Optional<Batch> recentBatch = allBatches.stream()
                    .filter(b -> b.getMedicine() != null && b.getMedicine().getId().equals(m.getId()))
                    .filter(b -> b.getSupplierId() != null)
                    .findFirst();

            if (recentBatch.isPresent()) {
                preferredSupplier = suppliers.stream()
                        .filter(s -> s.getId().equals(recentBatch.get().getSupplierId()))
                        .findFirst()
                        .orElse(defaultSupplier);
            }

            int leadTime = preferredSupplier != null ? preferredSupplier.getLeadTimeDays() : 5;
            if (leadTime <= 0) leadTime = 5;

            // 4. Determine Risk Category
            String riskLevel;
            int reorderThreshold = m.getReorderLevel() > 0 ? m.getReorderLevel() : 20;
            int safetyStock = m.getSafetyStock() > 0 ? m.getSafetyStock() : 10;

            if (activeStock == 0) {
                riskLevel = "CRITICAL_STOCKOUT";
            } else if (activeStock <= safetyStock || runoutDays <= leadTime) {
                riskLevel = "HIGH_RISK";
            } else if (activeStock <= reorderThreshold || runoutDays <= (leadTime + 7)) {
                riskLevel = "MODERATE_RISK";
            } else if (m.getMaximumStock() > 0 && activeStock > m.getMaximumStock()) {
                riskLevel = "OVERSTOCKED";
            } else {
                riskLevel = "OPTIMAL";
            }

            // 5. Calculate Recommended Reorder Quantity
            int targetQty;
            if (m.getMaximumStock() > activeStock) {
                targetQty = m.getMaximumStock() - activeStock;
            } else {
                targetQty = Math.max(reorderThreshold * 2, 50);
            }

            analysisList.add(StockoutRiskAnalysis.builder()
                    .medicineId(m.getId())
                    .medicineCode(m.getMedicineCode())
                    .genericName(m.getGenericName())
                    .brandName(m.getBrandName())
                    .currentStock(activeStock)
                    .reorderLevel(reorderThreshold)
                    .safetyStock(safetyStock)
                    .maximumStock(m.getMaximumStock())
                    .dailyBurnRate(Math.round(dailyBurnRate * 10.0) / 10.0)
                    .runoutDays(runoutDays)
                    .riskLevel(riskLevel)
                    .recommendedReorderQuantity(targetQty)
                    .preferredSupplierName(preferredSupplier != null ? preferredSupplier.getName() : "Primary Vendor")
                    .preferredSupplierId(preferredSupplier != null ? preferredSupplier.getId() : null)
                    .supplierLeadTimeDays(leadTime)
                    .build());
        }

        return analysisList;
    }

    @Transactional
    public PurchaseRequest triggerAutonomousReorder(UUID organizationId, UUID userId) {
        List<StockoutRiskAnalysis> risks = analyzeStockoutRisk(organizationId).stream()
                .filter(r -> "CRITICAL_STOCKOUT".equals(r.getRiskLevel()) ||
                             "HIGH_RISK".equals(r.getRiskLevel()) ||
                             "MODERATE_RISK".equals(r.getRiskLevel()))
                .toList();

        if (risks.isEmpty()) {
            return null;
        }

        boolean hasCritical = risks.stream().anyMatch(r -> "CRITICAL_STOCKOUT".equals(r.getRiskLevel()));
        String priority = hasCritical ? "EMERGENCY_STOCKOUT" : "URGENT";

        PurchaseRequest pr = new PurchaseRequest();
        pr.setOrganizationId(organizationId);
        pr.setRequestedBy(userId);
        pr.setPriority(priority);
        pr.setStatus("SUBMITTED");
        pr.setReason(String.format("Autonomous Stockout Safeguard: %d medications reached depletion thresholds.", risks.size()));
        pr.setNotes("Generated via MediStock Autonomous Reorder Engine based on consumption velocity and lead time.");

        for (StockoutRiskAnalysis item : risks) {
            Medicine med = medicineRepository.findById(item.getMedicineId()).orElse(null);
            if (med == null) continue;

            PurchaseRequestItem pri = new PurchaseRequestItem();
            pri.setPurchaseRequest(pr);
            pri.setMedicine(med);
            pri.setRequestedQuantity(item.getRecommendedReorderQuantity());
            if (item.getPreferredSupplierId() != null) {
                Supplier s = supplierRepository.findById(item.getPreferredSupplierId()).orElse(null);
                pri.setPreferredSupplier(s);
            }
            pri.setTargetDate(LocalDate.now().plusDays(item.getSupplierLeadTimeDays()));
            pri.setReason(String.format("%s: Current stock %d units, runout in %d days.",
                    item.getRiskLevel(), item.getCurrentStock(), item.getRunoutDays()));
            pri.setStatus("PENDING");
            pr.getItems().add(pri);
        }

        pr = purchaseRequestRepository.save(pr);

        try {
            auditService.recordAudit(
                    organizationId, userId, "Procurement Automator", "SYSTEM",
                    "AUTONOMOUS_REORDER_TRIGGER", "PURCHASE_REQUEST", pr.getId(),
                    null, "items=" + pr.getItems().size() + ",priority=" + priority,
                    "Automated reorder purchase request generated for " + pr.getItems().size() + " items"
            );
        } catch (Exception ignored) {}

        return pr;
    }

    @Transactional
    public PurchaseOrder convertRequestToPO(UUID requestId, UUID organizationId, UUID userId) {
        PurchaseRequest pr = purchaseRequestRepository.findByIdAndOrganizationId(requestId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase request not found: " + requestId));

        if ("CONVERTED_TO_PO".equalsIgnoreCase(pr.getStatus())) {
            throw new IllegalStateException("Purchase request is already converted to PO.");
        }

        Supplier primarySupplier = null;
        for (PurchaseRequestItem item : pr.getItems()) {
            if (item.getPreferredSupplier() != null) {
                primarySupplier = item.getPreferredSupplier();
                break;
            }
        }
        if (primarySupplier == null) {
            List<Supplier> suppliers = supplierRepository.findByOrganizationId(organizationId);
            if (!suppliers.isEmpty()) primarySupplier = suppliers.get(0);
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setOrganizationId(organizationId);
        po.setPoNumber("PO-" + System.currentTimeMillis());
        po.setCreatedBy(userId);
        po.setSupplier(primarySupplier);
        po.setOrderDate(LocalDate.now());
        po.setExpectedDelivery(LocalDate.now().plusDays(primarySupplier != null ? primarySupplier.getLeadTimeDays() : 7));
        po.setStatus("APPROVED");
        po.setApprovedBy(userId);

        double subtotal = 0.0;
        for (PurchaseRequestItem reqItem : pr.getItems()) {
            PurchaseOrderItem poItem = new PurchaseOrderItem();
            poItem.setPurchaseOrder(po);
            poItem.setMedicine(reqItem.getMedicine());
            poItem.setQuantity(reqItem.getRequestedQuantity());
            poItem.setUnitPrice(15.00); // Contract rate default
            poItem.setTotalPrice(reqItem.getRequestedQuantity() * 15.00);
            poItem.setStatus("PENDING");
            po.getItems().add(poItem);
            subtotal += poItem.getTotalPrice();
        }

        po.setSubtotal(subtotal);
        po.setTotal(subtotal);

        po = purchaseOrderRepository.save(po);

        pr.setStatus("CONVERTED_TO_PO");
        pr.setApprovedBy(userId);
        pr.setApprovedAt(OffsetDateTime.now());
        purchaseRequestRepository.save(pr);

        try {
            auditService.recordAudit(
                    organizationId, userId, "Procurement Officer", "PURCHASING_AGENT",
                    "CONVERT_PURCHASE_REQUEST_TO_PO", "PURCHASE_ORDER", po.getId(),
                    null, "requestId=" + requestId + ",poNumber=" + po.getPoNumber(),
                    "Converted purchase request to approved purchase order " + po.getPoNumber()
            );
        } catch (Exception ignored) {}

        return po;
    }
}

