package com.medistock.backend.controller;

import com.medistock.backend.entity.User;
import com.medistock.backend.entity.Role;
import com.medistock.backend.repository.UserRepository;
import com.medistock.backend.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<User>> getUsers() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(userRepository.findByOrganizationId(tenantId));
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();
        
        com.medistock.backend.entity.Organization org = new com.medistock.backend.entity.Organization();
        org.setId(tenantId);
        user.setOrganization(org);
        
        if (user.getPasswordHash() != null) {
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        } else {
            user.setPasswordHash(passwordEncoder.encode("default123")); // simple default
        }
        
        if (user.getRole() == null) {
            user.setRole(Role.STORE_STAFF);
        }
        
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable UUID id, @RequestBody User userDetails) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return userRepository.findByIdAndOrganizationId(id, tenantId)
                .map(existingUser -> {
                    existingUser.setName(userDetails.getName());
                    existingUser.setEmail(userDetails.getEmail());
                    existingUser.setPhone(userDetails.getPhone());
                    if (userDetails.getRole() != null) {
                        existingUser.setRole(userDetails.getRole());
                    }
                    existingUser.setStatus(userDetails.getStatus());
                    
                    if (userDetails.getPasswordHash() != null && !userDetails.getPasswordHash().isEmpty() && !userDetails.getPasswordHash().startsWith("$2a$")) {
                        existingUser.setPasswordHash(passwordEncoder.encode(userDetails.getPasswordHash()));
                    }
                    return ResponseEntity.ok(userRepository.save(existingUser));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) return ResponseEntity.status(403).build();

        return userRepository.findByIdAndOrganizationId(id, tenantId)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
