import os

BASE_PKG = "backend/src/main/java/com/medistock/backend"
PKG_PREFIX = "com.medistock.backend"

def write_file(path, content):
    with open(path, "w") as f:
        f.write(content)

# ENUMS
enums = """package {prefix}.entity;

public enum Role {{
    SUPER_ADMIN, ORGANIZATION_ADMIN, INVENTORY_MANAGER, PHARMACIST, STORE_STAFF, VIEWER
}}
"""

status_enum = """package {prefix}.entity;

public enum RecordStatus {{
    ACTIVE, INACTIVE, ARCHIVED, WARNING, CRITICAL
}}
"""

# ENTITIES
org_entity = """package {prefix}.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "organizations")
@Data
public class Organization {{
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    private String name;
    private String code;
    private String address;
    private String contact;
    private String email;
    private String status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    @PrePersist
    protected void onCreate() {{
        createdAt = ZonedDateTime.now();
        updatedAt = createdAt;
        if(status == null) status = "ACTIVE";
    }}

    @PreUpdate
    protected void onUpdate() {{
        updatedAt = ZonedDateTime.now();
    }}
}}
"""

user_entity = """package {prefix}.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
public class User {{
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;
    
    private String name;
    private String email;
    private String passwordHash;
    private String phone;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    private String status;
    private ZonedDateTime lastLogin;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {{
        createdAt = ZonedDateTime.now();
        updatedAt = createdAt;
        if(status == null) status = "ACTIVE";
    }}

    @PreUpdate
    protected void onUpdate() {{
        updatedAt = ZonedDateTime.now();
    }}
}}
"""

medicine_entity = """package {prefix}.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "medicines")
@Data
public class Medicine {{
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;
    
    private String medicineCode;
    private String genericName;
    private String brandName;
    private String category;
    private String dosageForm;
    private String strength;
    private String manufacturer;
    private String description;
    private String unit;
    
    private boolean prescriptionRequired;
    private boolean controlledMedicine;
    private boolean temperatureSensitive;
    
    private String storageRequirement;
    private int reorderLevel;
    private int safetyStock;
    private int maximumStock;
    private boolean active;
    
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {{
        createdAt = ZonedDateTime.now();
        updatedAt = createdAt;
    }}

    @PreUpdate
    protected void onUpdate() {{
        updatedAt = ZonedDateTime.now();
    }}
}}
"""

batch_entity = """package {prefix}.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "batches")
@Data
public class Batch {{
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;
    
    private String batchNumber;
    private String manufacturer;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    
    private int receivedQuantity;
    private int currentQuantity;
    private Double purchasePrice;
    private Double sellingPrice;
    
    @Column(name = "supplier_id")
    private UUID supplierId;
    
    @Column(name = "storage_location_id")
    private UUID storageLocationId;
    
    private String status;
    private boolean quarantine;
    private boolean recall;
    
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {{
        createdAt = ZonedDateTime.now();
        updatedAt = createdAt;
        if(status == null) status = "ACTIVE";
    }}

    @PreUpdate
    protected void onUpdate() {{
        updatedAt = ZonedDateTime.now();
    }}
}}
"""

transaction_entity = """package {prefix}.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_transactions")
@Data
public class InventoryTransaction {{
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;
    
    private String transactionId;
    
    @ManyToOne
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;
    
    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;
    
    private int quantity;
    private int previousQuantity;
    private int newQuantity;
    private String movementType;
    
    @Column(name = "source_location_id")
    private UUID sourceLocationId;
    
    @Column(name = "destination_location_id")
    private UUID destinationLocationId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String reason;
    private String referenceNumber;
    private ZonedDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {{
        if(timestamp == null) timestamp = ZonedDateTime.now();
    }}
}}
"""

security_config = """package {prefix}.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {{

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {{
        this.jwtAuthFilter = jwtAuthFilter;
    }}

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {{
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/health", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }}

    @Bean
    public PasswordEncoder passwordEncoder() {{
        return new BCryptPasswordEncoder();
    }}

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {{
        return config.getAuthenticationManager();
    }}
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {{
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000", "https://your-backend-domain.com"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }}
}}
"""

jwt_util = """package {prefix}.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {{

    @Value("${{jwt.secret}}")
    private String secret;

    @Value("${{jwt.expiration}}")
    private long expiration;

    private Key getSigningKey() {{
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }}

    public String extractUsername(String token) {{
        return extractClaim(token, Claims::getSubject);
    }}

    public Date extractExpiration(String token) {{
        return extractClaim(token, Claims::getExpiration);
    }}

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {{
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }}

    private Claims extractAllClaims(String token) {{
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }}

    private Boolean isTokenExpired(String token) {{
        return extractExpiration(token).before(new Date());
    }}

    public String generateToken(String username, String role, String organizationId) {{
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("org", organizationId);
        return createToken(claims, username);
    }}

    private String createToken(Map<String, Object> claims, String subject) {{
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }}

    public Boolean validateToken(String token, UserDetails userDetails) {{
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }}
}}
"""

jwt_filter = """package {prefix}.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {{

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtUtils jwtUtils, UserDetailsService userDetailsService) {{
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }}

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {{
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {{
            token = authHeader.substring(7);
            try {{
                username = jwtUtils.extractUsername(token);
            }} catch (Exception e) {{
                // Invalid token
            }}
        }}

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {{
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtils.validateToken(token, userDetails)) {{
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }}
        }}
        filterChain.doFilter(request, response);
    }}
}}
"""

user_details = """package {prefix}.security;

import {prefix}.entity.User;
import {prefix}.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {{

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {{
        this.userRepository = userRepository;
    }}

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {{
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }}
}}
"""

repo = """package {prefix}.repository;

import {prefix}.entity.{entity};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface {entity}Repository extends JpaRepository<{entity}, UUID> {{
    {methods}
}}
"""

controller = """package {prefix}.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {{

    @GetMapping("/health")
    public Map<String, Object> health() {{
        return Map.of("status", "UP", "version", "1.0", "environment", "production");
    }}
}}
"""

def generate():
    os.makedirs(f"{BASE_PKG}/entity", exist_ok=True)
    os.makedirs(f"{BASE_PKG}/repository", exist_ok=True)
    os.makedirs(f"{BASE_PKG}/security", exist_ok=True)
    os.makedirs(f"{BASE_PKG}/service", exist_ok=True)
    os.makedirs(f"{BASE_PKG}/controller", exist_ok=True)

    write_file(f"{BASE_PKG}/entity/Role.java", enums.format(prefix=PKG_PREFIX))
    write_file(f"{BASE_PKG}/entity/RecordStatus.java", status_enum.format(prefix=PKG_PREFIX))
    write_file(f"{BASE_PKG}/entity/Organization.java", org_entity.format(prefix=PKG_PREFIX))
    write_file(f"{BASE_PKG}/entity/User.java", user_entity.format(prefix=PKG_PREFIX))
    write_file(f"{BASE_PKG}/entity/Medicine.java", medicine_entity.format(prefix=PKG_PREFIX))
    write_file(f"{BASE_PKG}/entity/Batch.java", batch_entity.format(prefix=PKG_PREFIX))
    write_file(f"{BASE_PKG}/entity/InventoryTransaction.java", transaction_entity.format(prefix=PKG_PREFIX))
    
    write_file(f"{BASE_PKG}/security/SecurityConfig.java", security_config.format(prefix=PKG_PREFIX))
    write_file(f"{BASE_PKG}/security/JwtUtils.java", jwt_util.format(prefix=PKG_PREFIX))
    write_file(f"{BASE_PKG}/security/JwtAuthFilter.java", jwt_filter.format(prefix=PKG_PREFIX))
    write_file(f"{BASE_PKG}/security/CustomUserDetailsService.java", user_details.format(prefix=PKG_PREFIX))
    
    write_file(f"{BASE_PKG}/repository/UserRepository.java", repo.format(prefix=PKG_PREFIX, entity="User", methods="Optional<User> findByEmail(String email);"))
    write_file(f"{BASE_PKG}/repository/MedicineRepository.java", repo.format(prefix=PKG_PREFIX, entity="Medicine", methods=""))
    write_file(f"{BASE_PKG}/repository/BatchRepository.java", repo.format(prefix=PKG_PREFIX, entity="Batch", methods=""))
    write_file(f"{BASE_PKG}/repository/InventoryTransactionRepository.java", repo.format(prefix=PKG_PREFIX, entity="InventoryTransaction", methods=""))
    
    write_file(f"{BASE_PKG}/controller/HealthController.java", controller.format(prefix=PKG_PREFIX))

if __name__ == "__main__":
    generate()
