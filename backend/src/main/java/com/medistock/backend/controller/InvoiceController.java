package com.medistock.backend.controller;

import com.medistock.backend.entity.Invoice;
import com.medistock.backend.repository.InvoiceRepository;
import com.medistock.backend.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;

    public InvoiceController(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @GetMapping
    public ResponseEntity<List<Invoice>> getInvoices() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(invoiceRepository.findByOrganizationId(tenantId));
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
