package com.medistock.backend.service;

import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StockoutPredictionService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final ForecastService forecastService;

    public StockoutPredictionService(MedicineRepository medicineRepository, 
                                     BatchRepository batchRepository,
                                     ForecastService forecastService) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.forecastService = forecastService;
    }

    public List<Map<String, Object>> calculateStockoutRisks(UUID organizationId) {
        List<Medicine> medicines = medicineRepository.findAll().stream()
                .filter(m -> m.getOrganization().getId().equals(organizationId))
                .filter(Medicine::isActive)
                .collect(Collectors.toList());

        return medicines.stream().map(medicine -> {
            int currentStock = batchRepository.findAll().stream()
                    .filter(b -> b.getMedicine().getId().equals(medicine.getId()))
                    .filter(b -> b.getCurrentQuantity() > 0)
                    .mapToInt(Batch::getCurrentQuantity)
                    .sum();

            // Fetch forecast for 30 days
            Map<String, Object> forecast = forecastService.getForecast(medicine.getId(), 30);
            double dailyDemand = (double) forecast.get("predictedDemand") / 30.0;
            
            String riskLevel = "LOW";
            Integer estimatedDaysRemaining = null;

            if (currentStock <= 0) {
                riskLevel = "CRITICAL";
                estimatedDaysRemaining = 0;
            } else if (dailyDemand > 0) {
                double daysRemaining = currentStock / dailyDemand;
                estimatedDaysRemaining = (int) Math.floor(daysRemaining);
                
                if (daysRemaining <= 7) riskLevel = "CRITICAL";
                else if (daysRemaining <= 14) riskLevel = "HIGH";
                else if (daysRemaining <= 30) riskLevel = "MODERATE";
            }

            Map<String, Object> result = new java.util.HashMap<>();
            result.put("medicineId", medicine.getId());
            result.put("medicineName", medicine.getGenericName());
            result.put("currentStock", currentStock);
            result.put("averageDailyConsumption", dailyDemand);
            result.put("estimatedStockoutDate", estimatedDaysRemaining != null ? java.time.LocalDate.now().plusDays(estimatedDaysRemaining).toString() : "N/A");
            result.put("daysRemaining", estimatedDaysRemaining != null ? estimatedDaysRemaining : -1);
            result.put("riskLevel", riskLevel);
            return result;
        }).collect(Collectors.toList());
    }
}
