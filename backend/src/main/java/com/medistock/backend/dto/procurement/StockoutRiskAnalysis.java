package com.medistock.backend.dto.procurement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockoutRiskAnalysis {
    private UUID medicineId;
    private String medicineCode;
    private String genericName;
    private String brandName;
    private int currentStock;
    private int reorderLevel;
    private int safetyStock;
    private int maximumStock;
    private double dailyBurnRate;
    private Integer runoutDays;
    private String riskLevel; // CRITICAL_STOCKOUT, HIGH_RISK, MODERATE_RISK, OPTIMAL, OVERSTOCKED
    private int recommendedReorderQuantity;
    private String preferredSupplierName;
    private UUID preferredSupplierId;
    private int supplierLeadTimeDays;
}

