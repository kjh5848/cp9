package com.cp9.repository;

import com.cp9.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

/**
 * 역할(Role) 리포지토리
 * Spring Security RBAC를 위한 역할 관리
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    /**
     * 역할 이름으로 역할 조회
     * @param name 역할 이름 (예: ROLE_USER, ROLE_ADMIN)
     * @return 역할 Optional
     */
    Optional<Role> findByName(String name);
    
    /**
     * 역할 이름으로 존재 여부 확인
     * @param name 역할 이름
     * @return 존재 여부
     */
    boolean existsByName(String name);
    
    /**
     * 활성화된 역할들만 조회
     * @return 활성화된 역할 목록
     */
    @Query("SELECT r FROM Role r WHERE r.enabled = true ORDER BY r.name")
    Set<Role> findByEnabledTrueOrderByName();
    
    /**
     * 역할 이름 목록으로 역할들 조회
     * @param names 역할 이름 목록
     * @return 역할 Set
     */
    @Query("SELECT r FROM Role r WHERE r.name IN :names AND r.enabled = true")
    Set<Role> findByNameInAndEnabledTrue(@Param("names") Set<String> names);
    
    /**
     * 기본 사용자 역할 조회
     * @return ROLE_USER 역할
     */
    @Query("SELECT r FROM Role r WHERE r.name = 'ROLE_USER'")
    Optional<Role> findDefaultUserRole();
    
    /**
     * 관리자 역할들 조회
     * @return 관리자 역할 목록
     */
    @Query("SELECT r FROM Role r WHERE r.name IN ('ROLE_ADMIN', 'ROLE_SUPER_ADMIN') AND r.enabled = true")
    Set<Role> findAdminRoles();
    
    /**
     * 특정 권한을 가진 역할들 조회
     * @param permissionName 권한 이름
     * @return 해당 권한을 가진 역할들
     */
    @Query("SELECT r FROM Role r JOIN r.permissions p WHERE p.name = :permissionName AND r.enabled = true")
    Set<Role> findByPermissionName(@Param("permissionName") String permissionName);
    
    /**
     * 역할별 사용자 수 조회
     * @param roleName 역할 이름
     * @return 해당 역할을 가진 사용자 수
     */
    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.enabled = true")
    long countUsersByRoleName(@Param("roleName") String roleName);
}