package com.medistock.backend.repository;

import com.medistock.backend.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {
    List<PurchaseOrder> findByOrganizationId(UUID organizationId);
    Optional<PurchaseOrder> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
