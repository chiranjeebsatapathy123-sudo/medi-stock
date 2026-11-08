package com.medistock.backend.repository;

import com.medistock.backend.entity.InvoiceException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceExceptionRepository extends JpaRepository<InvoiceException, UUID> {
    List<InvoiceException> findByOrganizationId(UUID organizationId);
    List<InvoiceException> findByInvoiceId(UUID invoiceId);
    List<InvoiceException> findByOrganizationIdAndStatus(UUID organizationId, String status);
}

