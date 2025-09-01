package com.cp9.infrastructure.persistence.user;

import com.cp9.domain.shared.vo.Email;
import com.cp9.domain.user.model.User;
import com.cp9.domain.user.model.UserId;
import com.cp9.domain.user.model.UserStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 사용자 JPA 엔티티
 * 데이터베이스 테이블과 매핑되는 영속성 객체
 */
@Entity
@Table(name = "users", 
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_users_username", columnNames = "username"),
           @UniqueConstraint(name = "uk_users_email", columnNames = "email")
       },
       indexes = {
           @Index(name = "idx_users_status", columnList = "status"),
           @Index(name = "idx_users_email", columnList = "email"),
           @Index(name = "idx_users_created_at", columnList = "created_at")
       })
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserJpaEntity {
    
    @Id
    @Column(name = "id", length = 36)
    private String id;
    
    @Column(name = "username", nullable = false, length = 50)
    private String username;
    
    @Column(name = "email", nullable = false, length = 254)
    private String email;
    
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private UserStatus status;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    /**
     * 도메인 객체로부터 JPA 엔티티 생성
     */
    public static UserJpaEntity from(User user) {
        UserJpaEntity entity = new UserJpaEntity();
        entity.id = user.getId().getValue();
        entity.username = user.getUsername();
        entity.email = user.getEmail().getValue();
        entity.displayName = user.getDisplayName();
        entity.status = user.getStatus();
        entity.createdAt = user.getCreatedAt();
        entity.updatedAt = user.getUpdatedAt();
        entity.lastLoginAt = user.getLastLoginAt();
        return entity;
    }
    
    /**
     * JPA 엔티티를 도메인 객체로 변환
     */
    public User toDomain() {
        return new User(
            UserId.of(this.id),
            this.username,
            new Email(this.email),
            this.displayName,
            this.status,
            this.createdAt,
            this.updatedAt,
            this.lastLoginAt
        );
    }
    
    /**
     * 도메인 객체의 변경사항을 JPA 엔티티에 반영
     */
    public void updateFrom(User user) {
        this.username = user.getUsername();
        this.email = user.getEmail().getValue();
        this.displayName = user.getDisplayName();
        this.status = user.getStatus();
        this.updatedAt = user.getUpdatedAt();
        this.lastLoginAt = user.getLastLoginAt();
    }
}