package com.cp9.application.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 정보 수정 명령
 * 사용자 프로필 업데이트를 위한 입력 데이터
 */
@Getter
@NoArgsConstructor
public class UpdateUserCommand {
    
    @NotBlank(message = "사용자 ID는 필수입니다.")
    private String userId;
    
    @NotBlank(message = "표시명은 필수입니다.")
    @Size(max = 100, message = "표시명은 100자를 초과할 수 없습니다.")
    private String displayName;
    
    public UpdateUserCommand(String userId, String displayName) {
        this.userId = userId;
        this.displayName = displayName;
    }
}