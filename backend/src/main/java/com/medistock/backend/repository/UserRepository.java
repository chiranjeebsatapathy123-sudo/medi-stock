package com.medistock.backend.repository;

import com.medistock.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    java.util.List<User> findByOrganizationId(UUID organizationId);
    Optional<User> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
