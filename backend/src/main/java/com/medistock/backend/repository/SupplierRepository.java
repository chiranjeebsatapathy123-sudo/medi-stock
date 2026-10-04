package com.medistock.backend.repository;

import com.medistock.backend.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    List<Supplier> findByOrganizationId(UUID organizationId);
}
