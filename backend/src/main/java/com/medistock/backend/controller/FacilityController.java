package com.medistock.backend.controller;
import com.medistock.backend.entity.facility.FacilityIncident;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.FacilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/facility")
public class FacilityController {
    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(facilityService.getFacilityOverview(tenantId));
    }

    @PostMapping("/incidents")
    public ResponseEntity<FacilityIncident> reportIncident(@RequestBody FacilityIncident incident) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(facilityService.reportIncident(incident, tenantId));
    }

    @PutMapping("/vision/{id}/resolve")
    public ResponseEntity<?> resolveVisionEvent(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(facilityService.resolveVisionEvent(id, body.get("status"), tenantId));
    }
    
    @PostMapping("/vision/trigger-simulation")
    public ResponseEntity<?> triggerVisionSimulation(@RequestBody Map<String, String> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(facilityService.triggerVisionSimulation(tenantId, payload.get("deviceId")));
    }
}
