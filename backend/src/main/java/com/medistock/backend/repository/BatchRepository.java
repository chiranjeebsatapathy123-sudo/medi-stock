package com.medistock.backend.repository;

import com.medistock.backend.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, UUID> {
    
    java.util.List<Batch> findByMedicineOrganizationId(UUID organizationId);
    Optional<Batch> findByIdAndMedicineOrganizationId(UUID id, UUID organizationId);
    java.util.List<Batch> findByMedicineIdAndMedicineOrganizationId(UUID medicineId, UUID organizationId);
    
    @org.springframework.data.jpa.repository.Query("SELECT b FROM Batch b WHERE b.medicine.id = :medicineId AND b.medicine.organization.id = :orgId AND b.currentQuantity > 0 AND b.status = 'ACTIVE' AND b.quarantine = false AND b.recall = false AND (b.expiryDate IS NULL OR b.expiryDate >= :minExpiry) ORDER BY b.expiryDate ASC")
    java.util.List<Batch> findEligibleBatchesForFEFO(@org.springframework.data.repository.query.Param("medicineId") UUID medicineId, @org.springframework.data.repository.query.Param("orgId") UUID orgId, @org.springframework.data.repository.query.Param("minExpiry") java.time.LocalDate minExpiry);
}
