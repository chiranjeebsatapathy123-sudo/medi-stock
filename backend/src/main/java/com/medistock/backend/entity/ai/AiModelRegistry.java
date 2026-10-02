package com.medistock.backend.entity.ai;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_model_registry")
@Data
public class AiModelRegistry {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    private String modelName;
    private String modelType;
    private String version;
    private String artifactUri;
    
    private String datasetVersion;
    private String featureVersion;
    private String algorithm;
    
    @Column(columnDefinition = "TEXT")
    private String metricsJson;
    
    private String validationStatus;
    private String deploymentStatus;
    private String checksum;
    
    private UUID createdBy;
    private UUID approvedBy;
    
    private ZonedDateTime createdAt;
    private ZonedDateTime approvedAt;
    private ZonedDateTime retiredAt;
    
    @PrePersist
    protected void onCreate() {
        if(createdAt == null) createdAt = ZonedDateTime.now();
    }
}
