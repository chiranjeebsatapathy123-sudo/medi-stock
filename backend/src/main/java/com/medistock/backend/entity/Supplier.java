package com.medistock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "suppliers")
@Data
public class Supplier {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "supplier_code")
    private String supplierCode;
    
    @Column(name = "contact_person")
    private String contactPerson;
    
    private String phone;
    private String email;
    private String address;
    
    @Column(name = "lead_time_days")
    private int leadTimeDays = 0;
    
    @Column(name = "payment_terms")
    private String paymentTerms;
    
    private String status = "ACTIVE";
    private Double rating;

    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "tax_identifier")
    private String taxIdentifier;

    private String currency = "USD";

    @Column(name = "minimum_order_value")
    private Double minimumOrderValue = 0.0;

    @Column(name = "minimum_order_quantity")
    private Integer minimumOrderQuantity = 0;
    
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = createdAt;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
