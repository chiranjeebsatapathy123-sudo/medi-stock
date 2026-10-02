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
}
