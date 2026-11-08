package com.medistock.backend.service;

import com.medistock.backend.dto.recall.PatientExposureSummary;
import com.medistock.backend.dto.recall.RecallExecutionRequest;
import com.medistock.backend.dto.recall.RecallExecutionResult;
import com.medistock.backend.entity.AuditLog;
import com.medistock.backend.entity.Batch;
import com.medistock.backend.entity.Medicine;
import com.medistock.backend.entity.Patient;
import com.medistock.backend.entity.pharmacy.DispensingItem;
import com.medistock.backend.entity.pharmacy.DispensingRecord;
import com.medistock.backend.entity.pharmacy.MedicationOrder;
import com.medistock.backend.entity.pharmacy.MedicationOrderItem;
import com.medistock.backend.repository.BatchRepository;
import com.medistock.backend.repository.InventoryTransactionRepository;
import com.medistock.backend.repository.PatientRepository;
import com.medistock.backend.repository.pharmacy.DispensingRecordRepository;
import com.medistock.backend.repository.pharmacy.MedicationOrderRepository;
import com.medistock.backend.repository.pharmacy.PharmacyAlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecallServiceTest {

    @Mock
    private BatchRepository batchRepository;
    @Mock
    private DispensingRecordRepository dispensingRepository;
    @Mock
    private MedicationOrderRepository orderRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private PharmacyAlertRepository alertRepository;
    @Mock
    private InventoryTransactionRepository transactionRepository;
    @Mock
    private AuditService auditService;

    private RecallService recallService;
    private final UUID orgId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        recallService = new RecallService(
                batchRepository, dispensingRepository, orderRepository,
                patientRepository, alertRepository, transactionRepository, auditService
        );
    }

    @Test
    void testExecuteEmergencyRecall_QuarantinesBatchesAndHaltsOrders() {
        Medicine med = new Medicine();
        med.setId(UUID.randomUUID());
        med.setBrandName("Cardiomax 50mg");

        Batch batch = new Batch();
        batch.setId(UUID.randomUUID());
        batch.setBatchNumber("LOT-RECALL-999");
        batch.setMedicine(med);
        batch.setCurrentQuantity(450);
        batch.setStatus("ACTIVE");

        when(batchRepository.findByMedicineOrganizationId(orgId)).thenReturn(List.of(batch));

        MedicationOrder order = new MedicationOrder();
        order.setId(UUID.randomUUID());
        order.setStatus("APPROVED");
        MedicationOrderItem orderItem = new MedicationOrderItem();
        orderItem.setMedicine(med);
        order.setItems(List.of(orderItem));

        when(orderRepository.findByOrganizationId(orgId)).thenReturn(List.of(order));
        when(dispensingRepository.findByOrganizationId(orgId)).thenReturn(List.of());
        when(patientRepository.findByOrganizationId(orgId)).thenReturn(List.of());

        AuditLog mockLog = new AuditLog();
        mockLog.setSignatureHash("HASH-MOCK-RECALL-1234");
        when(auditService.recordAudit(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(mockLog);

        RecallExecutionRequest req = RecallExecutionRequest.builder()
                .lotNumber("LOT-RECALL-999")
                .recallClass("CLASS_I")
                .reason("Particulate contamination reported by manufacturer")
                .mandateAuthority("FDA")
                .build();

        RecallExecutionResult result = recallService.executeRecall(req, orgId, userId);

        assertNotNull(result);
        assertEquals("LOT-RECALL-999", result.getLotNumber());
        assertEquals("CLASS_I", result.getRecallClass());
        assertEquals(1, result.getBatchesRecalledCount());
        assertEquals(450, result.getQuarantinedStockUnits());
        assertEquals(1, result.getHaltedOrdersCount());
        assertEquals("RECALLED", batch.getStatus());
        assertEquals("RECALLED_HOLD", order.getStatus());
        assertEquals("HASH-MOCK-RECALL-1234", result.getAuditTransactionHash());
    }

    @Test
    void testTracePatientExposure_IdentifiesExposedPatients() {
        Patient patient = new Patient();
        patient.setMrn("MRN-5544");
        patient.setName("Robert Smith");
        patient.setContactNumber("+1-555-789-0123");
        patient.setEmail("robert.smith@example.com");

        when(patientRepository.findByOrganizationId(orgId)).thenReturn(List.of(patient));

        Batch batch = new Batch();
        batch.setBatchNumber("LOT-CONTAMINATED-101");

        MedicationOrder order = new MedicationOrder();
        order.setPatientReference("MRN-5544");
        order.setPrescriberReference("Dr. House, MD");

        DispensingRecord record = new DispensingRecord();
        record.setDispensingNumber("DISP-99001");
        record.setOrder(order);

        DispensingItem item = new DispensingItem();
        item.setBatch(batch);
        item.setQuantity(30);
        record.setItems(List.of(item));

        when(dispensingRepository.findByOrganizationId(orgId)).thenReturn(List.of(record));

        List<PatientExposureSummary> exposed = recallService.tracePatientExposure(orgId, "LOT-CONTAMINATED-101");

        assertNotNull(exposed);
        assertEquals(1, exposed.size());
        PatientExposureSummary summary = exposed.get(0);
        assertEquals("Robert Smith", summary.getPatientName());
        assertEquals("MRN-5544", summary.getPatientReference());
        assertEquals("+1-555-789-0123", summary.getContactNumber());
        assertEquals(30, summary.getQuantityDispensed());
        assertEquals("Dr. House, MD", summary.getPrescriber());
    }
}
