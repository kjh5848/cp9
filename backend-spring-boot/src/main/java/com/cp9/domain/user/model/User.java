package com.cp9.domain.user.model;

import com.cp9.domain.shared.vo.Email;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * 사용자 도메인 엔티티
 * 사용자와 관련된 핵심 비즈니스 로직과 규칙을 포함
 */
@Getter
public class User {
    
    private UserId id;
    private String username;
    private Email email;
    private String displayName;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
    
    // JPA를 위한 기본 생성자
    protected User() {}
    
    /**
     * 새 사용자 생성
     */
    public User(String username, Email email, String displayName) {
        validateUserCreation(username, email, displayName);
        
        this.id = UserId.generate();
        this.username = username.trim();
        this.email = email;
        this.displayName = displayName.trim();
        this.status = UserStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * 기존 사용자 재구성 (영속성 레이어에서 사용)
     */
    public User(UserId id, String username, Email email, String displayName, 
                UserStatus status, LocalDateTime createdAt, LocalDateTime updatedAt, 
                LocalDateTime lastLoginAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLoginAt = lastLoginAt;
    }
    
    /**
     * 사용자 프로필 업데이트
     */
    public void updateProfile(String displayName) {
        validateDisplayName(displayName);
        this.displayName = displayName.trim();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * 이메일 변경
     */
    public void changeEmail(Email newEmail) {
        if (newEmail == null) {
            throw new IllegalArgumentException("이메일은 필수입니다.");
        }
        this.email = newEmail;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * 사용자 활성화
     */
    public void activate() {
        if (this.status == UserStatus.DELETED) {
            throw new IllegalStateException("삭제된 사용자는 활성화할 수 없습니다.");
        }
        this.status = UserStatus.ACTIVE;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * 사용자 비활성화
     */
    public void deactivate() {
        if (this.status == UserStatus.DELETED) {
            throw new IllegalStateException("삭제된 사용자는 비활성화할 수 없습니다.");
        }
        this.status = UserStatus.INACTIVE;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * 사용자 정지
     */
    public void suspend() {
        if (this.status == UserStatus.DELETED) {
            throw new IllegalStateException("삭제된 사용자는 정지할 수 없습니다.");
        }
        this.status = UserStatus.SUSPENDED;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * 사용자 삭제 (소프트 삭제)
     */
    public void delete() {
        this.status = UserStatus.DELETED;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * 로그인 시간 기록
     */
    public void recordLogin() {
        this.lastLoginAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * 사용자가 로그인 가능한 상태인지 확인
     */
    public boolean canLogin() {
        return status.isActive();
    }
    
    /**
     * 사용자가 접근 가능한 상태인지 확인
     */
    public boolean isAccessible() {
        return status.isAccessible();
    }
    
    private void validateUserCreation(String username, Email email, String displayName) {
        validateUsername(username);
        if (email == null) {
            throw new IllegalArgumentException("이메일은 필수입니다.");
        }
        validateDisplayName(displayName);
    }
    
    private void validateUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("사용자명은 필수입니다.");
        }
        
        String trimmed = username.trim();
        if (trimmed.length() < 3 || trimmed.length() > 50) {
            throw new IllegalArgumentException("사용자명은 3자 이상 50자 이하여야 합니다.");
        }
        
        if (!trimmed.matches("^[a-zA-Z0-9_-]+$")) {
            throw new IllegalArgumentException("사용자명은 영문, 숫자, 언더스코어, 하이픈만 사용할 수 있습니다.");
        }
    }
    
    private void validateDisplayName(String displayName) {
        if (displayName == null || displayName.trim().isEmpty()) {
            throw new IllegalArgumentException("표시명은 필수입니다.");
        }
        
        String trimmed = displayName.trim();
        if (trimmed.length() > 100) {
            throw new IllegalArgumentException("표시명은 100자를 초과할 수 없습니다.");
        }
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email=" + email +
                ", displayName='" + displayName + '\'' +
                ", status=" + status +
                ", createdAt=" + createdAt +
                '}';
    }
}