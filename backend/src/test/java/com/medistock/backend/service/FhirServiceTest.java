package com.medistock.backend.service;

import com.medistock.backend.dto.cdss.CdssEvaluationResult;
import com.medistock.backend.entity.Medicine;
import com.medistock.backend.entity.Patient;
import com.medistock.backend.entity.pharmacy.DispensingItem;
import com.medistock.backend.entity.pharmacy.DispensingRecord;
import com.medistock.backend.entity.pharmacy.MedicationOrder;
import com.medistock.backend.repository.MedicineRepository;
import com.medistock.backend.repository.PatientRepository;
import com.medistock.backend.repository.pharmacy.DispensingRecordRepository;
import com.medistock.backend.repository.pharmacy.MedicationOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FhirServiceTest {

    @Mock
    private PatientRepository patientRepository;
    @Mock
    private MedicationOrderRepository orderRepository;
    @Mock
    private DispensingRecordRepository dispensingRepository;
    @Mock
    private MedicineRepository medicineRepository;
    @Mock
    private CdssService cdssService;
    @Mock
    private AuditService auditService;

    private FhirService fhirService;
    private final UUID orgId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        fhirService = new FhirService(
                patientRepository, orderRepository, dispensingRepository,
                medicineRepository, cdssService, auditService
        );
    }

    @Test
    void testConvertPatientToFhir_GeneratesCompliantResource() {
        Patient patient = new Patient();
        patient.setId(UUID.randomUUID());
        patient.setMrn("MRN-90210");
        patient.setName("Eleanor Vance");
        patient.setGender("FEMALE");
        patient.setDateOfBirth(LocalDate.of(1982, 6, 15));
        patient.setContactNumber("+1-555-432-1000");
        patient.setEmail("eleanor.vance@example.com");
        patient.setAddress("42 Crestwood Dr, Boston MA");
        patient.setAllergies("Penicillin");

        Map<String, Object> fhir = fhirService.convertPatientToFhir(patient);

        assertNotNull(fhir);
        assertEquals("Patient", fhir.get("resourceType"));
        assertEquals(patient.getId().toString(), fhir.get("id"));
        assertEquals("female", fhir.get("gender"));
        assertEquals("1982-06-15", fhir.get("birthDate"));
        assertTrue(fhir.containsKey("telecom"));
        assertTrue(fhir.containsKey("extension"));
    }

    @Test
    void testIngestFhirMedicationRequest_CreatesOrderAndEvaluatesCdss() {
        Medicine med = new Medicine();
        med.setId(UUID.randomUUID());
        med.setGenericName("Amoxicillin");
        med.setBrandName("Amoxil");
        med.setUnit("capsule");

        when(medicineRepository.findByOrganizationId(orgId)).thenReturn(List.of(med));

        when(orderRepository.save(any(MedicationOrder.class))).thenAnswer(inv -> {
            MedicationOrder o = inv.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });

        CdssEvaluationResult cdssResult = new CdssEvaluationResult();
        cdssResult.setSafeToDispense(true);
        cdssResult.setAlertCount(0);
        when(cdssService.evaluateOrder(any(), any())).thenReturn(cdssResult);

        Map<String, Object> requestJson = new LinkedHashMap<>();
        requestJson.put("resourceType", "MedicationRequest");

        Map<String, Object> subject = new HashMap<>();
        subject.put("reference", "Patient/MRN-90210");
        requestJson.put("subject", subject);

        Map<String, Object> requester = new HashMap<>();
        requester.put("display", "Dr. Gregory House");
        requestJson.put("requester", requester);

        Map<String, Object> mcc = new HashMap<>();
        mcc.put("text", "Amoxicillin 500mg");
        requestJson.put("medicationCodeableConcept", mcc);

        Map<String, Object> dr = new HashMap<>();
        Map<String, Object> qty = new HashMap<>();
        qty.put("value", 21);
        dr.put("quantity", qty);
        requestJson.put("dispenseRequest", dr);

        Map<String, Object> fhirResponse = fhirService.ingestFhirMedicationRequest(requestJson, orgId, userId);

        assertNotNull(fhirResponse);
        assertEquals("MedicationRequest", fhirResponse.get("resourceType"));
        assertEquals("active", fhirResponse.get("status"));
        assertEquals("order", fhirResponse.get("intent"));
        assertTrue(fhirResponse.containsKey("extension"), "Should include CDSS safety clearance extension");
    }

    @Test
    void testConvertDispensingToFhir_GeneratesCompliantResource() {
        DispensingRecord record = new DispensingRecord();
        record.setId(UUID.randomUUID());
        record.setDispensingNumber("DISP-8877");
        record.setStatus("COMPLETED");

        MedicationOrder order = new MedicationOrder();
        order.setId(UUID.randomUUID());
        order.setPatientReference("MRN-5544");
        record.setOrder(order);

        Medicine med = new Medicine();
        med.setBrandName("Lipitor 20mg");
        med.setUnit("tablet");

        com.medistock.backend.entity.Batch batch = new com.medistock.backend.entity.Batch();
        batch.setBatchNumber("LOT-2026-X");
        batch.setExpiryDate(LocalDate.now().plusMonths(12));
        batch.setMedicine(med);

        DispensingItem item = new DispensingItem();
        item.setBatch(batch);
        item.setQuantity(60);
        record.setItems(List.of(item));

        Map<String, Object> fhir = fhirService.convertDispensingToFhir(record);

        assertNotNull(fhir);
        assertEquals("MedicationDispense", fhir.get("resourceType"));
        assertEquals("completed", fhir.get("status"));
        assertTrue(fhir.containsKey("authorizingPrescription"));
        assertTrue(fhir.containsKey("dosageInstruction"));
    }
}

