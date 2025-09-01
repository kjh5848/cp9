package com.cp9.application.user.port.in;

import com.cp9.application.user.dto.ChangeEmailCommand;
import com.cp9.application.user.dto.UpdateUserCommand;
import com.cp9.application.user.dto.UserResponse;

/**
 * 사용자 정보 수정 유스케이스 인바운드 포트
 * 사용자 정보 수정 기능의 계약을 정의
 */
public interface UpdateUserUseCase {
    
    /**
     * 사용자 프로필 업데이트
     */
    UserResponse updateUser(UpdateUserCommand command);
    
    /**
     * 사용자 이메일 변경
     */
    UserResponse changeEmail(ChangeEmailCommand command);
    
    /**
     * 사용자 활성화
     */
    UserResponse activateUser(String userId);
    
    /**
     * 사용자 비활성화
     */
    UserResponse deactivateUser(String userId);
    
    /**
     * 사용자 정지
     */
    UserResponse suspendUser(String userId);
    
    /**
     * 사용자 삭제 (소프트 삭제)
     */
    void deleteUser(String userId);
    
    /**
     * 로그인 시간 기록
     */
    UserResponse recordLogin(String userId);
}