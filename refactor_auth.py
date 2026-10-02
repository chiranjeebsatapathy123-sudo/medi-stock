import re

with open("backend/src/main/java/com/medistock/backend/controller/AuthController.java", "r") as f:
    code = f.read()

import_insert = """import com.medistock.backend.entity.User;
import com.medistock.backend.repository.UserRepository;
"""
if "com.medistock.backend.repository.UserRepository" not in code:
    code = code.replace("import com.medistock.backend.security.JwtUtils;", import_insert + "import com.medistock.backend.security.JwtUtils;")

auth_class_decl = "public class AuthController {"
auth_vars = """    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }"""
code = re.sub(r'    private final AuthenticationManager authenticationManager;.*?}', auth_vars, code, flags=re.DOTALL)

login_method = """    @PostMapping("/login")
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
    }"""
code = re.sub(r'    @PostMapping\("/login"\).*?}', login_method, code, flags=re.DOTALL)

with open("backend/src/main/java/com/medistock/backend/controller/AuthController.java", "w") as f:
    f.write(code)

print("AuthController updated")
