package com.medistock.backend.entity.logistics;
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
