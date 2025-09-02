package com.cp9.security.jwt;

import com.cp9.security.userdetails.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT 인증 필터
 * 모든 HTTP 요청에서 JWT 토큰을 검증하고 Spring Security Context에 인증 정보 설정
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final JwtProperties jwtProperties;
    
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, 
            @NonNull HttpServletResponse response, 
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // 1. 요청에서 JWT 토큰 추출
            String jwt = extractTokenFromRequest(request);
            
            // 2. 토큰이 있고 유효한 경우 인증 처리
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
                authenticateUser(request, jwt);
            } else if (StringUtils.hasText(jwt)) {
                // 유효하지 않은 토큰인 경우 로깅
                log.warn("Invalid JWT token from IP: {}, User-Agent: {}", 
                    getClientIpAddress(request), request.getHeader("User-Agent"));
            }
            
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
            // 인증 실패해도 필터 체인은 계속 진행 (다른 인증 방식 시도 가능)
        }
        
        // 3. 다음 필터로 진행
        filterChain.doFilter(request, response);
    }
    
    /**
     * 사용자 인증 처리
     * @param request HTTP 요청
     * @param jwt JWT 토큰
     */
    private void authenticateUser(HttpServletRequest request, String jwt) {
        try {
            // 토큰에서 사용자 ID 추출
            Long userId = jwtTokenProvider.getUserIdFromToken(jwt);
            
            // 사용자 정보 로드
            UserDetails userDetails = userDetailsService.loadUserById(userId);
            
            // 인증 객체 생성
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, 
                    null, 
                    userDetails.getAuthorities()
                );
            
            // 요청 상세 정보 설정
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            
            // SecurityContext에 인증 정보 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // 요청 속성에 추가 정보 저장 (인터셉터에서 사용 가능)
            setRequestAttributes(request, jwt, userId);
            
            log.debug("Successfully authenticated user: {} from IP: {}", 
                userDetails.getUsername(), getClientIpAddress(request));
                
        } catch (Exception ex) {
            log.warn("Failed to authenticate user from JWT: {}", ex.getMessage());
            SecurityContextHolder.clearContext();
        }
    }
    
    /**
     * 요청 속성에 JWT 관련 정보 저장
     * @param request HTTP 요청
     * @param jwt JWT 토큰
     * @param userId 사용자 ID
     */
    private void setRequestAttributes(HttpServletRequest request, String jwt, Long userId) {
        try {
            request.setAttribute("jwtToken", jwt);
            request.setAttribute("userId", userId);
            request.setAttribute("userRoles", jwtTokenProvider.getRolesFromToken(jwt));
            request.setAttribute("userPermissions", jwtTokenProvider.getPermissionsFromToken(jwt));
            request.setAttribute("tokenType", jwtTokenProvider.getTokenType(jwt));
            request.setAttribute("tokenExpiringSoon", jwtTokenProvider.isTokenExpiringSoon(jwt));
        } catch (Exception ex) {
            log.debug("Failed to set request attributes: {}", ex.getMessage());
        }
    }
    
    /**
     * HTTP 요청에서 JWT 토큰 추출
     * @param request HTTP 요청
     * @return JWT 토큰 (Bearer 접두사 제거된 순수 토큰)
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        // 1. Authorization 헤더에서 추출 (우선순위)
        String bearerToken = request.getHeader(jwtProperties.getHeaderName());
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(jwtProperties.getTokenPrefix())) {
            return bearerToken.substring(jwtProperties.getTokenPrefix().length());
        }
        
        // 2. 쿼리 파라미터에서 추출 (WebSocket 연결 등을 위해)
        String tokenParam = request.getParameter("token");
        if (StringUtils.hasText(tokenParam)) {
            return tokenParam;
        }
        
        // 3. 쿠키에서 추출 (Remember Me 등을 위해)
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        return null;
    }
    
    /**
     * 클라이언트 IP 주소 추출
     * 프록시 서버를 고려한 실제 IP 주소 추출
     * @param request HTTP 요청
     * @return 클라이언트 IP 주소
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * 필터를 적용하지 않을 요청인지 확인
     * @param request HTTP 요청
     * @return 필터 적용 여부 (true: 적용 안함, false: 적용)
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // 인증이 필요없는 공개 엔드포인트
        String[] publicPaths = {
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/verify",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/public/",
            "/h2-console/",
            "/swagger-ui/",
            "/v3/api-docs/",
            "/management/health"
        };
        
        for (String publicPath : publicPaths) {
            if (path.startsWith(publicPath)) {
                return true;
            }
        }
        
        // OPTIONS 요청은 필터 적용 안함 (CORS Preflight)
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }
        
        return false;
    }
}