package com.medistock.backend.dto.cdss;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CdssAlert {
    private String type; // DRUG_ALLERGY, DRUG_INTERACTION, HIGH_DOSE_WARNING, DUPLICATE_THERAPY
    private String severity; // CONTRAINDICATED, MAJOR, MODERATE, INFO
    private String medicineName;
    private String conflictingFactor;
    private String description;
    private String clinicalRecommendation;
    private boolean requiresOverrideReason;
}

