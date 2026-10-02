package com.medistock.backend.repository.ai;

import com.medistock.backend.entity.ai.DatasetVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DatasetVersionRepository extends JpaRepository<DatasetVersion, UUID> {
    Optional<DatasetVersion> findByDatasetNameAndVersion(String datasetName, String version);
}
