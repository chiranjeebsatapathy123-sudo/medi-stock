package com.medistock.backend.service;

import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ProcurementService {

    private final PurchaseOrderRepository poRepository;
    private final GRNRepository grnRepository;
    private final BatchRepository batchRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final MedicineRepository medicineRepository;

    public ProcurementService(PurchaseOrderRepository poRepository, GRNRepository grnRepository, BatchRepository batchRepository, InventoryTransactionRepository transactionRepository, MedicineRepository medicineRepository) {
        this.poRepository = poRepository;
        this.grnRepository = grnRepository;
        this.batchRepository = batchRepository;
        this.transactionRepository = transactionRepository;
        this.medicineRepository = medicineRepository;
    }

    public List<PurchaseOrder> getPurchaseOrders(UUID orgId) {
        return poRepository.findByOrganizationId(orgId);
    }

    @Transactional
    public PurchaseOrder createPO(PurchaseOrder po, UUID orgId, UUID userId) {
        po.setOrganizationId(orgId);
        po.setCreatedBy(userId);
        po.setStatus("DRAFT");
        po.setPoNumber("PO-" + System.currentTimeMillis());
        if (po.getItems() != null) {
            po.getItems().forEach(item -> {
                item.setPurchaseOrder(po);
                item.setStatus("PENDING");
            });
        }
        return poRepository.save(po);
    }

    @Transactional
    public PurchaseOrder approvePO(UUID poId, UUID orgId, UUID userId) {
        PurchaseOrder po = poRepository.findByIdAndOrganizationId(poId, orgId).orElseThrow();
        if (!"DRAFT".equals(po.getStatus()) && !"PENDING_APPROVAL".equals(po.getStatus())) {
            throw new IllegalStateException("PO cannot be approved in current state.");
        }
        po.setStatus("APPROVED");
        po.setApprovedBy(userId);
        return poRepository.save(po);
    }

    @Transactional
    public GRN receiveGRN(UUID poId, GRN grnRequest, UUID orgId, UUID userId) {
        PurchaseOrder po = poRepository.findByIdAndOrganizationId(poId, orgId).orElseThrow();
        if (!"APPROVED".equals(po.getStatus()) && !"PARTIALLY_RECEIVED".equals(po.getStatus()) && !"SENT".equals(po.getStatus())) {
            throw new IllegalStateException("PO is not in a receivable state.");
        }

        GRN grn = new GRN();
        grn.setOrganizationId(orgId);
        grn.setPurchaseOrder(po);
        grn.setGrnNumber("GRN-" + System.currentTimeMillis());
        grn.setReceivedBy(userId);
        grn.setReceivedAt(OffsetDateTime.now());
        grn.setStatus("RECEIVED");
        grn.setNotes(grnRequest.getNotes());

        for (GRNItem reqItem : grnRequest.getItems()) {
            PurchaseOrderItem poItem = po.getItems().stream()
                .filter(i -> i.getId().equals(reqItem.getPurchaseOrderItem().getId()))
                .findFirst().orElseThrow(() -> new IllegalArgumentException("Invalid PO Item"));

            if (reqItem.getReceivedQuantity() <= 0) continue;
            
            int remainingToReceive = poItem.getQuantity() - poItem.getReceivedQuantity();
            if (reqItem.getReceivedQuantity() > remainingToReceive) {
                // configurable over-receiving tolerance could go here
                throw new IllegalStateException("Cannot receive more than ordered quantity.");
            }

            Medicine medicine = medicineRepository.findById(poItem.getMedicine().getId()).orElseThrow();

            // Create Batch
            Batch batch = new Batch();
            batch.setMedicine(medicine);
            batch.setBatchNumber("BATCH-" + System.currentTimeMillis()); // Normally scanned
            batch.setReceivedQuantity(reqItem.getReceivedQuantity());
            batch.setCurrentQuantity(reqItem.getReceivedQuantity());
            batch.setPurchasePrice(poItem.getUnitPrice());
            batch.setSupplierId(po.getSupplier().getId());
            batch.setExpiryDate(LocalDate.now().plusYears(1)); // For demo if not supplied
            batch.setStatus("ACTIVE");
            batchRepository.save(batch);

            // Record Inventory Transaction
            InventoryTransaction tx = new InventoryTransaction();
            Organization org = new Organization();
            org.setId(orgId);
            tx.setOrganization(org);
            tx.setMedicine(medicine);
            tx.setBatch(batch);
            tx.setQuantity(reqItem.getReceivedQuantity());
            tx.setMovementType("RECEIPT");
            tx.setReferenceNumber(grn.getGrnNumber());
            tx.setReason("PO Receipt");
            User userObj = new User();
            userObj.setId(userId);
            tx.setUser(userObj);
            transactionRepository.save(tx);

            poItem.setReceivedQuantity(poItem.getReceivedQuantity() + reqItem.getReceivedQuantity());
            poItem.setStatus(poItem.getReceivedQuantity() >= poItem.getQuantity() ? "RECEIVED" : "PARTIALLY_RECEIVED");

            reqItem.setGrn(grn);
            reqItem.setMedicine(medicine);
            reqItem.setBatch(batch);
            reqItem.setAcceptedQuantity(reqItem.getReceivedQuantity());
            grn.getItems().add(reqItem);
        }

        boolean allReceived = po.getItems().stream().allMatch(i -> "RECEIVED".equals(i.getStatus()));
        po.setStatus(allReceived ? "RECEIVED" : "PARTIALLY_RECEIVED");

        poRepository.save(po);
        return grnRepository.save(grn);
    }
}
