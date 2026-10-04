package com.medistock.backend.repository.logistics;
import com.medistock.backend.entity.logistics.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {
    List<Driver> findByOrganizationId(UUID organizationId);
}
