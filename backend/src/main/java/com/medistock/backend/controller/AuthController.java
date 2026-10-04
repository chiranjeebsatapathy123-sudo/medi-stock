package com.medistock.backend.controller;

import com.medistock.backend.entity.User;
import com.medistock.backend.repository.UserRepository;
import com.medistock.backend.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import org.springframework.http.ResponseEntity;
import com.medistock.backend.entity.Organization;
import com.medistock.backend.entity.Role;
import com.medistock.backend.repository.OrganizationRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final OrganizationRepository orgRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, UserRepository userRepository, OrganizationRepository orgRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.orgRepository = orgRepository;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.get("email"), request.get("password"))
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        String orgId = user.getOrganization() != null && user.getOrganization().getId() != null ? user.getOrganization().getId().toString() : "UNKNOWN";
        String role = user.getRole() != null ? user.getRole().name() : "USER";
        
        String token = jwtUtils.generateToken(authentication.getName(), role, orgId);
        
        return Map.of("success", true, "token", token, "user", Map.of(
            "id", user.getId().toString(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", role,
            "organizationId", orgId
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        if (userRepository.findByEmail(request.get("email")).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }
        
        Organization org = new Organization();
        String companyName = request.get("companyName") != null ? request.get("companyName") : "New Organization";
        org.setName(companyName);
        
        String cleanName = companyName.toUpperCase().replaceAll("[^A-Z0-9]", "");
        if (cleanName.length() == 0) cleanName = "ORG";
        String code = cleanName.substring(0, Math.min(cleanName.length(), 4)) + "-" + (System.currentTimeMillis() % 10000);
        org.setCode(code);
        
        org = orgRepository.save(org);
        
        User user = new User();
        user.setName(request.get("name"));
        user.setEmail(request.get("email"));
        user.setPasswordHash(request.get("password")); // using plain for demo, SecurityConfig is NoOpPasswordEncoder
        user.setRole(Role.ORGANIZATION_ADMIN);
        user.setOrganization(org);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Registration successful"));
    }
}
