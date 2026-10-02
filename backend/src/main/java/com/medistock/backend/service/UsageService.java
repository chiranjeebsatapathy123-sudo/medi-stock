package com.medistock.backend.service;

import com.medistock.backend.security.TenantContext;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class UsageService {
    
    // Abstracted for Phase 5 to show usage tracking across organizations
    public Map<String, Object> getUsageLimits(UUID organizationId) {
        // Enforce securely resolved tenant
        UUID resolvedTenant = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : organizationId;
        
        // Mocking billing metrics
        return Map.of(
            "plan", "PROFESSIONAL",
            "activeUsers", 12,
            "userLimit", 25,
            "storageUsedMB", 45,
            "storageLimitMB", 5000,
            "aiRequestsUsed", 124,
            "aiRequestLimit", 1000,
            "status", "ACTIVE"
        );
    }
    
    public void trackApiUsage(UUID organizationId) {
        // Increment usage counters
    }
}
