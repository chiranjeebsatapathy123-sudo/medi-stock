package com.medistock.backend.controller;

import com.medistock.backend.security.CustomUserDetails;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.FhirService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/fhir", produces = {MediaType.APPLICATION_JSON_VALUE, "application/fhir+json"})
public class FhirController {

    private final FhirService fhirService;

    public FhirController(FhirService fhirService) {
        this.fhirService = fhirService;
    }

    @GetMapping("/Patient/{id}")
    @PreAuthorize("hasAuthority('PATIENT_VIEW') or hasAuthority('PHARMACIST') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getPatient(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(fhirService.getFhirPatient(id, tenantId));
    }

    @GetMapping("/Patient")
    @PreAuthorize("hasAuthority('PATIENT_VIEW') or hasAuthority('PHARMACIST') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> searchPatients(@RequestParam(required = false) String identifier) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(fhirService.searchFhirPatients(identifier, tenantId));
    }

    @PostMapping(value = "/MedicationRequest", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('PHARMACY_MANAGER') or hasAuthority('PHARMACIST') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> createMedicationRequest(@RequestBody Map<String, Object> fhirBody,
                                                                       @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        UUID userId = userDetails != null ? userDetails.getId() : UUID.randomUUID();
        return ResponseEntity.status(201).body(fhirService.ingestFhirMedicationRequest(fhirBody, tenantId, userId));
    }

    @GetMapping("/MedicationDispense/{id}")
    @PreAuthorize("hasAuthority('PHARMACY_VIEW') or hasAuthority('PHARMACIST') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getMedicationDispense(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(fhirService.getFhirMedicationDispense(id, tenantId));
    }

    @GetMapping("/metadata")
    public ResponseEntity<Map<String, Object>> getCapabilityStatement() {
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("resourceType", "CapabilityStatement");
        meta.put("status", "active");
        meta.put("fhirVersion", "4.0.1");
        meta.put("format", List.of("application/json", "application/fhir+json"));
        meta.put("name", "MediStockProFHIRGateway");
        meta.put("title", "MediStock Pro Hospital Pharmacy & Supply Chain FHIR R4 Gateway");
        meta.put("publisher", "MediStock Health Systems");
        return ResponseEntity.ok(meta);
    }
}

