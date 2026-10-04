package com.medistock.backend.entity.facility;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "facility_maintenance_tasks")
@Data
public class MaintenanceTask {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "asset_id", nullable = false)
    private String assetId;
    
    @Column(name = "task_type", nullable = false)
    private String taskType;
    
    private String description;
    
    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;
    
    private String status = "SCHEDULED";
    
    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
    
    @Column(name = "technician_id")
    private UUID technicianId;
}
