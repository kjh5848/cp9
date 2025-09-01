package com.cp9.exception;

/**
 * 리소스를 찾을 수 없을 때 발생하는 예외
 * HTTP 404 Not Found 상태 코드에 매핑됨
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * 기본 생성자
     */
    public ResourceNotFoundException() {
        super("리소스를 찾을 수 없습니다.");
    }

    /**
     * 메시지와 함께 예외 생성
     * @param message 예외 메시지
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * 메시지와 원인과 함께 예외 생성
     * @param message 예외 메시지
     * @param cause 예외 원인
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}