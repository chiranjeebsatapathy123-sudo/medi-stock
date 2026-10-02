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

            if (!batch.getMedicine().getOrganizationId().equals(organizationId)) {
                throw new SecurityException("Batch does not belong to your organization");
            }

            if (batch.getExpiryDate() != null && batch.getExpiryDate().isBefore(java.time.LocalDate.now())) {
                throw new IllegalStateException("Cannot dispense expired batch: " + batch.getBatchNumber());
            }

            if ("RECALLED".equals(batch.getStatus()) || "QUARANTINED".equals(batch.getStatus())) {
                throw new IllegalStateException("Cannot dispense batch with status: " + batch.getStatus());
            }

            if (batch.getCurrentQty() < reqItem.getQuantity()) {
                throw new IllegalStateException("Insufficient quantity in batch: " + batch.getBatchNumber());
            }

            // Deduct inventory
            batch.setCurrentQty(batch.getCurrentQty() - reqItem.getQuantity());
            batchRepository.save(batch);

            // Record transaction
            InventoryTransaction tx = new InventoryTransaction();
            tx.setOrganizationId(organizationId);
            tx.setMedicine(batch.getMedicine());
            tx.setBatch(batch);
            tx.setQuantity(-reqItem.getQuantity());
            tx.setType("DISPENSE");
            tx.setReference("ORDER-" + order.getOrderNumber());
            tx.setNotes("Dispensed for order");
            tx.setPerformedBy(userId);
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
}
