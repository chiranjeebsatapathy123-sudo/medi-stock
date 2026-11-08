package com.medistock.backend.service;

import com.medistock.backend.entity.Batch;
import com.medistock.backend.entity.facility.*;
import com.medistock.backend.repository.BatchRepository;
import com.medistock.backend.repository.facility.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class FacilityService {
    private final EdgeDeviceRepository deviceRepo;
    private final VisionEventRepository visionRepo;
    private final FacilityIncidentRepository incidentRepo;
    private final MaintenanceTaskRepository maintenanceRepo;
    private final ColdChainReadingRepository readingRepo;
    private final BatchRepository batchRepo;
    private final AuditService auditService;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    public FacilityService(EdgeDeviceRepository deviceRepo,
                           VisionEventRepository visionRepo,
                           FacilityIncidentRepository incidentRepo,
                           MaintenanceTaskRepository maintenanceRepo,
                           ColdChainReadingRepository readingRepo,
                           BatchRepository batchRepo,
                           AuditService auditService) {
        this.deviceRepo = deviceRepo;
        this.visionRepo = visionRepo;
        this.incidentRepo = incidentRepo;
        this.maintenanceRepo = maintenanceRepo;
        this.readingRepo = readingRepo;
        this.batchRepo = batchRepo;
        this.auditService = auditService;
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

            String url = (mlServiceUrl != null ? mlServiceUrl : "http://localhost:8000") + "/predict/vision";
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

            VisionEvent event = new VisionEvent();
            event.setOrganizationId(orgId);
            event.setDeviceId(UUID.fromString((String) response.get("camera_id")));
            event.setEventType((String) response.get("event_type"));
            event.setConfidenceScore((Double) response.get("confidence"));
            event.setDetection((String) response.get("detection"));
            event.setExpected((String) response.get("expected"));
            event.setDetectedAt(OffsetDateTime.now());
            event.setImageUrl("simulated-camera-frame.jpg");
            event.setResolved(false);

            return visionRepo.save(event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to contact ML Service", e);
        }
    }

    @Transactional
    public ColdChainReading ingestReading(ColdChainReading reading, UUID orgId) {
        reading.setOrganizationId(orgId);
        if (reading.getTimestamp() == null) {
            reading.setTimestamp(OffsetDateTime.now());
        }

        double temp = reading.getTemperature();
        boolean isExcursion = (temp < 2.0 || temp > 8.0);
        reading.setStatus(isExcursion ? "EXCURSION" : "NORMAL");

        ColdChainReading saved = readingRepo.save(reading);

        // Update Edge Device heartbeat if registered
        List<EdgeDevice> devices = deviceRepo.findByOrganizationId(orgId);
        for (EdgeDevice dev : devices) {
            if (dev.getDeviceName().equalsIgnoreCase(reading.getDeviceId()) ||
                    dev.getDeviceName().equalsIgnoreCase(reading.getDeviceName())) {
                dev.setLastHeartbeat(OffsetDateTime.now());
                dev.setStatus(isExcursion ? "WARNING" : "ACTIVE");
                deviceRepo.save(dev);
            }
        }

        // Automated Excursion Protocol: If temperature exceeds WHO/CDC threshold (2-8°C)
        if (isExcursion) {
            FacilityIncident incident = new FacilityIncident();
            incident.setOrganizationId(orgId);
            incident.setIncidentType("COLD_CHAIN_EXCURSION");
            incident.setSeverity(temp > 12.0 || temp < 0.0 ? "CRITICAL" : "HIGH");
            incident.setDescription("Temperature excursion detected by " + reading.getDeviceId() + " at " +
                    reading.getLocationCode() + ": " + temp + "°C (Allowed: 2.0°C - 8.0°C)");
            incident.setReportedAt(OffsetDateTime.now());
            incident.setStatus("OPEN");
            incidentRepo.save(incident);

            // Auto-Quarantine temperature-sensitive inventory in this zone
            List<Batch> batches = batchRepo.findByMedicineOrganizationId(orgId);
            for (Batch b : batches) {
                if ("ACTIVE".equalsIgnoreCase(b.getStatus()) && b.getMedicine() != null && b.getMedicine().isTemperatureSensitive()) {
                    b.setQuarantine(true);
                    b.setStatus("QUARANTINED");
                    b.setQuarantineReason("Automated Cold-Chain Excursion (" + temp + "°C at " + reading.getLocationCode() + ")");
                    batchRepo.save(b);

                    try {
                        auditService.recordAudit(
                                orgId, null, "ColdChainGuardian", "IOT_AUTOMATION",
                                "AUTO_QUARANTINE_EXCURSION", "BATCH", b.getId(),
                                "ACTIVE", "QUARANTINED",
                                "Automated IoT quarantine triggered by sensor " + reading.getDeviceId() + " reporting " + temp + "°C"
                        );
                    } catch (Exception ignored) {}
                }
            }
        }

        return saved;
    }

    public Map<String, Object> getLatestTelemetry(UUID orgId) {
        List<ColdChainReading> latestReadings;
        try {
            latestReadings = readingRepo.findLatestReadingsPerDevice(orgId);
        } catch (Exception e) {
            latestReadings = readingRepo.findByOrganizationIdOrderByTimestampDesc(orgId);
        }

        if (latestReadings == null || latestReadings.isEmpty()) {
            // Provide default baseline readings
            latestReadings = Arrays.asList(
                    createDefaultReading(orgId, "SenseNode-Alpha", "Cold Storage Array Alpha", "LOC-COLD", 4.2, 42.0, 94),
                    createDefaultReading(orgId, "SenseNode-Beta", "Cold Storage Array Beta", "LOC-COLD", 4.8, 44.0, 88),
                    createDefaultReading(orgId, "MobileCooler-Logger1", "Mobile Transit Cooler 1", "TRANSIT-01", 3.9, 41.0, 76)
            );
        }

        boolean hasExcursion = latestReadings.stream().anyMatch(r -> "EXCURSION".equalsIgnoreCase(r.getStatus()));

        Map<String, Object> response = new HashMap<>();
        response.put("readings", latestReadings);
        response.put("systemStatus", hasExcursion ? "EXCURSION_ACTIVE" : "COMPLIANT");
        response.put("targetRange", "2.0°C - 8.0°C");
        response.put("monitoredCoolersCount", latestReadings.size());
        response.put("lastCheckTimestamp", OffsetDateTime.now());
        return response;
    }

    public ColdChainReading simulateExcursion(UUID orgId, String deviceId, Double temp) {
        ColdChainReading reading = new ColdChainReading();
        reading.setOrganizationId(orgId);
        reading.setDeviceId(deviceId != null ? deviceId : "SenseNode-Alpha");
        reading.setDeviceName(deviceId != null ? deviceId : "Cold Storage Array Alpha");
        reading.setLocationCode("LOC-COLD");
        reading.setTemperature(temp != null ? temp : 9.8);
        reading.setHumidity(48.0);
        reading.setBatteryLevel(91);
        reading.setTimestamp(OffsetDateTime.now());
        return ingestReading(reading, orgId);
    }

    private ColdChainReading createDefaultReading(UUID orgId, String devId, String name, String loc, double temp, double hum, int batt) {
        ColdChainReading r = new ColdChainReading();
        r.setId(UUID.randomUUID());
        r.setOrganizationId(orgId);
        r.setDeviceId(devId);
        r.setDeviceName(name);
        r.setLocationCode(loc);
        r.setTemperature(temp);
        r.setHumidity(hum);
        r.setBatteryLevel(batt);
        r.setStatus(temp < 2.0 || temp > 8.0 ? "EXCURSION" : "NORMAL");
        r.setTimestamp(OffsetDateTime.now());
        return r;
    }
}
