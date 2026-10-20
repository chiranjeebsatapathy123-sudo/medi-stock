package com.medistock.backend.service;

import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public InventoryService(MedicineRepository medicineRepository,
                            BatchRepository batchRepository,
                            InventoryTransactionRepository transactionRepository,
                            UserRepository userRepository) {
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> issueStock(UUID medicineId, int quantityToIssue, UUID userId, String reason, UUID destLocId) {
        return issueStock(medicineId, quantityToIssue, userId, reason, destLocId, null);
    }

    @Transactional
    public Map<String, Object> issueStock(UUID medicineId, int quantityToIssue, UUID userId, String reason, UUID destLocId, UUID tenantId) {
        if (quantityToIssue <= 0) {
            throw new IllegalArgumentException("Quantity to issue must be greater than 0");
        }

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found with ID: " + medicineId));

        if (tenantId != null && medicine.getOrganization() != null && !tenantId.equals(medicine.getOrganization().getId())) {
            throw new SecurityException("Unauthorized access to organization medicine");
        }

        LocalDate today = LocalDate.now();
        List<Batch> eligibleBatches = batchRepository.findAll().stream()
                .filter(b -> b.getMedicine() != null && b.getMedicine().getId().equals(medicineId))
                .filter(b -> b.getCurrentQuantity() > 0)
                .filter(b -> !"EXPIRED".equalsIgnoreCase(b.getStatus()) && !"RECALLED".equalsIgnoreCase(b.getStatus()))
                .filter(b -> !b.isQuarantine() && !b.isRecall())
                .filter(b -> b.getExpiryDate() == null || !b.getExpiryDate().isBefore(today))
                .sorted((b1, b2) -> {
                    if (b1.getExpiryDate() == null) return 1;
                    if (b2.getExpiryDate() == null) return -1;
                    return b1.getExpiryDate().compareTo(b2.getExpiryDate());
                })
                .collect(Collectors.toList());

        int totalAvailable = eligibleBatches.stream().mapToInt(Batch::getCurrentQuantity).sum();
        if (totalAvailable < quantityToIssue) {
            throw new IllegalStateException("Insufficient stock. Requested: " + quantityToIssue + ", Available: " + totalAvailable);
        }

        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        int remaining = quantityToIssue;
        List<Map<String, Object>> deductions = new ArrayList<>();

        for (Batch batch : eligibleBatches) {
            if (remaining <= 0) break;

            int availableInBatch = batch.getCurrentQuantity();
            int deduct = Math.min(availableInBatch, remaining);
            int newQuantity = availableInBatch - deduct;

            batch.setCurrentQuantity(newQuantity);
            if (newQuantity == 0) {
                batch.setStatus("DEPLETED");
            }
            batchRepository.save(batch);

            // Record transaction audit trail
            InventoryTransaction tx = new InventoryTransaction();
            tx.setOrganization(medicine.getOrganization());
            tx.setTransactionId("TX-OUT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            tx.setMedicine(medicine);
            tx.setBatch(batch);
            tx.setQuantity(-deduct);
            tx.setPreviousQuantity(availableInBatch);
            tx.setNewQuantity(newQuantity);
            tx.setMovementType("DISPENSED");
            tx.setDestinationLocationId(destLocId);
            tx.setReason(reason != null ? reason : "Clinical Dispense / Outward Issue");
            tx.setUser(user);

            InventoryTransaction savedTx = transactionRepository.save(tx);

            Map<String, Object> deductionInfo = new HashMap<>();
            deductionInfo.put("batchId", batch.getId());
            deductionInfo.put("batchNumber", batch.getBatchNumber());
            deductionInfo.put("quantityDeducted", deduct);
            deductionInfo.put("remainingInBatch", newQuantity);
            deductionInfo.put("transactionId", savedTx.getTransactionId());
            deductions.add(deductionInfo);

            remaining -= deduct;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("medicineId", medicine.getId());
        result.put("medicineName", medicine.getGenericName());
        result.put("totalIssued", quantityToIssue);
        result.put("batchesDeducted", deductions);
        return result;
    }

    @Transactional
    public Map<String, Object> receiveStock(UUID medicineId,
                                           String batchNumber,
                                           int quantity,
                                           LocalDate expiryDate,
                                           LocalDate manufacturingDate,
                                           Double purchasePrice,
                                           UUID supplierId,
                                           UUID storageLocationId,
                                           UUID userId,
                                           String referenceNumber,
                                           UUID tenantId) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Received quantity must be greater than 0");
        }
        if (batchNumber == null || batchNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Batch number is required");
        }

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found with ID: " + medicineId));

        if (tenantId != null && medicine.getOrganization() != null && !tenantId.equals(medicine.getOrganization().getId())) {
            throw new SecurityException("Unauthorized access to organization medicine");
        }

        // Look for existing batch with same batch number for this medicine
        Optional<Batch> existingBatchOpt = batchRepository.findAll().stream()
                .filter(b -> b.getMedicine() != null && b.getMedicine().getId().equals(medicineId))
                .filter(b -> batchNumber.equalsIgnoreCase(b.getBatchNumber()))
                .findFirst();

        Batch batch;
        int previousQty = 0;
        int newQty;

        if (existingBatchOpt.isPresent()) {
            batch = existingBatchOpt.get();
            previousQty = batch.getCurrentQuantity();
            newQty = previousQty + quantity;
            batch.setCurrentQuantity(newQty);
            batch.setReceivedQuantity(batch.getReceivedQuantity() + quantity);
            if (storageLocationId != null) batch.setStorageLocationId(storageLocationId);
            if (expiryDate != null) batch.setExpiryDate(expiryDate);
            batch.setStatus("ACTIVE");
        } else {
            batch = new Batch();
            batch.setMedicine(medicine);
            batch.setBatchNumber(batchNumber.trim().toUpperCase());
            batch.setReceivedQuantity(quantity);
            batch.setCurrentQuantity(quantity);
            batch.setExpiryDate(expiryDate);
            batch.setManufacturingDate(manufacturingDate);
            batch.setPurchasePrice(purchasePrice != null ? purchasePrice : 0.0);
            batch.setSupplierId(supplierId);
            batch.setStorageLocationId(storageLocationId);
            batch.setStatus("ACTIVE");
            newQty = quantity;
        }

        Batch savedBatch = batchRepository.save(batch);

        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        // Record InventoryTransaction
        InventoryTransaction tx = new InventoryTransaction();
        tx.setOrganization(medicine.getOrganization());
        tx.setTransactionId("TX-IN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        tx.setMedicine(medicine);
        tx.setBatch(savedBatch);
        tx.setQuantity(quantity);
        tx.setPreviousQuantity(previousQty);
        tx.setNewQuantity(newQty);
        tx.setMovementType("RECEIVED");
        tx.setDestinationLocationId(storageLocationId);
        tx.setReferenceNumber(referenceNumber != null ? referenceNumber : "PO-GRN-" + System.currentTimeMillis() % 100000);
        tx.setReason("Inward Goods Receipt");
        tx.setUser(user);

        InventoryTransaction savedTx = transactionRepository.save(tx);

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("transactionId", savedTx.getTransactionId());
        result.put("batchId", savedBatch.getId());
        result.put("batchNumber", savedBatch.getBatchNumber());
        result.put("quantityReceived", quantity);
        result.put("newTotalBatchStock", newQty);
        return result;
    }

    @Transactional
    public Map<String, Object> transferStock(UUID batchId,
                                             UUID sourceLocationId,
                                             UUID destinationLocationId,
                                             int quantity,
                                             String reason,
                                             UUID userId,
                                             UUID tenantId) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Transfer quantity must be greater than 0");
        }

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found with ID: " + batchId));

        if (quantity > batch.getCurrentQuantity()) {
            throw new IllegalStateException("Cannot transfer more than available batch stock. Available: " + batch.getCurrentQuantity());
        }

        int previousQty = batch.getCurrentQuantity();
        batch.setStorageLocationId(destinationLocationId);
        batchRepository.save(batch);

        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        InventoryTransaction tx = new InventoryTransaction();
        if (batch.getMedicine() != null) {
            tx.setOrganization(batch.getMedicine().getOrganization());
            tx.setMedicine(batch.getMedicine());
        }
        tx.setTransactionId("TX-TRF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        tx.setBatch(batch);
        tx.setQuantity(quantity);
        tx.setPreviousQuantity(previousQty);
        tx.setNewQuantity(previousQty);
        tx.setMovementType("TRANSFERRED");
        tx.setSourceLocationId(sourceLocationId);
        tx.setDestinationLocationId(destinationLocationId);
        tx.setReason(reason != null ? reason : "Internal Zone/Rack Transfer");
        tx.setUser(user);

        InventoryTransaction savedTx = transactionRepository.save(tx);

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("transactionId", savedTx.getTransactionId());
        result.put("batchId", batch.getId());
        result.put("quantityTransferred", quantity);
        result.put("destinationLocationId", destinationLocationId);
        return result;
    }

    @Transactional
    public Map<String, Object> adjustStock(UUID batchId,
                                           int newQuantity,
                                           String adjustmentType,
                                           String reason,
                                           UUID userId,
                                           UUID tenantId) {
        if (newQuantity < 0) {
            throw new IllegalArgumentException("New quantity cannot be negative");
        }

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found with ID: " + batchId));

        int previousQty = batch.getCurrentQuantity();
        int delta = newQuantity - previousQty;

        batch.setCurrentQuantity(newQuantity);
        if (newQuantity == 0 && ("DISPOSAL".equalsIgnoreCase(adjustmentType) || "EXPIRED".equalsIgnoreCase(adjustmentType))) {
            batch.setStatus("DEPLETED");
        }
        batchRepository.save(batch);

        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        InventoryTransaction tx = new InventoryTransaction();
        if (batch.getMedicine() != null) {
            tx.setOrganization(batch.getMedicine().getOrganization());
            tx.setMedicine(batch.getMedicine());
        }
        tx.setTransactionId("TX-ADJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        tx.setBatch(batch);
        tx.setQuantity(delta);
        tx.setPreviousQuantity(previousQty);
        tx.setNewQuantity(newQuantity);
        tx.setMovementType(adjustmentType != null ? adjustmentType : "ADJUSTED");
        tx.setReason(reason != null ? reason : "Cycle Count / Inventory Reconciliation");
        tx.setUser(user);

        InventoryTransaction savedTx = transactionRepository.save(tx);

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("transactionId", savedTx.getTransactionId());
        result.put("batchId", batch.getId());
        result.put("previousQuantity", previousQty);
        result.put("newQuantity", newQuantity);
        result.put("delta", delta);
        return result;
    }
}
