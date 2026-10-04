package com.medistock.backend.controller;

import com.medistock.backend.entity.Patient;
import com.medistock.backend.repository.PatientRepository;
import com.medistock.backend.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;

    public PatientController(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getPatients() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(patientRepository.findByOrganizationId(tenantId));
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        
        com.medistock.backend.entity.Organization org = new com.medistock.backend.entity.Organization();
        org.setId(tenantId);
        patient.setOrganization(org);
        
        return ResponseEntity.ok(patientRepository.save(patient));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable UUID id, @RequestBody Patient details) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return patientRepository.findByIdAndOrganizationId(id, tenantId)
                .map(existing -> {
                    existing.setName(details.getName());
                    existing.setMrn(details.getMrn());
                    existing.setDateOfBirth(details.getDateOfBirth());
                    existing.setGender(details.getGender());
                    existing.setContactNumber(details.getContactNumber());
                    existing.setEmail(details.getEmail());
                    existing.setAddress(details.getAddress());
                    existing.setAllergies(details.getAllergies());
                    existing.setBloodGroup(details.getBloodGroup());
                    return ResponseEntity.ok(patientRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return patientRepository.findByIdAndOrganizationId(id, tenantId)
                .map(patient -> {
                    patientRepository.delete(patient);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
