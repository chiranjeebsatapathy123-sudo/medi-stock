package com.medistock.backend.repository;

import com.medistock.backend.entity.IntelligenceRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface IntelligenceRecommendationRepository extends JpaRepository<IntelligenceRecommendation, UUID> {
    List<IntelligenceRecommendation> findByOrganizationIdAndStatus(UUID organizationId, String status);
}
