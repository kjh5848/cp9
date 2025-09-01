package com.cp9.infrastructure.persistence.user;

import com.cp9.domain.user.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 JPA 레포지토리
 * Spring Data JPA를 사용한 데이터 액세스
 */
@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, String> {
    
    /**
     * 사용자명으로 조회
     */
    Optional<UserJpaEntity> findByUsername(String username);
    
    /**
     * 이메일로 조회
     */
    Optional<UserJpaEntity> findByEmail(String email);
    
    /**
     * 상태별 사용자 조회
     */
    List<UserJpaEntity> findByStatus(UserStatus status);
    
    /**
     * 활성 사용자 조회
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE u.status = 'ACTIVE' ORDER BY u.createdAt DESC")
    List<UserJpaEntity> findActiveUsers();
    
    /**
     * 사용자명 존재 여부 확인
     */
    boolean existsByUsername(String username);
    
    /**
     * 이메일 존재 여부 확인
     */
    boolean existsByEmail(String email);
    
    /**
     * 상태별 사용자 수 조회
     */
    long countByStatus(UserStatus status);
    
    /**
     * 표시명으로 검색 (LIKE 검색)
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE u.displayName LIKE %:displayName% ORDER BY u.createdAt DESC")
    List<UserJpaEntity> findByDisplayNameContaining(@Param("displayName") String displayName);
    
    /**
     * 최근 로그인한 사용자 조회
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE u.lastLoginAt IS NOT NULL ORDER BY u.lastLoginAt DESC")
    List<UserJpaEntity> findRecentlyLoggedInUsers();
    
    /**
     * 생성일 기간별 사용자 조회
     */
    @Query("SELECT u FROM UserJpaEntity u WHERE u.createdAt BETWEEN :startDate AND :endDate ORDER BY u.createdAt DESC")
    List<UserJpaEntity> findByCreatedAtBetween(@Param("startDate") java.time.LocalDateTime startDate, 
                                             @Param("endDate") java.time.LocalDateTime endDate);
}