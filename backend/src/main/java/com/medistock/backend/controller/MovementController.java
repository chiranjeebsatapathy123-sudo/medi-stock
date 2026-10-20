package com.medistock.backend.controller;

import com.medistock.backend.entity.InventoryTransaction;
import com.medistock.backend.repository.InventoryTransactionRepository;
import com.medistock.backend.security.TenantContext;
import com.medistock.backend.service.InventoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
public class MovementController {

    private final InventoryTransactionRepository repository;
    private final InventoryService inventoryService;

    public MovementController(InventoryTransactionRepository repository, InventoryService inventoryService) {
        this.repository = repository;
        this.inventoryService = inventoryService;
    }

    @GetMapping("/movements")
    public ResponseEntity<List<Map<String, Object>>> getMovements() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        List<InventoryTransaction> txs = repository.findByOrganizationId(tenantId);
        List<Map<String, Object>> response = txs.stream().map(tx -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", tx.getId());
            map.put("transactionId", tx.getTransactionId());
            map.put("medicineId", tx.getMedicine() != null ? tx.getMedicine().getId() : null);
            map.put("medicineName", tx.getMedicine() != null ? tx.getMedicine().getGenericName() : null);
            map.put("medicineBrand", tx.getMedicine() != null ? tx.getMedicine().getBrandName() : null);
            map.put("batchId", tx.getBatch() != null ? tx.getBatch().getId() : null);
            map.put("batchNumber", tx.getBatch() != null ? tx.getBatch().getBatchNumber() : null);
            map.put("quantity", tx.getQuantity());
            map.put("previousQuantity", tx.getPreviousQuantity());
            map.put("newQuantity", tx.getNewQuantity());
            map.put("type", tx.getMovementType());
            map.put("sourceId", tx.getSourceLocationId());
            map.put("destId", tx.getDestinationLocationId());
            map.put("userId", tx.getUser() != null ? tx.getUser().getId() : null);
            map.put("userName", tx.getUser() != null ? tx.getUser().getName() : null);
            map.put("reason", tx.getReason());
            map.put("referenceNumber", tx.getReferenceNumber());
            map.put("timestamp", tx.getTimestamp());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/receive")
    public ResponseEntity<?> receiveStock(@RequestBody Map<String, Object> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        try {
            UUID medicineId = parseUUID(payload.get("medicineId"));
            String batchNumber = (String) payload.get("batchNumber");
            int quantity = parseInt(payload.get("quantity"));
            LocalDate expiryDate = parseLocalDate(payload.get("expiryDate"));
            LocalDate manufacturingDate = parseLocalDate(payload.get("manufacturingDate"));
            Double purchasePrice = parseDouble(payload.get("purchasePrice"));
            UUID supplierId = parseUUID(payload.get("supplierId"));
            UUID storageLocationId = parseUUID(payload.get("locationId") != null ? payload.get("locationId") : payload.get("storageLocationId"));
            String referenceNumber = (String) payload.get("referenceNumber");
            UUID userId = parseUUID(payload.get("userId"));

            Map<String, Object> result = inventoryService.receiveStock(
                    medicineId,
                    batchNumber,
                    quantity,
                    expiryDate,
                    manufacturingDate,
                    purchasePrice,
                    supplierId,
                    storageLocationId,
                    userId,
                    referenceNumber,
                    tenantId
            );
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error processing stock receipt: " + e.getMessage()));
        }
    }

    @PostMapping("/issue")
    public ResponseEntity<?> issueStock(@RequestBody Map<String, Object> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        try {
            UUID medicineId = parseUUID(payload.get("medicineId"));
            int quantity = parseInt(payload.get("quantity"));
            String reason = (String) payload.get("reason");
            UUID destLocId = parseUUID(payload.get("destId") != null ? payload.get("destId") : payload.get("destinationLocationId"));
            UUID userId = parseUUID(payload.get("userId"));

            Map<String, Object> result = inventoryService.issueStock(
                    medicineId,
                    quantity,
                    userId,
                    reason,
                    destLocId,
                    tenantId
            );
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error issuing stock: " + e.getMessage()));
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transferStock(@RequestBody Map<String, Object> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        try {
            UUID batchId = parseUUID(payload.get("batchId"));
            UUID sourceLocationId = parseUUID(payload.get("sourceId") != null ? payload.get("sourceId") : payload.get("sourceLocationId"));
            UUID destinationLocationId = parseUUID(payload.get("destId") != null ? payload.get("destId") : payload.get("destinationLocationId"));
            int quantity = parseInt(payload.get("quantity"));
            String reason = (String) payload.get("reason");
            UUID userId = parseUUID(payload.get("userId"));

            Map<String, Object> result = inventoryService.transferStock(
                    batchId,
                    sourceLocationId,
                    destinationLocationId,
                    quantity,
                    reason,
                    userId,
                    tenantId
            );
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error transferring stock: " + e.getMessage()));
        }
    }

    @PostMapping("/adjust")
    public ResponseEntity<?> adjustStock(@RequestBody Map<String, Object> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        try {
            UUID batchId = parseUUID(payload.get("batchId"));
            int newQuantity = parseInt(payload.get("newQuantity") != null ? payload.get("newQuantity") : payload.get("quantity"));
            String type = (String) payload.get("type");
            String reason = (String) payload.get("reason");
            UUID userId = parseUUID(payload.get("userId"));

            Map<String, Object> result = inventoryService.adjustStock(
                    batchId,
                    newQuantity,
                    type,
                    reason,
                    userId,
                    tenantId
            );
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error adjusting stock: " + e.getMessage()));
        }
    }

    private UUID parseUUID(Object val) {
        if (val == null) return null;
        String s = val.toString().trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        try {
            return UUID.fromString(s);
        } catch (Exception e) {
            return null;
        }
    }

    private int parseInt(Object val) {
        if (val == null) return 0;
        try {
            return Integer.parseInt(val.toString().trim());
        } catch (Exception e) {
            return 0;
        }
    }

    private Double parseDouble(Object val) {
        if (val == null) return null;
        try {
            return Double.parseDouble(val.toString().trim());
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDate parseLocalDate(Object val) {
        if (val == null) return null;
        String s = val.toString().trim();
        if (s.isEmpty()) return null;
        try {
            return LocalDate.parse(s.substring(0, Math.min(10, s.length())));
        } catch (Exception e) {
            return null;
        }
    }
}
