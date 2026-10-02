package com.medistock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "batches")
@Data
public class Batch {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;
    
    private String batchNumber;
    private String manufacturer;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    
    private int receivedQuantity;
    private int currentQuantity;
    private Double purchasePrice;
    private Double sellingPrice;
    
    @Column(name = "supplier_id")
    private UUID supplierId;
    
    @Column(name = "storage_location_id")
    private UUID storageLocationId;
    
    private String status;
    private boolean quarantine;
    private boolean recall;
    
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        updatedAt = createdAt;
        if(status == null) status = "ACTIVE";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
