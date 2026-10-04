package com.medistock.backend.service;

import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IntelligenceService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final InventoryTransactionRepository transactionRepository;

    public IntelligenceService(MedicineRepository medicineRepository, 
                               BatchRepository batchRepository,
                               InventoryTransactionRepository transactionRepository) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.transactionRepository = transactionRepository;
    }

    public Map<String, Object> getDashboardIntelligence(UUID tenantId) {
        Map<String, Object> dataQuality = calculateDataQuality(tenantId);
        Map<String, Object> stockoutRisk = calculateStockoutRisk(tenantId);
        Map<String, Object> expiryRisk = calculateExpiryRisk(tenantId);
        Map<String, Object> inventoryHealth = calculateInventoryHealth(tenantId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("dataQuality", dataQuality);
        response.put("stockoutRiskSummary", stockoutRisk.get("summary"));
        response.put("expiryRiskSummary", expiryRisk.get("summary"));
        response.put("inventoryHealth", inventoryHealth);
        response.put("timestamp", ZonedDateTime.now());
        
        return response;
    }

    public Map<String, Object> calculateDataQuality(UUID tenantId) {
        List<Medicine> medicines = medicineRepository.findByOrganizationId(tenantId);
        List<Batch> batches = batchRepository.findByMedicineOrganizationId(tenantId);
        
        int missingLeadTimes = 0;
        int missingCategories = 0;
        
        for (Medicine m : medicines) {
            if (m.getCategory() == null || m.getCategory().isEmpty()) missingCategories++;
        }
        
        for (Batch b : batches) {
            if (b.getSupplierId() == null) missingLeadTimes++; // Proxy for supplier info missing
        }
        
        double categoryCoverage = medicines.isEmpty() ? 100.0 : ((medicines.size() - missingCategories) / (double) medicines.size()) * 100;
        double supplierCoverage = batches.isEmpty() ? 100.0 : ((batches.size() - missingLeadTimes) / (double) batches.size()) * 100;
        
        double overallScore = (categoryCoverage + supplierCoverage + 100.0) / 3.0; // Simplistic score
        
        Map<String, Object> result = new HashMap<>();
        result.put("score", Math.round(overallScore));
        
        Map<String, Object> coverage = new HashMap<>();
        coverage.put("categoryCoverage", Math.round(categoryCoverage) + "%");
        coverage.put("supplierCoverage", Math.round(supplierCoverage) + "%");
        coverage.put("batchExpiry", "100%"); // Required field in schema
        
        result.put("coverage", coverage);
        return result;
    }

    public Map<String, Object> calculateStockoutRisk(UUID tenantId) {
        List<Medicine> medicines = medicineRepository.findByOrganizationId(tenantId);
        List<Batch> batches = batchRepository.findByMedicineOrganizationId(tenantId);
        
        Map<UUID, Integer> currentStock = new HashMap<>();
        for (Batch b : batches) {
            if ("ACTIVE".equals(b.getStatus())) {
                currentStock.put(b.getMedicine().getId(), currentStock.getOrDefault(b.getMedicine().getId(), 0) + b.getCurrentQuantity());
            }
        }
        
        int highRiskCount = 0;
        int mediumRiskCount = 0;
        int lowRiskCount = 0;
        
        List<Map<String, Object>> riskList = new ArrayList<>();
        
        for (Medicine m : medicines) {
            int stock = currentStock.getOrDefault(m.getId(), 0);
            int safetyStock = m.getSafetyStock();
            int reorderLevel = m.getReorderLevel();
            
            String risk = "UNKNOWN";
            if (safetyStock == 0 && reorderLevel == 0) {
                risk = "UNKNOWN";
            } else if (stock <= safetyStock) {
                risk = "HIGH";
                highRiskCount++;
            } else if (stock <= reorderLevel) {
                risk = "MEDIUM";
                mediumRiskCount++;
            } else {
                risk = "LOW";
                lowRiskCount++;
            }
            
            if ("HIGH".equals(risk) || "MEDIUM".equals(risk)) {
                Map<String, Object> item = new HashMap<>();
                item.put("medicineId", m.getId());
                item.put("medicineName", m.getGenericName());
                item.put("currentStock", stock);
                item.put("safetyStock", safetyStock);
                item.put("riskLevel", risk);
                riskList.add(item);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("riskyItems", riskList);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("HIGH", highRiskCount);
        summary.put("MEDIUM", mediumRiskCount);
        summary.put("LOW", lowRiskCount);
        result.put("summary", summary);
        
        return result;
    }

    public Map<String, Object> calculateExpiryRisk(UUID tenantId) {
        List<Batch> batches = batchRepository.findByMedicineOrganizationId(tenantId);
        LocalDate today = LocalDate.now();
        
        int criticalCount = 0;
        int highCount = 0;
        int watchCount = 0;
        
        List<Map<String, Object>> riskList = new ArrayList<>();
        
        for (Batch b : batches) {
            if (!"ACTIVE".equals(b.getStatus()) || b.getCurrentQuantity() <= 0) continue;
            
            LocalDate expiry = b.getExpiryDate();
            long daysToExpiry = ChronoUnit.DAYS.between(today, expiry);
            
            String risk = null;
            if (daysToExpiry < 0) {
                risk = "EXPIRED";
            } else if (daysToExpiry <= 30) {
                risk = "CRITICAL";
                criticalCount++;
            } else if (daysToExpiry <= 90) {
                risk = "HIGH";
                highCount++;
            } else if (daysToExpiry <= 180) {
                risk = "WATCH";
                watchCount++;
            }
            
            if (risk != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("batchId", b.getId());
                item.put("medicineName", b.getMedicine().getGenericName());
                item.put("batchNumber", b.getBatchNumber());
                item.put("daysToExpiry", daysToExpiry);
                item.put("quantity", b.getCurrentQuantity());
                item.put("riskLevel", risk);
                riskList.add(item);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("riskyBatches", riskList);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("CRITICAL", criticalCount);
        summary.put("HIGH", highCount);
        summary.put("WATCH", watchCount);
        result.put("summary", summary);
        
        return result;
    }

    public Map<String, Object> calculateInventoryHealth(UUID tenantId) {
        Map<String, Object> stockoutRisk = calculateStockoutRisk(tenantId);
        Map<String, Object> dataQuality = calculateDataQuality(tenantId);
        
        int dqScore = (int) dataQuality.get("score");
        
        Map<String, Integer> soSummary = (Map<String, Integer>) stockoutRisk.get("summary");
        int totalItems = soSummary.values().stream().mapToInt(Integer::intValue).sum();
        int safeItems = soSummary.getOrDefault("LOW", 0);
        
        double availabilityScore = totalItems > 0 ? (safeItems / (double) totalItems) * 100 : 100.0;
        
        int overallScore = (int) Math.round((dqScore + availabilityScore) / 2.0);
        
        Map<String, Object> result = new HashMap<>();
        result.put("score", overallScore);
        
        Map<String, Object> dimensions = new HashMap<>();
        dimensions.put("Availability", (int)Math.round(availabilityScore));
        dimensions.put("DataQuality", dqScore);
        dimensions.put("Accuracy", 95); // Placeholder for count accuracy
        
        result.put("dimensions", dimensions);
        return result;
    }

    public Map<String, Object> processNaturalLanguageQuery(UUID tenantId, String query) {
        String lowerQuery = query.toLowerCase();
        Map<String, Object> response = new HashMap<>();
        
        if (lowerQuery.contains("stockout") || lowerQuery.contains("run out") || lowerQuery.contains("low stock")) {
            Map<String, Object> risk = calculateStockoutRisk(tenantId);
            Map<String, Integer> summary = (Map<String, Integer>) risk.get("summary");
            int high = summary.getOrDefault("HIGH", 0);
            
            response.put("answer", "Based on current real-time data, there are " + high + " medicines at HIGH risk of stockout. I recommend checking the Intelligence Center to review their required safety stock versus current on-hand quantities.");
            response.put("evidence", risk.get("riskyItems"));
            response.put("actionWidget", true);
            response.put("actionType", "STOCKOUT_DRILLDOWN");
        } else if (lowerQuery.contains("expire") || lowerQuery.contains("expiry")) {
            Map<String, Object> risk = calculateExpiryRisk(tenantId);
            Map<String, Integer> summary = (Map<String, Integer>) risk.get("summary");
            int critical = summary.getOrDefault("CRITICAL", 0);
            
            response.put("answer", "I checked the batch records. There are " + critical + " batches marked as CRITICAL (expiring within 30 days). Ensure FEFO is strictly applied in dispensing.");
            response.put("evidence", risk.get("riskyBatches"));
            response.put("actionWidget", true);
            response.put("actionType", "EXPIRY_DRILLDOWN");
        } else if (lowerQuery.contains("health") || lowerQuery.contains("overview")) {
            Map<String, Object> health = calculateInventoryHealth(tenantId);
            response.put("answer", "The current Inventory Health score is " + health.get("score") + "/100. This is derived from availability metrics and data quality scores.");
            response.put("evidence", health.get("dimensions"));
            response.put("actionWidget", false);
        } else {
            response.put("answer", "I can help you analyze stockout risks, expiry exposures, and overall inventory health based on actual system data. Try asking 'Which medicines might stockout?' or 'Are any batches expiring soon?'");
            response.put("evidence", null);
            response.put("actionWidget", false);
        }
        
        return response;
    }
}
