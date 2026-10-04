package com.medistock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Data
public class Invoice {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
    
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
    
    private String invoiceNumber;
    private BigDecimal amount;
    private String status;
    private ZonedDateTime issuedDate;
    private ZonedDateTime dueDate;
    private ZonedDateTime paidDate;
    private String notes;
    
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items;
    
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        updatedAt = createdAt;
        if(issuedDate == null) issuedDate = ZonedDateTime.now();
        if(status == null) status = "PENDING";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
