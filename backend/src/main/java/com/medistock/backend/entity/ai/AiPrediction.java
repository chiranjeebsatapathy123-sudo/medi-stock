package com.medistock.backend.entity.ai;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_predictions")
@Data
public class AiPrediction {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    private UUID organizationId;
    private UUID branchId;
    
    @ManyToOne
    @JoinColumn(name = "model_id")
    private AiModelRegistry model;
    
    private String modelVersion;
    private String entityType;
    private UUID entityId;
    private String predictionType;
    private String inputSnapshotHash;
    
    @Column(columnDefinition = "TEXT")
    private String predictionJson;
    
    private String confidence;
    
    @Column(columnDefinition = "TEXT")
    private String uncertaintyJson;
    
    private String featureVersion;
    private String dataFreshness;
    
    private ZonedDateTime createdAt;
    private ZonedDateTime expiresAt;
    
    @PrePersist
    protected void onCreate() {
        if(createdAt == null) createdAt = ZonedDateTime.now();
    }
}
