package com.medistock.backend.entity.facility;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import java.time.OffsetDateTime;

@Entity
@Table(name = "facility_vision_events")
@Data
public class VisionEvent {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "device_id")
    private UUID deviceId;
    
    @Column(name = "event_type", nullable = false)
    private String eventType;
    
    @Column(name = "confidence_score")
    private Double confidenceScore;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "detected_at")
    private OffsetDateTime detectedAt;
    
    @Column(name = "detection")
    private String detection;
    
    @Column(name = "expected")
    private String expected;
    
    
    private Boolean resolved = false;
    
    @Column(name = "resolution_notes")
    private String resolutionNotes;
}
