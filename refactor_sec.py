import re

with open("backend/src/main/java/com/medistock/backend/security/CustomUserDetailsService.java", "r") as f:
    code = f.read()

load_user = """    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new CustomUserDetails(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                user.getId(),
                user.getOrganization() != null ? user.getOrganization().getId() : null
        );
    }"""
code = re.sub(r'    @Override.*?}', load_user, code, flags=re.DOTALL)
with open("backend/src/main/java/com/medistock/backend/security/CustomUserDetailsService.java", "w") as f:
    f.write(code)

with open("backend/src/main/java/com/medistock/backend/security/TenantFilter.java", "r") as f:
    code = f.read()

filter_logic = """        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            if (userDetails.getOrganizationId() != null) {
                TenantContext.setCurrentTenant(userDetails.getOrganizationId());
            }
        }"""
code = re.sub(r'        if \(authentication != null && authentication\.getPrincipal\(\).*?}', filter_logic, code, flags=re.DOTALL)
with open("backend/src/main/java/com/medistock/backend/security/TenantFilter.java", "w") as f:
    f.write(code)

print("Security updated")
