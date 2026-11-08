package com.medistock.backend.controller;

import com.medistock.backend.dto.procurement.ThreeWayMatchResult;
import com.medistock.backend.entity.Invoice;
import com.medistock.backend.entity.InvoiceException;
import com.medistock.backend.repository.InvoiceExceptionRepository;
import com.medistock.backend.repository.InvoiceRepository;
import com.medistock.backend.security.CustomUserDetails;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.ThreeWayMatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final ThreeWayMatchService threeWayMatchService;
    private final InvoiceExceptionRepository exceptionRepository;

    public InvoiceController(InvoiceRepository invoiceRepository,
                             ThreeWayMatchService threeWayMatchService,
                             InvoiceExceptionRepository exceptionRepository) {
        this.invoiceRepository = invoiceRepository;
        this.threeWayMatchService = threeWayMatchService;
        this.exceptionRepository = exceptionRepository;
    }

    @GetMapping
    public ResponseEntity<List<Invoice>> getInvoices() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(invoiceRepository.findByOrganizationId(tenantId));
    }

    @GetMapping("/{id}/three-way-match")
    public ResponseEntity<ThreeWayMatchResult> getThreeWayMatch(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(threeWayMatchService.matchInvoice(id, tenantId));
    }

    @PostMapping("/{id}/reconcile")
    public ResponseEntity<Invoice> reconcileInvoice(@PathVariable UUID id,
                                                    @RequestBody(required = false) Map<String, String> body,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        UUID userId = userDetails != null ? userDetails.getId() : UUID.randomUUID();
        String notes = body != null ? body.get("notes") : "Approved via 3-way reconciliation";
        return ResponseEntity.ok(threeWayMatchService.reconcileAndApprove(id, tenantId, userId, notes));
    }

    @GetMapping("/exceptions")
    public ResponseEntity<List<InvoiceException>> getExceptions() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(exceptionRepository.findByOrganizationId(tenantId));
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        
        com.medistock.backend.entity.Organization org = new com.medistock.backend.entity.Organization();
        org.setId(tenantId);
        invoice.setOrganization(org);
        
        if (invoice.getItems() != null) {
            invoice.getItems().forEach(item -> item.setInvoice(invoice));
        }
        
        return ResponseEntity.ok(invoiceRepository.save(invoice));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable UUID id, @RequestBody Invoice details) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return invoiceRepository.findByIdAndOrganizationId(id, tenantId)
                .map(existing -> {
                    existing.setStatus(details.getStatus());
                    existing.setPaidDate(details.getPaidDate());
                    existing.setNotes(details.getNotes());
                    return ResponseEntity.ok(invoiceRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return invoiceRepository.findByIdAndOrganizationId(id, tenantId)
                .map(invoice -> {
                    invoiceRepository.delete(invoice);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
