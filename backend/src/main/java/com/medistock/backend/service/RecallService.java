package com.medistock.backend.service;

import com.medistock.backend.dto.recall.PatientExposureSummary;
import com.medistock.backend.dto.recall.RecallExecutionRequest;
import com.medistock.backend.dto.recall.RecallExecutionResult;
import com.medistock.backend.entity.AuditLog;
import com.medistock.backend.entity.Batch;
import com.medistock.backend.entity.InventoryTransaction;
import com.medistock.backend.entity.Patient;
import com.medistock.backend.entity.pharmacy.*;
import com.medistock.backend.repository.BatchRepository;
import com.medistock.backend.repository.InventoryTransactionRepository;
import com.medistock.backend.repository.PatientRepository;
import com.medistock.backend.repository.pharmacy.DispensingRecordRepository;
import com.medistock.backend.repository.pharmacy.MedicationOrderRepository;
import com.medistock.backend.repository.pharmacy.PharmacyAlertRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class RecallService {

    private final BatchRepository batchRepository;
    private final DispensingRecordRepository dispensingRepository;
    private final MedicationOrderRepository orderRepository;
    private final PatientRepository patientRepository;
    private final PharmacyAlertRepository alertRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final AuditService auditService;

    public RecallService(BatchRepository batchRepository,
                         DispensingRecordRepository dispensingRepository,
                         MedicationOrderRepository orderRepository,
                         PatientRepository patientRepository,
                         PharmacyAlertRepository alertRepository,
                         InventoryTransactionRepository transactionRepository,
                         AuditService auditService) {
        this.batchRepository = batchRepository;
        this.dispensingRepository = dispensingRepository;
        this.orderRepository = orderRepository;
        this.patientRepository = patientRepository;
        this.alertRepository = alertRepository;
        this.transactionRepository = transactionRepository;
        this.auditService = auditService;
    }

    @Transactional
    public RecallExecutionResult executeRecall(RecallExecutionRequest request, UUID organizationId, UUID userId) {
        if (request.getLotNumber() == null || request.getLotNumber().isBlank()) {
            throw new IllegalArgumentException("Lot number is required for executing a product recall.");
        }

        String targetLot = request.getLotNumber().trim();
        String recallClass = request.getRecallClass() != null ? request.getRecallClass() : "CLASS_I";
        String reason = request.getReason() != null ? request.getReason() : "Mandated " + recallClass + " Lot Recall";

        // 1. Locate all matching batches across warehouse inventory
        List<Batch> allOrgBatches = batchRepository.findByMedicineOrganizationId(organizationId);
        List<Batch> matchedBatches = allOrgBatches.stream()
                .filter(b -> targetLot.equalsIgnoreCase(b.getBatchNumber()) ||
                        (request.getGtin() != null && request.getGtin().equalsIgnoreCase(b.getGtin())))
                .toList();

        int quarantinedUnits = 0;
        String medicineName = "Unknown Medicine";
        Set<UUID> affectedMedicineIds = new HashSet<>();

        for (Batch batch : matchedBatches) {
            quarantinedUnits += batch.getCurrentQuantity();
            batch.setStatus("RECALLED");
            batch.setRecallReason("[" + recallClass + "]: " + reason);
            batchRepository.save(batch);

            if (batch.getMedicine() != null) {
                affectedMedicineIds.add(batch.getMedicine().getId());
                medicineName = (batch.getMedicine().getBrandName() != null ? batch.getMedicine().getBrandName() : "") +
                        " (" + (batch.getMedicine().getGenericName() != null ? batch.getMedicine().getGenericName() : "") + ")";
            }

            // Record transaction
            try {
                InventoryTransaction tx = new InventoryTransaction();
                com.medistock.backend.entity.Organization org = new com.medistock.backend.entity.Organization();
                org.setId(organizationId);
                tx.setOrganization(org);
                tx.setMedicine(batch.getMedicine());
                tx.setBatch(batch);
                tx.setQuantity(0);
                tx.setMovementType("RECALL_HOLD");
                tx.setReferenceNumber("RECALL-" + targetLot);
                tx.setReason("Emergency " + recallClass + " Recall: " + reason);
                com.medistock.backend.entity.User userObj = new com.medistock.backend.entity.User();
                userObj.setId(userId);
                tx.setUser(userObj);
                transactionRepository.save(tx);
            } catch (Exception ignored) {}
        }

        // 2. Halt in-flight medication orders referencing this lot or affected medicine
        List<MedicationOrder> activeOrders = orderRepository.findByOrganizationId(organizationId);
        int haltedOrdersCount = 0;

        for (MedicationOrder order : activeOrders) {
            if ("RECEIVED".equalsIgnoreCase(order.getStatus()) || "APPROVED".equalsIgnoreCase(order.getStatus()) || "READY_TO_DISPENSE".equalsIgnoreCase(order.getStatus())) {
                boolean containsAffected = false;
                if (order.getItems() != null) {
                    for (MedicationOrderItem item : order.getItems()) {
                        if (item.getMedicine() != null && affectedMedicineIds.contains(item.getMedicine().getId())) {
                            containsAffected = true;
                            break;
                        }
                    }
                }
                if (containsAffected) {
                    order.setStatus("RECALLED_HOLD");
                    order.setNotes((order.getNotes() != null ? order.getNotes() + "\n" : "") +
                            "[EMERGENCY RECALL HOLD]: Halted due to active recall of lot " + targetLot + " (" + recallClass + ")");
                    orderRepository.save(order);
                    haltedOrdersCount++;
                }
            }
        }

        // 3. Trace-Back Patient Exposure Analysis
        List<PatientExposureSummary> exposedPatients = tracePatientExposure(organizationId, targetLot);

        // 4. Raise Critical Pharmacy Alert
        try {
            PharmacyAlert alert = new PharmacyAlert();
            alert.setOrganizationId(organizationId);
            alert.setType("EMERGENCY_LOT_RECALL");
            alert.setSeverity("CRITICAL");
            alert.setMessage(String.format("EMERGENCY %s RECALL: Lot %s quarantined (%d units). %d prescriptions halted. %d patients exposed.",
                    recallClass, targetLot, quarantinedUnits, haltedOrdersCount, exposedPatients.size()));
            alert.setStatus("UNRESOLVED");
            alertRepository.save(alert);
        } catch (Exception ignored) {}

        // 5. FDA 21 CFR Part 11 Hash-Chained Audit Trail
        String auditHash = null;
        try {
            AuditLog auditLog = auditService.recordAudit(
                    organizationId, userId, "Quality Director", "REGULATORY_OFFICER",
                    "EXECUTE_EMERGENCY_RECALL", "BATCH_LOT",
                    matchedBatches.isEmpty() ? UUID.randomUUID() : matchedBatches.get(0).getId(),
                    null,
                    "lot=" + targetLot + ",class=" + recallClass + ",unitsQuarantined=" + quarantinedUnits + ",exposedPatients=" + exposedPatients.size(),
                    "Emergency lot recall executed under mandate: " + (request.getMandateAuthority() != null ? request.getMandateAuthority() : "FDA") + " - " + reason
            );
            auditHash = auditLog.getSignatureHash();
        } catch (Exception ignored) {}

        return RecallExecutionResult.builder()
                .lotNumber(targetLot)
                .gtin(request.getGtin())
                .recallClass(recallClass)
                .medicineName(medicineName)
                .batchesRecalledCount(matchedBatches.size())
                .quarantinedStockUnits(quarantinedUnits)
                .haltedOrdersCount(haltedOrdersCount)
                .exposedPatientsCount(exposedPatients.size())
                .exposedPatients(exposedPatients)
                .auditTransactionHash(auditHash)
                .executedAt(OffsetDateTime.now())
                .build();
    }

    public List<PatientExposureSummary> tracePatientExposure(UUID organizationId, String lotNumber) {
        List<PatientExposureSummary> result = new ArrayList<>();
        List<DispensingRecord> records = dispensingRepository.findByOrganizationId(organizationId);
        List<Patient> patients = patientRepository.findByOrganizationId(organizationId);

        Map<String, Patient> patientMap = new HashMap<>();
        for (Patient p : patients) {
            if (p.getMrn() != null) patientMap.put(p.getMrn().toLowerCase(), p);
            if (p.getName() != null) patientMap.put(p.getName().toLowerCase(), p);
            if (p.getId() != null) patientMap.put(p.getId().toString().toLowerCase(), p);
        }

        for (DispensingRecord record : records) {
            if (record.getItems() != null) {
                for (DispensingItem item : record.getItems()) {
                    if (item.getBatch() != null && lotNumber.equalsIgnoreCase(item.getBatch().getBatchNumber())) {
                        String patRef = record.getOrder() != null ? record.getOrder().getPatientReference() : null;
                        Patient matchedPat = patRef != null ? patientMap.get(patRef.toLowerCase()) : null;

                        result.add(PatientExposureSummary.builder()
                                .patientReference(patRef != null ? patRef : "Unknown")
                                .patientName(matchedPat != null && matchedPat.getName() != null ? matchedPat.getName() : (patRef != null ? patRef : "N/A"))
                                .contactNumber(matchedPat != null ? matchedPat.getContactNumber() : "N/A")
                                .email(matchedPat != null ? matchedPat.getEmail() : "N/A")
                                .dispensingNumber(record.getDispensingNumber())
                                .dispensedAt(record.getCreatedAt())
                                .quantityDispensed(item.getQuantity())
                                .prescriber(record.getOrder() != null ? record.getOrder().getPrescriberReference() : "N/A")
                                .status("DISPENSED")
                                .build());
                    }
                }
            }
        }

        return result;
    }

    public List<Map<String, Object>> getActiveRecalls(UUID organizationId) {
        List<Batch> recalledBatches = batchRepository.findByMedicineOrganizationId(organizationId).stream()
                .filter(b -> "RECALLED".equalsIgnoreCase(b.getStatus()))
                .toList();

        List<Map<String, Object>> list = new ArrayList<>();
        for (Batch b : recalledBatches) {
            Map<String, Object> map = new HashMap<>();
            map.put("batchId", b.getId());
            map.put("batchNumber", b.getBatchNumber());
            map.put("gtin", b.getGtin());
            map.put("medicineName", b.getMedicine() != null ? b.getMedicine().getBrandName() : "N/A");
            map.put("quarantinedQuantity", b.getCurrentQuantity());
            map.put("expiryDate", b.getExpiryDate());
            map.put("recallReason", b.getRecallReason());
            list.add(map);
        }
        return list;
    }
}
