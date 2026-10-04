package com.medistock.backend.controller;

import com.medistock.backend.dto.FinanceOverviewDTO;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.FinanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/overview")
    public ResponseEntity<FinanceOverviewDTO> getOverview() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(financeService.getFinancialOverview(tenantId));
    }
}
