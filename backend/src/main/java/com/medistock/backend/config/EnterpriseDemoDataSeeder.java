package com.medistock.backend.config;

import com.medistock.backend.entity.*;
import com.medistock.backend.entity.pharmacy.MedicationOrder;
import com.medistock.backend.entity.pharmacy.MedicationOrderItem;
import com.medistock.backend.repository.*;
import com.medistock.backend.repository.pharmacy.MedicationOrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Component
@Order(2)
public class EnterpriseDemoDataSeeder implements CommandLineRunner {

    public static final UUID DEFAULT_ORG_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    private final JdbcTemplate jdbcTemplate;
    private final OrganizationRepository organizationRepository;
    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final PatientRepository patientRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseLocationRepository warehouseLocationRepository;
    private final UserRepository userRepository;
    private final MedicationOrderRepository medicationOrderRepository;
    private final PurchaseOrderRepository poRepository;
    private final GRNRepository grnRepository;
    private final InvoiceRepository invoiceRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public EnterpriseDemoDataSeeder(
            JdbcTemplate jdbcTemplate,
            OrganizationRepository organizationRepository,
            MedicineRepository medicineRepository,
            BatchRepository batchRepository,
            PatientRepository patientRepository,
            SupplierRepository supplierRepository,
            WarehouseLocationRepository warehouseLocationRepository,
            UserRepository userRepository,
            MedicationOrderRepository medicationOrderRepository,
            PurchaseOrderRepository poRepository,
            GRNRepository grnRepository,
            InvoiceRepository invoiceRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.organizationRepository = organizationRepository;
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.patientRepository = patientRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseLocationRepository = warehouseLocationRepository;
        this.userRepository = userRepository;
        this.medicationOrderRepository = medicationOrderRepository;
        this.poRepository = poRepository;
        this.grnRepository = grnRepository;
        this.invoiceRepository = invoiceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedDemoData(false);
    }

    @Transactional
    public Map<String, Object> seedDemoData(boolean force) {
        // 1. Ensure Organization exists via native insert
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM organizations WHERE id = ?", Integer.class, DEFAULT_ORG_ID);
        if (count == null || count == 0) {
            jdbcTemplate.update(
                    "INSERT INTO organizations (id, name, code, status, address, contact, email, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                    DEFAULT_ORG_ID, "Medistock Enterprise - St. Jude Health", "STJUDE-METRO", "ACTIVE",
                    "100 Healthcare Blvd, NY", "+1 (800) 555-0199", "pharmacy-ops@stjude-health.org"
            );
        }

        Organization org = organizationRepository.findById(DEFAULT_ORG_ID).orElseThrow();

        // 2. Ensure Admin & Pharmacist users exist for login
        User admin = userRepository.findByEmail("admin@medistock.com").orElseGet(() -> {
            User u = new User();
            u.setOrganization(org);
            u.setName("Dr. Sarah Mitchell, Chief Medical Officer");
            u.setEmail("admin@medistock.com");
            u.setPasswordHash(passwordEncoder.encode("admin123"));
            u.setRole(Role.SUPER_ADMIN);
            u.setStatus("ACTIVE");
            u.setPhone("+1 (555) 019-2831");
            return userRepository.save(u);
        });

        User pharm = userRepository.findByEmail("pharmacist@medistock.com").orElseGet(() -> {
            User u = new User();
            u.setOrganization(org);
            u.setName("Robert Chen, Lead Clinical Pharmacist (PharmD)");
            u.setEmail("pharmacist@medistock.com");
            u.setPasswordHash(passwordEncoder.encode("pharma123"));
            u.setRole(Role.PHARMACIST);
            u.setStatus("ACTIVE");
            u.setPhone("+1 (555) 019-2832");
            return userRepository.save(u);
        });

        // 3. Ensure Suppliers
        Supplier pfizer = getOrCreateSupplier(DEFAULT_ORG_ID, "SUP-PFZ-01", "Pfizer Global Supply", "orders@pfizer.com");
        Supplier novartis = getOrCreateSupplier(DEFAULT_ORG_ID, "SUP-NVS-02", "Novartis Pharmaceuticals", "b2b@novartis.com");
        Supplier astra = getOrCreateSupplier(DEFAULT_ORG_ID, "SUP-AZN-03", "AstraZeneca Biologics", "hospital@astrazeneca.com");
        Supplier teva = getOrCreateSupplier(DEFAULT_ORG_ID, "SUP-TEV-04", "Teva Generics North America", "orders@teva.com");

        // 4. Ensure Storage Locations
        List<WarehouseLocation> locations = warehouseLocationRepository.findAll();
        UUID standardLocId = locations.isEmpty() ? null : locations.get(0).getId();
        UUID coldLocId = locations.size() > 1 ? locations.get(1).getId() : standardLocId;

        // 5. Seed Clinical Medicine Catalog (18 essential clinical drugs)
        Medicine amx = createMed(org, "MED-AMX-500", "Amoxicillin Trihydrate", "Amoxil", "Antibiotic", "Capsule", "500 mg", "Teva Generics",
                "00312345678906", false, "NON_CONTROLLED", false, "Room Temp 15-25C", 300, 150, 1500, true);
        
        Medicine cef = createMed(org, "MED-CEF-1G", "Ceftriaxone Sodium", "Rocephin", "Antibiotic", "Injection Vial", "1 g", "Pfizer",
                "00312345678913", false, "NON_CONTROLLED", false, "Room Temp 15-25C", 200, 100, 1000, true);

        Medicine wrf = createMed(org, "MED-WRF-5MG", "Warfarin Sodium", "Coumadin", "Cardiovascular", "Tablet", "5 mg", "Novartis",
                "00312345678920", false, "NON_CONTROLLED", false, "Room Temp 15-25C", 400, 200, 2000, true);

        Medicine ibu = createMed(org, "MED-IBU-400", "Ibuprofen", "Motrin", "Analgesic", "Tablet", "400 mg", "Pfizer",
                "00312345678937", false, "NON_CONTROLLED", false, "Room Temp 15-25C", 600, 250, 3000, true);

        Medicine ins = createMed(org, "MED-INS-100", "Insulin Glargine", "Lantus SoloStar", "Endocrine", "Subcutaneous Pen", "100 U/mL", "AstraZeneca",
                "00312345678944", false, "NON_CONTROLLED", true, "2-8C COLD STORAGE", 120, 50, 600, true);

        Medicine mph = createMed(org, "MED-MPH-15", "Morphine Sulfate", "Infumorph", "Opioid Analgesic", "Injection Ampoule", "15 mg/mL", "Pfizer",
                "00312345678951", true, "SCHEDULE_II", false, "DEA Schedule II Vault", 80, 30, 400, true);

        Medicine lor = createMed(org, "MED-LOR-1MG", "Lorazepam", "Ativan", "Benzodiazepine", "Tablet", "1 mg", "Novartis",
                "00312345678968", true, "SCHEDULE_IV", false, "DEA Schedule IV Cabinet", 150, 60, 800, true);

        Medicine ntg = createMed(org, "MED-NTG-04", "Nitroglycerin Sublingual", "Nitrostat", "Cardiovascular", "Sublingual Tablet", "0.4 mg", "Pfizer",
                "00312345678975", false, "NON_CONTROLLED", false, "Room Temp 15-25C", 100, 40, 500, true);

        Medicine ato = createMed(org, "MED-ATO-40", "Atorvastatin Calcium", "Lipitor", "Cardiovascular", "Tablet", "40 mg", "Pfizer",
                "00312345678982", false, "NON_CONTROLLED", false, "Room Temp 15-25C", 500, 200, 2500, true);

        Medicine azi = createMed(org, "MED-AZI-250", "Azithromycin", "Zithromax", "Antibiotic", "Tablet", "250 mg", "Teva Generics",
                "00312345678999", false, "NON_CONTROLLED", false, "Room Temp 15-25C", 350, 150, 1800, true);

        Medicine epi = createMed(org, "MED-EPI-1", "Epinephrine Auto-Injector", "EpiPen", "Emergency", "Auto-Injector", "0.3 mg", "Teva Generics",
                "00312345678807", false, "NON_CONTROLLED", false, "Room Temp 20-25C (Do Not Freeze)", 50, 25, 200, true);

        Medicine vac = createMed(org, "MED-VAC-COV", "Covid-19 mRNA Vaccine", "Comirnaty", "Vaccine", "Multi-Dose Vial", "30 mcg/0.3mL", "Pfizer",
                "00312345678814", false, "NON_CONTROLLED", true, "2-8C COLD STORAGE", 200, 80, 1000, true);

        Medicine mtx = createMed(org, "MED-MTX-25", "Methotrexate Sodium", "Trexall", "Oncology", "Tablet", "2.5 mg", "Novartis",
                "00312345678890", false, "NON_CONTROLLED", false, "Room Temp 20-25C", 90, 40, 500, true);

        Medicine nep = createMed(org, "MED-NEP-4MG", "Norepinephrine Bitartrate", "Levophed", "Emergency", "Injection Ampoule", "4 mg/4mL", "Pfizer",
                "00312345678869", false, "NON_CONTROLLED", false, "Room Temp 20-25C", 70, 30, 300, true);

        Medicine atr = createMed(org, "MED-ATR-1MG", "Atropine Sulfate", "AtroPen", "Emergency", "Injection Vial", "1 mg/mL", "Pfizer",
                "00312345678876", false, "NON_CONTROLLED", false, "Room Temp 15-25C", 50, 20, 200, true);

        Medicine fnt = createMed(org, "MED-FNT-100", "Fentanyl Citrate", "Sublimaze", "Controlled Substance", "Injection Ampoule", "100 mcg/2mL", "Novartis",
                "00312345678883", true, "SCHEDULE_II", false, "DEA Schedule II Vault", 100, 40, 400, true);

        Medicine enox = createMed(org, "MED-ENOX-40", "Enoxaparin Sodium", "Lovenox", "Cardiovascular", "Injection Syringe", "40 mg/0.4mL", "AstraZeneca",
                "00312345678845", false, "NON_CONTROLLED", false, "Room Temp 15-30C", 250, 100, 1200, true);

        Medicine meto = createMed(org, "MED-METO-50", "Metoprolol Succinate ER", "Toprol-XL", "Cardiovascular", "Tablet", "50 mg", "AstraZeneca",
                "00312345678852", false, "NON_CONTROLLED", false, "Room Temp 15-25C", 300, 150, 1500, true);

        // 6. Seed Batches (FEFO priority lots, near expiry, quarantined, and recalled)
        LocalDate today = LocalDate.now();

        createBatch(amx, "AMX-2026-N1", teva.getId(), standardLocId, today.minusMonths(5), today.plusDays(14), 500, 220, 2.80, 5.50, "ACTIVE", false, false, null, null);
        createBatch(amx, "AMX-2027-A2", teva.getId(), standardLocId, today.minusMonths(1), today.plusMonths(18), 1000, 850, 2.75, 5.50, "ACTIVE", false, false, null, null);

        createBatch(cef, "CEF-2027-C1", pfizer.getId(), standardLocId, today.minusMonths(2), today.plusMonths(14), 400, 340, 14.50, 28.00, "ACTIVE", false, false, null, null);
        createBatch(cef, "LOT-REC-2026-99", pfizer.getId(), standardLocId, today.minusMonths(4), today.plusMonths(8), 200, 115, 14.50, 28.00, "RECALLED", false, true, "FDA Recall Class I - Microscopic particulate contamination", "CLASS_I");

        createBatch(wrf, "WRF-2027-W1", novartis.getId(), standardLocId, today.minusMonths(3), today.plusMonths(22), 800, 620, 4.20, 8.90, "ACTIVE", false, false, null, null);
        createBatch(ibu, "IBU-2027-B1", pfizer.getId(), standardLocId, today.minusMonths(2), today.plusMonths(26), 1500, 1340, 1.20, 3.50, "ACTIVE", false, false, null, null);

        createBatch(ins, "INS-2026-CR1", astra.getId(), coldLocId, today.minusMonths(1), today.plusMonths(12), 200, 165, 34.00, 68.00, "ACTIVE", false, false, null, null);
        createBatch(ins, "INS-2026-EXC", astra.getId(), coldLocId, today.minusMonths(3), today.plusMonths(9), 100, 45, 34.00, 68.00, "QUARANTINED", true, false, "Temperature excursion alert > 8.0C recorded by IoT sensor SenseNode-Alpha", null);

        createBatch(mph, "MPH-2027-C2", pfizer.getId(), standardLocId, today.minusMonths(1), today.plusMonths(20), 100, 82, 18.00, 45.00, "ACTIVE", false, false, null, null);
        createBatch(lor, "LOR-2027-C4", novartis.getId(), standardLocId, today.minusMonths(2), today.plusMonths(24), 300, 240, 3.50, 9.00, "ACTIVE", false, false, null, null);

        createBatch(ntg, "NTG-2027-N1", pfizer.getId(), standardLocId, today.minusMonths(2), today.plusMonths(16), 150, 125, 8.50, 19.00, "ACTIVE", false, false, null, null);
        createBatch(ato, "ATO-2027-L1", pfizer.getId(), standardLocId, today.minusMonths(4), today.plusMonths(20), 600, 480, 5.10, 12.00, "ACTIVE", false, false, null, null);
        createBatch(azi, "AZI-2027-Z1", teva.getId(), standardLocId, today.minusMonths(3), today.plusMonths(15), 450, 380, 4.80, 11.50, "ACTIVE", false, false, null, null);
        createBatch(epi, "EPI-2026-E1", teva.getId(), standardLocId, today.minusMonths(6), today.plusMonths(7), 60, 42, 65.00, 120.00, "ACTIVE", false, false, null, null);
        createBatch(vac, "VAC-2026-V1", pfizer.getId(), coldLocId, today.minusMonths(1), today.plusMonths(11), 300, 275, 24.00, 45.00, "ACTIVE", false, false, null, null);

        createBatch(mtx, "MTX-2027-M1", novartis.getId(), standardLocId, today.minusMonths(2), today.plusMonths(24), 100, 95, 12.00, 25.00, "ACTIVE", false, false, null, null);
        createBatch(nep, "NEP-2026-N2", pfizer.getId(), standardLocId, today.minusMonths(1), today.plusMonths(10), 80, 72, 28.00, 65.00, "ACTIVE", false, false, null, null);
        createBatch(fnt, "FNT-2027-F1", novartis.getId(), standardLocId, today.minusMonths(2), today.plusMonths(18), 120, 110, 22.00, 55.00, "ACTIVE", false, false, null, null);

        // 7. Seed Clinical Patients (demonstrating CDSS allergy & DDI safeguards)
        Patient p1 = seedPatient(org, "Marcus Aurelius", "MRN-100249", LocalDate.of(1978, 4, 12), "Male", "+1 (555) 234-5678", "m.aurelius@healthmail.com", "Severe Penicillin Allergy (Anaphylaxis)", "O+");
        Patient p2 = seedPatient(org, "Eleanor Rigby", "MRN-100250", LocalDate.of(1965, 9, 24), "Female", "+1 (555) 345-6789", "e.rigby@healthmail.com", "Sulfa Drugs, Aspirin", "A+");
        Patient p3 = seedPatient(org, "David Miller", "MRN-100251", LocalDate.of(1989, 11, 3), "Male", "+1 (555) 456-7890", "d.miller@healthmail.com", "None Documented", "B+");
        Patient p4 = seedPatient(org, "Sarah Jenkins", "MRN-100252", LocalDate.of(1992, 6, 18), "Female", "+1 (555) 567-8901", "s.jenkins@healthmail.com", "Codeine, NSAIDs", "AB+");

        // 8. Seed Clinical Medication Orders (CDSS Test Cases)
        seedDemoMedicationOrders(admin, amx, ibu, cef, mph);

        // 9. Seed B2B Procurement (Purchase Orders, GRNs, and 3-Way Match Invoices)
        seedDemoProcurement(org, admin, pfizer, novartis, astra, teva, amx, cef, wrf, ins);

        System.out.println(">>> [MediStock Pro] Successfully seeded enterprise catalog: 18 medicines, 18 batches, 4 patients, 4 demo orders, 3 POs, 4 Invoices.");
        return Map.of("status", "SUCCESS", "medicines", 18, "batches", 18, "patients", 4, "orders", 4, "purchaseOrders", 3, "invoices", 4);
    }

    private void seedDemoProcurement(Organization org, User user, Supplier pfizer, Supplier novartis, Supplier astra, Supplier teva,
                                     Medicine amx, Medicine cef, Medicine wrf, Medicine ins) {
        // PO 1: Ceftriaxone from Pfizer (Received with GRN and Matched Invoice)
        PurchaseOrder po1 = poRepository.findByOrganizationIdAndPoNumber(org.getId(), "PO-2026-8001").orElseGet(() -> {
            PurchaseOrder p = new PurchaseOrder();
            p.setOrganizationId(org.getId());
            p.setPoNumber("PO-2026-8001");
            p.setSupplier(pfizer);
            p.setOrderDate(LocalDate.now().minusDays(10));
            p.setExpectedDelivery(LocalDate.now().minusDays(3));
            p.setStatus("RECEIVED");
            p.setCreatedBy(user.getId());
            p.setSubtotal(5800.00);
            p.setTotal(5800.00);

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(p);
            item.setMedicine(cef);
            item.setQuantity(400);
            item.setReceivedQuantity(400);
            item.setUnitPrice(14.50);
            item.setTotalPrice(5800.00);
            item.setStatus("RECEIVED");
            p.setItems(new ArrayList<>(List.of(item)));
            return poRepository.save(p);
        });

        // GRN 1 for PO 1
        if (grnRepository.findByPurchaseOrderId(po1.getId()).isEmpty()) {
            GRN grn1 = new GRN();
            grn1.setOrganizationId(org.getId());
            grn1.setPurchaseOrder(po1);
            grn1.setGrnNumber("GRN-2026-4001");
            grn1.setReceivedBy(user.getId());
            grn1.setStatus("COMPLETED");
            grn1.setNotes("Inspected and accepted all 400 vials.");

            GRNItem grnItem = new GRNItem();
            grnItem.setGrn(grn1);
            grnItem.setPurchaseOrderItem(po1.getItems().get(0));
            grnItem.setMedicine(cef);
            grnItem.setReceivedQuantity(400);
            grnItem.setAcceptedQuantity(400);
            grnItem.setQualityStatus("ACCEPTED");
            grn1.setItems(new ArrayList<>(List.of(grnItem)));
            grnRepository.save(grn1);
        }

        // Invoice 1: Perfectly matched
        if (invoiceRepository.findByOrganizationId(org.getId()).stream().noneMatch(i -> "INV-PFZ-9901".equals(i.getInvoiceNumber()))) {
            Invoice inv1 = new Invoice();
            inv1.setOrganization(org);
            inv1.setSupplier(pfizer);
            inv1.setPurchaseOrder(po1);
            inv1.setInvoiceNumber("INV-PFZ-9901");
            inv1.setAmount(new BigDecimal("5800.00"));
            inv1.setStatus("PENDING");
            inv1.setNotes("PO-2026-8001 Delivery - 400 vials Rocephin");

            InvoiceItem invItem = new InvoiceItem();
            invItem.setInvoice(inv1);
            invItem.setDescription("Ceftriaxone Sodium 1g Injection Vial");
            invItem.setQuantity(400);
            invItem.setUnitPrice(new BigDecimal("14.50"));
            invItem.setTotalPrice(new BigDecimal("5800.00"));
            inv1.setItems(new ArrayList<>(List.of(invItem)));
            invoiceRepository.save(inv1);
        }

        // PO 2: Amoxicillin from Teva (Received, Invoice with Price Variance Discrepancy)
        PurchaseOrder po2 = poRepository.findByOrganizationIdAndPoNumber(org.getId(), "PO-2026-8002").orElseGet(() -> {
            PurchaseOrder p = new PurchaseOrder();
            p.setOrganizationId(org.getId());
            p.setPoNumber("PO-2026-8002");
            p.setSupplier(teva);
            p.setOrderDate(LocalDate.now().minusDays(5));
            p.setExpectedDelivery(LocalDate.now().minusDays(1));
            p.setStatus("RECEIVED");
            p.setCreatedBy(user.getId());
            p.setSubtotal(2750.00);
            p.setTotal(2750.00);

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(p);
            item.setMedicine(amx);
            item.setQuantity(1000);
            item.setReceivedQuantity(1000);
            item.setUnitPrice(2.75);
            item.setTotalPrice(2750.00);
            item.setStatus("RECEIVED");
            p.setItems(new ArrayList<>(List.of(item)));
            return poRepository.save(p);
        });

        // Ensure PO 2 has items marked received if already created in database
        if (po2.getItems() != null && !po2.getItems().isEmpty() && po2.getItems().get(0).getReceivedQuantity() < 1000) {
            po2.getItems().get(0).setReceivedQuantity(1000);
            po2.getItems().get(0).setStatus("RECEIVED");
            po2.setStatus("RECEIVED");
            poRepository.save(po2);
        }

        // GRN 2 for PO 2
        if (grnRepository.findByPurchaseOrderId(po2.getId()).isEmpty()) {
            GRN grn2 = new GRN();
            grn2.setOrganizationId(org.getId());
            grn2.setPurchaseOrder(po2);
            grn2.setGrnNumber("GRN-2026-4002");
            grn2.setReceivedBy(user.getId());
            grn2.setStatus("COMPLETED");
            grn2.setNotes("Inspected and accepted all 1000 capsules at central warehouse.");

            GRNItem grnItem2 = new GRNItem();
            grnItem2.setGrn(grn2);
            grnItem2.setPurchaseOrderItem(po2.getItems().get(0));
            grnItem2.setMedicine(amx);
            grnItem2.setReceivedQuantity(1000);
            grnItem2.setAcceptedQuantity(1000);
            grnItem2.setQualityStatus("ACCEPTED");
            grn2.setItems(new ArrayList<>(List.of(grnItem2)));
            grnRepository.save(grn2);
        }

        // Invoice 2: Price variance discrepancy ($3.20/unit instead of $2.75 contract)
        if (invoiceRepository.findByOrganizationId(org.getId()).stream().noneMatch(i -> "INV-TEV-9902".equals(i.getInvoiceNumber()))) {
            Invoice inv2 = new Invoice();
            inv2.setOrganization(org);
            inv2.setSupplier(teva);
            inv2.setPurchaseOrder(po2);
            inv2.setInvoiceNumber("INV-TEV-9902");
            inv2.setAmount(new BigDecimal("3200.00"));
            inv2.setStatus("PENDING");
            inv2.setNotes("PO-2026-8002 Expedited Billing - 1000 capsules Amoxil");

            InvoiceItem invItem2 = new InvoiceItem();
            invItem2.setInvoice(inv2);
            invItem2.setDescription("Amoxicillin Trihydrate 500mg");
            invItem2.setQuantity(1000);
            invItem2.setUnitPrice(new BigDecimal("3.20"));
            invItem2.setTotalPrice(new BigDecimal("3200.00"));
            inv2.setItems(new ArrayList<>(List.of(invItem2)));
            invoiceRepository.save(inv2);
        }

        // PO 3: Insulin from AstraZeneca (Partial delivery: 100 received out of 200)
        PurchaseOrder po3 = poRepository.findByOrganizationIdAndPoNumber(org.getId(), "PO-2026-8003").orElseGet(() -> {
            PurchaseOrder p = new PurchaseOrder();
            p.setOrganizationId(org.getId());
            p.setPoNumber("PO-2026-8003");
            p.setSupplier(astra);
            p.setOrderDate(LocalDate.now().minusDays(7));
            p.setExpectedDelivery(LocalDate.now().minusDays(1));
            p.setStatus("PARTIALLY_RECEIVED");
            p.setCreatedBy(user.getId());
            p.setSubtotal(6800.00);
            p.setTotal(6800.00);

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(p);
            item.setMedicine(ins);
            item.setQuantity(200);
            item.setReceivedQuantity(100);
            item.setUnitPrice(34.00);
            item.setTotalPrice(6800.00);
            item.setStatus("PARTIALLY_RECEIVED");
            p.setItems(new ArrayList<>(List.of(item)));
            return poRepository.save(p);
        });

        // GRN 3: only 100 units received
        if (grnRepository.findByPurchaseOrderId(po3.getId()).isEmpty()) {
            GRN grn3 = new GRN();
            grn3.setOrganizationId(org.getId());
            grn3.setPurchaseOrder(po3);
            grn3.setGrnNumber("GRN-2026-4003");
            grn3.setReceivedBy(user.getId());
            grn3.setStatus("PARTIAL");
            grn3.setNotes("Partial cold-chain shipment. 100 pens received, 100 pens backordered.");

            GRNItem grnItem3 = new GRNItem();
            grnItem3.setGrn(grn3);
            grnItem3.setPurchaseOrderItem(po3.getItems().get(0));
            grnItem3.setMedicine(ins);
            grnItem3.setReceivedQuantity(100);
            grnItem3.setAcceptedQuantity(100);
            grnItem3.setQualityStatus("ACCEPTED");
            grn3.setItems(new ArrayList<>(List.of(grnItem3)));
            grnRepository.save(grn3);
        }

        // Invoice 3: Invoiced for full 200 units ($6,800) -> Quantity Mismatch Exception
        if (invoiceRepository.findByOrganizationId(org.getId()).stream().noneMatch(i -> "INV-AZN-9903".equals(i.getInvoiceNumber()))) {
            Invoice inv3 = new Invoice();
            inv3.setOrganization(org);
            inv3.setSupplier(astra);
            inv3.setPurchaseOrder(po3);
            inv3.setInvoiceNumber("INV-AZN-9903");
            inv3.setAmount(new BigDecimal("6800.00"));
            inv3.setStatus("PENDING");
            inv3.setNotes("PO-2026-8003 Full Advance Billing - 200 pens Lantus SoloStar");

            InvoiceItem invItem3 = new InvoiceItem();
            invItem3.setInvoice(inv3);
            invItem3.setDescription("Insulin Glargine 100 U/mL");
            invItem3.setQuantity(200);
            invItem3.setUnitPrice(new BigDecimal("34.00"));
            invItem3.setTotalPrice(new BigDecimal("6800.00"));
            inv3.setItems(new ArrayList<>(List.of(invItem3)));
            invoiceRepository.save(inv3);
        }

        // Invoice 4: Warfarin from Novartis
        if (invoiceRepository.findByOrganizationId(org.getId()).stream().noneMatch(i -> "INV-NVS-9904".equals(i.getInvoiceNumber()))) {
            Invoice inv4 = new Invoice();
            inv4.setOrganization(org);
            inv4.setSupplier(novartis);
            inv4.setInvoiceNumber("INV-NVS-9904");
            inv4.setAmount(new BigDecimal("3360.00"));
            inv4.setStatus("PENDING");
            inv4.setNotes("Direct vendor billing - Coumadin 5mg tablets");

            InvoiceItem invItem4 = new InvoiceItem();
            invItem4.setInvoice(inv4);
            invItem4.setDescription("Warfarin Sodium 5mg");
            invItem4.setQuantity(800);
            invItem4.setUnitPrice(new BigDecimal("4.20"));
            invItem4.setTotalPrice(new BigDecimal("3360.00"));
            inv4.setItems(new ArrayList<>(List.of(invItem4)));
            invoiceRepository.save(inv4);
        }
    }

    private void seedDemoMedicationOrders(User prescriber, Medicine amx, Medicine ibu, Medicine cef, Medicine mph) {
        // Order 1: Marcus Aurelius + Amoxicillin (Penicillin Anaphylaxis CDSS Block)
        createOrderIfNotExists("RX-2026-9001", "Marcus Aurelius (MRN-100249)", "Dr. Robert Harrison, MD",
                "RECEIVED", "STAT", "Patient admitted with acute bacterial sinusitis.", prescriber.getId(),
                amx, 10, "Take 1 capsule by mouth every 8 hours for 7 days");

        // Order 2: Eleanor Rigby + Ibuprofen (Warfarin DDI Major Bleed Risk)
        createOrderIfNotExists("RX-2026-9002", "Eleanor Rigby (MRN-100250)", "Dr. Elena Rostova, MD (Cardiology)",
                "RECEIVED", "ROUTINE", "Acute osteoarthritis joint flare-up.", prescriber.getId(),
                ibu, 20, "Take 1 tablet every 6-8 hours with food as needed for pain");

        // Order 3: David Miller + Ceftriaxone (Approved, Ready for Dispensing)
        createOrderIfNotExists("RX-2026-9003", "David Miller (MRN-100251)", "Dr. Sarah Mitchell, Chief Medical Officer",
                "APPROVED", "URGENT", "Post-operative surgical infection prophylaxis.", prescriber.getId(),
                cef, 4, "Administer 1g IV piggyback every 24 hours");

        // Order 4: Sarah Jenkins + Morphine Sulfate (Schedule II Controlled Substance)
        createOrderIfNotExists("RX-2026-9004", "Sarah Jenkins (MRN-100252)", "Dr. Marcus Vance, MD (Anesthesiology)",
                "RECEIVED", "STAT", "Post-thoracotomy surgical pain management. Controlled substance protocol.", prescriber.getId(),
                mph, 2, "2mg IV bolus every 3-4 hours PRN breakthrough pain");
    }

    private void createOrderIfNotExists(String orderNumber, String patientRef, String prescriberRef,
                                       String status, String priority, String notes, UUID createdBy,
                                       Medicine medicine, int qty, String instructions) {
        if (medicationOrderRepository.findByOrganizationIdAndOrderNumber(DEFAULT_ORG_ID, orderNumber).isEmpty()) {
            MedicationOrder order = new MedicationOrder();
            order.setOrganizationId(DEFAULT_ORG_ID);
            order.setOrderNumber(orderNumber);
            order.setPatientReference(patientRef);
            order.setPrescriberReference(prescriberRef);
            order.setStatus(status);
            order.setPriority(priority);
            order.setNotes(notes);
            order.setCreatedBy(createdBy);

            MedicationOrderItem item = new MedicationOrderItem();
            item.setOrder(order);
            item.setMedicine(medicine);
            item.setRequestedQuantity(qty);
            item.setApprovedQuantity("APPROVED".equals(status) ? qty : 0);
            item.setDispensedQuantity(0);
            item.setInstructions(instructions);
            item.setStatus("APPROVED".equals(status) ? "APPROVED" : "PENDING");

            order.setItems(new ArrayList<>(List.of(item)));
            medicationOrderRepository.save(order);
        }
    }

    private Supplier getOrCreateSupplier(UUID tenantId, String code, String name, String email) {
        return supplierRepository.findByOrganizationId(tenantId).stream()
                .filter(s -> code.equals(s.getSupplierCode()))
                .findFirst()
                .orElseGet(() -> {
                    Supplier s = new Supplier();
                    s.setOrganizationId(tenantId);
                    s.setSupplierCode(code);
                    s.setName(name);
                    s.setEmail(email);
                    s.setContactPerson("Commercial Operations");
                    s.setPhone("+1 (800) 555-1000");
                    s.setStatus("ACTIVE");
                    return supplierRepository.save(s);
                });
    }

    private Medicine createMed(Organization org, String code, String generic, String brand, String cat, String form, String str, String mfr,
                              String gtin, boolean ctrl, String schedule, boolean tempSens, String storage, int reorder, int safety, int max, boolean rx) {
        return medicineRepository.findByOrganizationId(org.getId()).stream()
                .filter(m -> code.equalsIgnoreCase(m.getMedicineCode()))
                .findFirst()
                .orElseGet(() -> {
                    Medicine m = new Medicine();
                    m.setOrganization(org);
                    m.setMedicineCode(code);
                    m.setGenericName(generic);
                    m.setBrandName(brand);
                    m.setCategory(cat);
                    m.setDosageForm(form);
                    m.setStrength(str);
                    m.setManufacturer(mfr);
                    m.setGtin(gtin);
                    m.setControlledMedicine(ctrl);
                    m.setDeaSchedule(schedule);
                    m.setTemperatureSensitive(tempSens);
                    m.setStorageRequirement(storage);
                    m.setReorderLevel(reorder);
                    m.setSafetyStock(safety);
                    m.setMaximumStock(max);
                    m.setPrescriptionRequired(rx);
                    m.setActive(true);
                    m.setUnit("PACK");
                    return medicineRepository.save(m);
                });
    }

    private Batch createBatch(Medicine med, String batchNum, UUID supplierId, UUID locId, LocalDate mfg, LocalDate exp,
                              int recQty, int curQty, Double pPrice, Double sPrice, String status, boolean quar, boolean rec, String qReason, String rClass) {
        return batchRepository.findFirstByMedicineIdAndBatchNumberIgnoreCase(med.getId(), batchNum)
                .orElseGet(() -> {
                    Batch b = new Batch();
                    b.setMedicine(med);
                    b.setBatchNumber(batchNum);
                    b.setManufacturer(med.getManufacturer());
                    b.setSupplierId(supplierId);
                    b.setStorageLocationId(locId);
                    b.setManufacturingDate(mfg);
                    b.setExpiryDate(exp);
                    b.setReceivedQuantity(recQty);
                    b.setCurrentQuantity(curQty);
                    b.setPurchasePrice(pPrice);
                    b.setSellingPrice(sPrice);
                    b.setStatus(status);
                    b.setQuarantine(quar);
                    b.setRecall(rec);
                    b.setQuarantineReason(qReason);
                    b.setRecallReason(rec ? qReason : null);
                    b.setRecallClass(rClass);
                    b.setGtin(med.getGtin());
                    b.setSerialNumber("SN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    return batchRepository.save(b);
                });
    }

    private Patient seedPatient(Organization org, String name, String mrn, LocalDate dob, String gender, String phone, String email, String allergies, String blood) {
        return patientRepository.findByOrganizationId(org.getId()).stream()
                .filter(p -> mrn.equalsIgnoreCase(p.getMrn()))
                .findFirst()
                .orElseGet(() -> {
                    Patient p = new Patient();
                    p.setOrganization(org);
                    p.setName(name);
                    p.setMrn(mrn);
                    p.setDateOfBirth(dob);
                    p.setGender(gender);
                    p.setContactNumber(phone);
                    p.setEmail(email);
                    p.setAddress("Metropolitan District, NY");
                    p.setAllergies(allergies);
                    p.setBloodGroup(blood);
                    return patientRepository.save(p);
                });
    }
}
