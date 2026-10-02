package com.medistock.backend.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AiAnomalyDetectionService {

    public List<Map<String, Object>> detectAnomalies(UUID organizationId) {
        List<Map<String, Object>> anomalies = new ArrayList<>();

        // In a real scenario, this would query historical inventory_transactions
        // and calculate std-deviations over moving averages.
        
        // Mocked Anomaly 1: Consumption spike
        anomalies.add(Map.of(
            "type", "CONSUMPTION_SPIKE",
            "medicineId", "mocked-uuid",
            "message", "Consumption of Azithromycin is 2.4x its recent baseline.",
            "baseline", 12.0,
            "currentValue", 28.8,
            "comparisonPeriod", "Last 7 days vs Previous 30 days"
        ));

        // Mocked Anomaly 2: Price increase
        anomalies.add(Map.of(
            "type", "PRICE_INCREASE",
            "supplierId", "mocked-supplier",
            "message", "Purchase price of Insulin Glargine increased by 18% compared with recent records.",
            "baseline", 25.0,
            "currentValue", 29.5,
            "comparisonPeriod", "Last Order vs 6-Month Average"
        ));

        return anomalies;
    }
}
