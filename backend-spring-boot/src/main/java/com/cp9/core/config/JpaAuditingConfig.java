package com.cp9.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA 감사(Auditing) 설정
 * 엔티티의 생성/수정 시간 자동 관리를 위한 설정
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
    // JPA Auditing 기능 활성화
    // @CreatedDate, @LastModifiedDate 어노테이션 동작
}