package com.medistock.backend.entity.pharmacy;

import com.medistock.backend.entity.Batch;
import com.medistock.backend.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pharmacy_returns")
@Data
public class PharmacyReturn {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @ManyToOne
    @JoinColumn(name = "dispensing_record_id")
    private DispensingRecord dispensingRecord;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private MedicationOrder order;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

    private int quantity;
    private String reason;
    private String status = "PENDING_INSPECTION";

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "inspected_at")
    private OffsetDateTime inspectedAt;

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
