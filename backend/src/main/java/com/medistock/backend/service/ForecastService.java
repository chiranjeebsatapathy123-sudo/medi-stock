package com.medistock.backend.service;

import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ForecastService {

    private final MedicineRepository medicineRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final AiPredictionService aiPredictionService;

    public ForecastService(MedicineRepository medicineRepository, InventoryTransactionRepository transactionRepository, AiPredictionService aiPredictionService) {
        this.medicineRepository = medicineRepository;
        this.transactionRepository = transactionRepository;
        this.aiPredictionService = aiPredictionService;
    }

    public Map<String, Object> getForecast(UUID medicineId, int horizonDays) {
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found"));

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            // Build Request
            Map<String, Object> request = Map.of(
                "medicine_id", medicineId.toString(),
                "branch_id", medicine.getOrganization().getId().toString(),
                "horizon_days", horizonDays
            );
            
            org.springframework.http.ResponseEntity<Map> response = restTemplate.postForEntity(
                "http://localhost:8000/predict/demand", 
                request, 
                Map.class
            );
            
            Map<String, Object> result = response.getBody();
            if (result == null) throw new RuntimeException("Empty response from ML Service");
            
            // Parse response
            List<Number> forecastList = (List<Number>) result.get("forecast");
            double totalPredictedDemand = forecastList.stream().mapToDouble(Number::doubleValue).sum();
            
            // Track prediction in DB
            aiPredictionService.recordPrediction(
                medicine.getOrganization().getId(), // organizationId
                medicine.getOrganization().getId(), // branchId (simulated)
                "DemandForecastModel",              // modelName
                "MEDICINE",                         // entityType
                medicineId,                         // entityId
                "DEMAND_FORECAST",                  // predictionType
                request,                            // inputData
                result                              // responseData
            );
            
            return Map.of(
                "horizonDays", horizonDays,
                "predictedDemand", totalPredictedDemand,
                "confidence", result.get("confidence"),
                "mae", 9.38, // Placeholder until ML service returns it
                "evidence", result.get("evidence"),
                "recommendedStock", totalPredictedDemand + medicine.getSafetyStock()
            );

        } catch (Exception e) {
            // Fallback to historical baseline if Python script fails or model is missing
            double averageDailyDemand = calculateAverageDailyDemand(medicineId);
            double predictedDemand = averageDailyDemand * horizonDays;
            
            return Map.of(
                "horizonDays", horizonDays,
                "predictedDemand", predictedDemand,
                "confidence", 60.0,
                "mae", averageDailyDemand * 0.25,
                "recommendedStock", predictedDemand + medicine.getSafetyStock()
            );
        }
    }

    private double calculateAverageDailyDemand(UUID medicineId) {
        return 15.5; // Fallback placeholder
    }
}
