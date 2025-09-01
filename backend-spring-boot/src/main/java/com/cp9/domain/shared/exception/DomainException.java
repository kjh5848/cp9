package com.cp9.domain.shared.exception;

/**
 * 도메인 예외의 기본 클래스
 * 모든 도메인 관련 예외는 이 클래스를 상속받아 구현
 */
public abstract class DomainException extends RuntimeException {
    
    private final String errorCode;
    
    protected DomainException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
    
    protected DomainException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}