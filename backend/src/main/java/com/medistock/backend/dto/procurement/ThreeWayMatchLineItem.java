package com.medistock.backend.dto.procurement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreeWayMatchLineItem {
    private String medicineName;
    private Integer poQuantity;
    private Integer grnQuantity;
    private Integer invoicedQuantity;
    private BigDecimal poUnitPrice;
    private BigDecimal invoicedUnitPrice;
    private BigDecimal lineVarianceAmount;
    private Double variancePercent;
    private String status; // MATCHED, QTY_MISMATCH, PRICE_MISMATCH, NOT_RECEIVED
    private String discrepancyNote;
}

