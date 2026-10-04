package com.medistock.backend.service;

import com.medistock.backend.dto.FinanceOverviewDTO;
import com.medistock.backend.entity.Batch;
import com.medistock.backend.entity.PurchaseOrder;
import com.medistock.backend.repository.BatchRepository;
import com.medistock.backend.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FinanceService {

    private final BatchRepository batchRepository;
    private final PurchaseOrderRepository poRepository;

    public FinanceService(BatchRepository batchRepository, PurchaseOrderRepository poRepository) {
        this.batchRepository = batchRepository;
        this.poRepository = poRepository;
    }

    public FinanceOverviewDTO getFinancialOverview(UUID orgId) {
        List<Batch> batches = batchRepository.findAll(); // Should be filtered by org, simplified for demo
        List<PurchaseOrder> pos = poRepository.findByOrganizationId(orgId);

        BigDecimal inventoryValue = BigDecimal.ZERO;
        BigDecimal expiringValue = BigDecimal.ZERO;
        BigDecimal deadStockValue = BigDecimal.ZERO; // Simplified: would normally check transaction history

        LocalDate expiryThreshold = LocalDate.now().plusDays(90);

        for (Batch batch : batches) {
            if (batch.getMedicine().getOrganization().getId().equals(orgId) && batch.getCurrentQuantity() > 0) {
                BigDecimal qty = new BigDecimal(batch.getCurrentQuantity());
                // Defaulting to purchasePrice, if null use sellingPrice or zero
                BigDecimal cost = batch.getPurchasePrice() != null ? new BigDecimal(batch.getPurchasePrice()) : BigDecimal.ZERO;
                BigDecimal val = qty.multiply(cost);

                inventoryValue = inventoryValue.add(val);

                if (batch.getExpiryDate() != null && batch.getExpiryDate().isBefore(expiryThreshold)) {
                    expiringValue = expiringValue.add(val);
                }
                
                // Stub for dead stock (in reality, query InventoryTransactions > 90 days ago)
                if (batch.getCreatedAt() != null && batch.getCreatedAt().isBefore(ZonedDateTime.now().minusDays(180))) {
                    deadStockValue = deadStockValue.add(val);
                }
            }
        }

        BigDecimal committedSpend = BigDecimal.ZERO;
        BigDecimal receivedSpend = BigDecimal.ZERO;

        for (PurchaseOrder po : pos) {
            BigDecimal total = po.getTotal() != null ? new BigDecimal(po.getTotal()) : BigDecimal.ZERO;
            if ("APPROVED".equals(po.getStatus()) || "SENT".equals(po.getStatus())) {
                committedSpend = committedSpend.add(total);
            } else if ("RECEIVED".equals(po.getStatus()) || "PARTIALLY_RECEIVED".equals(po.getStatus())) {
                receivedSpend = receivedSpend.add(total);
            }
        }

        FinanceOverviewDTO dto = new FinanceOverviewDTO();
        dto.setTotalInventoryValue(inventoryValue);
        dto.setExpiringValue(expiringValue);
        dto.setDeadStockValue(deadStockValue);
        dto.setCommittedSpend(committedSpend);
        dto.setReceivedSpend(receivedSpend);
        dto.setCurrency("INR");
        dto.setCalculatedAt(OffsetDateTime.now());

        return dto;
    }
}
