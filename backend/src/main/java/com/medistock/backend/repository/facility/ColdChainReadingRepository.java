package com.medistock.backend.repository.facility;

import com.medistock.backend.entity.facility.ColdChainReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ColdChainReadingRepository extends JpaRepository<ColdChainReading, UUID> {

    List<ColdChainReading> findByOrganizationIdOrderByTimestampDesc(UUID organizationId);

    List<ColdChainReading> findByOrganizationIdAndDeviceIdOrderByTimestampDesc(UUID organizationId, String deviceId);

    @Query(value = "SELECT DISTINCT ON (device_id) * FROM cold_chain_readings WHERE organization_id = :orgId ORDER BY device_id, timestamp DESC", nativeQuery = true)
    List<ColdChainReading> findLatestReadingsPerDevice(@Param("orgId") UUID orgId);
}

