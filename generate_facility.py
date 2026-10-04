import os

backend_dir = "c:/Users/chira/Downloads/medistock-pro/backend/src/main/java/com/medistock/backend"
os.makedirs(f"{backend_dir}/entity/facility", exist_ok=True)
os.makedirs(f"{backend_dir}/repository/facility", exist_ok=True)

entities = {
    "EdgeDevice": """package com.medistock.backend.entity.facility;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import java.time.OffsetDateTime;

@Entity
@Table(name = "facility_edge_devices")
@Data
public class EdgeDevice {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "device_name", nullable = false)
    private String deviceName;
    
    @Column(name = "device_type", nullable = false)
    private String deviceType;
    
    @Column(name = "location_id")
    private String locationId;
    
    private String status = "ACTIVE";
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "firmware_version")
    private String firmwareVersion;
    
    @Column(name = "last_heartbeat")
    private OffsetDateTime lastHeartbeat;
}
""",
    "VisionEvent": """package com.medistock.backend.entity.facility;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import java.time.OffsetDateTime;

@Entity
@Table(name = "facility_vision_events")
@Data
public class VisionEvent {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "device_id")
    private UUID deviceId;
    
    @Column(name = "event_type", nullable = false)
    private String eventType;
    
    @Column(name = "confidence_score")
    private Double confidenceScore;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "detected_at")
    private OffsetDateTime detectedAt;
    
    private Boolean resolved = false;
    
    @Column(name = "resolution_notes")
    private String resolutionNotes;
}
""",
    "FacilityIncident": """package com.medistock.backend.entity.facility;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import java.time.OffsetDateTime;

@Entity
@Table(name = "facility_incidents")
@Data
public class FacilityIncident {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "incident_type", nullable = false)
    private String incidentType;
    
    @Column(nullable = false)
    private String severity;
    
    @Column(name = "location_id")
    private String locationId;
    
    private String description;
    
    @Column(name = "reported_at")
    private OffsetDateTime reportedAt;
    
    private String status = "OPEN";
    
    @Column(name = "assigned_to")
    private UUID assignedTo;
}
""",
    "MaintenanceTask": """package com.medistock.backend.entity.facility;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "facility_maintenance_tasks")
@Data
public class MaintenanceTask {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "asset_id", nullable = false)
    private String assetId;
    
    @Column(name = "task_type", nullable = false)
    private String taskType;
    
    private String description;
    
    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;
    
    private String status = "SCHEDULED";
    
    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
    
    @Column(name = "technician_id")
    private UUID technicianId;
}
"""
}

repos = [
    "EdgeDevice", "VisionEvent", "FacilityIncident", "MaintenanceTask"
]

for name, content in entities.items():
    with open(f"{backend_dir}/entity/facility/{name}.java", "w") as f:
        f.write(content)

for name in repos:
    content = f"""package com.medistock.backend.repository.facility;
import com.medistock.backend.entity.facility.{name};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface {name}Repository extends JpaRepository<{name}, UUID> {{
    List<{name}> findByOrganizationId(UUID organizationId);
}}
"""
    with open(f"{backend_dir}/repository/facility/{name}Repository.java", "w") as f:
        f.write(content)

service = """package com.medistock.backend.service;
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
}
"""
with open(f"{backend_dir}/service/FacilityService.java", "w") as f:
    f.write(service)

controller = """package com.medistock.backend.controller;
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
}
"""
with open(f"{backend_dir}/controller/FacilityController.java", "w") as f:
    f.write(controller)
