package com.cp9.dto;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * 사용자 데이터 전송 객체 모음 (DTO Layer)
 * 클라이언트와 서버 간 데이터 전송을 위한 객체들
 */
public class UserDto {

    /**
     * 사용자 생성 요청 DTO
     */
    public static class CreateRequest {
        @Email(message = "올바른 이메일 형식이 아닙니다")
        @NotBlank(message = "이메일은 필수입니다")
        private String email;

        @NotBlank(message = "이름은 필수입니다")
        @Size(min = 2, max = 50, message = "이름은 2자 이상 50자 이하여야 합니다")
        private String name;

        // 기본 생성자
        public CreateRequest() {}

        // 생성자
        public CreateRequest(String email, String name) {
            this.email = email;
            this.name = name;
        }

        // Getter & Setter
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    /**
     * 사용자 업데이트 요청 DTO
     */
    public static class UpdateRequest {
        @Email(message = "올바른 이메일 형식이 아닙니다")
        private String email;

        @Size(min = 2, max = 50, message = "이름은 2자 이상 50자 이하여야 합니다")
        private String name;

        // 기본 생성자
        public UpdateRequest() {}

        // 생성자
        public UpdateRequest(String email, String name) {
            this.email = email;
            this.name = name;
        }

        // Getter & Setter
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    /**
     * 사용자 응답 DTO
     */
    public static class Response {
        private Long id;
        private String email;
        private String name;
        private Boolean active;

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;

        // 기본 생성자
        public Response() {}

        // 생성자
        public Response(Long id, String email, String name, Boolean active, 
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
            this.id = id;
            this.email = email;
            this.name = name;
            this.active = active;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        // Getter & Setter
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    /**
     * 사용자 목록 조회용 간단한 응답 DTO
     */
    public static class Summary {
        private Long id;
        private String email;
        private String name;
        private Boolean active;

        // 기본 생성자
        public Summary() {}

        // 생성자
        public Summary(Long id, String email, String name, Boolean active) {
            this.id = id;
            this.email = email;
            this.name = name;
            this.active = active;
        }

        // Getter & Setter
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }
}