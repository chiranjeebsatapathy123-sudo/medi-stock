package com.medistock.backend.repository;

import com.medistock.backend.entity.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, UUID> {
    List<PurchaseRequest> findByOrganizationId(UUID organizationId);
    Optional<PurchaseRequest> findByIdAndOrganizationId(UUID id, UUID organizationId);
    List<PurchaseRequest> findByOrganizationIdAndStatus(UUID organizationId, String status);
}

