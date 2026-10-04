package com.medistock.backend.service;

import com.medistock.backend.entity.WarehouseLocation;
import com.medistock.backend.repository.WarehouseLocationRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
public class PutAwayEngine {

    private final WarehouseLocationRepository locationRepository;

    public PutAwayEngine(WarehouseLocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public static class PutAwayRecommendation {
        public WarehouseLocation location;
        public String reason;
        
        public PutAwayRecommendation(WarehouseLocation location, String reason) {
            this.location = location;
            this.reason = reason;
        }
    }

    public PutAwayRecommendation recommendLocation(UUID warehouseId, String requiredTemp, BigDecimal quantity) {
        List<WarehouseLocation> allLocations = locationRepository.findByWarehouseId(warehouseId);
        
        // Filter by availability and type
        List<WarehouseLocation> eligible = allLocations.stream()
            .filter(loc -> !loc.getLocationType().equals("WAREHOUSE") && !loc.getLocationType().equals("ZONE"))
            .filter(loc -> "AVAILABLE".equals(loc.getStatus()))
            .collect(Collectors.toList());

        // Storage Compatibility: Temperature
        if (requiredTemp != null && !requiredTemp.isEmpty()) {
            eligible = eligible.stream()
                .filter(loc -> requiredTemp.equals(loc.getTemperatureProfile()))
                .collect(Collectors.toList());
        }

        // Storage Compatibility: Capacity
        eligible = eligible.stream()
            .filter(loc -> {
                if (loc.getPhysicalCapacity() == null) return true; // Infinite/Unconfigured
                BigDecimal used = loc.getUsedCapacity() != null ? loc.getUsedCapacity() : BigDecimal.ZERO;
                return loc.getPhysicalCapacity().subtract(used).compareTo(quantity) >= 0;
            })
            .collect(Collectors.toList());

        if (eligible.isEmpty()) {
            throw new RuntimeException("PUT-AWAY BLOCKED: No compatible locations available with sufficient capacity and requirements.");
        }

        // Just return the first one with reason for now. (Could add ML ranking here if configured)
        WarehouseLocation best = eligible.get(0);
        return new PutAwayRecommendation(best, "Compatible temperature and sufficient capacity.");
    }
}
