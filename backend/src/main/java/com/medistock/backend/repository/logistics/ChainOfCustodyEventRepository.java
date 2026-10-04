package com.medistock.backend.repository.logistics;
import com.medistock.backend.entity.logistics.ChainOfCustodyEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChainOfCustodyEventRepository extends JpaRepository<ChainOfCustodyEvent, UUID> {
    List<ChainOfCustodyEvent> findByShipmentId(UUID shipmentId);
}
