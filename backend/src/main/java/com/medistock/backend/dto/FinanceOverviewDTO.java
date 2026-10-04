package com.medistock.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class FinanceOverviewDTO {
    private BigDecimal totalInventoryValue;
    private BigDecimal expiringValue;
    private BigDecimal deadStockValue;
    private BigDecimal committedSpend;
    private BigDecimal receivedSpend;
    private String currency;
    private OffsetDateTime calculatedAt;
}
