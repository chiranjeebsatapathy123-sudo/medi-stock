package com.medistock.backend.repository.logistics;
import com.medistock.backend.entity.logistics.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {
    List<Shipment> findByOrganizationId(UUID organizationId);
}
