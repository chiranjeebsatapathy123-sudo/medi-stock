package com.medistock.backend.repository.facility;
import com.medistock.backend.entity.facility.VisionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface VisionEventRepository extends JpaRepository<VisionEvent, UUID> {
    List<VisionEvent> findByOrganizationId(UUID organizationId);
}
