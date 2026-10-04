package com.medistock.backend.controller;

import com.medistock.backend.entity.Batch;
import com.medistock.backend.repository.BatchRepository;
import com.medistock.backend.security.TenantContext;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    private final BatchRepository batchRepository;

    public BatchController(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
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
}
