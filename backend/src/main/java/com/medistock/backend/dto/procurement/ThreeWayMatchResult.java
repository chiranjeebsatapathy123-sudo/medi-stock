package com.medistock.backend.dto.procurement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreeWayMatchResult {
    private UUID invoiceId;
    private String invoiceNumber;
    private UUID poId;
    private String poNumber;
    private UUID grnId;
    private String grnNumber;
    private String supplierName;
    private BigDecimal invoiceTotal;
    private BigDecimal expectedTotal;
    private BigDecimal netVariance;
    private Double netVariancePercent;
    private String matchStatus; // PERFECT_MATCH, WITHIN_TOLERANCE, EXCEPTION_QUANTITY, EXCEPTION_PRICE, EXCEPTION_UNRECEIVED
    private boolean approvedForPayment;
    @Builder.Default
    private List<ThreeWayMatchLineItem> lineItems = new ArrayList<>();
    @Builder.Default
    private List<String> exceptionSummaries = new ArrayList<>();
}

