package com.medistock.backend.entity.pharmacy;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "dispensing_records")
@Data
public class DispensingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private MedicationOrder order;

    @Column(name = "dispensing_number", nullable = false)
    private String dispensingNumber;

    @Column(name = "dispensed_by", nullable = false)
    private UUID dispensedBy;

    @Column(nullable = false)
    private String status = "COMPLETED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "reversed_at")
    private OffsetDateTime reversedAt;

    @Column(name = "reversed_by")
    private UUID reversedBy;

    @Column(name = "reversal_reason")
    private String reversalReason;

    @OneToMany(mappedBy = "dispensingRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<DispensingItem> items = new ArrayList<>();
}
