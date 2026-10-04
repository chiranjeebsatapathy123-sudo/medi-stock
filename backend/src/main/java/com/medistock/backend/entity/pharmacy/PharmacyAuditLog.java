package com.medistock.backend.entity.pharmacy;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pharmacy_audit_logs")
@Data
public class PharmacyAuditLog {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "actor_id")
    private UUID actorId;

    private String action;
    
    @Column(name = "entity_type")
    private String entityType;
    
    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "before_state", columnDefinition = "jsonb")
    private String beforeState;

    @Column(name = "after_state", columnDefinition = "jsonb")
    private String afterState;

    private String reason;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
