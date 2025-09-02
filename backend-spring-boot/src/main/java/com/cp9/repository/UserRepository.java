package com.cp9.repository;

import com.cp9.entity.AuthProvider;
import com.cp9.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * 사용자 리포지토리 인터페이스 (Repository Layer)
 * Spring Security 인증과 Role 기반 인가를 지원하는 사용자 데이터 접근 계층
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // =========================== 기본 조회 ===========================
    
    /**
     * 사용자명으로 사용자 조회 (Spring Security 인증용)
     * @param username 사용자명
     * @return 사용자 Optional 객체
     */
    Optional<User> findByUsername(String username);
    
    /**
     * 이메일로 사용자 조회
     * @param email 사용자 이메일
     * @return 사용자 Optional 객체
     */
    Optional<User> findByEmail(String email);
    
    /**
     * 사용자명 또는 이메일로 사용자 조회 (로그인용)
     * @param username 사용자명
     * @param email 이메일
     * @return 사용자 Optional 객체
     */
    @Query("SELECT u FROM User u WHERE u.username = :username OR u.email = :email")
    Optional<User> findByUsernameOrEmail(@Param("username") String username, @Param("email") String email);

    // =========================== 존재 여부 확인 ===========================
    
    /**
     * 사용자명 존재 여부 확인
     * @param username 확인할 사용자명
     * @return 존재 여부 (true/false)
     */
    boolean existsByUsername(String username);
    
    /**
     * 이메일 존재 여부 확인
     * @param email 확인할 이메일
     * @return 존재 여부 (true/false)
     */
    boolean existsByEmail(String email);

    
    // =========================== 인증 관련 조회 ===========================
    
    /**
     * 이메일 인증 토큰으로 사용자 조회
     * @param verificationToken 인증 토큰
     * @return 사용자 Optional
     */
    Optional<User> findByVerificationToken(String verificationToken);
    
    /**
     * 비밀번호 재설정 토큰으로 사용자 조회
     * @param passwordResetToken 비밀번호 재설정 토큰
     * @return 사용자 Optional
     */
    Optional<User> findByPasswordResetToken(String passwordResetToken);
    
    /**
     * OAuth2 제공자와 제공자 ID로 사용자 조회
     * @param authProvider 인증 제공자
     * @param providerId 제공자 ID
     * @return 사용자 Optional
     */
    Optional<User> findByAuthProviderAndProviderId(AuthProvider authProvider, String providerId);
    
    // =========================== 활성 상태별 조회 ===========================
    
    /**
     * 활성화된 사용자 조회 (enabled 상태)
     * @param enabled 활성 상태 (true: 활성, false: 비활성)
     * @return 해당 상태의 사용자 목록
     */
    List<User> findByEnabled(Boolean enabled);
    
    /**
     * 활성 사용자만 페이징 조회 (enabled 상태)
     * @param enabled 활성 상태
     * @param pageable 페이징 정보
     * @return 페이징된 사용자 목록
     */
    Page<User> findByEnabled(Boolean enabled, Pageable pageable);
    
    /**
     * 활성 사용자 조회 (active 상태)
     * @param active 활성 상태 (true: 활성, false: 비활성)
     * @return 해당 상태의 사용자 목록
     */
    List<User> findByActive(Boolean active);
    
    /**
     * 활성 사용자만 페이징 조회 (active 상태)
     * @param active 활성 상태
     * @param pageable 페이징 정보
     * @return 페이징된 사용자 목록
     */
    Page<User> findByActive(Boolean active, Pageable pageable);
    
    /**
     * 계정 잠금 상태별 사용자 조회
     * @param accountNonLocked 계정 잠금 상태
     * @return 해당 상태의 사용자 목록
     */
    List<User> findByAccountNonLocked(Boolean accountNonLocked);
    
    // =========================== Role 기반 조회 ===========================
    
    /**
     * 특정 역할을 가진 사용자들 조회
     * @param roleName 역할 이름 (예: ROLE_ADMIN)
     * @return 해당 역할을 가진 사용자 목록
     */
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.enabled = true")
    List<User> findByRoleName(@Param("roleName") String roleName);
    
    /**
     * 관리자 사용자들 조회
     * @return 관리자 권한을 가진 사용자 목록
     */
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name IN ('ROLE_ADMIN', 'ROLE_SUPER_ADMIN') AND u.enabled = true")
    List<User> findAdminUsers();
    
    /**
     * 일반 사용자들 조회
     * @return 일반 사용자 권한을 가진 사용자 목록
     */
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_USER' AND u.enabled = true")
    List<User> findRegularUsers();
    
    /**
     * 역할이 없는 사용자들 조회
     * @return 역할이 할당되지 않은 사용자 목록
     */
    @Query("SELECT u FROM User u WHERE u.roles IS EMPTY AND u.enabled = true")
    List<User> findUsersWithoutRole();
    
    // =========================== 검색 기능 ===========================
    
    /**
     * 이름에 특정 문자열이 포함된 사용자 조회
     * @param name 검색할 이름 (부분 문자열)
     * @return 조건에 맞는 사용자 목록
     */
    List<User> findByNameContainingIgnoreCase(String name);
    
    /**
     * 이름에 특정 문자열이 포함된 활성 사용자 조회
     * @param name 검색할 이름 (부분 문자열)
     * @param active 활성 상태
     * @return 조건에 맞는 사용자 목록
     */
    List<User> findByNameContainingIgnoreCaseAndActive(String name, Boolean active);
    
    /**
     * 사용자명에 특정 문자열이 포함된 사용자 조회
     * @param username 검색할 사용자명
     * @return 조건에 맞는 사용자 목록
     */
    List<User> findByUsernameContainingIgnoreCase(String username);
    
    /**
     * 이메일에 특정 문자열이 포함된 사용자 조회
     * @param email 검색할 이메일
     * @return 조건에 맞는 사용자 목록
     */
    List<User> findByEmailContainingIgnoreCase(String email);
    
    /**
     * 종합 검색 (이름, 사용자명, 이메일 통합 검색)
     * @param keyword 검색 키워드
     * @return 조건에 맞는 사용자 목록
     */
    @Query("SELECT u FROM User u WHERE u.enabled = true AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<User> searchUsers(@Param("keyword") String keyword);
    
    // =========================== 통계 및 카운트 ===========================
    
    /**
     * 활성 사용자 수 조회
     * @return 활성 사용자 총 개수
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = true")
    long countActiveUsers();
    
    /**
     * 역할별 사용자 수 조회
     * @param roleName 역할 이름
     * @return 해당 역할을 가진 사용자 수
     */
    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.enabled = true")
    long countUsersByRole(@Param("roleName") String roleName);
    
    /**
     * OAuth2 제공자별 사용자 수 조회
     * @param provider 인증 제공자
     * @return 해당 제공자로 가입한 사용자 수
     */
    long countByAuthProvider(AuthProvider provider);
    
    /**
     * 이메일 인증이 완료된 사용자 수 조회
     * @return 이메일 인증 완료 사용자 수
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.emailVerifiedAt IS NOT NULL")
    long countEmailVerifiedUsers();
    
    // =========================== 관리 기능 ===========================
    
    /**
     * 사용자 활성화/비활성화
     * @param userId 사용자 ID
     * @param enabled 활성 상태
     * @return 업데이트된 레코드 수
     */
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.enabled = :enabled WHERE u.id = :userId")
    int updateUserEnabled(@Param("userId") Long userId, @Param("enabled") Boolean enabled);
    
    /**
     * 사용자 계정 잠금/해제
     * @param userId 사용자 ID
     * @param locked 잠금 상태 (true: 잠금해제, false: 잠금)
     * @return 업데이트된 레코드 수
     */
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.accountNonLocked = :locked WHERE u.id = :userId")
    int updateUserLocked(@Param("userId") Long userId, @Param("locked") Boolean locked);
    
    /**
     * 마지막 로그인 시간 업데이트
     * @param userId 사용자 ID
     * @param lastLoginAt 마지막 로그인 시간
     * @return 업데이트된 레코드 수
     */
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.lastLoginAt = :lastLoginAt, u.loginCount = u.loginCount + 1 WHERE u.id = :userId")
    int updateLastLogin(@Param("userId") Long userId, @Param("lastLoginAt") LocalDateTime lastLoginAt);
    
    /**
     * 이메일 인증 완료 처리
     * @param userId 사용자 ID
     * @param verifiedAt 인증 완료 시간
     * @return 업데이트된 레코드 수
     */
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.emailVerifiedAt = :verifiedAt, u.enabled = true, u.verificationToken = null WHERE u.id = :userId")
    int markEmailAsVerified(@Param("userId") Long userId, @Param("verifiedAt") LocalDateTime verifiedAt);
    
    // =========================== 정리 기능 ===========================
    
    /**
     * 오래된 미인증 사용자 삭제 (30일 이상 미인증)
     * @param cutoffDate 기준 날짜
     * @return 삭제된 레코드 수
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM User u WHERE u.enabled = false AND u.emailVerifiedAt IS NULL AND u.createdAt < :cutoffDate")
    int deleteUnverifiedUsersOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * 특정 이메일 도메인의 사용자 조회
     * @param domain 이메일 도메인 (예: gmail.com)
     * @return 해당 도메인의 사용자 목록
     */
    @Query("SELECT u FROM User u WHERE u.email LIKE CONCAT('%@', :domain)")
    List<User> findByEmailDomain(@Param("domain") String domain);
    
    /**
     * 최근 로그인한 사용자들 조회 (상위 N개)
     * @param limit 조회할 개수
     * @return 최근 로그인 사용자 목록
     */
    @Query("SELECT u FROM User u WHERE u.lastLoginAt IS NOT NULL ORDER BY u.lastLoginAt DESC LIMIT :limit")
    List<User> findRecentlyLoggedInUsers(@Param("limit") int limit);
}