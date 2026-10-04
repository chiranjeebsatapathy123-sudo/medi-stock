package com.medistock.backend.repository.facility;
import com.medistock.backend.entity.facility.FacilityIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface FacilityIncidentRepository extends JpaRepository<FacilityIncident, UUID> {
    List<FacilityIncident> findByOrganizationId(UUID organizationId);
}
