package com.medistock.backend.dto.cdss;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CdssEvaluationResult {
    private UUID orderId;
    private String orderNumber;
    private String patientReference;
    private String patientAllergies;
    private boolean safeToDispense;
    private int alertCount;
    private int contraindicatedCount;
    private int majorCount;
    private int moderateCount;
    @Builder.Default
    private List<CdssAlert> alerts = new ArrayList<>();
    private OffsetDateTime evaluatedAt;
}

