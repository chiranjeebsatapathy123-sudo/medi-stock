package com.medistock.backend.repository;

import com.medistock.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    List<Patient> findByOrganizationId(UUID organizationId);
    Optional<Patient> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
