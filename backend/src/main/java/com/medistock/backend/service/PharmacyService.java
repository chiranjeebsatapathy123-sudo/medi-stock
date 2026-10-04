package com.medistock.backend.service;

import com.medistock.backend.entity.Batch;
import com.medistock.backend.entity.InventoryTransaction;
import com.medistock.backend.entity.pharmacy.*;
import com.medistock.backend.repository.BatchRepository;
import com.medistock.backend.repository.InventoryTransactionRepository;
import com.medistock.backend.repository.pharmacy.DispensingRecordRepository;
import com.medistock.backend.repository.pharmacy.MedicationOrderRepository;
import com.medistock.backend.repository.pharmacy.PharmacyAlertRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PharmacyService {

    private final MedicationOrderRepository orderRepository;
    private final DispensingRecordRepository dispensingRepository;
    private final PharmacyAlertRepository alertRepository;
    private final BatchRepository batchRepository;
    private final InventoryTransactionRepository transactionRepository;

    public PharmacyService(MedicationOrderRepository orderRepository,
                           DispensingRecordRepository dispensingRepository,
                           PharmacyAlertRepository alertRepository,
                           BatchRepository batchRepository,
                           InventoryTransactionRepository transactionRepository) {
        this.orderRepository = orderRepository;
        this.dispensingRepository = dispensingRepository;
        this.alertRepository = alertRepository;
        this.batchRepository = batchRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<MedicationOrder> getOrders(UUID organizationId) {
        return orderRepository.findByOrganizationId(organizationId);
    }

    public MedicationOrder getOrder(UUID id, UUID organizationId) {
        return orderRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public MedicationOrder createOrder(MedicationOrder order, UUID organizationId, UUID userId) {
        order.setOrganizationId(organizationId);
        order.setCreatedBy(userId);
        order.setStatus("RECEIVED");
        
        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setOrder(order));
        }
        
        return orderRepository.save(order);
    }

    @Transactional
    public MedicationOrder reviewOrder(UUID id, UUID organizationId, UUID userId, String action) {
        MedicationOrder order = getOrder(id, organizationId);
        
        if ("APPROVE".equalsIgnoreCase(action)) {
            order.setStatus("APPROVED");
        } else if ("REJECT".equalsIgnoreCase(action)) {
            order.setStatus("REJECTED");
        } else {
            throw new IllegalArgumentException("Invalid review action");
        }
        
        order.setReviewedBy(userId);
        order.setReviewedAt(OffsetDateTime.now());
        
        return orderRepository.save(order);
    }

    @Transactional
    public DispensingRecord dispenseOrder(UUID orderId, UUID organizationId, UUID userId, DispensingRequest request) {
        MedicationOrder order = getOrder(orderId, organizationId);
        
        if (!"APPROVED".equals(order.getStatus()) && !"PARTIALLY_FULFILLED".equals(order.getStatus()) && !"READY_TO_DISPENSE".equals(order.getStatus())) {
            throw new IllegalStateException("Order must be approved or ready to dispense");
        }

        DispensingRecord record = new DispensingRecord();
        record.setOrganizationId(organizationId);
        record.setOrder(order);
        record.setDispensedBy(userId);
        record.setDispensingNumber("DISP-" + System.currentTimeMillis());

        for (DispensingRequestItem reqItem : request.getItems()) {
            MedicationOrderItem orderItem = order.getItems().stream()
                    .filter(i -> i.getId().equals(reqItem.getOrderItemId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Invalid order item ID"));

            Batch batch = batchRepository.findById(reqItem.getBatchId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid batch ID"));

            if (!batch.getMedicine().getOrganization().getId().equals(organizationId)) {
                throw new SecurityException("Batch does not belong to your organization");
            }

            if (batch.getExpiryDate() != null && batch.getExpiryDate().isBefore(java.time.LocalDate.now())) {
                throw new IllegalStateException("Cannot dispense expired batch: " + batch.getBatchNumber());
            }

            if ("RECALLED".equals(batch.getStatus()) || "QUARANTINED".equals(batch.getStatus())) {
                throw new IllegalStateException("Cannot dispense batch with status: " + batch.getStatus());
            }

            if (batch.getCurrentQuantity() < reqItem.getQuantity()) {
                throw new IllegalStateException("Insufficient quantity in batch: " + batch.getBatchNumber());
            }

            // FEFO Enforcement
            List<Batch> eligibleBatches = batchRepository.findEligibleBatchesForFEFO(
                    batch.getMedicine().getId(), organizationId, java.time.LocalDate.now().plusDays(30)); // example policy: 30 days remaining
            
            if (!eligibleBatches.isEmpty()) {
                Batch nextFefoBatch = eligibleBatches.get(0);
                if (!nextFefoBatch.getId().equals(batch.getId())) {
                    throw new IllegalStateException("FEFO Violation: Batch " + nextFefoBatch.getBatchNumber() + " must be dispensed first before " + batch.getBatchNumber());
                }
            }

            // Deduct inventory
            batch.setCurrentQuantity(batch.getCurrentQuantity() - reqItem.getQuantity());
            batchRepository.save(batch);

            // Record transaction
            InventoryTransaction tx = new InventoryTransaction();
            com.medistock.backend.entity.Organization org = new com.medistock.backend.entity.Organization();
            org.setId(organizationId);
            tx.setOrganization(org);
            tx.setMedicine(batch.getMedicine());
            tx.setBatch(batch);
            tx.setQuantity(-reqItem.getQuantity());
            tx.setMovementType("DISPENSE");
            tx.setReferenceNumber("ORDER-" + order.getOrderNumber());
            tx.setReason("Dispensed for order");
            com.medistock.backend.entity.User userObj = new com.medistock.backend.entity.User();
            userObj.setId(userId);
            tx.setUser(userObj);
            transactionRepository.save(tx);

            // Create dispensing item
            DispensingItem dItem = new DispensingItem();
            dItem.setDispensingRecord(record);
            dItem.setOrderItem(orderItem);
            dItem.setBatch(batch);
            dItem.setQuantity(reqItem.getQuantity());
            record.getItems().add(dItem);

            // Update order item status
            orderItem.setDispensedQuantity(orderItem.getDispensedQuantity() + reqItem.getQuantity());
            if (orderItem.getDispensedQuantity() >= orderItem.getRequestedQuantity()) {
                orderItem.setStatus("FULFILLED");
            } else {
                orderItem.setStatus("PARTIALLY_FULFILLED");
            }
        }

        // Update main order status
        boolean allFulfilled = order.getItems().stream().allMatch(i -> "FULFILLED".equals(i.getStatus()));
        if (allFulfilled) {
            order.setStatus("FULFILLED");
            order.setCompletedAt(OffsetDateTime.now());
        } else {
            order.setStatus("PARTIALLY_FULFILLED");
        }

        orderRepository.save(order);
        return dispensingRepository.save(record);
    }

    @Transactional
    public MedicationOrder secondVerifyOrder(UUID id, UUID organizationId, UUID userId) {
        MedicationOrder order = getOrder(id, organizationId);
        
        if (!"APPROVED".equals(order.getStatus())) {
            throw new IllegalStateException("Order must be in APPROVED state for second verification");
        }
        
        if (userId.equals(order.getReviewedBy())) {
            throw new SecurityException("Second verifier must be different from the first reviewer");
        }
        
        order.setSecondVerifierId(userId);
        order.setSecondVerifiedAt(OffsetDateTime.now());
        order.setStatus("READY_TO_DISPENSE");
        
        return orderRepository.save(order);
    }

    @Transactional
    public DispensingRecord reverseDispense(UUID id, UUID organizationId, UUID userId, String reason) {
        DispensingRecord record = dispensingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dispensing record not found"));
                
        if (!record.getOrganizationId().equals(organizationId)) {
            throw new SecurityException("Unauthorized access to dispensing record");
        }
        
        if ("REVERSED".equals(record.getStatus())) {
            throw new IllegalStateException("Already reversed");
        }
        
        // Reverse inventory and order status
        for (DispensingItem dItem : record.getItems()) {
            Batch batch = dItem.getBatch();
            batch.setCurrentQuantity(batch.getCurrentQuantity() + dItem.getQuantity());
            batchRepository.save(batch);
            
            InventoryTransaction tx = new InventoryTransaction();
            com.medistock.backend.entity.Organization org = new com.medistock.backend.entity.Organization();
            org.setId(organizationId);
            tx.setOrganization(org);
            tx.setMedicine(batch.getMedicine());
            tx.setBatch(batch);
            tx.setQuantity(dItem.getQuantity());
            tx.setMovementType("REVERSAL");
            tx.setReferenceNumber("REV-" + record.getDispensingNumber());
            tx.setReason(reason != null ? reason : "Dispensing Reversal");
            com.medistock.backend.entity.User userObj = new com.medistock.backend.entity.User();
            userObj.setId(userId);
            tx.setUser(userObj);
            transactionRepository.save(tx);
            
            MedicationOrderItem oItem = dItem.getOrderItem();
            oItem.setDispensedQuantity(oItem.getDispensedQuantity() - dItem.getQuantity());
            oItem.setStatus(oItem.getDispensedQuantity() == 0 ? "PENDING" : "PARTIALLY_FULFILLED");
        }
        
        record.setStatus("REVERSED");
        record.setReversedAt(OffsetDateTime.now());
        record.setReversedBy(userId);
        record.setReversalReason(reason);
        
        MedicationOrder order = record.getOrder();
        order.setStatus(order.getItems().stream().allMatch(i -> i.getDispensedQuantity() == 0) ? "APPROVED" : "PARTIALLY_FULFILLED");
        orderRepository.save(order);
        
        return dispensingRepository.save(record);
    }
}
