package com.cp9.security.jwt;

import com.cp9.entity.Role;
import com.cp9.entity.User;
import com.cp9.security.userdetails.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@DisplayName("JWT 토큰 제공자 테스트")
class JwtTokenProviderTest {

    @Mock
    private JwtProperties jwtProperties;

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    private CustomUserDetails userDetails;
    private final String testSecret = "test-secret-key-for-jwt-token-generation-and-validation-must-be-at-least-256-bits";

    @BeforeEach
    void setUp() {
        // JWT Properties Mock 설정
        given(jwtProperties.getSecret()).willReturn(testSecret);
        given(jwtProperties.getAccessTokenValidity()).willReturn(900_000L); // 15분
        given(jwtProperties.getRefreshTokenValidity()).willReturn(604_800_000L); // 7일
        given(jwtProperties.getRememberMeTokenValidity()).willReturn(2_592_000_000L); // 30일
        given(jwtProperties.getIssuer()).willReturn("cp9-backend");
        given(jwtProperties.getRefreshThreshold()).willReturn(300_000L); // 5분

        // 테스트용 사용자 생성
        User user = User.builder()
            .id(1L)
            .username("testuser")
            .email("test@example.com")
            .name("Test User")
            .password("encodedPassword")
            .enabled(true)
            .active(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .roles(Set.of(Role.builder().name("ROLE_USER").enabled(true).build()))
            .build();

        userDetails = CustomUserDetails.create(user);
    }

    @Test
    @DisplayName("Access Token 생성 테스트")
    void generateAccessToken_Success() {
        // When
        String token = jwtTokenProvider.generateAccessToken(userDetails);

        // Then
        assertThat(token).isNotNull().isNotEmpty();
        
        // JWT 구조 검증 (header.payload.signature)
        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3);
        
        // 토큰 유효성 검증
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
    }

    @Test
    @DisplayName("Refresh Token 생성 테스트")
    void generateRefreshToken_Success() {
        // When
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        // Then
        assertThat(refreshToken).isNotNull().isNotEmpty();
        assertThat(jwtTokenProvider.validateToken(refreshToken)).isTrue();
        assertThat(jwtTokenProvider.getTokenType(refreshToken)).isEqualTo("refresh");
    }

    @Test
    @DisplayName("Remember Me Token 생성 테스트")
    void generateRememberMeToken_Success() {
        // When
        String rememberMeToken = jwtTokenProvider.generateRememberMeToken(userDetails);

        // Then
        assertThat(rememberMeToken).isNotNull().isNotEmpty();
        assertThat(jwtTokenProvider.validateToken(rememberMeToken)).isTrue();
        assertThat(jwtTokenProvider.getTokenType(rememberMeToken)).isEqualTo("remember_me");
    }

    @Test
    @DisplayName("토큰에서 사용자명 추출 테스트")
    void getUsernameFromToken_Success() {
        // Given
        String token = jwtTokenProvider.generateAccessToken(userDetails);

        // When
        String username = jwtTokenProvider.getUsernameFromToken(token);

        // Then
        assertThat(username).isEqualTo("testuser");
    }

    @Test
    @DisplayName("토큰에서 사용자 ID 추출 테스트")
    void getUserIdFromToken_Success() {
        // Given
        String token = jwtTokenProvider.generateAccessToken(userDetails);

        // When
        Long userId = jwtTokenProvider.getUserIdFromToken(token);

        // Then
        assertThat(userId).isEqualTo(1L);
    }

    @Test
    @DisplayName("토큰에서 역할 목록 추출 테스트")
    void getRolesFromToken_Success() {
        // Given
        String token = jwtTokenProvider.generateAccessToken(userDetails);

        // When
        List<String> roles = jwtTokenProvider.getRolesFromToken(token);

        // Then
        assertThat(roles).isNotNull().contains("ROLE_USER");
    }

    @Test
    @DisplayName("토큰 만료 시간 추출 테스트")
    void getExpirationFromToken_Success() {
        // Given
        String token = jwtTokenProvider.generateAccessToken(userDetails);
        Date currentTime = new Date();

        // When
        Date expiration = jwtTokenProvider.getExpirationFromToken(token);

        // Then
        assertThat(expiration).isAfter(currentTime);
        assertThat(expiration.getTime() - currentTime.getTime())
            .isCloseTo(900_000L, within(10_000L)); // 15분 ±10초
    }

    @Test
    @DisplayName("유효한 토큰 검증 테스트")
    void validateToken_ValidToken_ReturnsTrue() {
        // Given
        String token = jwtTokenProvider.generateAccessToken(userDetails);

        // When
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("잘못된 형식의 토큰 검증 테스트")
    void validateToken_MalformedToken_ReturnsFalse() {
        // Given
        String malformedToken = "invalid.token.format";

        // When
        boolean isValid = jwtTokenProvider.validateToken(malformedToken);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("만료된 토큰 검증 테스트")
    void validateToken_ExpiredToken_ReturnsFalse() {
        // Given - 이미 만료된 토큰 생성
        given(jwtProperties.getAccessTokenValidity()).willReturn(-1000L); // 음수로 설정하여 즉시 만료
        String expiredToken = jwtTokenProvider.generateAccessToken(userDetails);

        // 다시 정상 설정으로 복구
        given(jwtProperties.getAccessTokenValidity()).willReturn(900_000L);

        // When
        boolean isValid = jwtTokenProvider.validateToken(expiredToken);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("토큰 만료 여부 확인 테스트")
    void isTokenExpired_NotExpired_ReturnsFalse() {
        // Given
        String token = jwtTokenProvider.generateAccessToken(userDetails);

        // When
        boolean isExpired = jwtTokenProvider.isTokenExpired(token);

        // Then
        assertThat(isExpired).isFalse();
    }

    @Test
    @DisplayName("토큰 갱신 가능 여부 테스트")
    void canTokenBeRefreshed_WithinThreshold_ReturnsTrue() {
        // Given - 갱신 임계값 내의 토큰 생성
        given(jwtProperties.getAccessTokenValidity()).willReturn(60_000L); // 1분
        given(jwtProperties.getRefreshThreshold()).willReturn(300_000L); // 5분 (더 긴 임계값)
        String token = jwtTokenProvider.generateAccessToken(userDetails);

        // When
        boolean canRefresh = jwtTokenProvider.canTokenBeRefreshed(token);

        // Then
        assertThat(canRefresh).isTrue();
    }

    @Test
    @DisplayName("토큰 곧 만료 여부 확인 테스트")
    void isTokenExpiringSoon_RecentToken_ReturnsFalse() {
        // Given
        String token = jwtTokenProvider.generateAccessToken(userDetails);

        // When
        boolean isExpiringSoon = jwtTokenProvider.isTokenExpiringSoon(token);

        // Then
        assertThat(isExpiringSoon).isFalse(); // 15분 토큰이므로 5분 내 만료가 아님
    }

    @Test
    @DisplayName("토큰 생성 시간 추출 테스트")
    void getIssuedAtFromToken_Success() {
        // Given
        String token = jwtTokenProvider.generateAccessToken(userDetails);

        // When
        var issuedAt = jwtTokenProvider.getIssuedAtFromToken(token);

        // Then
        assertThat(issuedAt).isNotNull();
        assertThat(issuedAt).isBefore(java.time.LocalDateTime.now().plusMinutes(1));
        assertThat(issuedAt).isAfter(java.time.LocalDateTime.now().minusMinutes(1));
    }

    @Test
    @DisplayName("토큰 만료까지 남은 시간 계산 테스트")
    void getTimeUntilExpiration_Success() {
        // Given
        String token = jwtTokenProvider.generateAccessToken(userDetails);

        // When
        long timeUntilExpiration = jwtTokenProvider.getTimeUntilExpiration(token);

        // Then
        assertThat(timeUntilExpiration).isPositive();
        assertThat(timeUntilExpiration).isLessThanOrEqualTo(900_000L); // 15분 이하
        assertThat(timeUntilExpiration).isGreaterThan(800_000L); // 대략 13분 이상
    }

    @Test
    @DisplayName("빈 토큰 검증 테스트")
    void validateToken_EmptyToken_ReturnsFalse() {
        // When & Then
        assertThat(jwtTokenProvider.validateToken("")).isFalse();
        assertThat(jwtTokenProvider.validateToken(null)).isFalse();
        assertThat(jwtTokenProvider.validateToken("   ")).isFalse();
    }
}