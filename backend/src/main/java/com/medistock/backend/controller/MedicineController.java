package com.medistock.backend.controller;

import com.medistock.backend.entity.Medicine;
import com.medistock.backend.repository.MedicineRepository;
import com.medistock.backend.security.TenantContext;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineRepository medicineRepository;

    public MedicineController(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(medicineRepository.findByOrganizationId(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicine(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return medicineRepository.findByIdAndOrganizationId(id, tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Medicine> createMedicine(@RequestBody Medicine medicine) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        
        com.medistock.backend.entity.Organization org = new com.medistock.backend.entity.Organization();
        org.setId(tenantId);
        medicine.setOrganization(org);
        medicine.setActive(true);
        
        Medicine saved = medicineRepository.save(medicine);
        return ResponseEntity.ok(saved);
    }
}
