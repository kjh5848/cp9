package com.cp9.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 100)
    private String name; // USER_READ, USER_WRITE, ADMIN_ACCESS, SYSTEM_CONFIG, etc.
    
    @Column(length = 200)
    private String description;
    
    @Column(length = 50)
    private String resource; // USER, ADMIN, SYSTEM, etc.
    
    @Column(length = 50)
    private String action; // READ, WRITE, DELETE, EXECUTE, ACCESS, etc.
    
    @Column(name = "display_name", length = 100)
    private String displayName; // 화면 표시용 이름
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @ManyToMany(mappedBy = "permissions")
    @Builder.Default
    private Set<Role> roles = new HashSet<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Permission permission = (Permission) obj;
        return id != null && id.equals(permission.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    
    @Override
    public String toString() {
        return "Permission{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", resource='" + resource + '\'' +
                ", action='" + action + '\'' +
                ", displayName='" + displayName + '\'' +
                ", enabled=" + enabled +
                '}';
    }
}