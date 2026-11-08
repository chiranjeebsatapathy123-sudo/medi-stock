package com.medistock.backend.controller;

import com.medistock.backend.entity.AuditLog;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(auditService.getLogsForOrganization(tenantId));
    }

    @GetMapping({"/verify", "/verify-chain"})
    public ResponseEntity<Map<String, Object>> verifyIntegrity() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(auditService.verifyChainIntegrity(tenantId));
    }

    @GetMapping("/entity/{type}/{id}")
    public ResponseEntity<List<AuditLog>> getEntityAudit(@PathVariable String type, @PathVariable UUID id) {
        return ResponseEntity.ok(auditService.getLogsForEntity(type.toUpperCase(), id));
    }
}

