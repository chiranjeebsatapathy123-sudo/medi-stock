package com.medistock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;

@Entity
@Table(name = "warehouse_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "warehouse_id", nullable = false)
    private UUID warehouseId;

    @Column(name = "parent_location_id")
    private UUID parentLocationId;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "location_type", nullable = false)
    private String locationType;

    private String barcode;

    @Column(nullable = false)
    private String status;

    @Column(name = "temperature_profile")
    private String temperatureProfile;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "storage_requirements", columnDefinition = "jsonb")
    private Map<String, Object> storageRequirements;

    @Column(name = "physical_capacity")
    private BigDecimal physicalCapacity;

    @Column(name = "used_capacity")
    private BigDecimal usedCapacity;

    @Column(name = "capacity_uom")
    private String capacityUom;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
