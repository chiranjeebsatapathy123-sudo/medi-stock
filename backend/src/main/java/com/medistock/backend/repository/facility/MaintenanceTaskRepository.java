package com.medistock.backend.repository.facility;
import com.medistock.backend.entity.facility.MaintenanceTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, UUID> {
    List<MaintenanceTask> findByOrganizationId(UUID organizationId);
}
