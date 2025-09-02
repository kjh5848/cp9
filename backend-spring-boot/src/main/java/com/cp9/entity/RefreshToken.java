package com.cp9.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(name = "device_info")
    private String deviceInfo; // 디바이스 정보 (예: "Chrome on Windows")
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress; // IPv4/IPv6 지원
    
    @Builder.Default
    @Column(name = "is_revoked", nullable = false)
    private Boolean isRevoked = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
    
    public boolean isValid() {
        return !isRevoked && !isExpired();
    }
    
    public void revoke() {
        this.isRevoked = true;
    }
    
    public void updateLastUsed() {
        this.lastUsedAt = LocalDateTime.now();
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        RefreshToken that = (RefreshToken) obj;
        return id != null && id.equals(that.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    
    @Override
    public String toString() {
        return "RefreshToken{" +
                "id=" + id +
                ", token='" + token.substring(0, Math.min(token.length(), 10)) + "...'" +
                ", userId=" + (user != null ? user.getId() : null) +
                ", expiryDate=" + expiryDate +
                ", isRevoked=" + isRevoked +
                ", createdAt=" + createdAt +
                '}';
    }
}