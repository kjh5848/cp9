package com.cp9.security.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 인증 실패 시 처리하는 Entry Point
 * 401 Unauthorized 응답을 반환
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SecurityAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response,
                        AuthenticationException authException) throws IOException {

        log.error("Unauthorized error: {} from IP: {}, User-Agent: {}", 
            authException.getMessage(), 
            getClientIpAddress(request), 
            request.getHeader("User-Agent"));

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", "Authentication required to access this resource");
        body.put("path", request.getServletPath());
        body.put("timestamp", LocalDateTime.now().toString());

        // 추가적인 디버깅 정보 (개발 환경에서만)
        String activeProfile = System.getProperty("spring.profiles.active", "dev");
        if ("dev".equals(activeProfile)) {
            body.put("detail", authException.getMessage());
            body.put("method", request.getMethod());
            body.put("headers", getAuthHeaders(request));
        }

        objectMapper.writeValue(response.getOutputStream(), body);
    }

    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * 인증 관련 헤더 정보 수집 (디버깅용)
     */
    private Map<String, String> getAuthHeaders(HttpServletRequest request) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", request.getHeader("Authorization"));
        headers.put("Content-Type", request.getHeader("Content-Type"));
        return headers;
    }
}