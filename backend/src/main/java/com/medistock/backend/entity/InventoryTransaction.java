package com.medistock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_transactions")
@Data
public class InventoryTransaction {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;
    
    private String transactionId;
    
    @ManyToOne
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;
    
    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;
    
    private int quantity;
    private int previousQuantity;
    private int newQuantity;
    private String movementType;
    
    @Column(name = "source_location_id")
    private UUID sourceLocationId;
    
    @Column(name = "destination_location_id")
    private UUID destinationLocationId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String reason;
    private String referenceNumber;
    private ZonedDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        if(timestamp == null) timestamp = ZonedDateTime.now();
    }
}
