package com.medistock.backend.service;

import com.medistock.backend.entity.Batch;
import com.medistock.backend.entity.Medicine;
import com.medistock.backend.repository.BatchRepository;
import com.medistock.backend.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReorderRecommendationService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final ForecastService forecastService;

    public ReorderRecommendationService(MedicineRepository medicineRepository, 
                                        BatchRepository batchRepository,
                                        ForecastService forecastService) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.forecastService = forecastService;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> generateRecommendations(UUID organizationId) {
        List<Map<String, Object>> recommendations = new ArrayList<>();

        List<Medicine> medicines = medicineRepository.findAll().stream()
                .filter(m -> organizationId == null || (m.getOrganization() != null && organizationId.equals(m.getOrganization().getId())))
                .collect(Collectors.toList());

        List<Batch> allBatches = batchRepository.findAll();

        for (Medicine medicine : medicines) {
            int currentStock = allBatches.stream()
                    .filter(b -> b.getMedicine() != null && b.getMedicine().getId().equals(medicine.getId()))
                    .filter(b -> b.getCurrentQuantity() > 0)
                    .mapToInt(Batch::getCurrentQuantity)
                    .sum();

            // 14-day lead time demand forecast
            double predictedDemand = 20.0;
            try {
                Map<String, Object> forecast = forecastService.getForecast(medicine.getId(), 14);
                if (forecast != null && forecast.containsKey("predictedDemand")) {
                    Object pd = forecast.get("predictedDemand");
                    predictedDemand = pd instanceof Number ? ((Number) pd).doubleValue() : 20.0;
                }
            } catch (Exception e) {
                predictedDemand = Math.max(10.0, medicine.getSafetyStock() * 0.5);
            }

            int safetyStock = medicine.getSafetyStock();
            int incomingStock = 0;

            // Smart Reorder Engine Formula:
            // recommended quantity = forecast demand during lead time + safety stock - available stock - confirmed incoming
            int recommendedQuantity = (int) Math.ceil(predictedDemand) + safetyStock - currentStock - incomingStock;

            if (recommendedQuantity > 0 || currentStock <= safetyStock) {
                int finalQty = Math.max(recommendedQuantity, safetyStock - currentStock);

                // Cap at maximumStock if configured
                if (medicine.getMaximumStock() > 0 && (currentStock + incomingStock + finalQty) > medicine.getMaximumStock()) {
                    finalQty = Math.max(1, medicine.getMaximumStock() - (currentStock + incomingStock));
                }

                // Average purchase price estimate
                double avgPrice = allBatches.stream()
                        .filter(b -> b.getMedicine() != null && b.getMedicine().getId().equals(medicine.getId()))
                        .filter(b -> b.getPurchasePrice() != null && b.getPurchasePrice() > 0)
                        .mapToDouble(Batch::getPurchasePrice)
                        .average()
                        .orElse(5.0);

                double estimatedCost = Math.round(finalQty * avgPrice * 100.0) / 100.0;
                String urgency = currentStock == 0 ? "CRITICAL" : (currentStock <= safetyStock ? "HIGH" : "MEDIUM");
                String reason = currentStock == 0 
                        ? "Stock completely depleted. Immediate PO requisition required." 
                        : (currentStock <= safetyStock 
                            ? "Current stock (" + currentStock + ") breached safety stock threshold (" + safetyStock + ")." 
                            : "Projected 14-day demand exceeds buffer during supplier replenishment lead time.");

                Map<String, Object> rec = new HashMap<>();
                rec.put("id", UUID.randomUUID());
                rec.put("medicineId", medicine.getId());
                rec.put("medicineCode", medicine.getMedicineCode());
                rec.put("genericName", medicine.getGenericName());
                rec.put("brandName", medicine.getBrandName());
                rec.put("category", medicine.getCategory());
                rec.put("currentStock", currentStock);
                rec.put("safetyStock", safetyStock);
                rec.put("reorderLevel", medicine.getReorderLevel());
                rec.put("forecastDemand14d", Math.round(predictedDemand * 10.0) / 10.0);
                rec.put("suggestedQuantity", finalQty);
                rec.put("estimatedCost", estimatedCost);
                rec.put("unitPrice", Math.round(avgPrice * 100.0) / 100.0);
                rec.put("urgency", urgency);
                rec.put("reason", reason);
                rec.put("status", "PENDING_APPROVAL");

                recommendations.add(rec);
            }
        }

        // Sort by urgency: CRITICAL first, then HIGH, then MEDIUM
        recommendations.sort((a, b) -> {
            int rankA = "CRITICAL".equals(a.get("urgency")) ? 0 : ("HIGH".equals(a.get("urgency")) ? 1 : 2);
            int rankB = "CRITICAL".equals(b.get("urgency")) ? 0 : ("HIGH".equals(b.get("urgency")) ? 1 : 2);
            return Integer.compare(rankA, rankB);
        });

        return recommendations;
    }
}
