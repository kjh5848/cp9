package com.cp9.application.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이메일 변경 명령
 * 사용자 이메일 변경을 위한 입력 데이터
 */
@Getter
@NoArgsConstructor
public class ChangeEmailCommand {
    
    @NotBlank(message = "사용자 ID는 필수입니다.")
    private String userId;
    
    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Size(max = 254, message = "이메일은 254자를 초과할 수 없습니다.")
    private String email;
    
    public ChangeEmailCommand(String userId, String email) {
        this.userId = userId;
        this.email = email;
    }
}