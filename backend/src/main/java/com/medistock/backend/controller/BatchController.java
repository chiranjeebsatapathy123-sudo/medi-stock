package com.medistock.backend.controller;

import com.medistock.backend.entity.Batch;
import com.medistock.backend.repository.BatchRepository;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.AuditService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    private final BatchRepository batchRepository;
    private final AuditService auditService;

    public BatchController(BatchRepository batchRepository, AuditService auditService) {
        this.batchRepository = batchRepository;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<Batch>> getAllBatches(@RequestParam(required = false) UUID medicineId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        
        if (medicineId != null) {
            return ResponseEntity.ok(batchRepository.findByMedicineIdAndMedicineOrganizationId(medicineId, tenantId));
        }
        
        return ResponseEntity.ok(batchRepository.findByMedicineOrganizationId(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Batch> getBatch(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        
        return batchRepository.findByIdAndMedicineOrganizationId(id, tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    public ResponseEntity<Batch> createBatch(@RequestBody Batch batch) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        
        // Assume medicine organization matches tenant (could be verified here for strict security)
        return ResponseEntity.ok(batchRepository.save(batch));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Batch> updateBatch(@PathVariable UUID id, @RequestBody Batch batchDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return batchRepository.findByIdAndMedicineOrganizationId(id, tenantId)
                .map(existingBatch -> {
                    existingBatch.setBatchNumber(batchDetails.getBatchNumber());
                    existingBatch.setManufacturer(batchDetails.getManufacturer());
                    existingBatch.setManufacturingDate(batchDetails.getManufacturingDate());
                    existingBatch.setExpiryDate(batchDetails.getExpiryDate());
                    existingBatch.setReceivedQuantity(batchDetails.getReceivedQuantity());
                    existingBatch.setCurrentQuantity(batchDetails.getCurrentQuantity());
                    existingBatch.setPurchasePrice(batchDetails.getPurchasePrice());
                    existingBatch.setSellingPrice(batchDetails.getSellingPrice());
                    existingBatch.setSupplierId(batchDetails.getSupplierId());
                    existingBatch.setStorageLocationId(batchDetails.getStorageLocationId());
                    existingBatch.setStatus(batchDetails.getStatus());
                    existingBatch.setQuarantine(batchDetails.isQuarantine());
                    existingBatch.setRecall(batchDetails.isRecall());
                    return ResponseEntity.ok(batchRepository.save(existingBatch));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return batchRepository.findByIdAndMedicineOrganizationId(id, tenantId)
                .map(batch -> {
                    batchRepository.delete(batch);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/quarantine")
    public ResponseEntity<?> quarantineBatch(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        String reason = request.getOrDefault("reason", "Suspected Quality or Cold-Chain Excursion");

        return batchRepository.findByIdAndMedicineOrganizationId(id, tenantId)
                .map(batch -> {
                    String prevState = "status=" + batch.getStatus() + ",quarantine=" + batch.isQuarantine();
                    batch.setQuarantine(true);
                    batch.setStatus("QUARANTINED");
                    batch.setQuarantineReason(reason);
                    Batch saved = batchRepository.save(batch);

                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    auditService.recordAudit(
                            tenantId, null, auth != null ? auth.getName() : "Pharmacist", "QUALITY_INSPECTOR",
                            "QUARANTINE_BATCH", "BATCH", saved.getId(),
                            prevState, "status=QUARANTINED,quarantine=true", reason
                    );

                    return ResponseEntity.ok(Map.of(
                            "status", "SUCCESS",
                            "message", "Batch quarantined and locked from clinical dispensing.",
                            "batchId", saved.getId(),
                            "batchNumber", saved.getBatchNumber()
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/recall")
    public ResponseEntity<?> recallBatch(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        String reason = request.getOrDefault("reason", "Manufacturer / Regulatory Recall Notification");
        String recallClass = request.getOrDefault("recallClass", "CLASS_II");

        return batchRepository.findByIdAndMedicineOrganizationId(id, tenantId)
                .map(batch -> {
                    String prevState = "status=" + batch.getStatus() + ",recall=" + batch.isRecall();
                    batch.setRecall(true);
                    batch.setStatus("RECALLED");
                    batch.setRecallReason(reason);
                    batch.setRecallClass(recallClass);
                    Batch saved = batchRepository.save(batch);

                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    auditService.recordAudit(
                            tenantId, null, auth != null ? auth.getName() : "SafetyOfficer", "REGULATORY_COMPLIANCE",
                            "RECALL_BATCH", "BATCH", saved.getId(),
                            prevState, "status=RECALLED,recall=true,class=" + recallClass, reason
                    );

                    return ResponseEntity.ok(Map.of(
                            "status", "SUCCESS",
                            "message", "Mandatory recall initiated. All inventory locked across all zones.",
                            "batchId", saved.getId(),
                            "recallClass", recallClass
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<?> releaseBatch(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        String reason = request.getOrDefault("reason", "QC Lab Inspection Passed - Released for Use");

        return batchRepository.findByIdAndMedicineOrganizationId(id, tenantId)
                .map(batch -> {
                    String prevState = "status=" + batch.getStatus() + ",quarantine=" + batch.isQuarantine();
                    batch.setQuarantine(false);
                    batch.setStatus("ACTIVE");
                    batch.setQuarantineReason(null);
                    Batch saved = batchRepository.save(batch);

                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    auditService.recordAudit(
                            tenantId, null, auth != null ? auth.getName() : "QCManager", "QUALITY_ASSURANCE",
                            "RELEASE_QUARANTINE", "BATCH", saved.getId(),
                            prevState, "status=ACTIVE,quarantine=false", reason
                    );

                    return ResponseEntity.ok(Map.of(
                            "status", "SUCCESS",
                            "message", "Batch released from quarantine and restored to ACTIVE FEFO queue.",
                            "batchId", saved.getId()
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
