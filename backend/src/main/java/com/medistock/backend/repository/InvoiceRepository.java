package com.medistock.backend.repository;

import com.medistock.backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findByOrganizationId(UUID organizationId);
    Optional<Invoice> findByIdAndOrganizationId(UUID id, UUID organizationId);
    List<Invoice> findByPatientIdAndOrganizationId(UUID patientId, UUID organizationId);
}
