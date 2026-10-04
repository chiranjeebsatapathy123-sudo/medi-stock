package com.medistock.backend.entity.pharmacy;

import com.medistock.backend.entity.Medicine;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pharmacy_backorders")
@Data
public class PharmacyBackorder {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private MedicationOrder order;

    @ManyToOne
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;

    private int quantity;
    private String status = "OPEN";
    private String priority = "ROUTINE";

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
