package com.medistock.backend.repository;

import com.medistock.backend.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {
    List<Warehouse> findByTenantId(UUID tenantId);
}
