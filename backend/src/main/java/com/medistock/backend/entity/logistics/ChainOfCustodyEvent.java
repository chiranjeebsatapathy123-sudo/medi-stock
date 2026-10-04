package com.medistock.backend.entity.logistics;
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
