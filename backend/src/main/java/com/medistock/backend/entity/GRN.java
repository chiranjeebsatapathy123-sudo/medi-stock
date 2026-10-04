package com.medistock.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "grns")
@Data
public class GRN {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @Column(name = "grn_number", nullable = false)
    private String grnNumber;

    @Column(name = "received_by", nullable = false)
    private UUID receivedBy;

    @Column(name = "received_at")
    private OffsetDateTime receivedAt;

    @Column(nullable = false)
    private String status = "DRAFT";

    private String notes;

    @OneToMany(mappedBy = "grn", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<GRNItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if(receivedAt == null) receivedAt = OffsetDateTime.now();
    }
}
