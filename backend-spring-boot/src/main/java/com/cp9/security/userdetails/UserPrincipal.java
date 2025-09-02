package com.cp9.security.userdetails;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * 사용자 주체 정보 클래스
 * JWT 토큰에 포함되거나 SecurityContext에서 사용되는 사용자 정보
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPrincipal {
    
    private Long id;
    private String username;
    private String email;
    private String name;
    private Collection<? extends GrantedAuthority> authorities;
    
    /**
     * CustomUserDetails로부터 UserPrincipal 생성
     * @param userDetails CustomUserDetails 인스턴스
     * @return UserPrincipal 인스턴스
     */
    public static UserPrincipal create(CustomUserDetails userDetails) {
        return UserPrincipal.builder()
            .id(userDetails.getId())
            .username(userDetails.getUsername())
            .email(userDetails.getEmail())
            .name(userDetails.getName())
            .authorities(userDetails.getAuthorities())
            .build();
    }
    
    /**
     * 특정 역할을 가지고 있는지 확인
     * @param roleName 역할 이름
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
     * @param permissionName 권한 이름
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
}