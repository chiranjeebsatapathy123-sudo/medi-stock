package com.medistock.backend.service;

import com.medistock.backend.dto.procurement.ThreeWayMatchLineItem;
import com.medistock.backend.dto.procurement.ThreeWayMatchResult;
import com.medistock.backend.entity.*;
import com.medistock.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class ThreeWayMatchService {

    private final InvoiceRepository invoiceRepository;
    private final PurchaseOrderRepository poRepository;
    private final GRNRepository grnRepository;
    private final InvoiceExceptionRepository exceptionRepository;
    private final AuditService auditService;

    public ThreeWayMatchService(InvoiceRepository invoiceRepository,
                                PurchaseOrderRepository poRepository,
                                GRNRepository grnRepository,
                                InvoiceExceptionRepository exceptionRepository,
                                AuditService auditService) {
        this.invoiceRepository = invoiceRepository;
        this.poRepository = poRepository;
        this.grnRepository = grnRepository;
        this.exceptionRepository = exceptionRepository;
        this.auditService = auditService;
    }

    public ThreeWayMatchResult matchInvoice(UUID invoiceId, UUID organizationId) {
        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(invoiceId, organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        return executeThreeWayMatch(invoice, organizationId);
    }

    public ThreeWayMatchResult executeThreeWayMatch(Invoice invoice, UUID organizationId) {
        ThreeWayMatchResult result = new ThreeWayMatchResult();
        result.setInvoiceId(invoice.getId());
        result.setInvoiceNumber(invoice.getInvoiceNumber());

        // 1. Resolve Associated Purchase Order
        PurchaseOrder po = invoice.getPurchaseOrder();
        if (po == null && invoice.getNotes() != null) {
            // Attempt resolving PO from notes or reference
            String notes = invoice.getNotes();
            int poIdx = notes.indexOf("PO-");
            if (poIdx != -1) {
                String poNumCandidate = notes.substring(poIdx).split("[\\s,;]+")[0].trim();
                Optional<PurchaseOrder> poOpt = poRepository.findByOrganizationIdAndPoNumber(organizationId, poNumCandidate);
                if (poOpt.isPresent()) po = poOpt.get();
            }
        }

        if (po == null) {
            // Find most recent PO for the organization
            List<PurchaseOrder> pos = poRepository.findByOrganizationId(organizationId);
            if (!pos.isEmpty()) {
                po = pos.get(0);
            }
        }

        if (po == null) {
            result.setMatchStatus("EXCEPTION_UNRECEIVED");
            result.setApprovedForPayment(false);
            result.getExceptionSummaries().add("No corresponding Purchase Order located for invoice " + invoice.getInvoiceNumber());
            return result;
        }

        result.setPoId(po.getId());
        result.setPoNumber(po.getPoNumber());
        if (po.getSupplier() != null) {
            result.setSupplierName(po.getSupplier().getName());
        }

        // 2. Resolve Goods Received Notes (GRN)
        List<GRN> grnList = grnRepository.findByPurchaseOrderId(po.getId());
        if (!grnList.isEmpty()) {
            GRN primaryGrn = grnList.get(0);
            result.setGrnId(primaryGrn.getId());
            result.setGrnNumber(primaryGrn.getGrnNumber());
        }

        // Aggregate received quantities from GRNs by Medicine
        Map<String, Integer> grnReceivedMap = new HashMap<>();
        for (GRN grn : grnList) {
            if (grn.getItems() != null) {
                for (GRNItem grnItem : grn.getItems()) {
                    if (grnItem.getMedicine() != null) {
                        String medKey = normalizeKey(grnItem.getMedicine().getGenericName(), grnItem.getMedicine().getBrandName());
                        int qty = grnItem.getAcceptedQuantity() > 0 ? grnItem.getAcceptedQuantity() : grnItem.getReceivedQuantity();
                        grnReceivedMap.put(medKey, grnReceivedMap.getOrDefault(medKey, 0) + qty);
                    }
                }
            }
        }

        // Map PO Items by Medicine key
        Map<String, PurchaseOrderItem> poItemMap = new HashMap<>();
        if (po.getItems() != null) {
            for (PurchaseOrderItem poItem : po.getItems()) {
                if (poItem.getMedicine() != null) {
                    String medKey = normalizeKey(poItem.getMedicine().getGenericName(), poItem.getMedicine().getBrandName());
                    poItemMap.put(medKey, poItem);
                    // If no GRN was recorded but PO item has receivedQuantity, use it
                    if (!grnReceivedMap.containsKey(medKey) && poItem.getReceivedQuantity() > 0) {
                        grnReceivedMap.put(medKey, poItem.getReceivedQuantity());
                    }
                }
            }
        }

        // 3. Match line-by-line
        List<ThreeWayMatchLineItem> matchLines = new ArrayList<>();
        List<String> exceptions = new ArrayList<>();
        BigDecimal totalInvoiced = BigDecimal.ZERO;
        BigDecimal totalExpected = BigDecimal.ZERO;

        List<InvoiceItem> invoiceItems = invoice.getItems() != null ? invoice.getItems() : Collections.emptyList();
        for (InvoiceItem invItem : invoiceItems) {
            String desc = invItem.getDescription() != null ? invItem.getDescription() : "Item";
            Integer invQty = invItem.getQuantity() != null ? invItem.getQuantity() : 0;
            BigDecimal invUnitPrice = invItem.getUnitPrice() != null ? invItem.getUnitPrice() : BigDecimal.ZERO;
            BigDecimal invLineTotal = invItem.getTotalPrice() != null ? invItem.getTotalPrice() : invUnitPrice.multiply(BigDecimal.valueOf(invQty));
            totalInvoiced = totalInvoiced.add(invLineTotal);

            // Find matching PO item
            PurchaseOrderItem matchedPoItem = findBestPoMatch(desc, poItemMap);
            int poQty = matchedPoItem != null ? matchedPoItem.getQuantity() : 0;
            BigDecimal poUnitPrice = matchedPoItem != null && matchedPoItem.getUnitPrice() != null
                    ? BigDecimal.valueOf(matchedPoItem.getUnitPrice())
                    : invUnitPrice;

            // Find matching GRN qty
            String matchKey = matchedPoItem != null && matchedPoItem.getMedicine() != null
                    ? normalizeKey(matchedPoItem.getMedicine().getGenericName(), matchedPoItem.getMedicine().getBrandName())
                    : desc.toLowerCase();
            int grnQty = grnReceivedMap.getOrDefault(matchKey, 0);

            BigDecimal expLineTotal = poUnitPrice.multiply(BigDecimal.valueOf(grnQty));
            totalExpected = totalExpected.add(expLineTotal);

            BigDecimal lineVariance = invLineTotal.subtract(expLineTotal);
            double variancePct = expLineTotal.compareTo(BigDecimal.ZERO) > 0
                    ? lineVariance.divide(expLineTotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : (lineVariance.compareTo(BigDecimal.ZERO) == 0 ? 0.0 : 100.0);

            String lineStatus;
            String note;

            if (grnQty == 0) {
                lineStatus = "NOT_RECEIVED";
                note = "Warehouse receipt note missing. Goods not accepted at receiving dock.";
                exceptions.add(desc + ": Unreceived goods billed (" + invQty + " units).");
            } else if (invQty > grnQty) {
                lineStatus = "QTY_MISMATCH";
                note = "Quantity variance: Invoiced for " + invQty + " units, warehouse accepted " + grnQty + " units.";
                exceptions.add(desc + ": Overbilled by " + (invQty - grnQty) + " units.");
            } else if (invUnitPrice.compareTo(poUnitPrice.add(BigDecimal.valueOf(0.01))) > 0) {
                lineStatus = "PRICE_MISMATCH";
                note = String.format("Price creep: Invoiced @ $%.2f vs agreed PO rate $%.2f.", invUnitPrice, poUnitPrice);
                exceptions.add(desc + ": Price discrepancy ($" + invUnitPrice + " vs $" + poUnitPrice + ").");
            } else {
                lineStatus = "MATCHED";
                note = "3-way line reconciled: PO rate and GRN physical receipt confirmed.";
            }

            matchLines.add(ThreeWayMatchLineItem.builder()
                    .medicineName(desc)
                    .poQuantity(poQty)
                    .grnQuantity(grnQty)
                    .invoicedQuantity(invQty)
                    .poUnitPrice(poUnitPrice)
                    .invoicedUnitPrice(invUnitPrice)
                    .lineVarianceAmount(lineVariance)
                    .variancePercent(variancePct)
                    .status(lineStatus)
                    .discrepancyNote(note)
                    .build());
        }

        result.setLineItems(matchLines);
        result.setInvoiceTotal(totalInvoiced);
        result.setExpectedTotal(totalExpected);

        BigDecimal netVariance = totalInvoiced.subtract(totalExpected);
        result.setNetVariance(netVariance);

        double netPct = totalExpected.compareTo(BigDecimal.ZERO) > 0
                ? netVariance.divide(totalExpected, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;
        result.setNetVariancePercent(netPct);
        result.setExceptionSummaries(exceptions);

        // Overall classification
        boolean hasUnreceived = matchLines.stream().anyMatch(l -> "NOT_RECEIVED".equals(l.getStatus()));
        boolean hasQtyMismatch = matchLines.stream().anyMatch(l -> "QTY_MISMATCH".equals(l.getStatus()));
        boolean hasPriceMismatch = matchLines.stream().anyMatch(l -> "PRICE_MISMATCH".equals(l.getStatus()));

        if (hasUnreceived) {
            result.setMatchStatus("EXCEPTION_UNRECEIVED");
            result.setApprovedForPayment(false);
        } else if (hasQtyMismatch) {
            result.setMatchStatus("EXCEPTION_QUANTITY");
            result.setApprovedForPayment(false);
        } else if (hasPriceMismatch) {
            result.setMatchStatus("EXCEPTION_PRICE");
            result.setApprovedForPayment(false);
        } else if (Math.abs(netPct) <= 1.0) {
            result.setMatchStatus(netVariance.compareTo(BigDecimal.ZERO) == 0 ? "PERFECT_MATCH" : "WITHIN_TOLERANCE");
            result.setApprovedForPayment(true);
        } else {
            result.setMatchStatus("EXCEPTION_PRICE");
            result.setApprovedForPayment(false);
        }

        // If exceptions detected, log to invoice_exceptions table
        if (!result.isApprovedForPayment() && invoice.getId() != null) {
            recordInvoiceExceptions(invoice, organizationId, result);
        }

        return result;
    }

    private void recordInvoiceExceptions(Invoice invoice, UUID orgId, ThreeWayMatchResult result) {
        try {
            List<InvoiceException> existing = exceptionRepository.findByInvoiceId(invoice.getId());
            if (existing.isEmpty() && !result.getExceptionSummaries().isEmpty()) {
                InvoiceException ex = new InvoiceException();
                ex.setOrganizationId(orgId);
                ex.setInvoice(invoice);
                ex.setType(result.getMatchStatus());
                ex.setDescription(String.join("; ", result.getExceptionSummaries()) +
                        String.format(" [Total Invoiced: $%.2f, Expected: $%.2f, Variance: $%.2f]",
                                result.getInvoiceTotal(), result.getExpectedTotal(), result.getNetVariance()));
                ex.setStatus("OPEN");
                exceptionRepository.save(ex);
            }
        } catch (Exception ignored) {}
    }

    @Transactional
    public Invoice reconcileAndApprove(UUID invoiceId, UUID orgId, UUID userId, String notes) {
        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(invoiceId, orgId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        ThreeWayMatchResult match = executeThreeWayMatch(invoice, orgId);

        // Close any open exceptions
        List<InvoiceException> exceptions = exceptionRepository.findByInvoiceId(invoiceId);
        for (InvoiceException ex : exceptions) {
            ex.setStatus("RESOLVED");
            ex.setResolvedBy(userId);
            ex.setResolvedAt(OffsetDateTime.now());
            ex.setResolutionNotes(notes != null ? notes : "Reconciled and approved by Finance Controller.");
            exceptionRepository.save(ex);
        }

        invoice.setStatus("APPROVED_FOR_PAYMENT");
        String approvedNote = "[3-WAY MATCH APPROVED]: " + (notes != null ? notes : "Verified with variance " + match.getNetVariance());
        String currentNotes = invoice.getNotes();
        String combinedNotes = (currentNotes != null && !currentNotes.isEmpty()) ? currentNotes + " | " + approvedNote : approvedNote;
        if (combinedNotes.length() > 250) {
            combinedNotes = combinedNotes.substring(0, 250);
        }
        invoice.setNotes(combinedNotes);

        try {
            auditService.recordAudit(
                    orgId, userId, "Finance Officer", "FINANCE",
                    "THREE_WAY_MATCH_RECONCILE", "INVOICE", invoice.getId(),
                    null, "status=APPROVED_FOR_PAYMENT,variance=" + match.getNetVariance(),
                    "Reconciliation and payment approval for invoice " + invoice.getInvoiceNumber()
            );
        } catch (Exception ignored) {}

        return invoiceRepository.save(invoice);
    }

    private PurchaseOrderItem findBestPoMatch(String desc, Map<String, PurchaseOrderItem> poItemMap) {
        String lowerDesc = desc.toLowerCase();
        for (Map.Entry<String, PurchaseOrderItem> entry : poItemMap.entrySet()) {
            if (entry.getKey().contains(lowerDesc) || lowerDesc.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return poItemMap.values().stream().findFirst().orElse(null);
    }

    private String normalizeKey(String generic, String brand) {
        String g = generic != null ? generic.trim().toLowerCase() : "";
        String b = brand != null ? brand.trim().toLowerCase() : "";
        return (g + " " + b).trim();
    }
}

