package com.medistock.backend.controller;

import com.medistock.backend.entity.*;
import com.medistock.backend.security.CustomUserDetails;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.ProcurementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/procurement")
public class ProcurementController {

    private final ProcurementService procurementService;

    public ProcurementController(ProcurementService procurementService) {
        this.procurementService = procurementService;
    }

    @GetMapping("/purchase-orders")
    @PreAuthorize("hasAuthority('PROCUREMENT_VIEW') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<PurchaseOrder>> getPurchaseOrders() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(procurementService.getPurchaseOrders(tenantId));
    }

    @PostMapping("/purchase-orders")
    @PreAuthorize("hasAuthority('PURCHASE_ORDER_CREATE') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<PurchaseOrder> createPO(@RequestBody PurchaseOrder po, @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(procurementService.createPO(po, tenantId, userDetails.getId()));
    }

    @PostMapping("/purchase-orders/{id}/approve")
    @PreAuthorize("hasAuthority('PURCHASE_ORDER_APPROVE') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<PurchaseOrder> approvePO(@PathVariable UUID id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(procurementService.approvePO(id, tenantId, userDetails.getId()));
    }

    @PostMapping("/purchase-orders/{id}/receive")
    @PreAuthorize("hasAuthority('RECEIVING_CREATE') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<GRN> receiveGRN(@PathVariable UUID id, @RequestBody GRN grnRequest, @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(procurementService.receiveGRN(id, grnRequest, tenantId, userDetails.getId()));
    }
}
