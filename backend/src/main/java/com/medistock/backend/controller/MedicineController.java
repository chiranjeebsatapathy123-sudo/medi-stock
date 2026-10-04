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

    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable UUID id, @RequestBody Medicine medicineDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return medicineRepository.findByIdAndOrganizationId(id, tenantId)
                .map(existingMedicine -> {
                    existingMedicine.setMedicineCode(medicineDetails.getMedicineCode());
                    existingMedicine.setGenericName(medicineDetails.getGenericName());
                    existingMedicine.setBrandName(medicineDetails.getBrandName());
                    existingMedicine.setStrength(medicineDetails.getStrength());
                    existingMedicine.setCategory(medicineDetails.getCategory());
                    existingMedicine.setDosageForm(medicineDetails.getDosageForm());
                    existingMedicine.setManufacturer(medicineDetails.getManufacturer());
                    existingMedicine.setUnit(medicineDetails.getUnit());
                    existingMedicine.setSafetyStock(medicineDetails.getSafetyStock());
                    existingMedicine.setReorderLevel(medicineDetails.getReorderLevel());
                    existingMedicine.setDescription(medicineDetails.getDescription());
                    existingMedicine.setStorageRequirement(medicineDetails.getStorageRequirement());
                    return ResponseEntity.ok(medicineRepository.save(existingMedicine));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return medicineRepository.findByIdAndOrganizationId(id, tenantId)
                .map(medicine -> {
                    medicineRepository.delete(medicine);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
