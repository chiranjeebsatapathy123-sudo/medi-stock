package com.medistock.backend.service;

import com.medistock.backend.dto.cdss.CdssAlert;
import com.medistock.backend.dto.cdss.CdssEvaluationResult;
import com.medistock.backend.entity.Medicine;
import com.medistock.backend.entity.Patient;
import com.medistock.backend.entity.pharmacy.MedicationOrder;
import com.medistock.backend.entity.pharmacy.MedicationOrderItem;
import com.medistock.backend.entity.pharmacy.PharmacyAlert;
import com.medistock.backend.repository.MedicineRepository;
import com.medistock.backend.repository.PatientRepository;
import com.medistock.backend.repository.pharmacy.MedicationOrderRepository;
import com.medistock.backend.repository.pharmacy.PharmacyAlertRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class CdssService {

    private final MedicationOrderRepository orderRepository;
    private final PatientRepository patientRepository;
    private final PharmacyAlertRepository alertRepository;
    private final MedicineRepository medicineRepository;

    public CdssService(MedicationOrderRepository orderRepository,
                       PatientRepository patientRepository,
                       PharmacyAlertRepository alertRepository,
                       MedicineRepository medicineRepository) {
        this.orderRepository = orderRepository;
        this.patientRepository = patientRepository;
        this.alertRepository = alertRepository;
        this.medicineRepository = medicineRepository;
    }

    public CdssEvaluationResult evaluateOrder(MedicationOrder order, UUID organizationId) {
        CdssEvaluationResult result = new CdssEvaluationResult();
        result.setOrderId(order.getId());
        result.setOrderNumber(order.getOrderNumber());
        result.setPatientReference(order.getPatientReference());
        result.setEvaluatedAt(OffsetDateTime.now());

        List<CdssAlert> alerts = new ArrayList<>();

        // 1. Resolve Patient and Allergies
        String patientAllergies = "";
        if (order.getPatientReference() != null && !order.getPatientReference().isBlank()) {
            Optional<Patient> patientOpt = findPatientByReference(order.getPatientReference(), organizationId);
            if (patientOpt.isPresent() && patientOpt.get().getAllergies() != null) {
                patientAllergies = patientOpt.get().getAllergies();
            }
        }
        result.setPatientAllergies(patientAllergies);

        // Collect all medicines in this order
        List<Medicine> orderMedicines = new ArrayList<>();
        if (order.getItems() != null) {
            for (MedicationOrderItem item : order.getItems()) {
                if (item.getMedicine() != null) {
                    orderMedicines.add(item.getMedicine());
                }
            }
        }

        // 2. Check Drug Allergies
        if (!patientAllergies.isBlank() && !orderMedicines.isEmpty()) {
            checkDrugAllergies(patientAllergies, orderMedicines, alerts);
        }

        // 3. Check Intra-Order Drug-Drug Interactions (DDI)
        if (orderMedicines.size() > 1) {
            for (int i = 0; i < orderMedicines.size(); i++) {
                for (int j = i + 1; j < orderMedicines.size(); j++) {
                    checkDrugPairInteraction(orderMedicines.get(i), orderMedicines.get(j), alerts);
                }
            }
        }

        // 4. Check Inter-Order Interactions (Active concurrent orders for the same patient)
        if (order.getPatientReference() != null && !order.getPatientReference().isBlank()) {
            checkPriorActiveOrdersInteractions(order, orderMedicines, organizationId, alerts);
        }

        // 5. Quantity / High Single Dose Safeguard
        if (order.getItems() != null) {
            for (MedicationOrderItem item : order.getItems()) {
                if (item.getMedicine() != null && item.getRequestedQuantity() != null && item.getRequestedQuantity() > 100) {
                    alerts.add(CdssAlert.builder()
                            .type("HIGH_DOSE_WARNING")
                            .severity("MODERATE")
                            .medicineName(getDisplayName(item.getMedicine()))
                            .conflictingFactor("Dispensing quantity: " + item.getRequestedQuantity() + " units")
                            .description("Single prescription request exceeds standard dispensing threshold (> 100 units).")
                            .clinicalRecommendation("Verify clinical indication, treatment duration, and prescriber authorization.")
                            .requiresOverrideReason(false)
                            .build());
                }
            }
        }

        // Calculate severity counts
        int contra = 0;
        int major = 0;
        int moderate = 0;
        for (CdssAlert alert : alerts) {
            if ("CONTRAINDICATED".equalsIgnoreCase(alert.getSeverity())) contra++;
            else if ("MAJOR".equalsIgnoreCase(alert.getSeverity())) major++;
            else if ("MODERATE".equalsIgnoreCase(alert.getSeverity())) moderate++;
        }

        result.setAlerts(alerts);
        result.setAlertCount(alerts.size());
        result.setContraindicatedCount(contra);
        result.setMajorCount(major);
        result.setModerateCount(moderate);
        result.setSafeToDispense(contra == 0 && major == 0);

        // Persist alerts to pharmacy_alerts table if any exist
        if (!alerts.isEmpty() && order.getId() != null) {
            for (CdssAlert a : alerts) {
                try {
                    PharmacyAlert entity = new PharmacyAlert();
                    entity.setOrganizationId(organizationId);
                    entity.setType(a.getType());
                    entity.setSeverity(a.getSeverity());
                    entity.setMessage(a.getMedicineName() + " - " + a.getDescription() + " Recommendation: " + a.getClinicalRecommendation());
                    entity.setReferenceId(order.getId());
                    entity.setStatus("UNRESOLVED");
                    alertRepository.save(entity);
                } catch (Exception ignored) {}
            }
        }

        return result;
    }

    private void checkDrugAllergies(String allergiesStr, List<Medicine> medicines, List<CdssAlert> alerts) {
        String[] allergyTokens = allergiesStr.split("[,;]+");
        for (String rawToken : allergyTokens) {
            String token = rawToken.trim().toLowerCase();
            if (token.isEmpty()) continue;

            for (Medicine med : medicines) {
                String gen = med.getGenericName() != null ? med.getGenericName().toLowerCase() : "";
                String brand = med.getBrandName() != null ? med.getBrandName().toLowerCase() : "";
                String cat = med.getCategory() != null ? med.getCategory().toLowerCase() : "";

                boolean matches = false;
                if (gen.contains(token) || brand.contains(token) || cat.contains(token)) {
                    matches = true;
                }

                // Family cross-sensitivities
                if (token.contains("penicillin") || token.contains("amoxicillin") || token.contains("ampicillin")) {
                    if (gen.contains("penicillin") || gen.contains("amoxicillin") || gen.contains("ampicillin") ||
                        gen.contains("augmentin") || gen.contains("piperacillin") || gen.contains("clavulan")) {
                        matches = true;
                    }
                } else if (token.contains("sulfa")) {
                    if (gen.contains("sulfa") || gen.contains("bactrim") || gen.contains("trimethoprim")) {
                        matches = true;
                    }
                } else if (token.contains("aspirin") || token.contains("nsaid")) {
                    if (gen.contains("aspirin") || gen.contains("ibuprofen") || gen.contains("naproxen") ||
                        gen.contains("ketorolac") || gen.contains("diclofenac") || gen.contains("celecoxib")) {
                        matches = true;
                    }
                } else if (token.contains("opioid") || token.contains("morphine") || token.contains("codeine")) {
                    if (gen.contains("morphine") || gen.contains("codeine") || gen.contains("oxycodone") ||
                        gen.contains("fentanyl") || gen.contains("tramadol") || gen.contains("hydrocodone")) {
                        matches = true;
                    }
                }

                if (matches) {
                    alerts.add(CdssAlert.builder()
                            .type("DRUG_ALLERGY")
                            .severity("CONTRAINDICATED")
                            .medicineName(getDisplayName(med))
                            .conflictingFactor("Documented Allergy: " + rawToken.trim())
                            .description("Prescribed medication is directly contraindicated due to patient's recorded allergy to " + rawToken.trim() + ".")
                            .clinicalRecommendation("Do NOT dispense. Contact prescriber to substitute with a non-cross-reactive clinical alternative.")
                            .requiresOverrideReason(true)
                            .build());
                }
            }
        }
    }

    private void checkDrugPairInteraction(Medicine m1, Medicine m2, List<CdssAlert> alerts) {
        String name1 = (m1.getGenericName() + " " + m1.getBrandName()).toLowerCase();
        String name2 = (m2.getGenericName() + " " + m2.getBrandName()).toLowerCase();

        // 1. Warfarin / Heparin + NSAIDs (Aspirin, Ibuprofen, Naproxen, Ketorolac, Diclofenac)
        if (isAnticoagulant(name1) && isNsaid(name2) || isAnticoagulant(name2) && isNsaid(name1)) {
            alerts.add(CdssAlert.builder()
                    .type("DRUG_INTERACTION")
                    .severity("CONTRAINDICATED")
                    .medicineName(getDisplayName(m1) + " + " + getDisplayName(m2))
                    .conflictingFactor("Anticoagulant + NSAID Co-administration")
                    .description("Synergistic antiplatelet and anticoagulant effects drastically increase major gastrointestinal hemorrhage and bleeding.")
                    .clinicalRecommendation("Absolute clinical contraindication. Substitute NSAID with Acetaminophen/Paracetamol.")
                    .requiresOverrideReason(true)
                    .build());
        }

        // 2. Nitroglycerin / Nitrates + PDE-5 Inhibitors (Sildenafil, Tadalafil, Vardenafil)
        if (isNitrate(name1) && isPde5(name2) || isNitrate(name2) && isPde5(name1)) {
            alerts.add(CdssAlert.builder()
                    .type("DRUG_INTERACTION")
                    .severity("CONTRAINDICATED")
                    .medicineName(getDisplayName(m1) + " + " + getDisplayName(m2))
                    .conflictingFactor("Nitrate + PDE5 Inhibitor")
                    .description("Co-administration triggers massive cGMP-mediated vasodilation leading to life-threatening refractory hypotension.")
                    .clinicalRecommendation("Contraindicated. Withhold PDE-5 inhibitor or select non-nitrate antianginal management.")
                    .requiresOverrideReason(true)
                    .build());
        }

        // 3. Opioids + Benzodiazepines (Diazepam, Lorazepam, Alprazolam, Clonazepam)
        if (isOpioid(name1) && isBenzo(name2) || isOpioid(name2) && isBenzo(name1)) {
            alerts.add(CdssAlert.builder()
                    .type("DRUG_INTERACTION")
                    .severity("CONTRAINDICATED")
                    .medicineName(getDisplayName(m1) + " + " + getDisplayName(m2))
                    .conflictingFactor("Opioid + Benzodiazepine (FDA Black Box Warning)")
                    .description("Concomitant administration causes severe CNS depression, respiratory depression, coma, and fatal overdose.")
                    .clinicalRecommendation("FDA Black Box Warning. Limit dosage/duration. Ensure Naloxone emergency antidote is available.")
                    .requiresOverrideReason(true)
                    .build());
        }

        // 4. ACE Inhibitors (Lisinopril, Enalapril, Ramipril) + Potassium-Sparing Diuretics (Spironolactone)
        if (isAceInhibitor(name1) && isPotassiumSparing(name2) || isAceInhibitor(name2) && isPotassiumSparing(name1)) {
            alerts.add(CdssAlert.builder()
                    .type("DRUG_INTERACTION")
                    .severity("MAJOR")
                    .medicineName(getDisplayName(m1) + " + " + getDisplayName(m2))
                    .conflictingFactor("ACE Inhibitor + Potassium-sparing Agent")
                    .description("Synergistic potassium retention significantly increases risk of severe life-threatening hyperkalemia.")
                    .clinicalRecommendation("Monitor serum potassium and serum creatinine within 3-7 days of initiation.")
                    .requiresOverrideReason(true)
                    .build());
        }

        // 5. Statins (Simvastatin, Atorvastatin) + Macrolides (Clarithromycin, Erythromycin)
        if (isStatin(name1) && isMacrolide(name2) || isStatin(name2) && isMacrolide(name1)) {
            alerts.add(CdssAlert.builder()
                    .type("DRUG_INTERACTION")
                    .severity("MAJOR")
                    .medicineName(getDisplayName(m1) + " + " + getDisplayName(m2))
                    .conflictingFactor("Statin + Strong CYP3A4 Inhibitor")
                    .description("Inhibition of CYP3A4 causes systemic statin elevation, drastically escalating risk of rhabdomyolysis.")
                    .clinicalRecommendation("Temporarily suspend statin during antibiotic therapy or substitute with Azithromycin.")
                    .requiresOverrideReason(true)
                    .build());
        }

        // 6. Fluoroquinolones (Ciprofloxacin, Levofloxacin) + Corticosteroids (Prednisone, Dexamethasone)
        if (isFluoroquinolone(name1) && isCorticosteroid(name2) || isFluoroquinolone(name2) && isCorticosteroid(name1)) {
            alerts.add(CdssAlert.builder()
                    .type("DRUG_INTERACTION")
                    .severity("MODERATE")
                    .medicineName(getDisplayName(m1) + " + " + getDisplayName(m2))
                    .conflictingFactor("Fluoroquinolone + Systemic Corticosteroid")
                    .description("Elevated risk of severe tendinitis and Achilles tendon rupture, especially in older adults.")
                    .clinicalRecommendation("Counsel patient to discontinue immediately and notify physician if tendon pain occurs.")
                    .requiresOverrideReason(false)
                    .build());
        }
    }

    private void checkPriorActiveOrdersInteractions(MedicationOrder currentOrder, List<Medicine> orderMedicines,
                                                   UUID organizationId, List<CdssAlert> alerts) {
        List<MedicationOrder> priorOrders = orderRepository.findByOrganizationId(organizationId);
        for (MedicationOrder prior : priorOrders) {
            if (currentOrder.getId() != null && currentOrder.getId().equals(prior.getId())) continue;
            if (!Objects.equals(currentOrder.getPatientReference(), prior.getPatientReference())) continue;
            // Only active/approved/received orders
            if ("FULFILLED".equalsIgnoreCase(prior.getStatus()) || "APPROVED".equalsIgnoreCase(prior.getStatus()) || "RECEIVED".equalsIgnoreCase(prior.getStatus())) {
                if (prior.getItems() != null) {
                    for (MedicationOrderItem priorItem : prior.getItems()) {
                        if (priorItem.getMedicine() != null) {
                            for (Medicine currentMed : orderMedicines) {
                                checkDrugPairInteraction(currentMed, priorItem.getMedicine(), alerts);
                            }
                        }
                    }
                }
            }
        }
    }

    private Optional<Patient> findPatientByReference(String ref, UUID organizationId) {
        if (ref == null || ref.isBlank()) return Optional.empty();
        String cleanRef = ref.trim().toLowerCase();
        List<Patient> patients = patientRepository.findByOrganizationId(organizationId);
        return patients.stream()
                .filter(p -> (p.getMrn() != null && cleanRef.contains(p.getMrn().toLowerCase())) ||
                             (p.getName() != null && cleanRef.contains(p.getName().toLowerCase())) ||
                             (p.getId() != null && cleanRef.contains(p.getId().toString().toLowerCase())))
                .findFirst();
    }

    private String getDisplayName(Medicine m) {
        if (m == null) return "Unknown Medicine";
        String brand = m.getBrandName() != null ? m.getBrandName() : "";
        String generic = m.getGenericName() != null ? m.getGenericName() : "";
        if (!brand.isEmpty() && !generic.isEmpty()) return brand + " (" + generic + ")";
        return !brand.isEmpty() ? brand : generic;
    }

    // Helper classifiers
    private boolean isAnticoagulant(String s) {
        return s.contains("warfarin") || s.contains("heparin") || s.contains("enoxaparin") || s.contains("rivaroxaban") || s.contains("apixaban");
    }

    private boolean isNsaid(String s) {
        return s.contains("aspirin") || s.contains("ibuprofen") || s.contains("naproxen") ||
                s.contains("ketorolac") || s.contains("diclofenac") || s.contains("celecoxib") || s.contains("meloxicam");
    }

    private boolean isNitrate(String s) {
        return s.contains("nitroglycerin") || s.contains("isosorbide") || s.contains("nitrostat") || s.contains("nitrate");
    }

    private boolean isPde5(String s) {
        return s.contains("sildenafil") || s.contains("tadalafil") || s.contains("vardenafil") || s.contains("viagra") || s.contains("cialis");
    }

    private boolean isOpioid(String s) {
        return s.contains("morphine") || s.contains("oxycodone") || s.contains("fentanyl") ||
                s.contains("codeine") || s.contains("tramadol") || s.contains("hydrocodone") || s.contains("hydromorphone");
    }

    private boolean isBenzo(String s) {
        return s.contains("diazepam") || s.contains("lorazepam") || s.contains("alprazolam") ||
                s.contains("clonazepam") || s.contains("midazolam") || s.contains("valium") || s.contains("xanax") || s.contains("ativan");
    }

    private boolean isAceInhibitor(String s) {
        return s.contains("lisinopril") || s.contains("enalapril") || s.contains("ramipril") || s.contains("captopril") || s.contains("losartan");
    }

    private boolean isPotassiumSparing(String s) {
        return s.contains("spironolactone") || s.contains("eplerenone") || s.contains("amiloride") || s.contains("triamterene");
    }

    private boolean isStatin(String s) {
        return s.contains("atorvastatin") || s.contains("simvastatin") || s.contains("rosuvastatin") || s.contains("pravastatin");
    }

    private boolean isMacrolide(String s) {
        return s.contains("clarithromycin") || s.contains("erythromycin");
    }

    private boolean isFluoroquinolone(String s) {
        return s.contains("ciprofloxacin") || s.contains("levofloxacin") || s.contains("moxifloxacin");
    }

    private boolean isCorticosteroid(String s) {
        return s.contains("prednisone") || s.contains("dexamethasone") || s.contains("hydrocortisone") || s.contains("methylprednisolone");
    }
}

