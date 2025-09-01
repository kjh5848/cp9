package com.cp9.domain.user.model;

import lombok.Getter;

import java.util.Objects;
import java.util.UUID;

/**
 * 사용자 식별자 Value Object
 * 사용자의 고유 식별자를 나타내는 불변 객체
 */
@Getter
public class UserId {
    
    private final String value;
    
    public UserId(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("사용자 ID는 필수입니다.");
        }
        this.value = value.trim();
    }
    
    /**
     * 새로운 UUID 기반 사용자 ID 생성
     */
    public static UserId generate() {
        return new UserId(UUID.randomUUID().toString());
    }
    
    /**
     * 문자열로부터 사용자 ID 생성
     */
    public static UserId of(String value) {
        return new UserId(value);
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserId userId = (UserId) o;
        return Objects.equals(value, userId.value);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
    
    @Override
    public String toString() {
        return value;
    }
}