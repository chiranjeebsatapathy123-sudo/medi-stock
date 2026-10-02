package com.medistock.backend.repository;

import com.medistock.backend.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, UUID> {
    
    java.util.List<Medicine> findByOrganizationId(UUID organizationId);
    Optional<Medicine> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
