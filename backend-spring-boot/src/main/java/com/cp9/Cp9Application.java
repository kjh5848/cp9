package com.cp9;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * CP9 Spring Boot 애플리케이션 메인 클래스
 * Traditional Layered Architecture 구조로 구성됨
 * 
 * 패키지 구조:
 * - controller: REST API 엔드포인트 (Presentation Layer)
 * - service: 비즈니스 로직 처리 (Business Layer)
 * - repository: 데이터 액세스 (Data Access Layer)
 * - entity: JPA 엔티티 (Data Model Layer)
 * - dto: 데이터 전송 객체 (Data Transfer Layer)
 * - config: 애플리케이션 설정 (Configuration Layer)
 * - exception: 예외 처리 (Exception Handling Layer)
 */
@SpringBootApplication
public class Cp9Application {

	public static void main(String[] args) {
		SpringApplication.run(Cp9Application.class, args);
	}

}
