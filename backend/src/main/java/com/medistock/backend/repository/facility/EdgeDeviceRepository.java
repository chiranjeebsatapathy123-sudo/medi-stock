package com.medistock.backend.repository.facility;
import com.medistock.backend.entity.facility.EdgeDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface EdgeDeviceRepository extends JpaRepository<EdgeDevice, UUID> {
    List<EdgeDevice> findByOrganizationId(UUID organizationId);
}
