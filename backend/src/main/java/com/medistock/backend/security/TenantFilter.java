package com.medistock.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TenantFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User) {
            // Extract custom details or map username back to user->org
            // In a full impl, we extend UserDetails to hold organizationId.
            // For now, we mock the secure resolution phase.
            
            // Example of how we prevent blind client trust:
            // UUID orgId = ((CustomUserDetails) authentication.getPrincipal()).getOrganizationId();
            // TenantContext.setCurrentTenant(orgId);
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
