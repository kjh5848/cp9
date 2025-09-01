package com.cp9.core.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 에러 응답 DTO
 * API 에러 응답의 일관성을 보장하는 표준 응답 형식
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    private int status;
    private String error;
    private String message;
    private String errorCode;
    private String path;
    
    // 유효성 검증 실패 시 필드별 에러 메시지
    private Map<String, String> validationErrors;
    
    // 추가 정보가 필요한 경우
    private Map<String, Object> details;
}