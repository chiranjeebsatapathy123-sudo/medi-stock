package com.medistock.backend.entity.logistics;
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
