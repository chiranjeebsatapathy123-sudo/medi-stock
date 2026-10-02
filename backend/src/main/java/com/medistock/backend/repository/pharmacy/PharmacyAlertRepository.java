package com.medistock.backend.repository.pharmacy;

import com.medistock.backend.entity.pharmacy.PharmacyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PharmacyAlertRepository extends JpaRepository<PharmacyAlert, UUID> {
    List<PharmacyAlert> findByOrganizationId(UUID organizationId);
    List<PharmacyAlert> findByOrganizationIdAndStatus(UUID organizationId, String status);
}
