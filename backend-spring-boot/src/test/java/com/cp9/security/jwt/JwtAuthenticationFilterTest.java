package com.cp9.security.jwt;

import com.cp9.entity.Role;
import com.cp9.entity.User;
import com.cp9.security.userdetails.CustomUserDetails;
import com.cp9.security.userdetails.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JWT 인증 필터 테스트")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private JwtProperties jwtProperties;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private CustomUserDetails userDetails;
    private final String validToken = "valid.jwt.token";
    private final String bearerToken = "Bearer " + validToken;

    @BeforeEach
    void setUp() {
        // SecurityContext 초기화
        SecurityContextHolder.clearContext();
        
        // JwtProperties Mock 설정
        given(jwtProperties.getHeaderName()).willReturn("Authorization");
        given(jwtProperties.getTokenPrefix()).willReturn("Bearer ");

        // 테스트용 사용자 생성
        User testUser = User.builder()
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
            
        userDetails = CustomUserDetails.create(testUser);
    }

    @Test
    @DisplayName("유효한 JWT 토큰으로 인증 성공 테스트")
    void doFilterInternal_ValidToken_AuthenticationSuccess() throws ServletException, IOException {
        // Given
        given(request.getHeader("Authorization")).willReturn(bearerToken);
        given(request.getRequestURI()).willReturn("/api/user/profile");
        given(request.getMethod()).willReturn("GET");
        given(jwtTokenProvider.validateToken(validToken)).willReturn(true);
        given(jwtTokenProvider.getUserIdFromToken(validToken)).willReturn(1L);
        given(jwtTokenProvider.getRolesFromToken(validToken)).willReturn(List.of("ROLE_USER"));
        given(jwtTokenProvider.getPermissionsFromToken(validToken)).willReturn(List.of());
        given(jwtTokenProvider.getTokenType(validToken)).willReturn("access");
        given(jwtTokenProvider.isTokenExpiringSoon(validToken)).willReturn(false);
        given(userDetailsService.loadUserById(1L)).willReturn(userDetails);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName())
            .isEqualTo("testuser");
        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
            .hasSize(1)
            .extracting("authority")
            .contains("ROLE_USER");
    }

    @Test
    @DisplayName("Authorization 헤더가 없는 경우 테스트")
    void doFilterInternal_NoAuthorizationHeader_ContinueFilter() throws ServletException, IOException {
        // Given
        given(request.getHeader("Authorization")).willReturn(null);
        given(request.getParameter("token")).willReturn(null);
        given(request.getCookies()).willReturn(null);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtTokenProvider, never()).validateToken(any());
    }

    @Test
    @DisplayName("유효하지 않은 JWT 토큰으로 인증 실패 테스트")
    void doFilterInternal_InvalidToken_AuthenticationFailure() throws ServletException, IOException {
        // Given
        given(request.getHeader("Authorization")).willReturn(bearerToken);
        given(request.getRemoteAddr()).willReturn("127.0.0.1");
        given(request.getHeader("User-Agent")).willReturn("TestAgent");
        given(jwtTokenProvider.validateToken(validToken)).willReturn(false);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(userDetailsService, never()).loadUserById(any());
    }

    @Test
    @DisplayName("쿼리 파라미터에서 토큰 추출 테스트")
    void doFilterInternal_TokenFromQueryParam_AuthenticationSuccess() throws ServletException, IOException {
        // Given
        given(request.getHeader("Authorization")).willReturn(null);
        given(request.getParameter("token")).willReturn(validToken);
        given(request.getCookies()).willReturn(null);
        given(jwtTokenProvider.validateToken(validToken)).willReturn(true);
        given(jwtTokenProvider.getUserIdFromToken(validToken)).willReturn(1L);
        given(jwtTokenProvider.getRolesFromToken(validToken)).willReturn(List.of("ROLE_USER"));
        given(jwtTokenProvider.getPermissionsFromToken(validToken)).willReturn(List.of());
        given(jwtTokenProvider.getTokenType(validToken)).willReturn("access");
        given(jwtTokenProvider.isTokenExpiringSoon(validToken)).willReturn(false);
        given(userDetailsService.loadUserById(1L)).willReturn(userDetails);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
    }

    @Test
    @DisplayName("쿠키에서 토큰 추출 테스트")
    void doFilterInternal_TokenFromCookie_AuthenticationSuccess() throws ServletException, IOException {
        // Given
        Cookie[] cookies = new Cookie[]{
            new Cookie("sessionId", "session123"),
            new Cookie("accessToken", validToken)
        };
        
        given(request.getHeader("Authorization")).willReturn(null);
        given(request.getParameter("token")).willReturn(null);
        given(request.getCookies()).willReturn(cookies);
        given(jwtTokenProvider.validateToken(validToken)).willReturn(true);
        given(jwtTokenProvider.getUserIdFromToken(validToken)).willReturn(1L);
        given(jwtTokenProvider.getRolesFromToken(validToken)).willReturn(List.of("ROLE_USER"));
        given(jwtTokenProvider.getPermissionsFromToken(validToken)).willReturn(List.of());
        given(jwtTokenProvider.getTokenType(validToken)).willReturn("access");
        given(jwtTokenProvider.isTokenExpiringSoon(validToken)).willReturn(false);
        given(userDetailsService.loadUserById(1L)).willReturn(userDetails);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
    }

    @Test
    @DisplayName("사용자 정보 로딩 실패 시 인증 실패 테스트")
    void doFilterInternal_UserLoadingFailure_AuthenticationFailure() throws ServletException, IOException {
        // Given
        given(request.getHeader("Authorization")).willReturn(bearerToken);
        given(jwtTokenProvider.validateToken(validToken)).willReturn(true);
        given(jwtTokenProvider.getUserIdFromToken(validToken)).willReturn(1L);
        given(userDetailsService.loadUserById(1L)).willThrow(new RuntimeException("User not found"));

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    @DisplayName("공개 경로에 대한 필터 적용 제외 테스트")
    void shouldNotFilter_PublicPath_ReturnsTrue() {
        // Given
        given(request.getRequestURI()).willReturn("/api/auth/login");

        // When
        boolean shouldNotFilter = jwtAuthenticationFilter.shouldNotFilter(request);

        // Then
        assertThat(shouldNotFilter).isTrue();
    }

    @Test
    @DisplayName("보호된 경로에 대한 필터 적용 테스트")
    void shouldNotFilter_ProtectedPath_ReturnsFalse() {
        // Given
        given(request.getRequestURI()).willReturn("/api/user/profile");
        given(request.getMethod()).willReturn("GET");

        // When
        boolean shouldNotFilter = jwtAuthenticationFilter.shouldNotFilter(request);

        // Then
        assertThat(shouldNotFilter).isFalse();
    }

    @Test
    @DisplayName("OPTIONS 요청에 대한 필터 적용 제외 테스트")
    void shouldNotFilter_OptionsMethod_ReturnsTrue() {
        // Given
        given(request.getRequestURI()).willReturn("/api/user/profile");
        given(request.getMethod()).willReturn("OPTIONS");

        // When
        boolean shouldNotFilter = jwtAuthenticationFilter.shouldNotFilter(request);

        // Then
        assertThat(shouldNotFilter).isTrue();
    }

    @Test
    @DisplayName("Bearer 접두사가 없는 Authorization 헤더 테스트")
    void doFilterInternal_AuthorizationWithoutBearer_NoAuthentication() throws ServletException, IOException {
        // Given
        given(request.getHeader("Authorization")).willReturn("Basic dXNlcjpwYXNz");
        given(request.getParameter("token")).willReturn(null);
        given(request.getCookies()).willReturn(null);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtTokenProvider, never()).validateToken(any());
    }

    @Test
    @DisplayName("X-Forwarded-For 헤더에서 IP 주소 추출 테스트")
    void doFilterInternal_XForwardedForHeader_ExtractCorrectIP() throws ServletException, IOException {
        // Given
        given(request.getHeader("Authorization")).willReturn(bearerToken);
        given(request.getHeader("X-Forwarded-For")).willReturn("192.168.1.1, 10.0.0.1");
        given(request.getHeader("User-Agent")).willReturn("TestAgent");
        given(jwtTokenProvider.validateToken(validToken)).willReturn(false);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        // IP 로깅 검증은 실제 로그 출력을 확인하거나 별도의 로깅 검증 방식 필요
    }
}