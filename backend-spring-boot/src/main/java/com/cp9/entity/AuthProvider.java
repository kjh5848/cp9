package com.cp9.entity;

/**
 * 인증 제공자 열거형
 * OAuth2 로그인과 일반 로그인을 구분하기 위한 enum
 */
public enum AuthProvider {
    /**
     * 일반 로그인 (사용자명/비밀번호)
     */
    LOCAL,
    
    /**
     * Google OAuth2 로그인
     */
    GOOGLE,
    
    /**
     * GitHub OAuth2 로그인
     */
    GITHUB,
    
    /**
     * Kakao OAuth2 로그인
     */
    KAKAO,
    
    /**
     * Naver OAuth2 로그인
     */
    NAVER;
    
    /**
     * OAuth2 제공자인지 확인
     * @return OAuth2 제공자면 true, LOCAL이면 false
     */
    public boolean isOAuth2() {
        return this != LOCAL;
    }
    
    /**
     * 제공자 이름을 소문자로 반환
     * @return 소문자 제공자 이름
     */
    public String getProviderName() {
        return this.name().toLowerCase();
    }
}