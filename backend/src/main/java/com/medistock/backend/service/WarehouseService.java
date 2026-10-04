package com.medistock.backend.service;

import com.medistock.backend.entity.Warehouse;
import com.medistock.backend.entity.WarehouseLocation;
import com.medistock.backend.repository.WarehouseLocationRepository;
import com.medistock.backend.repository.WarehouseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;

    public WarehouseService(WarehouseRepository warehouseRepository, WarehouseLocationRepository locationRepository) {
        this.warehouseRepository = warehouseRepository;
        this.locationRepository = locationRepository;
    }

    public List<Warehouse> getWarehouses(UUID tenantId) {
        return warehouseRepository.findByTenantId(tenantId);
    }

    public List<WarehouseLocation> getLocationsForWarehouse(UUID tenantId, UUID warehouseId) {
        // First verify warehouse belongs to tenant
        Optional<Warehouse> warehouse = warehouseRepository.findById(warehouseId);
        if (warehouse.isEmpty() || !warehouse.get().getTenantId().equals(tenantId)) {
            throw new RuntimeException("Warehouse not found or access denied");
        }
        return locationRepository.findByWarehouseId(warehouseId);
    }

    public WarehouseLocation resolveBarcode(UUID tenantId, String barcode) {
        Optional<WarehouseLocation> loc = locationRepository.findByBarcode(barcode);
        if (loc.isEmpty()) {
            throw new RuntimeException("Unknown barcode");
        }
        
        // Verify tenant owns this location via warehouse
        Warehouse w = warehouseRepository.findById(loc.get().getWarehouseId())
            .orElseThrow(() -> new RuntimeException("Warehouse not found"));
            
        if (!w.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        return loc.get();
    }
}
