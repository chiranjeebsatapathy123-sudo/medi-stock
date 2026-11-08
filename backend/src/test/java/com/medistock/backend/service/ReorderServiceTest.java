package com.medistock.backend.service;

import com.medistock.backend.dto.procurement.StockoutRiskAnalysis;
import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReorderServiceTest {

    @Mock
    private MedicineRepository medicineRepository;
    @Mock
    private BatchRepository batchRepository;
    @Mock
    private InventoryTransactionRepository transactionRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private PurchaseRequestRepository purchaseRequestRepository;
    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;
    @Mock
    private AuditService auditService;

    private ReorderService reorderService;
    private final UUID orgId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        reorderService = new ReorderService(
                medicineRepository, batchRepository, transactionRepository,
                supplierRepository, purchaseRequestRepository, purchaseOrderRepository, auditService
        );
    }

    @Test
    void testAnalyzeStockoutRisk_DetectsCriticalStockout() {
        Medicine med = new Medicine();
        med.setId(UUID.randomUUID());
        med.setGenericName("Insulin Glargine");
        med.setBrandName("Lantus 100U");
        med.setReorderLevel(50);
        med.setSafetyStock(20);
        med.setMaximumStock(200);

        when(medicineRepository.findByOrganizationId(orgId)).thenReturn(List.of(med));
        when(batchRepository.findByMedicineOrganizationId(orgId)).thenReturn(List.of()); // 0 stock
        when(supplierRepository.findByOrganizationId(orgId)).thenReturn(List.of());
        when(transactionRepository.findByOrganizationIdOrderByTimestampDesc(orgId)).thenReturn(List.of());

        List<StockoutRiskAnalysis> analysis = reorderService.analyzeStockoutRisk(orgId);

        assertNotNull(analysis);
        assertEquals(1, analysis.size());
        StockoutRiskAnalysis item = analysis.get(0);
        assertEquals("CRITICAL_STOCKOUT", item.getRiskLevel());
        assertEquals(0, item.getCurrentStock());
        assertEquals(200, item.getRecommendedReorderQuantity());
    }

    @Test
    void testTriggerAutonomousReorder_GeneratesPurchaseRequest() {
        Medicine med = new Medicine();
        med.setId(UUID.randomUUID());
        med.setBrandName("Amoxil 500mg");
        med.setReorderLevel(30);
        med.setMaximumStock(150);

        when(medicineRepository.findByOrganizationId(orgId)).thenReturn(List.of(med));
        when(medicineRepository.findById(med.getId())).thenReturn(Optional.of(med));
        when(batchRepository.findByMedicineOrganizationId(orgId)).thenReturn(List.of()); // 0 stock
        when(supplierRepository.findByOrganizationId(orgId)).thenReturn(List.of());
        when(transactionRepository.findByOrganizationIdOrderByTimestampDesc(orgId)).thenReturn(List.of());

        when(purchaseRequestRepository.save(any(PurchaseRequest.class))).thenAnswer(inv -> {
            PurchaseRequest pr = inv.getArgument(0);
            pr.setId(UUID.randomUUID());
            return pr;
        });

        PurchaseRequest result = reorderService.triggerAutonomousReorder(orgId, userId);

        assertNotNull(result);
        assertEquals("EMERGENCY_STOCKOUT", result.getPriority());
        assertEquals("SUBMITTED", result.getStatus());
        assertEquals(1, result.getItems().size());
        assertEquals(150, result.getItems().get(0).getRequestedQuantity());
    }

    @Test
    void testConvertRequestToPO_CreatesApprovedPurchaseOrder() {
        UUID reqId = UUID.randomUUID();
        Medicine med = new Medicine();
        med.setId(UUID.randomUUID());
        med.setBrandName("Cipro 500mg");

        Supplier supplier = new Supplier();
        supplier.setId(UUID.randomUUID());
        supplier.setName("Bayer Healthcare");
        supplier.setLeadTimeDays(4);

        PurchaseRequest pr = new PurchaseRequest();
        pr.setId(reqId);
        pr.setOrganizationId(orgId);
        pr.setStatus("SUBMITTED");

        PurchaseRequestItem item = new PurchaseRequestItem();
        item.setMedicine(med);
        item.setRequestedQuantity(100);
        item.setPreferredSupplier(supplier);
        pr.setItems(List.of(item));

        when(purchaseRequestRepository.findByIdAndOrganizationId(reqId, orgId)).thenReturn(Optional.of(pr));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(inv -> {
            PurchaseOrder po = inv.getArgument(0);
            po.setId(UUID.randomUUID());
            return po;
        });

        PurchaseOrder po = reorderService.convertRequestToPO(reqId, orgId, userId);

        assertNotNull(po);
        assertEquals("APPROVED", po.getStatus());
        assertEquals(supplier, po.getSupplier());
        assertEquals(1, po.getItems().size());
        assertEquals(100, po.getItems().get(0).getQuantity());
        assertEquals("CONVERTED_TO_PO", pr.getStatus());
    }
}

