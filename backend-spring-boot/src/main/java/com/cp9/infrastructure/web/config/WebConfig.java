package com.cp9.infrastructure.web.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * 웹 설정
 * CORS, 인터셉터, 메시지 컨버터 등 웹 관련 설정
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("#{'${cors.allowed-origins}'.split(',')}")
    private List<String> allowedOrigins;
    
    @Value("#{'${cors.allowed-methods}'.split(',')}")
    private List<String> allowedMethods;
    
    @Value("#{'${cors.allowed-headers}'.split(',')}")
    private List<String> allowedHeaders;
    
    @Value("${cors.allow-credentials:true}")
    private boolean allowCredentials;
    
    @Value("${cors.max-age:3600}")
    private long maxAge;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(new String[0]))
                .allowedMethods(allowedMethods.toArray(new String[0]))
                .allowedHeaders(allowedHeaders.toArray(new String[0]))
                .allowCredentials(allowCredentials)
                .maxAge(maxAge);
    }
}