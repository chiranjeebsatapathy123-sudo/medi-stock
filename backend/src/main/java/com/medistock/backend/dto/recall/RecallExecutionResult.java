package com.medistock.backend.dto.recall;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecallExecutionResult {
    private String lotNumber;
    private String gtin;
    private String recallClass;
    private String medicineName;
    private int batchesRecalledCount;
    private int quarantinedStockUnits;
    private int haltedOrdersCount;
    private int exposedPatientsCount;
    @Builder.Default
    private List<PatientExposureSummary> exposedPatients = new ArrayList<>();
    private String auditTransactionHash;
    private OffsetDateTime executedAt;
}

