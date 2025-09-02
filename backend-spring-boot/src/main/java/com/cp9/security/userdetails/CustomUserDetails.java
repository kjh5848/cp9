package com.cp9.security.userdetails;

import com.cp9.entity.Permission;
import com.cp9.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

/**
 * Spring Security UserDetails 구현체
 * User 엔티티를 Spring Security 인증 주체로 변환
 */
public class CustomUserDetails implements UserDetails {
    
    private final Long id;
    private final String username;
    private final String email;
    private final String password;
    private final String name;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean enabled;
    private final boolean accountNonExpired;
    private final boolean accountNonLocked;
    private final boolean credentialsNonExpired;
    
    public CustomUserDetails(Long id, String username, String email, String password, String name,
                           Collection<? extends GrantedAuthority> authorities, boolean enabled,
                           boolean accountNonExpired, boolean accountNonLocked, boolean credentialsNonExpired) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.name = name;
        this.authorities = authorities;
        this.enabled = enabled;
        this.accountNonExpired = accountNonExpired;
        this.accountNonLocked = accountNonLocked;
        this.credentialsNonExpired = credentialsNonExpired;
    }
    
    /**
     * User 엔티티로부터 CustomUserDetails 생성
     * @param user User 엔티티
     * @return CustomUserDetails 인스턴스
     */
    public static CustomUserDetails create(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        // 1. Role을 권한으로 추가 (ROLE_ 접두사)
        user.getRoles().forEach(role -> {
            if (role.getEnabled()) {
                authorities.add(new SimpleGrantedAuthority(role.getName()));
                
                // 2. Role이 가진 Permission도 권한으로 추가
                role.getPermissions().forEach(permission -> {
                    if (permission.getEnabled()) {
                        authorities.add(new SimpleGrantedAuthority(permission.getName()));
                    }
                });
            }
        });
        
        return new CustomUserDetails(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getPassword(),
            user.getName(),
            authorities,
            user.getEnabled(),
            user.getAccountNonExpired(),
            user.getAccountNonLocked(),
            user.getCredentialsNonExpired()
        );
    }
    
    /**
     * OAuth2 사용자를 위한 생성자 (비밀번호 없음)
     */
    public static CustomUserDetails createForOAuth2(User user) {
        CustomUserDetails userDetails = create(user);
        return new CustomUserDetails(
            userDetails.getId(),
            userDetails.getUsername(),
            userDetails.getEmail(),
            "", // OAuth2 사용자는 비밀번호 없음
            userDetails.getName(),
            userDetails.getAuthorities(),
            userDetails.isEnabled(),
            userDetails.isAccountNonExpired(),
            userDetails.isAccountNonLocked(),
            true // OAuth2 사용자는 자격증명 만료 없음
        );
    }
    
    // Getter 메서드들
    public Long getId() {
        return id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getName() {
        return name;
    }
    
    // UserDetails 인터페이스 구현
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }
    
    // 유틸리티 메서드들
    
    /**
     * 특정 역할을 가지고 있는지 확인
     * @param roleName 역할 이름 (예: ROLE_ADMIN)
     * @return 역할 보유 여부
     */
    public boolean hasRole(String roleName) {
        return authorities.stream()
            .anyMatch(authority -> authority.getAuthority().equals(roleName));
    }
    
    /**
     * 여러 역할 중 하나라도 가지고 있는지 확인
     * @param roleNames 역할 이름들
     * @return 역할 보유 여부
     */
    public boolean hasAnyRole(String... roleNames) {
        for (String roleName : roleNames) {
            if (hasRole(roleName)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 특정 권한을 가지고 있는지 확인
     * @param permissionName 권한 이름 (예: USER_READ)
     * @return 권한 보유 여부
     */
    public boolean hasPermission(String permissionName) {
        return authorities.stream()
            .anyMatch(authority -> authority.getAuthority().equals(permissionName));
    }
    
    /**
     * 관리자 권한을 가지고 있는지 확인
     * @return 관리자 여부
     */
    public boolean isAdmin() {
        return hasAnyRole("ROLE_ADMIN", "ROLE_SUPER_ADMIN");
    }
    
    /**
     * 최고 관리자 권한을 가지고 있는지 확인
     * @return 최고 관리자 여부
     */
    public boolean isSuperAdmin() {
        return hasRole("ROLE_SUPER_ADMIN");
    }
    
    /**
     * 현재 사용자가 특정 사용자와 같은 사용자인지 확인
     * @param userId 비교할 사용자 ID
     * @return 같은 사용자 여부
     */
    public boolean isSameUser(Long userId) {
        return Objects.equals(this.id, userId);
    }
    
    // equals와 hashCode
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        CustomUserDetails that = (CustomUserDetails) obj;
        return Objects.equals(id, that.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return "CustomUserDetails{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", enabled=" + enabled +
                ", accountNonLocked=" + accountNonLocked +
                ", authoritiesCount=" + authorities.size() +
                '}';
    }
}