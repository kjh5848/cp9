package com.cp9.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 사용자 엔티티 (Entity Layer)
 * Spring Security UserDetails와 연동되는 사용자 정보
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "사용자명은 필수입니다")
    @Size(min = 3, max = 50, message = "사용자명은 3자 이상 50자 이하여야 합니다")
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @NotBlank(message = "이메일은 필수입니다")
    private String email;

    @Column(nullable = false)
    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;

    @Column(length = 50)
    @Size(max = 50, message = "이름은 50자 이하여야 합니다")
    private String name;

    @Column(length = 20)
    private String phoneNumber;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<RefreshToken> refreshTokens = new HashSet<>();

    // Spring Security 관련 필드들
    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = false; // 이메일 인증 후 활성화

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true; // 사용자 활성화 상태 (논리적 삭제 방지)

    @Builder.Default
    @Column(name = "account_non_expired", nullable = false)
    private Boolean accountNonExpired = true;

    @Builder.Default
    @Column(name = "account_non_locked", nullable = false)
    private Boolean accountNonLocked = true;

    @Builder.Default
    @Column(name = "credentials_non_expired", nullable = false)
    private Boolean credentialsNonExpired = true;

    // 인증 관련 필드들
    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_expires_at")
    private LocalDateTime passwordResetExpiresAt;

    // OAuth2 관련 필드들
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider")
    private AuthProvider authProvider;

    @Column(name = "provider_id")
    private String providerId;

    // 활동 추적
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "login_count")
    @Builder.Default
    private Integer loginCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    
    // 편의 생성자들
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.enabled = false; // 이메일 인증 필요
        this.authProvider = AuthProvider.LOCAL;
    }
    
    // 비즈니스 메서드들
    public void activate() {
        this.enabled = true;
        this.emailVerifiedAt = LocalDateTime.now();
    }
    
    public void deactivate() {
        this.enabled = false;
    }
    
    public boolean isActive() {
        return this.enabled;
    }
    
    public void lock() {
        this.accountNonLocked = false;
    }
    
    public void unlock() {
        this.accountNonLocked = true;
    }
    
    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
        this.loginCount++;
    }
    
    // 역할 관리 메서드들
    public void addRole(Role role) {
        this.roles.add(role);
        role.getUsers().add(this);
    }
    
    public void removeRole(Role role) {
        this.roles.remove(role);
        role.getUsers().remove(this);
    }
    
    public boolean hasRole(String roleName) {
        return roles.stream()
                .anyMatch(role -> role.getName().equals(roleName));
    }
    
    public boolean hasAnyRole(String... roleNames) {
        for (String roleName : roleNames) {
            if (hasRole(roleName)) {
                return true;
            }
        }
        return false;
    }
    
    public boolean isAdmin() {
        return hasAnyRole("ROLE_ADMIN", "ROLE_SUPER_ADMIN");
    }
    
    public boolean isSuperAdmin() {
        return hasRole("ROLE_SUPER_ADMIN");
    }
    
    // 인증 관련 메서드들
    public void setVerificationToken(String token) {
        this.verificationToken = token;
    }
    
    public void clearVerificationToken() {
        this.verificationToken = null;
    }
    
    public boolean isEmailVerified() {
        return emailVerifiedAt != null;
    }
    
    public void setPasswordResetToken(String token, LocalDateTime expiresAt) {
        this.passwordResetToken = token;
        this.passwordResetExpiresAt = expiresAt;
    }
    
    public void clearPasswordResetToken() {
        this.passwordResetToken = null;
        this.passwordResetExpiresAt = null;
    }
    
    public boolean isPasswordResetTokenValid() {
        return passwordResetToken != null && 
               passwordResetExpiresAt != null &&
               LocalDateTime.now().isBefore(passwordResetExpiresAt);
    }
    
    // OAuth2 관련 메서드들
    public void setOAuth2Info(AuthProvider provider, String providerId) {
        this.authProvider = provider;
        this.providerId = providerId;
        this.enabled = true; // OAuth2 사용자는 바로 활성화
    }
    
    public boolean isOAuth2User() {
        return authProvider != null && authProvider != AuthProvider.LOCAL;
    }
    
    // RefreshToken 관리
    public void addRefreshToken(RefreshToken refreshToken) {
        refreshTokens.add(refreshToken);
        refreshToken.setUser(this);
    }
    
    public void revokeAllRefreshTokens() {
        refreshTokens.forEach(RefreshToken::revoke);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        User user = (User) obj;
        return id != null && id.equals(user.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", enabled=" + enabled +
                ", authProvider=" + authProvider +
                ", rolesCount=" + (roles != null ? roles.size() : 0) +
                ", createdAt=" + createdAt +
                '}';
    }
}