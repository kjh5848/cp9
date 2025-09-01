package com.cp9.application.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 생성 명령
 * 새 사용자 생성을 위한 입력 데이터
 */
@Getter
@NoArgsConstructor
public class CreateUserCommand {
    
    @NotBlank(message = "사용자명은 필수입니다.")
    @Size(min = 3, max = 50, message = "사용자명은 3자 이상 50자 이하여야 합니다.")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "사용자명은 영문, 숫자, 언더스코어, 하이픈만 사용할 수 있습니다.")
    private String username;
    
    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Size(max = 254, message = "이메일은 254자를 초과할 수 없습니다.")
    private String email;
    
    @NotBlank(message = "표시명은 필수입니다.")
    @Size(max = 100, message = "표시명은 100자를 초과할 수 없습니다.")
    private String displayName;
    
    public CreateUserCommand(String username, String email, String displayName) {
        this.username = username;
        this.email = email;
        this.displayName = displayName;
    }
}