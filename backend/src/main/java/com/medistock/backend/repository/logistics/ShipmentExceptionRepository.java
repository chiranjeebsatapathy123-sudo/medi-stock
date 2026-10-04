package com.medistock.backend.repository.logistics;
import com.medistock.backend.entity.logistics.ShipmentException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ShipmentExceptionRepository extends JpaRepository<ShipmentException, UUID> {
    List<ShipmentException> findByShipmentId(UUID shipmentId);
}
