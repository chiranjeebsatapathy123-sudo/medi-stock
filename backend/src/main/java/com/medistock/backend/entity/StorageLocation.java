package com.medistock.backend.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "storage_locations")
public class StorageLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "organization_id")
    private UUID organizationId;
    
    private String name;
    private String code;
    private String type;
    @Column(name = "temperature_range")
    private String temperatureRange;
    private Integer capacity;
    private Boolean active;
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getTemperatureRange() { return temperatureRange; }
    public void setTemperatureRange(String temperatureRange) { this.temperatureRange = temperatureRange; }
    
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
