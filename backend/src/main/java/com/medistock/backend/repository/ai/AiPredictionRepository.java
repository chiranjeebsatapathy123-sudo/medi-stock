package com.medistock.backend.repository.ai;

import com.medistock.backend.entity.ai.AiPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiPredictionRepository extends JpaRepository<AiPrediction, UUID> {
    List<AiPrediction> findByOrganizationIdAndEntityTypeAndEntityId(UUID organizationId, String entityType, UUID entityId);
}
