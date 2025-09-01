package com.cp9.core.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * 이메일 유효성 검증 어노테이션
 * 커스텀 이메일 검증 로직을 적용하는 어노테이션
 */
@Documented
@Constraint(validatedBy = EmailValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEmail {
    
    String message() default "올바른 이메일 형식이 아닙니다.";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}