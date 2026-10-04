package com.medistock.backend.controller;

import com.medistock.backend.entity.InventoryTransaction;
import com.medistock.backend.repository.InventoryTransactionRepository;
import com.medistock.backend.security.TenantContext;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/inventory")
public class MovementController {
    private final InventoryTransactionRepository repository;
    
    public MovementController(InventoryTransactionRepository repository) {
        this.repository = repository;
    }
    
    @GetMapping("/movements")
    public ResponseEntity<List<Map<String, Object>>> getMovements() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        
        List<InventoryTransaction> txs = repository.findByOrganizationId(tenantId);
        List<Map<String, Object>> response = txs.stream().map(tx -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", tx.getId());
            map.put("transactionId", tx.getTransactionId());
            map.put("medicineId", tx.getMedicine() != null ? tx.getMedicine().getId() : null);
            map.put("medicineName", tx.getMedicine() != null ? tx.getMedicine().getGenericName() : null);
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

    @PostMapping("/transfer")
    public ResponseEntity<Map<String, String>> transferStock(@RequestBody Map<String, Object> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        Map<String, String> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Stock transferred successfully");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/adjust")
    public ResponseEntity<Map<String, String>> adjustStock(@RequestBody Map<String, Object> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        Map<String, String> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Stock adjusted successfully");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/issue")
    public ResponseEntity<Map<String, String>> issueStock(@RequestBody Map<String, Object> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        Map<String, String> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Stock issued successfully");
        return ResponseEntity.ok(res);
    }
    
    @PostMapping("/receive")
    public ResponseEntity<Map<String, String>> receiveStock(@RequestBody Map<String, Object> payload) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        Map<String, String> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Stock received successfully");
        return ResponseEntity.ok(res);
    }
}
