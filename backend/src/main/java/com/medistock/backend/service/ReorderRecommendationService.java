package com.medistock.backend.service;

import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReorderRecommendationService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final ForecastService forecastService;
    // Assume a PurchaseOrderItemRepository exists to check incoming stock

    public ReorderRecommendationService(MedicineRepository medicineRepository, 
                                        BatchRepository batchRepository,
                                        ForecastService forecastService) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.forecastService = forecastService;
    }

    @Transactional
    public void generateRecommendations(UUID organizationId) {
        List<Medicine> medicines = medicineRepository.findAll().stream()
                .filter(m -> m.getOrganization().getId().equals(organizationId))
                .filter(Medicine::isActive)
                .collect(Collectors.toList());

        for (Medicine medicine : medicines) {
            int currentStock = batchRepository.findAll().stream()
                    .filter(b -> b.getMedicine().getId().equals(medicine.getId()))
                    .filter(b -> b.getCurrentQuantity() > 0)
                    .mapToInt(Batch::getCurrentQuantity)
                    .sum();

            // Default lead time forecast calculation (e.g. 14 days)
            Map<String, Object> forecast = forecastService.getForecast(medicine.getId(), 14);
            double predictedDemand = (double) forecast.get("predictedDemand");
            int safetyStock = medicine.getSafetyStock();
            int incomingStock = 0; // Mocked for phase 4: fetch from PurchaseOrders

            // Smart Reorder Engine Formula
            // recommended quantity = forecast demand during lead time + safety stock - available stock - confirmed incoming
            int recommendedQuantity = (int) Math.ceil(predictedDemand) + safetyStock - currentStock - incomingStock;

            if (recommendedQuantity > 0) {
                // If it exceeds max stock, cap it
                if (medicine.getMaximumStock() > 0 && (currentStock + incomingStock + recommendedQuantity) > medicine.getMaximumStock()) {
                    recommendedQuantity = medicine.getMaximumStock() - (currentStock + incomingStock);
                }
                
                // In a full implementation, we'd save this to the ReorderRecommendation table
                // reorderRepository.save(new ReorderRecommendation(...));
                System.out.println("Generated Recommendation for " + medicine.getGenericName() + ": " + recommendedQuantity + " units.");
            }
        }
    }
}
