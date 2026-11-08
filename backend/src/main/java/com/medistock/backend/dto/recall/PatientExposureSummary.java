package com.medistock.backend.dto.recall;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientExposureSummary {
    private String patientReference;
    private String patientName;
    private String contactNumber;
    private String email;
    private String dispensingNumber;
    private OffsetDateTime dispensedAt;
    private Integer quantityDispensed;
    private String prescriber;
    private String status; // DISPENSED, CONTACT_INITIATED, RESOLVED
}

