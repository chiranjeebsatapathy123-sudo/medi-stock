package com.medistock.backend.repository.ai;

import com.medistock.backend.entity.ai.AiModelRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiModelRegistryRepository extends JpaRepository<AiModelRegistry, UUID> {
    Optional<AiModelRegistry> findByModelNameAndDeploymentStatus(String modelName, String deploymentStatus);
    List<AiModelRegistry> findByModelName(String modelName);
}
