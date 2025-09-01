package com.cp9.application.user.port.in;

import com.cp9.application.user.dto.CreateUserCommand;
import com.cp9.application.user.dto.UserResponse;

/**
 * 사용자 생성 유스케이스 인바운드 포트
 * 사용자 생성 기능의 계약을 정의
 */
public interface CreateUserUseCase {
    
    /**
     * 새 사용자 생성
     */
    UserResponse createUser(CreateUserCommand command);
}