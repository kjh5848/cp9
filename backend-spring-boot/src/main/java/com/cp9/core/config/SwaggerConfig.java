package com.cp9.core.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Swagger OpenAPI 3 설정
 * JWT 인증을 지원하는 API 문서 생성
 */
@Configuration
public class SwaggerConfig {

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(apiInfo())
            .servers(apiServers())
            .addSecurityItem(securityRequirement())
            .components(apiComponents());
    }

    /**
     * API 기본 정보
     */
    private Info apiInfo() {
        return new Info()
            .title("CP9 Backend API")
            .description("Spring Boot 기반 레이어드 아키텍처 백엔드 API 문서")
            .version("1.0.0")
            .contact(new Contact()
                .name("CP9 Development Team")
                .email("dev@cp9.com")
                .url("https://cp9.com"))
            .license(new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT"));
    }

    /**
     * API 서버 정보
     */
    private List<Server> apiServers() {
        return List.of(
            new Server()
                .url("http://localhost:8080" + contextPath)
                .description("로컬 개발 서버"),
            new Server()
                .url("https://api.cp9.com" + contextPath)
                .description("프로덕션 서버")
        );
    }

    /**
     * JWT 보안 요구사항
     */
    private SecurityRequirement securityRequirement() {
        return new SecurityRequirement().addList("JWT Authentication");
    }

    /**
     * API 컴포넌트 (인증 스키마 등)
     */
    private Components apiComponents() {
        return new Components()
            .addSecuritySchemes("JWT Authentication", jwtSecurityScheme());
    }

    /**
     * JWT 보안 스키마
     */
    private SecurityScheme jwtSecurityScheme() {
        return new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")
            .name("Authorization")
            .description("JWT 토큰을 Authorization 헤더에 'Bearer {token}' 형식으로 전송");
    }
}