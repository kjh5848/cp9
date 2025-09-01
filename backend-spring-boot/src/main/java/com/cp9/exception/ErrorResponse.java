package com.cp9.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * API 오류 응답을 위한 표준 응답 객체
 * 모든 예외에 대해 일관된 형태의 응답을 제공
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    private int status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> validationErrors;

    // 기본 생성자
    public ErrorResponse() {}

    // 빌더 생성자
    private ErrorResponse(Builder builder) {
        this.timestamp = builder.timestamp;
        this.status = builder.status;
        this.error = builder.error;
        this.message = builder.message;
        this.path = builder.path;
        this.validationErrors = builder.validationErrors;
    }

    // Getter methods
    public LocalDateTime getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
    public String getError() { return error; }
    public String getMessage() { return message; }
    public String getPath() { return path; }
    public Map<String, String> getValidationErrors() { return validationErrors; }

    // Setter methods
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public void setStatus(int status) { this.status = status; }
    public void setError(String error) { this.error = error; }
    public void setMessage(String message) { this.message = message; }
    public void setPath(String path) { this.path = path; }
    public void setValidationErrors(Map<String, String> validationErrors) { this.validationErrors = validationErrors; }

    // Builder 패턴
    public static Builder builder() {
        return new Builder();
    }

    public Builder toBuilder() {
        return new Builder()
                .timestamp(this.timestamp)
                .status(this.status)
                .error(this.error)
                .message(this.message)
                .path(this.path)
                .validationErrors(this.validationErrors);
    }

    public static class Builder {
        private LocalDateTime timestamp;
        private int status;
        private String error;
        private String message;
        private String path;
        private Map<String, String> validationErrors;

        public Builder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder status(int status) {
            this.status = status;
            return this;
        }

        public Builder error(String error) {
            this.error = error;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder path(String path) {
            this.path = path;
            return this;
        }

        public Builder validationErrors(Map<String, String> validationErrors) {
            this.validationErrors = validationErrors;
            return this;
        }

        public ErrorResponse build() {
            return new ErrorResponse(this);
        }
    }

    @Override
    public String toString() {
        return "ErrorResponse{" +
                "timestamp=" + timestamp +
                ", status=" + status +
                ", error='" + error + '\'' +
                ", message='" + message + '\'' +
                ", path='" + path + '\'' +
                ", validationErrors=" + validationErrors +
                '}';
    }
}