package com.cp9.application.user.dto;

import com.cp9.domain.user.model.User;
import com.cp9.domain.user.model.UserStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 사용자 응답 DTO
 * 클라이언트에 반환되는 사용자 정보
 */
@Getter
public class UserResponse {
    
    private final String id;
    private final String username;
    private final String email;
    private final String displayName;
    private final UserStatus status;
    private final String statusDescription;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime updatedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime lastLoginAt;
    
    public UserResponse(User user) {
        this.id = user.getId().getValue();
        this.username = user.getUsername();
        this.email = user.getEmail().getValue();
        this.displayName = user.getDisplayName();
        this.status = user.getStatus();
        this.statusDescription = user.getStatus().getDescription();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
        this.lastLoginAt = user.getLastLoginAt();
    }
    
    /**
     * 간단한 사용자 정보만 포함한 응답 (프로필용)
     */
    public static UserResponse profile(User user) {
        return new UserResponse(user);
    }
    
    /**
     * 사용자 존재 여부만 확인하는 응답
     */
    public static UserResponse summary(User user) {
        return new UserResponse(user);
    }
}