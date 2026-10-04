package com.medistock.backend.entity.facility;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import java.time.OffsetDateTime;

@Entity
@Table(name = "facility_incidents")
@Data
public class FacilityIncident {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "incident_type", nullable = false)
    private String incidentType;
    
    @Column(nullable = false)
    private String severity;
    
    @Column(name = "location_id")
    private String locationId;
    
    private String description;
    
    @Column(name = "reported_at")
    private OffsetDateTime reportedAt;
    
    private String status = "OPEN";
    
    @Column(name = "assigned_to")
    private UUID assignedTo;
}
