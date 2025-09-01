package com.cp9.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 웹 설정 클래스 (Configuration Layer)
 * CORS, 인터셉터 등 웹 관련 설정을 담당
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * CORS(Cross-Origin Resource Sharing) 설정
     * 프론트엔드에서 백엔드 API 호출을 위한 설정
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*") // 모든 오리진 허용 (개발 환경)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // preflight 요청 캐시 시간 (1시간)
    }
}