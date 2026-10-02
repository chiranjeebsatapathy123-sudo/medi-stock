package com.medistock.backend.entity.ai;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "dataset_versions")
@Data
public class DatasetVersion {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    private String datasetName;
    private String version;
    private Long rowCount;
    private Integer featureCount;
    private String schemaHash;
    private String dataHash;
    
    private ZonedDateTime createdAt;
    private UUID createdBy;
    private String source;
    private String qualityStatus;
    
    @PrePersist
    protected void onCreate() {
        if(createdAt == null) createdAt = ZonedDateTime.now();
    }
}
