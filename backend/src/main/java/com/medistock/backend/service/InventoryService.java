package com.medistock.backend.service;

import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final InventoryTransactionRepository transactionRepository;

    public InventoryService(MedicineRepository medicineRepository,
                            BatchRepository batchRepository,
                            InventoryTransactionRepository transactionRepository) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public void issueStock(UUID medicineId, int quantityToIssue, UUID userId, String reason, UUID destLocId) {
        if (quantityToIssue <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found"));

        List<Batch> eligibleBatches = batchRepository.findAll().stream()
                .filter(b -> b.getMedicine().getId().equals(medicineId))
                .filter(b -> b.getCurrentQuantity() > 0)
                .filter(b -> "ACTIVE".equals(b.getStatus()) && !b.isQuarantine() && !b.isRecall())
                .filter(b -> b.getExpiryDate().isAfter(java.time.LocalDate.now()))
                .sorted((b1, b2) -> b1.getExpiryDate().compareTo(b2.getExpiryDate()))
                .collect(Collectors.toList());

        int remaining = quantityToIssue;
        
        // Sum total available
        int totalAvailable = eligibleBatches.stream().mapToInt(Batch::getCurrentQuantity).sum();
        if(totalAvailable < remaining) {
            throw new IllegalStateException("Insufficient eligible stock. Requested: " + quantityToIssue + ", Available: " + totalAvailable);
        }

        for (Batch batch : eligibleBatches) {
            if (remaining <= 0) break;

            int availableInBatch = batch.getCurrentQuantity();
            int deduct = Math.min(availableInBatch, remaining);

            batch.setCurrentQuantity(availableInBatch - deduct);
            batchRepository.save(batch);

            // Record transaction
            InventoryTransaction tx = new InventoryTransaction();
            tx.setOrganization(medicine.getOrganization());
            tx.setTransactionId("TX-" + System.currentTimeMillis());
            tx.setMedicine(medicine);
            tx.setBatch(batch);
            tx.setQuantity(-deduct);
            tx.setPreviousQuantity(availableInBatch);
            tx.setNewQuantity(availableInBatch - deduct);
            tx.setMovementType("DISPENSED");
            tx.setDestinationLocationId(destLocId);
            tx.setReason(reason);
            // In a real app we'd attach the real User entity
            // tx.setUser(user);

            transactionRepository.save(tx);

            remaining -= deduct;
        }
    }
}
