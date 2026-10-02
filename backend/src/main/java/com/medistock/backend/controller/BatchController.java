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
}
