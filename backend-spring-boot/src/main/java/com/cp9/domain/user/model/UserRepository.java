package com.cp9.domain.user.model;

import com.cp9.domain.shared.vo.Email;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 도메인 레포지토리 인터페이스
 * 사용자 엔티티의 영속성 계약을 정의
 */
public interface UserRepository {
    
    /**
     * 사용자 저장
     */
    User save(User user);
    
    /**
     * ID로 사용자 조회
     */
    Optional<User> findById(UserId userId);
    
    /**
     * 사용자명으로 사용자 조회
     */
    Optional<User> findByUsername(String username);
    
    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(Email email);
    
    /**
     * 모든 사용자 조회
     */
    List<User> findAll();
    
    /**
     * 상태별 사용자 조회
     */
    List<User> findByStatus(UserStatus status);
    
    /**
     * 활성 사용자 조회
     */
    List<User> findActiveUsers();
    
    /**
     * 사용자 삭제
     */
    void delete(UserId userId);
    
    /**
     * 사용자 존재 여부 확인 (ID)
     */
    boolean existsById(UserId userId);
    
    /**
     * 사용자 존재 여부 확인 (사용자명)
     */
    boolean existsByUsername(String username);
    
    /**
     * 사용자 존재 여부 확인 (이메일)
     */
    boolean existsByEmail(Email email);
    
    /**
     * 전체 사용자 수 조회
     */
    long count();
    
    /**
     * 상태별 사용자 수 조회
     */
    long countByStatus(UserStatus status);
}