package com.medistock.backend.service;

import com.medistock.backend.dto.cdss.CdssEvaluationResult;
import com.medistock.backend.entity.Medicine;
import com.medistock.backend.entity.Patient;
import com.medistock.backend.entity.pharmacy.MedicationOrder;
import com.medistock.backend.entity.pharmacy.MedicationOrderItem;
import com.medistock.backend.repository.MedicineRepository;
import com.medistock.backend.repository.PatientRepository;
import com.medistock.backend.repository.pharmacy.MedicationOrderRepository;
import com.medistock.backend.repository.pharmacy.PharmacyAlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CdssServiceTest {

    @Mock
    private MedicationOrderRepository orderRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private PharmacyAlertRepository alertRepository;
    @Mock
    private MedicineRepository medicineRepository;

    private CdssService cdssService;
    private final UUID orgId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        cdssService = new CdssService(orderRepository, patientRepository, alertRepository, medicineRepository);
    }

    @Test
    void testDrugAllergyContraindication_PenicillinVsAmoxicillin() {
        Patient patient = new Patient();
        patient.setMrn("MRN-90210");
        patient.setName("Jane Doe");
        patient.setAllergies("Severe Penicillin Allergy, Shellfish");

        when(patientRepository.findByOrganizationId(orgId)).thenReturn(List.of(patient));

        Medicine amox = new Medicine();
        amox.setGenericName("Amoxicillin Trihydrate");
        amox.setBrandName("Amoxil 500mg");

        MedicationOrder order = new MedicationOrder();
        order.setId(UUID.randomUUID());
        order.setOrderNumber("ORD-101");
        order.setPatientReference("MRN-90210");

        MedicationOrderItem item = new MedicationOrderItem();
        item.setMedicine(amox);
        item.setRequestedQuantity(20);
        order.setItems(List.of(item));

        CdssEvaluationResult result = cdssService.evaluateOrder(order, orgId);

        assertNotNull(result);
        assertFalse(result.isSafeToDispense(), "Should NOT be safe to dispense due to penicillin allergy");
        assertEquals(1, result.getContraindicatedCount());
        assertTrue(result.getAlerts().get(0).getDescription().toLowerCase().contains("penicillin"));
    }

    @Test
    void testDrugDrugInteraction_WarfarinAndAspirin() {
        when(patientRepository.findByOrganizationId(orgId)).thenReturn(List.of());

        Medicine warfarin = new Medicine();
        warfarin.setGenericName("Warfarin Sodium");
        warfarin.setBrandName("Coumadin 5mg");

        Medicine aspirin = new Medicine();
        aspirin.setGenericName("Aspirin (Acetylsalicylic Acid)");
        aspirin.setBrandName("Bayer Aspirin 325mg");

        MedicationOrder order = new MedicationOrder();
        order.setId(UUID.randomUUID());
        order.setOrderNumber("ORD-102");
        order.setPatientReference("ANON-PATIENT");

        MedicationOrderItem item1 = new MedicationOrderItem();
        item1.setMedicine(warfarin);
        item1.setRequestedQuantity(30);

        MedicationOrderItem item2 = new MedicationOrderItem();
        item2.setMedicine(aspirin);
        item2.setRequestedQuantity(30);

        order.setItems(List.of(item1, item2));

        CdssEvaluationResult result = cdssService.evaluateOrder(order, orgId);

        assertNotNull(result);
        assertFalse(result.isSafeToDispense(), "Co-administering Warfarin and Aspirin must trigger contraindication");
        assertEquals(1, result.getContraindicatedCount());
        assertTrue(result.getAlerts().get(0).getConflictingFactor().contains("Anticoagulant + NSAID"));
    }

    @Test
    void testSafeMedicationOrder_NoInteractionsOrAllergies() {
        Patient patient = new Patient();
        patient.setMrn("MRN-445");
        patient.setAllergies("Pollen");
        when(patientRepository.findByOrganizationId(orgId)).thenReturn(List.of(patient));

        Medicine paracetamol = new Medicine();
        paracetamol.setGenericName("Acetaminophen");
        paracetamol.setBrandName("Tylenol 500mg");

        MedicationOrder order = new MedicationOrder();
        order.setId(UUID.randomUUID());
        order.setOrderNumber("ORD-103");
        order.setPatientReference("MRN-445");

        MedicationOrderItem item = new MedicationOrderItem();
        item.setMedicine(paracetamol);
        item.setRequestedQuantity(20);
        order.setItems(List.of(item));

        CdssEvaluationResult result = cdssService.evaluateOrder(order, orgId);

        assertNotNull(result);
        assertTrue(result.isSafeToDispense(), "Clean order should be safe to dispense");
        assertEquals(0, result.getAlertCount());
    }
}
