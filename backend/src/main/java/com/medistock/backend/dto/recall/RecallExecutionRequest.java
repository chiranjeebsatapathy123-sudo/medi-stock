package com.medistock.backend.dto.recall;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecallExecutionRequest {
    private String lotNumber;
    private String gtin;
    private String recallClass; // CLASS_I, CLASS_II, CLASS_III
    private String reason;
    private String mandateAuthority; // FDA, WHO, MANUFACTURER, STATE_HEALTH_DEPT
}

