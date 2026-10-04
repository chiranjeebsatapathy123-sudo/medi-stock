package com.medistock.backend.entity.facility;
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
