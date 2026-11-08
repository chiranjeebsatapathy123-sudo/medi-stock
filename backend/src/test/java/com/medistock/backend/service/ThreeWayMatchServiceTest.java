package com.medistock.backend.service;

import com.medistock.backend.dto.procurement.ThreeWayMatchResult;
import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ThreeWayMatchServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private PurchaseOrderRepository poRepository;
    @Mock
    private GRNRepository grnRepository;
    @Mock
    private InvoiceExceptionRepository exceptionRepository;
    @Mock
    private AuditService auditService;

    private ThreeWayMatchService matchService;
    private final UUID orgId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        matchService = new ThreeWayMatchService(invoiceRepository, poRepository, grnRepository, exceptionRepository, auditService);
    }

    @Test
    void testPerfectThreeWayMatch() {
        UUID invoiceId = UUID.randomUUID();
        Medicine amox = new Medicine();
        amox.setId(UUID.randomUUID());
        amox.setGenericName("Amoxicillin");
        amox.setBrandName("Amoxil");

        PurchaseOrder po = new PurchaseOrder();
        po.setId(UUID.randomUUID());
        po.setPoNumber("PO-2026-001");
        Supplier supplier = new Supplier();
        supplier.setName("Pfizer Global");
        po.setSupplier(supplier);

        PurchaseOrderItem poItem = new PurchaseOrderItem();
        poItem.setMedicine(amox);
        poItem.setQuantity(100);
        poItem.setUnitPrice(15.00);
        poItem.setReceivedQuantity(100);
        po.setItems(List.of(poItem));

        GRN grn = new GRN();
        grn.setId(UUID.randomUUID());
        grn.setGrnNumber("GRN-2026-001");
        GRNItem grnItem = new GRNItem();
        grnItem.setMedicine(amox);
        grnItem.setReceivedQuantity(100);
        grnItem.setAcceptedQuantity(100);
        grn.setItems(List.of(grnItem));

        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setInvoiceNumber("INV-9901");
        invoice.setPurchaseOrder(po);
        invoice.setSupplier(supplier);

        InvoiceItem invItem = new InvoiceItem();
        invItem.setDescription("Amoxicillin (Amoxil)");
        invItem.setQuantity(100);
        invItem.setUnitPrice(BigDecimal.valueOf(15.00));
        invItem.setTotalPrice(BigDecimal.valueOf(1500.00));
        invoice.setItems(List.of(invItem));

        when(invoiceRepository.findByIdAndOrganizationId(invoiceId, orgId)).thenReturn(Optional.of(invoice));
        when(grnRepository.findByPurchaseOrderId(po.getId())).thenReturn(List.of(grn));

        ThreeWayMatchResult result = matchService.matchInvoice(invoiceId, orgId);

        assertNotNull(result);
        assertEquals("PERFECT_MATCH", result.getMatchStatus());
        assertTrue(result.isApprovedForPayment());
        assertEquals(0, BigDecimal.valueOf(1500.00).compareTo(result.getInvoiceTotal()));
        assertEquals(0, BigDecimal.ZERO.compareTo(result.getNetVariance()));
    }

    @Test
    void testQuantityDiscrepancy_OverbilledForUnreceivedGoods() {
        UUID invoiceId = UUID.randomUUID();
        Medicine med = new Medicine();
        med.setId(UUID.randomUUID());
        med.setGenericName("Ciprofloxacin");
        med.setBrandName("Cipro");

        PurchaseOrder po = new PurchaseOrder();
        po.setId(UUID.randomUUID());
        po.setPoNumber("PO-2026-002");

        PurchaseOrderItem poItem = new PurchaseOrderItem();
        poItem.setMedicine(med);
        poItem.setQuantity(100);
        poItem.setUnitPrice(20.00);
        po.setItems(List.of(poItem));

        // Warehouse only accepted 80 units
        GRN grn = new GRN();
        grn.setGrnNumber("GRN-2026-002");
        GRNItem grnItem = new GRNItem();
        grnItem.setMedicine(med);
        grnItem.setReceivedQuantity(100);
        grnItem.setAcceptedQuantity(80);
        grnItem.setRejectedQuantity(20);
        grn.setItems(List.of(grnItem));

        // Supplier invoiced full 100 units
        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setInvoiceNumber("INV-9902");
        invoice.setPurchaseOrder(po);

        InvoiceItem invItem = new InvoiceItem();
        invItem.setDescription("Ciprofloxacin (Cipro)");
        invItem.setQuantity(100);
        invItem.setUnitPrice(BigDecimal.valueOf(20.00));
        invItem.setTotalPrice(BigDecimal.valueOf(2000.00));
        invoice.setItems(List.of(invItem));

        when(invoiceRepository.findByIdAndOrganizationId(invoiceId, orgId)).thenReturn(Optional.of(invoice));
        when(grnRepository.findByPurchaseOrderId(po.getId())).thenReturn(List.of(grn));

        ThreeWayMatchResult result = matchService.matchInvoice(invoiceId, orgId);

        assertNotNull(result);
        assertEquals("EXCEPTION_QUANTITY", result.getMatchStatus());
        assertFalse(result.isApprovedForPayment(), "Should block payment when quantity variance is detected");
        assertEquals(0, BigDecimal.valueOf(400.00).compareTo(result.getNetVariance()));
    }

    @Test
    void testPriceCreepDiscrepancy_SupplierOverbillingUnitPrice() {
        UUID invoiceId = UUID.randomUUID();
        Medicine med = new Medicine();
        med.setId(UUID.randomUUID());
        med.setGenericName("Metformin");

        PurchaseOrder po = new PurchaseOrder();
        po.setId(UUID.randomUUID());
        PurchaseOrderItem poItem = new PurchaseOrderItem();
        poItem.setMedicine(med);
        poItem.setQuantity(50);
        poItem.setUnitPrice(10.00); // Agreed price $10.00
        po.setItems(List.of(poItem));

        GRN grn = new GRN();
        GRNItem grnItem = new GRNItem();
        grnItem.setMedicine(med);
        grnItem.setAcceptedQuantity(50);
        grn.setItems(List.of(grnItem));

        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setPurchaseOrder(po);

        InvoiceItem invItem = new InvoiceItem();
        invItem.setDescription("Metformin 500mg");
        invItem.setQuantity(50);
        invItem.setUnitPrice(BigDecimal.valueOf(14.50)); // Invoiced $14.50 instead of $10.00
        invItem.setTotalPrice(BigDecimal.valueOf(725.00));
        invoice.setItems(List.of(invItem));

        when(invoiceRepository.findByIdAndOrganizationId(invoiceId, orgId)).thenReturn(Optional.of(invoice));
        when(grnRepository.findByPurchaseOrderId(po.getId())).thenReturn(List.of(grn));

        ThreeWayMatchResult result = matchService.matchInvoice(invoiceId, orgId);

        assertNotNull(result);
        assertEquals("EXCEPTION_PRICE", result.getMatchStatus());
        assertFalse(result.isApprovedForPayment());
    }
}

