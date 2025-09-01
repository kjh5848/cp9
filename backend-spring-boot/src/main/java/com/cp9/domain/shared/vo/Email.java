package com.cp9.domain.shared.vo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

import java.util.Objects;

/**
 * 이메일 Value Object
 * 이메일 형식 검증과 불변성을 보장하는 도메인 값 객체
 */
@Getter
public class Email {
    
    private static final String EMAIL_PATTERN = 
        "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
    
    private final String value;
    
    public Email(String value) {
        validateEmail(value);
        this.value = value.toLowerCase().trim();
    }
    
    private void validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("이메일은 필수입니다.");
        }
        
        if (email.length() > 254) {
            throw new IllegalArgumentException("이메일은 254자를 초과할 수 없습니다.");
        }
        
        if (!email.matches(EMAIL_PATTERN)) {
            throw new IllegalArgumentException("올바른 이메일 형식이 아닙니다.");
        }
    }
    
    public String getDomain() {
        return value.substring(value.indexOf('@') + 1);
    }
    
    public String getLocalPart() {
        return value.substring(0, value.indexOf('@'));
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Email email = (Email) o;
        return Objects.equals(value, email.value);
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