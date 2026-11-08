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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = null;
        boolean isSuperAdmin = false;

        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            userDetails = (CustomUserDetails) authentication.getPrincipal();
            isSuperAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_SUPER_ADMIN".equalsIgnoreCase(a.getAuthority()));
        }

        // 1. Check custom X-Tenant-ID header passed by frontend workspace switcher
        String headerTenant = request.getHeader("X-Tenant-ID");
        if (headerTenant != null && !headerTenant.trim().isEmpty()) {
            UUID requestedTenant = null;
            if ("tenant_main".equalsIgnoreCase(headerTenant) || "main".equalsIgnoreCase(headerTenant) || "default".equalsIgnoreCase(headerTenant)) {
                requestedTenant = DEFAULT_ORGANIZATION_ID;
            } else {
                try {
                    requestedTenant = UUID.fromString(headerTenant.trim());
                } catch (Exception ignored) {}
            }

            if (requestedTenant != null) {
                // If user is authenticated, only allow header tenant if SUPER_ADMIN or matches user's assigned organization
                if (userDetails != null) {
                    if (isSuperAdmin || requestedTenant.equals(userDetails.getOrganizationId())) {
                        tenantId = requestedTenant;
                    } else {
                        tenantId = userDetails.getOrganizationId();
                    }
                } else {
                    tenantId = requestedTenant;
                }
            }
        }

        // 2. Check authenticated user's organizationId if not resolved from header
        if (tenantId == null && userDetails != null && userDetails.getOrganizationId() != null) {
            tenantId = userDetails.getOrganizationId();
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
