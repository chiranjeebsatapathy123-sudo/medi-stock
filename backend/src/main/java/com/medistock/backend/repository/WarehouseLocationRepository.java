package com.medistock.backend.repository;

import com.medistock.backend.entity.WarehouseLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarehouseLocationRepository extends JpaRepository<WarehouseLocation, UUID> {
    List<WarehouseLocation> findByWarehouseId(UUID warehouseId);
    Optional<WarehouseLocation> findByBarcode(String barcode);
}
