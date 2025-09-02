package com.cp9.repository;

import com.cp9.entity.RefreshToken;
import com.cp9.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 리프레시 토큰(RefreshToken) 리포지토리
 * JWT 리프레시 토큰 관리를 위한 데이터 접근 계층
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
    /**
     * 토큰 문자열로 리프레시 토큰 조회
     * @param token 토큰 문자열
     * @return RefreshToken Optional
     */
    Optional<RefreshToken> findByToken(String token);
    
    /**
     * 사용자별 리프레시 토큰 조회 (최신순)
     * @param user 사용자
     * @return 사용자의 리프레시 토큰 목록
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = :user ORDER BY rt.createdAt DESC")
    List<RefreshToken> findByUserOrderByCreatedAtDesc(@Param("user") User user);
    
    /**
     * 사용자 ID별 리프레시 토큰 조회
     * @param userId 사용자 ID
     * @return 사용자의 리프레시 토큰 목록
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user.id = :userId ORDER BY rt.createdAt DESC")
    List<RefreshToken> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    /**
     * 유효한 리프레시 토큰 조회 (만료되지 않고 취소되지 않은)
     * @param token 토큰 문자열
     * @return 유효한 RefreshToken Optional
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.token = :token AND rt.isRevoked = false AND rt.expiryDate > :now")
    Optional<RefreshToken> findValidByToken(@Param("token") String token, @Param("now") LocalDateTime now);
    
    /**
     * 사용자의 유효한 리프레시 토큰들 조회
     * @param userId 사용자 ID
     * @return 유효한 리프레시 토큰 목록
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user.id = :userId AND rt.isRevoked = false AND rt.expiryDate > :now ORDER BY rt.createdAt DESC")
    List<RefreshToken> findValidByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    /**
     * 특정 사용자의 모든 리프레시 토큰 취소
     * @param userId 사용자 ID
     * @return 업데이트된 레코드 수
     */
    @Modifying
    @Transactional
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true WHERE rt.user.id = :userId")
    int revokeAllByUserId(@Param("userId") Long userId);
    
    /**
     * 특정 토큰 취소
     * @param token 토큰 문자열
     * @return 업데이트된 레코드 수
     */
    @Modifying
    @Transactional
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true WHERE rt.token = :token")
    int revokeByToken(@Param("token") String token);
    
    /**
     * 만료된 토큰들 삭제
     * @param now 현재 시간
     * @return 삭제된 레코드 수
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    /**
     * 취소된 토큰들 삭제
     * @return 삭제된 레코드 수
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.isRevoked = true")
    int deleteRevokedTokens();
    
    /**
     * 사용자의 토큰 개수 조회
     * @param userId 사용자 ID
     * @return 토큰 개수
     */
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.user.id = :userId AND rt.isRevoked = false")
    long countValidTokensByUserId(@Param("userId") Long userId);
    
    /**
     * IP 주소별 토큰 조회
     * @param ipAddress IP 주소
     * @param now 현재 시간
     * @return 해당 IP의 유효한 토큰들
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.ipAddress = :ipAddress AND rt.isRevoked = false AND rt.expiryDate > :now")
    List<RefreshToken> findValidByIpAddress(@Param("ipAddress") String ipAddress, @Param("now") LocalDateTime now);
    
    /**
     * 오래된 사용된 토큰들 정리 (30일 이전)
     * @param cutoffDate 기준 날짜
     * @return 삭제된 레코드 수
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.lastUsedAt < :cutoffDate OR (rt.lastUsedAt IS NULL AND rt.createdAt < :cutoffDate)")
    int deleteOldTokens(@Param("cutoffDate") LocalDateTime cutoffDate);
}