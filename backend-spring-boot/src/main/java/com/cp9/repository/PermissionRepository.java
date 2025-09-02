package com.cp9.repository;

import com.cp9.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

/**
 * 권한(Permission) 리포지토리
 * 세밀한 권한 관리를 위한 Permission 엔티티 접근
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    /**
     * 권한 이름으로 권한 조회
     * @param name 권한 이름 (예: USER_READ, ADMIN_ACCESS)
     * @return 권한 Optional
     */
    Optional<Permission> findByName(String name);
    
    /**
     * 권한 이름으로 존재 여부 확인
     * @param name 권한 이름
     * @return 존재 여부
     */
    boolean existsByName(String name);
    
    /**
     * 활성화된 권한들만 조회
     * @return 활성화된 권한 목록
     */
    @Query("SELECT p FROM Permission p WHERE p.enabled = true ORDER BY p.resource, p.action")
    Set<Permission> findByEnabledTrueOrderByResourceAndAction();
    
    /**
     * 리소스별 권한 조회
     * @param resource 리소스 이름 (예: USER, ADMIN, SYSTEM)
     * @return 해당 리소스의 권한들
     */
    @Query("SELECT p FROM Permission p WHERE p.resource = :resource AND p.enabled = true ORDER BY p.action")
    Set<Permission> findByResourceAndEnabledTrueOrderByAction(@Param("resource") String resource);
    
    /**
     * 액션별 권한 조회
     * @param action 액션 이름 (예: READ, WRITE, DELETE)
     * @return 해당 액션의 권한들
     */
    @Query("SELECT p FROM Permission p WHERE p.action = :action AND p.enabled = true ORDER BY p.resource")
    Set<Permission> findByActionAndEnabledTrueOrderByResource(@Param("action") String action);
    
    /**
     * 리소스와 액션으로 권한 조회
     * @param resource 리소스 이름
     * @param action 액션 이름
     * @return 권한 Optional
     */
    Optional<Permission> findByResourceAndAction(String resource, String action);
    
    /**
     * 권한 이름 목록으로 권한들 조회
     * @param names 권한 이름 목록
     * @return 권한 Set
     */
    @Query("SELECT p FROM Permission p WHERE p.name IN :names AND p.enabled = true")
    Set<Permission> findByNameInAndEnabledTrue(@Param("names") Set<String> names);
    
    /**
     * 특정 역할이 가진 권한들 조회
     * @param roleName 역할 이름
     * @return 해당 역할이 가진 권한들
     */
    @Query("SELECT p FROM Permission p JOIN p.roles r WHERE r.name = :roleName AND p.enabled = true AND r.enabled = true")
    Set<Permission> findByRoleName(@Param("roleName") String roleName);
    
    /**
     * 사용자가 가진 모든 권한 조회 (역할을 통해)
     * @param userId 사용자 ID
     * @return 사용자가 가진 모든 권한들
     */
    @Query("SELECT DISTINCT p FROM Permission p JOIN p.roles r JOIN r.users u WHERE u.id = :userId AND p.enabled = true AND r.enabled = true AND u.enabled = true")
    Set<Permission> findByUserId(@Param("userId") Long userId);
    
    /**
     * 관리자 권한들 조회
     * @return 관리자 관련 권한들
     */
    @Query("SELECT p FROM Permission p WHERE p.resource = 'ADMIN' AND p.enabled = true ORDER BY p.action")
    Set<Permission> findAdminPermissions();
    
    /**
     * 시스템 권한들 조회
     * @return 시스템 관련 권한들
     */
    @Query("SELECT p FROM Permission p WHERE p.resource = 'SYSTEM' AND p.enabled = true ORDER BY p.action")
    Set<Permission> findSystemPermissions();
}