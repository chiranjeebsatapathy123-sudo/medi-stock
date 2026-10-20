package com.medistock.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

public class TenantFilter extends OncePerRequestFilter {

    private static final UUID DEFAULT_ORGANIZATION_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        UUID tenantId = null;

        // 1. Check custom X-Tenant-ID header passed by frontend workspace switcher
        String headerTenant = request.getHeader("X-Tenant-ID");
        if (headerTenant != null && !headerTenant.trim().isEmpty()) {
            if ("tenant_main".equalsIgnoreCase(headerTenant) || "main".equalsIgnoreCase(headerTenant) || "default".equalsIgnoreCase(headerTenant)) {
                tenantId = DEFAULT_ORGANIZATION_ID;
            } else {
                try {
                    tenantId = UUID.fromString(headerTenant.trim());
                } catch (Exception ignored) {}
            }
        }

        // 2. Check authenticated user's organizationId if not resolved from header
        if (tenantId == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                if (userDetails.getOrganizationId() != null) {
                    tenantId = userDetails.getOrganizationId();
                }
            }
        }

        // 3. Fallback to default enterprise organization if still unassigned
        if (tenantId == null) {
            tenantId = DEFAULT_ORGANIZATION_ID;
        }

        TenantContext.setCurrentTenant(tenantId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
