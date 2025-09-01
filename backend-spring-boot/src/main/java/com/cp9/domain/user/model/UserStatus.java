package com.cp9.domain.user.model;

/**
 * 사용자 상태를 나타내는 열거형
 */
public enum UserStatus {
    ACTIVE("활성"),
    INACTIVE("비활성"),
    SUSPENDED("정지"),
    DELETED("삭제됨");
    
    private final String description;
    
    UserStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * 사용자가 활성 상태인지 확인
     */
    public boolean isActive() {
        return this == ACTIVE;
    }
    
    /**
     * 사용자가 접근 가능한 상태인지 확인 (활성 또는 비활성)
     */
    public boolean isAccessible() {
        return this == ACTIVE || this == INACTIVE;
    }
}