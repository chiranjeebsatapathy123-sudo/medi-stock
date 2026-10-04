package com.medistock.backend.service;
import com.medistock.backend.entity.facility.*;
import com.medistock.backend.repository.facility.*;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class FacilityService {
    private final EdgeDeviceRepository deviceRepo;
    private final VisionEventRepository visionRepo;
    private final FacilityIncidentRepository incidentRepo;
    private final MaintenanceTaskRepository maintenanceRepo;

    public FacilityService(EdgeDeviceRepository deviceRepo, VisionEventRepository visionRepo, FacilityIncidentRepository incidentRepo, MaintenanceTaskRepository maintenanceRepo) {
        this.deviceRepo = deviceRepo;
        this.visionRepo = visionRepo;
        this.incidentRepo = incidentRepo;
        this.maintenanceRepo = maintenanceRepo;
    }

    public Map<String, Object> getFacilityOverview(UUID orgId) {
        Map<String, Object> overview = new HashMap<>();
        overview.put("edgeDevices", deviceRepo.findByOrganizationId(orgId));
        overview.put("visionEvents", visionRepo.findByOrganizationId(orgId));
        overview.put("facilityIncidents", incidentRepo.findByOrganizationId(orgId));
        overview.put("maintenanceTasks", maintenanceRepo.findByOrganizationId(orgId));
        return overview;
    }

    public FacilityIncident reportIncident(FacilityIncident incident, UUID orgId) {
        incident.setOrganizationId(orgId);
        return incidentRepo.save(incident);
    }

    public VisionEvent resolveVisionEvent(UUID eventId, String status, UUID orgId) {
        VisionEvent event = visionRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        if (!event.getOrganizationId().equals(orgId)) throw new RuntimeException("Access denied");
        event.setResolved(true);
        event.setResolutionNotes("Resolved manually as " + status);
        return visionRepo.save(event);
    }
    
    public VisionEvent triggerVisionSimulation(UUID orgId, String deviceId) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            Map<String, String> request = new HashMap<>();
            request.put("camera_id", deviceId == null ? UUID.randomUUID().toString() : deviceId);
            
            Map<String, Object> response = restTemplate.postForObject(
                "http://localhost:8000/predict/vision",
                request,
                Map.class
            );
            
            VisionEvent event = new VisionEvent();
            event.setOrganizationId(orgId);
            event.setDeviceId(UUID.fromString((String) response.get("camera_id")));
            event.setEventType((String) response.get("event_type"));
            event.setConfidenceScore((Double) response.get("confidence"));
            event.setDetection((String) response.get("detection"));
            event.setExpected((String) response.get("expected"));
            event.setDetectedAt(java.time.OffsetDateTime.now());
            event.setImageUrl("simulated-camera-frame.jpg");
            event.setResolved(false);
            
            return visionRepo.save(event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to contact ML Service", e);
        }
    }
}
