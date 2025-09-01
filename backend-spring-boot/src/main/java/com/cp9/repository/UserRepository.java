package com.cp9.repository;

import com.cp9.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * 사용자 리포지토리 인터페이스 (Repository Layer)
 * Spring Data JPA를 사용한 데이터 액세스 계층
 * JpaRepository를 상속받아 기본 CRUD 기능을 자동으로 제공받음
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일로 사용자 조회
     * @param email 사용자 이메일
     * @return 사용자 Optional 객체
     */
    Optional<User> findByEmail(String email);

    /**
     * 이메일 존재 여부 확인
     * @param email 확인할 이메일
     * @return 존재 여부 (true/false)
     */
    boolean existsByEmail(String email);

    /**
     * 활성 상태별 사용자 조회
     * @param active 활성 상태 (true: 활성, false: 비활성)
     * @return 해당 상태의 사용자 목록
     */
    List<User> findByActive(Boolean active);

    /**
     * 활성 사용자만 페이징 조회
     * @param active 활성 상태
     * @param pageable 페이징 정보
     * @return 페이징된 사용자 목록
     */
    Page<User> findByActive(Boolean active, Pageable pageable);

    /**
     * 이름에 특정 문자열이 포함된 사용자 조회
     * @param name 검색할 이름 (부분 문자열)
     * @return 조건에 맞는 사용자 목록
     */
    List<User> findByNameContainingIgnoreCase(String name);

    /**
     * 이름에 특정 문자열이 포함된 활성 사용자 조회
     * @param name 검색할 이름
     * @param active 활성 상태
     * @return 조건에 맞는 사용자 목록
     */
    List<User> findByNameContainingIgnoreCaseAndActive(String name, Boolean active);

    /**
     * 이름으로 시작하는 사용자 조회
     * @param namePrefix 이름 접두사
     * @return 조건에 맞는 사용자 목록
     */
    List<User> findByNameStartingWithIgnoreCase(String namePrefix);

    /**
     * 커스텀 쿼리: 활성 사용자 수 조회
     * @return 활성 사용자 총 개수
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.active = true")
    long countActiveUsers();

    /**
     * 커스텀 쿼리: 특정 이메일 도메인의 사용자 조회
     * @param domain 이메일 도메인 (예: gmail.com)
     * @return 해당 도메인의 사용자 목록
     */
    @Query("SELECT u FROM User u WHERE u.email LIKE CONCAT('%', :domain)")
    List<User> findByEmailDomain(@Param("domain") String domain);

    /**
     * 커스텀 쿼리: 최근 생성된 사용자 조회 (상위 N개)
     * @param limit 조회할 개수
     * @return 최근 생성된 사용자 목록
     */
    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC LIMIT :limit")
    List<User> findRecentUsers(@Param("limit") int limit);

    /**
     * 네이티브 쿼리: 월별 사용자 등록 통계
     * @return 월별 등록 사용자 수 통계
     */
    @Query(value = "SELECT MONTH(created_at) as month, COUNT(*) as count " +
                   "FROM users " +
                   "WHERE YEAR(created_at) = YEAR(CURDATE()) " +
                   "GROUP BY MONTH(created_at) " +
                   "ORDER BY month", 
           nativeQuery = true)
    List<Object[]> getMonthlyRegistrationStats();
}