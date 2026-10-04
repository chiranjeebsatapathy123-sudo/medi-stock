package com.medistock.backend.repository;

import com.medistock.backend.entity.GRN;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface GRNRepository extends JpaRepository<GRN, UUID> {
    List<GRN> findByOrganizationId(UUID organizationId);
}
