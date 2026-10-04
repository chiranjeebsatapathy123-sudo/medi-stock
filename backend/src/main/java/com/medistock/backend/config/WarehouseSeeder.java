package com.medistock.backend.config;

import com.medistock.backend.entity.Warehouse;
import com.medistock.backend.entity.WarehouseLocation;
import com.medistock.backend.repository.WarehouseLocationRepository;
import com.medistock.backend.repository.WarehouseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class WarehouseSeeder implements CommandLineRunner {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseLocationRepository locationRepository;

    public WarehouseSeeder(WarehouseRepository warehouseRepository, WarehouseLocationRepository locationRepository) {
        this.warehouseRepository = warehouseRepository;
        this.locationRepository = locationRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        UUID demoTenant = UUID.fromString("00000000-0000-0000-0000-000000000001");
        
        List<Warehouse> existing = warehouseRepository.findByTenantId(demoTenant);
        if (existing.isEmpty()) {
            Warehouse w = new Warehouse();
            w.setTenantId(demoTenant);
            w.setCode("WH-MAIN");
            w.setName("Central Logistics Hub");
            w.setLocationType("WAREHOUSE");
            w.setAddress("123 Med Line, NY");
            warehouseRepository.save(w);

            // Cold Room Location
            WarehouseLocation loc1 = new WarehouseLocation();
            loc1.setWarehouseId(w.getId());
            loc1.setCode("WH-MAIN-CR1");
            loc1.setName("Cold Room A");
            loc1.setLocationType("COLD_ROOM");
            loc1.setBarcode("LOC-10001");
            loc1.setStatus("AVAILABLE");
            loc1.setTemperatureProfile("2-8C");
            loc1.setPhysicalCapacity(BigDecimal.valueOf(5000));
            loc1.setUsedCapacity(BigDecimal.valueOf(1200));
            loc1.setCapacityUom("UNITS");
            locationRepository.save(loc1);

            // Standard Rack Location
            WarehouseLocation loc2 = new WarehouseLocation();
            loc2.setWarehouseId(w.getId());
            loc2.setCode("WH-MAIN-A1-R1-S1-B1");
            loc2.setName("Aisle 1 Rack 1 Shelf 1 Bin 1");
            loc2.setLocationType("BIN");
            loc2.setBarcode("LOC-20001");
            loc2.setStatus("AVAILABLE");
            loc2.setPhysicalCapacity(BigDecimal.valueOf(100));
            loc2.setUsedCapacity(BigDecimal.valueOf(40));
            loc2.setCapacityUom("UNITS");
            locationRepository.save(loc2);
            
            System.out.println("Seeded Demo Warehouse and Locations!");
        }
    }
}
