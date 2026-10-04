package com.medistock.backend.controller;

import com.medistock.backend.entity.Supplier;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SUPPLIER_VIEW') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Supplier>> getSuppliers() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(supplierService.getSuppliers(tenantId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SUPPLIER_MANAGE') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<Supplier> createSupplier(@RequestBody Supplier supplier) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(supplierService.createSupplier(supplier, tenantId));
    }
}
