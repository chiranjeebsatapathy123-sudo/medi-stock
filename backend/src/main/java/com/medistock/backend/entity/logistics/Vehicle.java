package com.medistock.backend.entity.logistics;
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
