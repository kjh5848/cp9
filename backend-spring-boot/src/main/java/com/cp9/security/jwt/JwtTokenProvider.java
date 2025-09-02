package com.cp9.security.jwt;

import com.cp9.security.userdetails.CustomUserDetails;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * JWT 토큰 생성 및 검증을 담당하는 Provider
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {
    
    private final JwtProperties jwtProperties;
    
    /**
     * 비밀키 생성 (HMAC-SHA 알고리즘용)
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    /**
     * Access Token 생성
     * @param userDetails 사용자 정보
     * @return JWT Access Token
     */
    public String generateAccessToken(CustomUserDetails userDetails) {
        Map<String, Object> claims = createClaims(userDetails);
        Date expiryDate = new Date(System.currentTimeMillis() + jwtProperties.getAccessTokenValidity());
        
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(expiryDate)
            .setIssuer(jwtProperties.getIssuer())
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }
    
    /**
     * Refresh Token 생성
     * @param userDetails 사용자 정보
     * @return JWT Refresh Token
     */
    public String generateRefreshToken(CustomUserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userDetails.getId());
        claims.put("type", "refresh");
        
        Date expiryDate = new Date(System.currentTimeMillis() + jwtProperties.getRefreshTokenValidity());
        
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(expiryDate)
            .setIssuer(jwtProperties.getIssuer())
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }
    
    /**
     * Remember Me Token 생성
     * @param userDetails 사용자 정보
     * @return Remember Me JWT Token
     */
    public String generateRememberMeToken(CustomUserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userDetails.getId());
        claims.put("type", "remember_me");
        
        Date expiryDate = new Date(System.currentTimeMillis() + jwtProperties.getRememberMeTokenValidity());
        
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(expiryDate)
            .setIssuer(jwtProperties.getIssuer())
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }
    
    /**
     * 토큰에서 사용자명 추출
     * @param token JWT 토큰
     * @return 사용자명
     */
    public String getUsernameFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getSubject();
    }
    
    /**
     * 토큰에서 사용자 ID 추출
     * @param token JWT 토큰
     * @return 사용자 ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return Long.parseLong(claims.get("userId").toString());
    }
    
    /**
     * 토큰에서 만료 시간 추출
     * @param token JWT 토큰
     * @return 만료 시간
     */
    public Date getExpirationFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getExpiration();
    }
    
    /**
     * 토큰에서 역할 목록 추출
     * @param token JWT 토큰
     * @return 역할 목록
     */
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return (List<String>) claims.get("roles");
    }
    
    /**
     * 토큰에서 권한 목록 추출
     * @param token JWT 토큰
     * @return 권한 목록
     */
    @SuppressWarnings("unchecked")
    public List<String> getPermissionsFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return (List<String>) claims.get("permissions");
    }
    
    /**
     * 토큰 유효성 검증
     * @param token JWT 토큰
     * @return 유효성 여부
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (SecurityException ex) {
            log.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }
    
    /**
     * 토큰 만료 확인
     * @param token JWT 토큰
     * @return 만료 여부
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationFromToken(token);
            return expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
    
    /**
     * 토큰 갱신 가능 확인
     * @param token JWT 토큰
     * @return 갱신 가능 여부
     */
    public boolean canTokenBeRefreshed(String token) {
        try {
            Date expiration = getExpirationFromToken(token);
            Date refreshThreshold = new Date(expiration.getTime() - jwtProperties.getRefreshThreshold());
            return new Date().after(refreshThreshold) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 토큰 타입 확인
     * @param token JWT 토큰
     * @return 토큰 타입
     */
    public String getTokenType(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return (String) claims.get("type");
        } catch (Exception e) {
            return "access"; // 기본값
        }
    }
    
    /**
     * 토큰이 곧 만료되는지 확인
     * @param token JWT 토큰
     * @return 곧 만료 여부 (5분 이내)
     */
    public boolean isTokenExpiringSoon(String token) {
        try {
            Date expiration = getExpirationFromToken(token);
            Date fiveMinutesFromNow = new Date(System.currentTimeMillis() + 300_000L); // 5분
            return expiration.before(fiveMinutesFromNow);
        } catch (Exception e) {
            return true;
        }
    }
    
    /**
     * 토큰에서 Claims 추출
     * @param token JWT 토큰
     * @return Claims
     */
    private Claims getClaimsFromToken(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
    
    /**
     * 사용자 정보로부터 Claims 생성
     * @param userDetails 사용자 정보
     * @return Claims Map
     */
    private Map<String, Object> createClaims(CustomUserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        
        claims.put("userId", userDetails.getId());
        claims.put("email", userDetails.getEmail());
        claims.put("name", userDetails.getName());
        claims.put("type", "access");
        
        // 역할 정보 추가
        List<String> roles = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(authority -> authority.startsWith("ROLE_"))
            .collect(Collectors.toList());
        claims.put("roles", roles);
        
        // 권한 정보 추가
        List<String> permissions = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(authority -> !authority.startsWith("ROLE_"))
            .collect(Collectors.toList());
        claims.put("permissions", permissions);
        
        return claims;
    }
    
    /**
     * 토큰 생성 시간 추출
     * @param token JWT 토큰
     * @return 생성 시간
     */
    public LocalDateTime getIssuedAtFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getIssuedAt().toInstant()
            .atZone(ZoneId.systemDefault())
            .toLocalDateTime();
    }
    
    /**
     * 토큰 만료까지 남은 시간 (밀리초)
     * @param token JWT 토큰
     * @return 남은 시간 (밀리초)
     */
    public long getTimeUntilExpiration(String token) {
        try {
            Date expiration = getExpirationFromToken(token);
            return Math.max(0, expiration.getTime() - System.currentTimeMillis());
        } catch (Exception e) {
            return 0;
        }
    }
}