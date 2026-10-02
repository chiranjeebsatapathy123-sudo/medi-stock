package com.medistock.backend.repository.pharmacy;

import com.medistock.backend.entity.pharmacy.MedicationOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicationOrderRepository extends JpaRepository<MedicationOrder, UUID> {
    List<MedicationOrder> findByOrganizationId(UUID organizationId);
    Optional<MedicationOrder> findByOrganizationIdAndOrderNumber(UUID organizationId, String orderNumber);
    List<MedicationOrder> findByOrganizationIdAndStatus(UUID organizationId, String status);
    Optional<MedicationOrder> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
