package com.medistock.backend.service;
import com.medistock.backend.entity.logistics.*;
import com.medistock.backend.repository.logistics.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class LogisticsService {
    private final VehicleRepository vehicleRepo;
    private final DriverRepository driverRepo;
    private final ShipmentRepository shipmentRepo;
    private final ChainOfCustodyEventRepository cocRepo;
    private final ShipmentExceptionRepository exceptionRepo;

    public LogisticsService(VehicleRepository vehicleRepo, DriverRepository driverRepo, ShipmentRepository shipmentRepo, ChainOfCustodyEventRepository cocRepo, ShipmentExceptionRepository exceptionRepo) {
        this.vehicleRepo = vehicleRepo;
        this.driverRepo = driverRepo;
        this.shipmentRepo = shipmentRepo;
        this.cocRepo = cocRepo;
        this.exceptionRepo = exceptionRepo;
    }

    public Map<String, Object> getLogisticsOverview(UUID orgId) {
        Map<String, Object> overview = new HashMap<>();
        overview.put("vehicles", vehicleRepo.findByOrganizationId(orgId));
        overview.put("drivers", driverRepo.findByOrganizationId(orgId));
        overview.put("shipments", shipmentRepo.findByOrganizationId(orgId));
        overview.put("exceptions", exceptionRepo.findAll()); // simplified
        overview.put("chainOfCustody", cocRepo.findAll()); // simplified
        return overview;
    }

    public Shipment createShipment(Shipment shipment, UUID orgId) {
        shipment.setOrganizationId(orgId);
        return shipmentRepo.save(shipment);
    }

    public Shipment updateShipmentStatus(UUID id, String status, UUID orgId) {
        Shipment shipment = shipmentRepo.findById(id).orElseThrow(() -> new RuntimeException("Shipment not found"));
        if (!shipment.getOrganizationId().equals(orgId)) throw new RuntimeException("Access denied");
        shipment.setStatus(status);
        return shipmentRepo.save(shipment);
    }
}
