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

    @GetMapping("/telemetry/latest")
    public ResponseEntity<?> getLatestTelemetry() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(facilityService.getLatestTelemetry(tenantId));
    }

    @PostMapping("/telemetry/ingest")
    public ResponseEntity<?> ingestTelemetry(@RequestBody com.medistock.backend.entity.facility.ColdChainReading reading) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(facilityService.ingestReading(reading, tenantId));
    }

    @PostMapping("/telemetry/simulate")
    public ResponseEntity<?> simulateTelemetry(@RequestBody(required = false) Map<String, Object> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        String deviceId = payload != null && payload.containsKey("deviceId") ? (String) payload.get("deviceId") : "SenseNode-Alpha";
        Double temp = payload != null && payload.containsKey("temperature") ? Double.valueOf(payload.get("temperature").toString()) : 9.5;

        return ResponseEntity.ok(facilityService.simulateExcursion(tenantId, deviceId, temp));
    }
}
