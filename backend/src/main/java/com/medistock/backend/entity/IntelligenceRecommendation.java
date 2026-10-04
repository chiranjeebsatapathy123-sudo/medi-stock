package com.medistock.backend.entity;

import jakarta.persistence.*;
import java.util.UUID;
import java.time.ZonedDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;

@Entity
@Table(name = "intelligence_recommendations")
public class IntelligenceRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "organization_id")
    private UUID organizationId;
    
    private String type;
    
    @Column(name = "entity_type")
    private String entityType;
    
    @Column(name = "entity_id")
    private UUID entityId;
    
    private String priority;
    private String reason;
    
    @JdbcTypeCode(SqlTypes.JSON)
    private String evidence;
    
    @Column(name = "data_freshness")
    private ZonedDateTime dataFreshness;
    
    private BigDecimal confidence;
    
    @JdbcTypeCode(SqlTypes.JSON)
    private String uncertainty;
    
    @Column(name = "suggested_action")
    private String suggestedAction;
    
    @Column(name = "required_approval")
    private String requiredApproval;
    
    private String status;
    
    @Column(name = "model_id")
    private UUID modelId;
    
    @Column(name = "created_at")
    private ZonedDateTime createdAt;
    
    @Column(name = "expires_at")
    private ZonedDateTime expiresAt;
    
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if(createdAt == null) createdAt = ZonedDateTime.now();
        if(updatedAt == null) updatedAt = ZonedDateTime.now();
        if(status == null) status = "NEW";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getEvidence() { return evidence; }
    public void setEvidence(String evidence) { this.evidence = evidence; }
    public ZonedDateTime getDataFreshness() { return dataFreshness; }
    public void setDataFreshness(ZonedDateTime dataFreshness) { this.dataFreshness = dataFreshness; }
    public BigDecimal getConfidence() { return confidence; }
    public void setConfidence(BigDecimal confidence) { this.confidence = confidence; }
    public String getUncertainty() { return uncertainty; }
    public void setUncertainty(String uncertainty) { this.uncertainty = uncertainty; }
    public String getSuggestedAction() { return suggestedAction; }
    public void setSuggestedAction(String suggestedAction) { this.suggestedAction = suggestedAction; }
    public String getRequiredApproval() { return requiredApproval; }
    public void setRequiredApproval(String requiredApproval) { this.requiredApproval = requiredApproval; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UUID getModelId() { return modelId; }
    public void setModelId(UUID modelId) { this.modelId = modelId; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    public ZonedDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(ZonedDateTime expiresAt) { this.expiresAt = expiresAt; }
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
}
