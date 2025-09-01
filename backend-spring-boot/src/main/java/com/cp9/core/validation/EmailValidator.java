package com.cp9.core.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * 이메일 유효성 검증기
 * 커스텀 이메일 형식 검증 로직
 */
public class EmailValidator implements ConstraintValidator<ValidEmail, String> {
    
    private static final String EMAIL_PATTERN = 
        "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
    
    private static final Pattern pattern = Pattern.compile(EMAIL_PATTERN);
    
    @Override
    public void initialize(ValidEmail constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }
    
    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        
        String trimmedEmail = email.trim();
        
        // 길이 검증
        if (trimmedEmail.length() > 254) {
            return false;
        }
        
        // 패턴 검증
        return pattern.matcher(trimmedEmail).matches();
    }
}