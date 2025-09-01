package com.cp9.infrastructure.web.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 설정
 * 인증, 인가, CSRF, CORS 등 보안 관련 설정
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (REST API 사용)
            .csrf(AbstractHttpConfigurer::disable)
            
            // CORS 설정 (WebConfig에서 관리)
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                corsConfiguration.setAllowedOriginPatterns(java.util.List.of("*"));
                corsConfiguration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
                corsConfiguration.setAllowCredentials(true);
                return corsConfiguration;
            }))
            
            // HTTP 요청 인가 설정
            .authorizeHttpRequests(auth -> auth
                // Actuator 엔드포인트 허용
                .requestMatchers("/management/**").permitAll()
                // H2 콘솔 접근 허용 (개발 환경)
                .requestMatchers("/h2-console/**").permitAll()
                // API 문서 접근 허용
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // 정적 리소스 허용
                .requestMatchers("/static/**", "/favicon.ico").permitAll()
                // 사용자 생성은 모든 사용자에게 허용 (회원가입)
                .requestMatchers("POST", "/api/users").permitAll()
                // 나머지 API는 인증 필요
                .requestMatchers("/api/**").authenticated()
                // 기타 모든 요청 허용
                .anyRequest().permitAll()
            )
            
            // OAuth2 로그인 설정
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/oauth2/authorization/google")
                .defaultSuccessUrl("/", true)
                .failureUrl("/login?error=true")
            )
            
            // 로그아웃 설정
            .logout(logout -> logout
                .logoutUrl("/api/logout")
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
            )
            
            // H2 콘솔을 위한 프레임 옵션 비활성화 (개발 환경에서만)
            .headers(headers -> headers.frameOptions().sameOrigin());
        
        return http.build();
    }
}