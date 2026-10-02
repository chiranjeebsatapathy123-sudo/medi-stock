package com.medistock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "medicines")
@Data
public class Medicine {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;
    
    private String medicineCode;
    private String genericName;
    private String brandName;
    private String category;
    private String dosageForm;
    private String strength;
    private String manufacturer;
    private String description;
    private String unit;
    
    private boolean prescriptionRequired;
    private boolean controlledMedicine;
    private boolean temperatureSensitive;
    
    private String storageRequirement;
    private int reorderLevel;
    private int safetyStock;
    private int maximumStock;
    private boolean active;
    
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
