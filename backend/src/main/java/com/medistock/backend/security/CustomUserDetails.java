package com.medistock.backend.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;
import java.util.UUID;

public class CustomUserDetails extends User {
    private final UUID id;
    private final UUID organizationId;

    public CustomUserDetails(String username, String password, Collection<? extends GrantedAuthority> authorities, UUID id, UUID organizationId) {
        super(username, password, authorities);
        this.id = id;
        this.organizationId = organizationId;
    }

    public UUID getId() {
        return id;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }
}
