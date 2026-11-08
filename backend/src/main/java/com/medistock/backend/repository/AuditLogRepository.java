package com.medistock.backend.repository;

import com.medistock.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByOrganizationIdOrderByTimestampDesc(UUID organizationId);

    List<AuditLog> findByOrganizationIdAndEntityTypeOrderByTimestampDesc(UUID organizationId, String entityType);

    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, UUID entityId);

    @Query("SELECT a.signatureHash FROM AuditLog a WHERE a.organization.id = :orgId ORDER BY a.timestamp DESC LIMIT 1")
    Optional<String> findLatestSignatureHash(@Param("orgId") UUID orgId);
}

