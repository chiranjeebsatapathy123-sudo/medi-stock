package com.medistock.backend.controller;

import com.medistock.backend.entity.StorageLocation;
import com.medistock.backend.repository.StorageLocationRepository;
import com.medistock.backend.security.TenantContext;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
public class LocationController {
    private final StorageLocationRepository repository;
    
    public LocationController(StorageLocationRepository repository) {
        this.repository = repository;
    }
    
    @GetMapping
    public ResponseEntity<List<StorageLocation>> getLocations() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(repository.findByOrganizationId(tenantId));
    }
}
