import os

backend_dir = "c:/Users/chira/Downloads/medistock-pro/backend/src/main/java/com/medistock/backend"
os.makedirs(f"{backend_dir}/entity/logistics", exist_ok=True)
os.makedirs(f"{backend_dir}/repository/logistics", exist_ok=True)

entities = {
    "Vehicle": """package com.medistock.backend.entity.logistics;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import java.time.LocalDate;

@Entity
@Table(name = "logistics_vehicles")
@Data
public class Vehicle {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "plate_number", nullable = false)
    private String plateNumber;
    
    @Column(name = "vehicle_type", nullable = false)
    private String vehicleType;
    
    private String status = "AVAILABLE";
    
    @Column(name = "capacity_kg")
    private Double capacityKg;
    
    @Column(name = "cold_chain_capable")
    private Boolean coldChainCapable = false;
    
    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;
}
""",
    "Driver": """package com.medistock.backend.entity.logistics;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;

@Entity
@Table(name = "logistics_drivers")
@Data
public class Driver {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "user_id")
    private UUID userId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "license_number")
    private String licenseNumber;
    
    private String status = "AVAILABLE";
    
    @Column(name = "vehicle_id")
    private UUID vehicleId;
}
""",
    "Shipment": """package com.medistock.backend.entity.logistics;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import java.time.OffsetDateTime;

@Entity
@Table(name = "logistics_shipments")
@Data
public class Shipment {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "shipment_number", nullable = false)
    private String shipmentNumber;
    
    @Column(name = "origin_id", nullable = false)
    private String originId;
    
    @Column(name = "destination_id", nullable = false)
    private String destinationId;
    
    private String status = "PENDING";
    
    @Column(name = "driver_id")
    private UUID driverId;
    
    @Column(name = "vehicle_id")
    private UUID vehicleId;
    
    private String priority = "NORMAL";
    
    @Column(name = "temperature_min")
    private Double temperatureMin;
    
    @Column(name = "temperature_max")
    private Double temperatureMax;
    
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    
    @Column(name = "estimated_arrival")
    private OffsetDateTime estimatedArrival;
    
    @PrePersist
    protected void onCreate() {
        if(createdAt == null) createdAt = OffsetDateTime.now();
    }
}
""",
    "ChainOfCustodyEvent": """package com.medistock.backend.entity.logistics;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import java.time.OffsetDateTime;

@Entity
@Table(name = "logistics_chain_of_custody")
@Data
public class ChainOfCustodyEvent {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "shipment_id", nullable = false)
    private UUID shipmentId;
    
    @Column(name = "event_type", nullable = false)
    private String eventType;
    
    @Column(nullable = false)
    private String location;
    
    @Column(name = "recorded_by", nullable = false)
    private String recordedBy;
    
    private OffsetDateTime timestamp;
    
    @Column(name = "signature_hash")
    private String signatureHash;
    
    private String notes;
    
    @PrePersist
    protected void onCreate() {
        if(timestamp == null) timestamp = OffsetDateTime.now();
    }
}
""",
    "ShipmentException": """package com.medistock.backend.entity.logistics;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import java.time.OffsetDateTime;

@Entity
@Table(name = "logistics_exceptions")
@Data
public class ShipmentException {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "shipment_id", nullable = false)
    private UUID shipmentId;
    
    @Column(name = "exception_type", nullable = false)
    private String exceptionType;
    
    @Column(nullable = false)
    private String severity;
    
    private String description;
    
    @Column(name = "reported_at")
    private OffsetDateTime reportedAt;
    
    private Boolean resolved = false;
    
    @PrePersist
    protected void onCreate() {
        if(reportedAt == null) reportedAt = OffsetDateTime.now();
    }
}
"""
}

repos = [
    "Vehicle", "Driver", "Shipment", "ChainOfCustodyEvent", "ShipmentException"
]

for name, content in entities.items():
    with open(f"{backend_dir}/entity/logistics/{name}.java", "w") as f:
        f.write(content)

for name in repos:
    content = f"""package com.medistock.backend.repository.logistics;
import com.medistock.backend.entity.logistics.{name};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface {name}Repository extends JpaRepository<{name}, UUID> {{
"""
    if name in ["Vehicle", "Driver", "Shipment"]:
        content += f"    List<{name}> findByOrganizationId(UUID organizationId);\n"
    elif name in ["ChainOfCustodyEvent", "ShipmentException"]:
        content += f"    List<{name}> findByShipmentId(UUID shipmentId);\n"
    content += "}\n"
    
    with open(f"{backend_dir}/repository/logistics/{name}Repository.java", "w") as f:
        f.write(content)

service = """package com.medistock.backend.service;
import com.medistock.backend.entity.logistics.*;
import com.medistock.backend.repository.logistics.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class LogisticsService {
    private final VehicleRepository vehicleRepo;
    private final DriverRepository driverRepo;
    private final ShipmentRepository shipmentRepo;
    private final ChainOfCustodyEventRepository cocRepo;
    private final ShipmentExceptionRepository exceptionRepo;

    public LogisticsService(VehicleRepository vehicleRepo, DriverRepository driverRepo, ShipmentRepository shipmentRepo, ChainOfCustodyEventRepository cocRepo, ShipmentExceptionRepository exceptionRepo) {
        this.vehicleRepo = vehicleRepo;
        this.driverRepo = driverRepo;
        this.shipmentRepo = shipmentRepo;
        this.cocRepo = cocRepo;
        this.exceptionRepo = exceptionRepo;
    }

    public Map<String, Object> getLogisticsOverview(UUID orgId) {
        Map<String, Object> overview = new HashMap<>();
        overview.put("vehicles", vehicleRepo.findByOrganizationId(orgId));
        overview.put("drivers", driverRepo.findByOrganizationId(orgId));
        overview.put("shipments", shipmentRepo.findByOrganizationId(orgId));
        overview.put("exceptions", exceptionRepo.findAll()); // simplified
        overview.put("chainOfCustody", cocRepo.findAll()); // simplified
        return overview;
    }

    public Shipment createShipment(Shipment shipment, UUID orgId) {
        shipment.setOrganizationId(orgId);
        return shipmentRepo.save(shipment);
    }
}
"""
with open(f"{backend_dir}/service/LogisticsService.java", "w") as f:
    f.write(service)

controller = """package com.medistock.backend.controller;
import com.medistock.backend.entity.logistics.Shipment;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.LogisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/logistics")
public class LogisticsController {
    private final LogisticsService logisticsService;

    public LogisticsController(LogisticsService logisticsService) {
        this.logisticsService = logisticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(logisticsService.getLogisticsOverview(tenantId));
    }

    @PostMapping("/shipments")
    public ResponseEntity<Shipment> createShipment(@RequestBody Shipment shipment) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(logisticsService.createShipment(shipment, tenantId));
    }
}
"""
with open(f"{backend_dir}/controller/LogisticsController.java", "w") as f:
    f.write(controller)
