package com.cp9.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * JPA 설정 클래스 (Configuration Layer)
 * JPA 관련 설정을 담당
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.cp9.repository")
@EnableJpaAuditing // @CreationTimestamp, @UpdateTimestamp 활성화
public class JpaConfig {
    
    // JPA Auditing을 위한 추가 설정이 필요한 경우 여기에 Bean 정의
}