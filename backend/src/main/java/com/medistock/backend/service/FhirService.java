package com.medistock.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medistock.backend.dto.cdss.CdssEvaluationResult;
import com.medistock.backend.entity.Medicine;
import com.medistock.backend.entity.Patient;
import com.medistock.backend.entity.pharmacy.DispensingItem;
import com.medistock.backend.entity.pharmacy.DispensingRecord;
import com.medistock.backend.entity.pharmacy.MedicationOrder;
import com.medistock.backend.entity.pharmacy.MedicationOrderItem;
import com.medistock.backend.repository.MedicineRepository;
import com.medistock.backend.repository.PatientRepository;
import com.medistock.backend.repository.pharmacy.DispensingRecordRepository;
import com.medistock.backend.repository.pharmacy.MedicationOrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class FhirService {

    private final PatientRepository patientRepository;
    private final MedicationOrderRepository orderRepository;
    private final DispensingRecordRepository dispensingRepository;
    private final MedicineRepository medicineRepository;
    private final CdssService cdssService;
    private final AuditService auditService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FhirService(PatientRepository patientRepository,
                       MedicationOrderRepository orderRepository,
                       DispensingRecordRepository dispensingRepository,
                       MedicineRepository medicineRepository,
                       CdssService cdssService,
                       AuditService auditService) {
        this.patientRepository = patientRepository;
        this.orderRepository = orderRepository;
        this.dispensingRepository = dispensingRepository;
        this.medicineRepository = medicineRepository;
        this.cdssService = cdssService;
        this.auditService = auditService;
    }

    // 1. FHIR Patient Resource
    public Map<String, Object> getFhirPatient(UUID patientId, UUID organizationId) {
        Patient patient = patientRepository.findByIdAndOrganizationId(patientId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));
        return convertPatientToFhir(patient);
    }

    public Map<String, Object> searchFhirPatients(String mrn, UUID organizationId) {
        List<Patient> patients = patientRepository.findByOrganizationId(organizationId);
        List<Map<String, Object>> entries = new ArrayList<>();

        for (Patient p : patients) {
            if (mrn == null || (p.getMrn() != null && p.getMrn().equalsIgnoreCase(mrn))) {
                entries.add(convertPatientToFhir(p));
            }
        }

        return createBundle("searchset", entries);
    }

    public Map<String, Object> convertPatientToFhir(Patient p) {
        Map<String, Object> fhir = new LinkedHashMap<>();
        fhir.put("resourceType", "Patient");
        fhir.put("id", p.getId() != null ? p.getId().toString() : UUID.randomUUID().toString());

        // Identifiers (MRN)
        if (p.getMrn() != null) {
            Map<String, Object> idMap = new LinkedHashMap<>();
            idMap.put("system", "http://hospital.smarthealth.org/mrn");
            idMap.put("value", p.getMrn());
            idMap.put("use", "official");
            fhir.put("identifier", List.of(idMap));
        }

        // Name
        if (p.getName() != null) {
            Map<String, Object> nameMap = new LinkedHashMap<>();
            nameMap.put("use", "official");
            nameMap.put("text", p.getName());
            fhir.put("name", List.of(nameMap));
        }

        // Telecom
        List<Map<String, Object>> telecoms = new ArrayList<>();
        if (p.getContactNumber() != null) {
            Map<String, Object> phone = new LinkedHashMap<>();
            phone.put("system", "phone");
            phone.put("value", p.getContactNumber());
            telecoms.add(phone);
        }
        if (p.getEmail() != null) {
            Map<String, Object> email = new LinkedHashMap<>();
            email.put("system", "email");
            email.put("value", p.getEmail());
            telecoms.add(email);
        }
        if (!telecoms.isEmpty()) {
            fhir.put("telecom", telecoms);
        }

        if (p.getGender() != null) {
            fhir.put("gender", p.getGender().toLowerCase());
        }

        if (p.getDateOfBirth() != null) {
            fhir.put("birthDate", p.getDateOfBirth().toString());
        }

        if (p.getAddress() != null) {
            Map<String, Object> addr = new LinkedHashMap<>();
            addr.put("text", p.getAddress());
            fhir.put("address", List.of(addr));
        }

        // Allergies Extension
        if (p.getAllergies() != null && !p.getAllergies().isBlank()) {
            Map<String, Object> allergyExt = new LinkedHashMap<>();
            allergyExt.put("url", "http://hl7.org/fhir/StructureDefinition/patient-allergy");
            allergyExt.put("valueString", p.getAllergies());
            fhir.put("extension", List.of(allergyExt));
        }

        return fhir;
    }

    // 2. FHIR MedicationRequest Ingestion (from Epic/Cerner)
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> ingestFhirMedicationRequest(Map<String, Object> requestJson, UUID organizationId, UUID userId) {
        String patientRef = "WALK-IN";
        if (requestJson.containsKey("subject") && requestJson.get("subject") instanceof Map) {
            Map<String, Object> subject = (Map<String, Object>) requestJson.get("subject");
            if (subject.containsKey("reference")) {
                patientRef = subject.get("reference").toString().replace("Patient/", "");
            } else if (subject.containsKey("display")) {
                patientRef = subject.get("display").toString();
            }
        }

        String prescriberRef = "Attending Physician";
        if (requestJson.containsKey("requester") && requestJson.get("requester") instanceof Map) {
            Map<String, Object> requester = (Map<String, Object>) requestJson.get("requester");
            if (requester.containsKey("display")) {
                prescriberRef = requester.get("display").toString();
            }
        }

        // Extract Medication and Quantity
        String medNameCandidate = "Standard Rx";
        String medCode = null;
        if (requestJson.containsKey("medicationCodeableConcept") && requestJson.get("medicationCodeableConcept") instanceof Map) {
            Map<String, Object> mcc = (Map<String, Object>) requestJson.get("medicationCodeableConcept");
            if (mcc.containsKey("text")) medNameCandidate = mcc.get("text").toString();
            if (mcc.containsKey("coding") && mcc.get("coding") instanceof List) {
                List<Map<String, Object>> codings = (List<Map<String, Object>>) mcc.get("coding");
                if (!codings.isEmpty()) {
                    if (codings.get(0).containsKey("code")) medCode = codings.get(0).get("code").toString();
                    if (codings.get(0).containsKey("display")) medNameCandidate = codings.get(0).get("display").toString();
                }
            }
        }

        int requestedQty = 30;
        String instructions = "Take as prescribed";
        if (requestJson.containsKey("dosageInstruction") && requestJson.get("dosageInstruction") instanceof List) {
            List<Map<String, Object>> dList = (List<Map<String, Object>>) requestJson.get("dosageInstruction");
            if (!dList.isEmpty() && dList.get(0).containsKey("text")) {
                instructions = dList.get(0).get("text").toString();
            }
        }

        if (requestJson.containsKey("dispenseRequest") && requestJson.get("dispenseRequest") instanceof Map) {
            Map<String, Object> dr = (Map<String, Object>) requestJson.get("dispenseRequest");
            if (dr.containsKey("quantity") && dr.get("quantity") instanceof Map) {
                Map<String, Object> qMap = (Map<String, Object>) dr.get("quantity");
                if (qMap.containsKey("value") && qMap.get("value") instanceof Number) {
                    requestedQty = ((Number) qMap.get("value")).intValue();
                }
            }
        }

        // Find or associate medicine
        List<Medicine> medicines = medicineRepository.findByOrganizationId(organizationId);
        final String searchName = medNameCandidate.toLowerCase();
        final String finalMedCode = medCode;
        Medicine matchedMed = medicines.stream()
                .filter(m -> (finalMedCode != null && finalMedCode.equalsIgnoreCase(m.getMedicineCode())) ||
                             (m.getBrandName() != null && searchName.contains(m.getBrandName().toLowerCase())) ||
                             (m.getGenericName() != null && searchName.contains(m.getGenericName().toLowerCase())))
                .findFirst()
                .orElse(null);

        if (matchedMed == null && !medicines.isEmpty()) {
            matchedMed = medicines.get(0); // Fallback to first active inventory item
        }

        // Create MedicationOrder
        MedicationOrder order = new MedicationOrder();
        order.setOrganizationId(organizationId);
        order.setOrderNumber("FHIR-" + (System.currentTimeMillis() % 1000000));
        order.setPatientReference(patientRef);
        order.setPrescriberReference(prescriberRef);
        order.setStatus("RECEIVED");
        order.setCreatedBy(userId);
        order.setNotes("Ingested via HL7 FHIR R4 API from external EHR");

        if (matchedMed != null) {
            MedicationOrderItem item = new MedicationOrderItem();
            item.setOrder(order);
            item.setMedicine(matchedMed);
            item.setRequestedQuantity(requestedQty);
            item.setInstructions(instructions);
            item.setStatus("PENDING");
            order.setItems(List.of(item));
        }

        order = orderRepository.save(order);

        // CDSS Safety Check
        CdssEvaluationResult cdss = cdssService.evaluateOrder(order, organizationId);

        // Audit Logging
        try {
            auditService.recordAudit(
                    organizationId, userId, "HL7 FHIR Interoperability Gateway", "SYSTEM",
                    "FHIR_INGEST_MEDICATION_REQUEST", "MEDICATION_ORDER", order.getId(),
                    null, "orderNumber=" + order.getOrderNumber() + ",safe=" + cdss.isSafeToDispense(),
                    "FHIR R4 MedicationRequest ingested for patient " + patientRef
            );
        } catch (Exception ignored) {}

        return convertOrderToFhirMedicationRequest(order, cdss);
    }

    public Map<String, Object> convertOrderToFhirMedicationRequest(MedicationOrder order, CdssEvaluationResult cdss) {
        Map<String, Object> fhir = new LinkedHashMap<>();
        fhir.put("resourceType", "MedicationRequest");
        fhir.put("id", order.getId() != null ? order.getId().toString() : UUID.randomUUID().toString());

        Map<String, Object> idMap = new LinkedHashMap<>();
        idMap.put("system", "http://medistock.org/orders");
        idMap.put("value", order.getOrderNumber());
        fhir.put("identifier", List.of(idMap));

        fhir.put("status", "RECEIVED".equals(order.getStatus()) ? "active" : order.getStatus().toLowerCase());
        fhir.put("intent", "order");

        Map<String, Object> subject = new LinkedHashMap<>();
        subject.put("reference", "Patient/" + order.getPatientReference());
        subject.put("display", order.getPatientReference());
        fhir.put("subject", subject);

        Map<String, Object> requester = new LinkedHashMap<>();
        requester.put("display", order.getPrescriberReference() != null ? order.getPrescriberReference() : "Attending Physician");
        fhir.put("requester", requester);

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            MedicationOrderItem item = order.getItems().get(0);
            Medicine m = item.getMedicine();

            Map<String, Object> mcc = new LinkedHashMap<>();
            mcc.put("text", m != null ? m.getBrandName() + " (" + m.getGenericName() + ")" : "Medication");
            if (m != null && m.getMedicineCode() != null) {
                Map<String, Object> coding = new LinkedHashMap<>();
                coding.put("system", "http://medistock.org/codes");
                coding.put("code", m.getMedicineCode());
                coding.put("display", m.getBrandName());
                mcc.put("coding", List.of(coding));
            }
            fhir.put("medicationCodeableConcept", mcc);

            Map<String, Object> dosage = new LinkedHashMap<>();
            dosage.put("text", item.getInstructions());
            fhir.put("dosageInstruction", List.of(dosage));

            Map<String, Object> dispenseRequest = new LinkedHashMap<>();
            Map<String, Object> qty = new LinkedHashMap<>();
            qty.put("value", item.getRequestedQuantity());
            qty.put("unit", m != null ? m.getUnit() : "unit");
            dispenseRequest.put("quantity", qty);
            fhir.put("dispenseRequest", dispenseRequest);
        }

        // CDSS Extension
        if (cdss != null) {
            Map<String, Object> cdssExt = new LinkedHashMap<>();
            cdssExt.put("url", "http://medistock.org/fhir/StructureDefinition/cdss-safety");
            cdssExt.put("valueBoolean", cdss.isSafeToDispense());
            cdssExt.put("alertCount", cdss.getAlertCount());
            cdssExt.put("contraindicatedCount", cdss.getContraindicatedCount());
            fhir.put("extension", List.of(cdssExt));
        }

        return fhir;
    }

    // 3. FHIR MedicationDispense Resource
    public Map<String, Object> getFhirMedicationDispense(UUID dispensingId, UUID organizationId) {
        DispensingRecord record = dispensingRepository.findById(dispensingId)
                .orElseThrow(() -> new IllegalArgumentException("Dispensing record not found: " + dispensingId));
        if (!record.getOrganizationId().equals(organizationId)) {
            throw new SecurityException("Unauthorized organization access.");
        }
        return convertDispensingToFhir(record);
    }

    public Map<String, Object> convertDispensingToFhir(DispensingRecord record) {
        Map<String, Object> fhir = new LinkedHashMap<>();
        fhir.put("resourceType", "MedicationDispense");
        fhir.put("id", record.getId().toString());

        Map<String, Object> idMap = new LinkedHashMap<>();
        idMap.put("system", "http://medistock.org/dispensing");
        idMap.put("value", record.getDispensingNumber());
        fhir.put("identifier", List.of(idMap));

        fhir.put("status", "REVERSED".equals(record.getStatus()) ? "stopped" : "completed");

        if (record.getOrder() != null) {
            Map<String, Object> subject = new LinkedHashMap<>();
            subject.put("reference", "Patient/" + record.getOrder().getPatientReference());
            subject.put("display", record.getOrder().getPatientReference());
            fhir.put("subject", subject);

            Map<String, Object> prescription = new LinkedHashMap<>();
            prescription.put("reference", "MedicationRequest/" + record.getOrder().getId());
            fhir.put("authorizingPrescription", List.of(prescription));
        }

        if (record.getItems() != null && !record.getItems().isEmpty()) {
            DispensingItem item = record.getItems().get(0);
            Medicine m = item.getBatch() != null ? item.getBatch().getMedicine() : null;

            Map<String, Object> mcc = new LinkedHashMap<>();
            mcc.put("text", m != null ? m.getBrandName() : "Dispensed Medication");
            fhir.put("medicationCodeableConcept", mcc);

            Map<String, Object> qty = new LinkedHashMap<>();
            qty.put("value", item.getQuantity());
            qty.put("unit", m != null ? m.getUnit() : "unit");
            fhir.put("quantity", qty);

            if (item.getBatch() != null) {
                Map<String, Object> dosageExt = new LinkedHashMap<>();
                dosageExt.put("lotNumber", item.getBatch().getBatchNumber());
                if (item.getBatch().getExpiryDate() != null) {
                    dosageExt.put("expirationDate", item.getBatch().getExpiryDate().toString());
                }
                fhir.put("dosageInstruction", List.of(dosageExt));
            }
        }

        fhir.put("whenHandedOver", record.getCreatedAt() != null ? record.getCreatedAt().toString() : OffsetDateTime.now().toString());

        return fhir;
    }

    public Map<String, Object> createBundle(String type, List<Map<String, Object>> resources) {
        Map<String, Object> bundle = new LinkedHashMap<>();
        bundle.put("resourceType", "Bundle");
        bundle.put("id", "bundle-" + UUID.randomUUID());
        bundle.put("type", type);
        bundle.put("total", resources.size());

        List<Map<String, Object>> entries = new ArrayList<>();
        for (Map<String, Object> r : resources) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("fullUrl", "urn:uuid:" + r.get("id"));
            entry.put("resource", r);
            entries.add(entry);
        }
        bundle.put("entry", entries);
        return bundle;
    }
}

