package com.medistock.backend.controller;

import com.medistock.backend.dto.recall.PatientExposureSummary;
import com.medistock.backend.dto.recall.RecallExecutionRequest;
import com.medistock.backend.dto.recall.RecallExecutionResult;
import com.medistock.backend.security.CustomUserDetails;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.RecallService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/recall")
public class RecallController {

    private final RecallService recallService;

    public RecallController(RecallService recallService) {
        this.recallService = recallService;
    }

    @PostMapping("/execute")
    @PreAuthorize("hasAuthority('QUALITY_MANAGE') or hasAuthority('BATCH_MANAGE') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<RecallExecutionResult> executeRecall(@RequestBody RecallExecutionRequest request,
                                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        UUID userId = userDetails != null ? userDetails.getId() : UUID.randomUUID();
        return ResponseEntity.ok(recallService.executeRecall(request, tenantId, userId));
    }

    @GetMapping("/trace/{lotNumber}")
    @PreAuthorize("hasAuthority('QUALITY_VIEW') or hasAuthority('BATCH_VIEW') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<PatientExposureSummary>> traceLotExposure(@PathVariable String lotNumber) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(recallService.tracePatientExposure(tenantId, lotNumber));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('QUALITY_VIEW') or hasAuthority('BATCH_VIEW') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getActiveRecalls() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(recallService.getActiveRecalls(tenantId));
    }
}

