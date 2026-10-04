package com.medistock.backend.entity.logistics;
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
