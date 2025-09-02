package com.cp9.security.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 권한 부족으로 접근 거부될 때 처리하는 Handler
 * 403 Forbidden 응답을 반환
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SecurityAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request, 
                      HttpServletResponse response,
                      AccessDeniedException accessDeniedException) throws IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "anonymous";
        
        log.warn("Access denied for user: {} accessing {} from IP: {}, User-Agent: {}", 
            username,
            request.getServletPath(),
            getClientIpAddress(request),
            request.getHeader("User-Agent"));

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_FORBIDDEN);
        body.put("error", "Access Denied");
        body.put("message", "You don't have permission to access this resource");
        body.put("path", request.getServletPath());
        body.put("timestamp", LocalDateTime.now().toString());

        // 추가적인 디버깅 정보 (개발 환경에서만)
        String activeProfile = System.getProperty("spring.profiles.active", "dev");
        if ("dev".equals(activeProfile)) {
            body.put("detail", accessDeniedException.getMessage());
            body.put("method", request.getMethod());
            body.put("user", username);
            body.put("authorities", authentication != null ? 
                authentication.getAuthorities().toString() : "none");
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
}