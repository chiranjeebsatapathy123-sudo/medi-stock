package com.medistock.backend.repository;

import com.medistock.backend.entity.StorageLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface StorageLocationRepository extends JpaRepository<StorageLocation, UUID> {
    List<StorageLocation> findByOrganizationId(UUID organizationId);
}
