package com.cp9.security.jwt;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT 관련 설정 프로퍼티
 * application.yml의 jwt 섹션과 바인딩
 */
@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    
    /**
     * JWT 서명을 위한 비밀키
     * 환경변수 또는 설정 파일에서 주입
     */
    private String secret = "mySecretKey";
    
    /**
     * 액세스 토큰 만료 시간 (밀리초)
     * 기본값: 15분 (900,000ms)
     */
    private long accessTokenValidity = 900_000L;
    
    /**
     * 리프레시 토큰 만료 시간 (밀리초)  
     * 기본값: 7일 (604,800,000ms)
     */
    private long refreshTokenValidity = 604_800_000L;
    
    /**
     * JWT 발행자 (issuer)
     */
    private String issuer = "cp9-backend";
    
    /**
     * JWT 헤더 이름
     */
    private String headerName = "Authorization";
    
    /**
     * JWT 토큰 접두사
     */
    private String tokenPrefix = "Bearer ";
    
    /**
     * 토큰 갱신 허용 시간 (밀리초)
     * 토큰 만료 전 이 시간 내에는 자동 갱신 허용
     * 기본값: 5분 (300,000ms)
     */
    private long refreshThreshold = 300_000L;
    
    /**
     * 동시 세션 수 제한
     * 기본값: 3개
     */
    private int maxSessions = 3;
    
    /**
     * Remember Me 토큰 만료 시간 (밀리초)
     * 기본값: 30일 (2,592,000,000ms)
     */
    private long rememberMeTokenValidity = 2_592_000_000L;
    
    // 유틸리티 메서드들
    
    /**
     * 액세스 토큰 만료 시간을 초 단위로 반환
     * @return 만료 시간 (초)
     */
    public long getAccessTokenValidityInSeconds() {
        return accessTokenValidity / 1000;
    }
    
    /**
     * 리프레시 토큰 만료 시간을 초 단위로 반환
     * @return 만료 시간 (초)
     */
    public long getRefreshTokenValidityInSeconds() {
        return refreshTokenValidity / 1000;
    }
    
    /**
     * 토큰 접두사를 제거한 순수 토큰 반환
     * @param token Bearer를 포함한 토큰
     * @return 순수 토큰
     */
    public String resolveToken(String token) {
        if (token != null && token.startsWith(tokenPrefix)) {
            return token.substring(tokenPrefix.length());
        }
        return null;
    }
    
    /**
     * 토큰에 Bearer 접두사 추가
     * @param token 순수 토큰
     * @return Bearer 접두사가 포함된 토큰
     */
    public String addTokenPrefix(String token) {
        return tokenPrefix + token;
    }
    
    /**
     * 설정 유효성 검증
     * @return 유효성 검증 결과
     */
    public boolean isValid() {
        return secret != null && !secret.trim().isEmpty()
            && accessTokenValidity > 0
            && refreshTokenValidity > 0
            && issuer != null && !issuer.trim().isEmpty();
    }
}