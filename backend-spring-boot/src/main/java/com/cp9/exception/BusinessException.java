package com.cp9.exception;

/**
 * 비즈니스 로직 관련 예외
 * HTTP 400 Bad Request 상태 코드에 매핑됨
 */
public class BusinessException extends RuntimeException {

    /**
     * 기본 생성자
     */
    public BusinessException() {
        super("비즈니스 규칙 위반입니다.");
    }

    /**
     * 메시지와 함께 예외 생성
     * @param message 예외 메시지
     */
    public BusinessException(String message) {
        super(message);
    }

    /**
     * 메시지와 원인과 함께 예외 생성
     * @param message 예외 메시지
     * @param cause 예외 원인
     */
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}