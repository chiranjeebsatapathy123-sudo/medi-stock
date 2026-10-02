package com.medistock.backend.repository.pharmacy;

import com.medistock.backend.entity.pharmacy.DispensingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DispensingRecordRepository extends JpaRepository<DispensingRecord, UUID> {
    List<DispensingRecord> findByOrganizationId(UUID organizationId);
    Optional<DispensingRecord> findByOrganizationIdAndDispensingNumber(UUID organizationId, String dispensingNumber);
}
