package com.medistock.backend.controller;

import com.medistock.backend.entity.pharmacy.DispensingRecord;
import com.medistock.backend.entity.pharmacy.DispensingRequest;
import com.medistock.backend.entity.pharmacy.MedicationOrder;
import com.medistock.backend.security.CustomUserDetails;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.PharmacyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pharmacy")
public class PharmacyController {

    private final PharmacyService pharmacyService;

    public PharmacyController(PharmacyService pharmacyService) {
        this.pharmacyService = pharmacyService;
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('PHARMACY_VIEW') or hasAuthority('PHARMACY_MANAGER') or hasAuthority('PHARMACIST') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<MedicationOrder>> getOrders() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(pharmacyService.getOrders(tenantId));
    }

    @GetMapping("/orders/{id}")
    @PreAuthorize("hasAuthority('PHARMACY_VIEW') or hasAuthority('PHARMACY_MANAGER') or hasAuthority('PHARMACIST') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<MedicationOrder> getOrder(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(pharmacyService.getOrder(id, tenantId));
    }

    @PostMapping("/orders")
    @PreAuthorize("hasAuthority('PHARMACY_MANAGER') or hasAuthority('PHARMACIST') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<MedicationOrder> createOrder(@RequestBody MedicationOrder order, @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(pharmacyService.createOrder(order, tenantId, userDetails.getId()));
    }

    @PostMapping("/orders/{id}/review")
    @PreAuthorize("hasAuthority('PHARMACY_REVIEW') or hasAuthority('PHARMACIST') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<MedicationOrder> reviewOrder(@PathVariable UUID id, @RequestBody Map<String, String> body, @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(pharmacyService.reviewOrder(id, tenantId, userDetails.getId(), body.get("action")));
    }

    @PostMapping("/orders/{id}/dispense")
    @PreAuthorize("hasAuthority('PHARMACY_DISPENSE') or hasAuthority('PHARMACIST') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<DispensingRecord> dispenseOrder(@PathVariable UUID id, @RequestBody DispensingRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(pharmacyService.dispenseOrder(id, tenantId, userDetails.getId(), request));
    }

    @PostMapping("/orders/{id}/second-verify")
    @PreAuthorize("hasAuthority('PHARMACY_REVIEW') or hasAuthority('PHARMACIST') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<MedicationOrder> secondVerifyOrder(@PathVariable UUID id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(pharmacyService.secondVerifyOrder(id, tenantId, userDetails.getId()));
    }

    @PostMapping("/dispensing/{id}/reverse")
    @PreAuthorize("hasAuthority('PHARMACY_REVERSE') or hasAuthority('PHARMACY_MANAGER') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<DispensingRecord> reverseDispense(@PathVariable UUID id, @RequestBody Map<String, String> body, @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(pharmacyService.reverseDispense(id, tenantId, userDetails.getId(), body.get("reason")));
    }
}
