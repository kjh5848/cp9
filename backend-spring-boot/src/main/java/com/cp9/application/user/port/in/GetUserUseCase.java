package com.cp9.application.user.port.in;

import com.cp9.application.user.dto.UserQuery;
import com.cp9.application.user.dto.UserResponse;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 조회 유스케이스 인바운드 포트
 * 사용자 조회 기능의 계약을 정의
 */
public interface GetUserUseCase {
    
    /**
     * 사용자 ID로 조회
     */
    Optional<UserResponse> getUserById(String userId);
    
    /**
     * 사용자명으로 조회
     */
    Optional<UserResponse> getUserByUsername(String username);
    
    /**
     * 이메일로 조회
     */
    Optional<UserResponse> getUserByEmail(String email);
    
    /**
     * 모든 사용자 조회
     */
    List<UserResponse> getAllUsers();
    
    /**
     * 활성 사용자 조회
     */
    List<UserResponse> getActiveUsers();
    
    /**
     * 쿼리 조건으로 사용자 조회
     */
    List<UserResponse> getUsersByQuery(UserQuery query);
}