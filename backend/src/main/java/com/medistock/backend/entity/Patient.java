package com.medistock.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "patients")
@Data
public class Patient {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
    
    private String name;
    private String mrn;
    private LocalDate dateOfBirth;
    private String gender;
    private String contactNumber;
    private String email;
    private String address;
    private String allergies;
    private String bloodGroup;
    
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
