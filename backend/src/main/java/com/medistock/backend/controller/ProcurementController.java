package com.medistock.backend.controller;

import com.medistock.backend.dto.procurement.StockoutRiskAnalysis;
import com.medistock.backend.entity.*;
import com.medistock.backend.repository.PurchaseRequestRepository;
import com.medistock.backend.security.CustomUserDetails;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.ProcurementService;
import com.medistock.backend.service.ReorderService;
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
    private final ReorderService reorderService;
    private final PurchaseRequestRepository purchaseRequestRepository;

    public ProcurementController(ProcurementService procurementService,
                                 ReorderService reorderService,
                                 PurchaseRequestRepository purchaseRequestRepository) {
        this.procurementService = procurementService;
        this.reorderService = reorderService;
        this.purchaseRequestRepository = purchaseRequestRepository;
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

    @GetMapping("/reorder/analysis")
    @PreAuthorize("hasAuthority('PROCUREMENT_VIEW') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<StockoutRiskAnalysis>> getStockoutAnalysis() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(reorderService.analyzeStockoutRisk(tenantId));
    }

    @PostMapping("/reorder/trigger")
    @PreAuthorize("hasAuthority('PURCHASE_ORDER_CREATE') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<PurchaseRequest> triggerReorder(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        UUID userId = userDetails != null ? userDetails.getId() : UUID.randomUUID();
        PurchaseRequest pr = reorderService.triggerAutonomousReorder(tenantId, userId);
        if (pr == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(pr);
    }

    @GetMapping("/purchase-requests")
    @PreAuthorize("hasAuthority('PROCUREMENT_VIEW') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<PurchaseRequest>> getPurchaseRequests() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(purchaseRequestRepository.findByOrganizationId(tenantId));
    }

    @PostMapping("/purchase-requests/{id}/convert-to-po")
    @PreAuthorize("hasAuthority('PURCHASE_ORDER_CREATE') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<PurchaseOrder> convertToPo(@PathVariable UUID id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        UUID userId = userDetails != null ? userDetails.getId() : UUID.randomUUID();
        return ResponseEntity.ok(reorderService.convertRequestToPO(id, tenantId, userId));
    }
}
