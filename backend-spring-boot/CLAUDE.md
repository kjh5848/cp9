# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Java 17과 Gradle 8.14.3으로 구축된 Spring Boot 3.5.5 백엔드 애플리케이션입니다. **DDD(Domain-Driven Design) 아키텍처**와 **헥사고날 아키텍처** 패턴을 적용하여 깨끗하고 유지보수 가능한 코드 구조를 제공합니다.

## 빌드 및 개발 명령어

### 필수 명령어
```bash
# 프로젝트 빌드
./gradlew build

# 애플리케이션 실행
./gradlew bootRun

# 테스트 실행
./gradlew test

# 특정 테스트 클래스 실행
./gradlew test --tests "com.cp9.ClassName"

# 빌드 아티팩트 정리
./gradlew clean

# API 문서 생성 (Spring REST Docs)
./gradlew asciidoctor

# 개발 프로파일로 실행 (H2 DB, DevTools 활성화)
./gradlew bootRun --args='--spring.profiles.active=dev'

# 프로덕션 프로파일로 실행 (PostgreSQL)
./gradlew bootRun --args='--spring.profiles.active=prod'
```

### 데이터베이스 접근
```bash
# H2 콘솔 접속 (개발 환경)
http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:testdb
# Username: sa
# Password: (비어있음)

# API 문서 접속
http://localhost:8080/swagger-ui/index.html

# Actuator 엔드포인트
http://localhost:8080/management/health
```

## DDD 아키텍처 구조

### 레이어 아키텍처 (Hexagonal Architecture)

```
src/main/java/com/cp9/
├── domain/                     # 도메인 레이어 (핵심 비즈니스 로직)
│   ├── user/
│   │   ├── model/             # 엔티티, Value Objects, Repository 인터페이스
│   │   ├── service/           # 도메인 서비스
│   │   └── event/             # 도메인 이벤트
│   └── shared/                # 공유 도메인 객체
│       ├── vo/                # Value Objects (Email 등)
│       └── exception/         # 도메인 예외
├── application/                # 애플리케이션 레이어 (유스케이스)
│   └── user/
│       ├── UserApplicationService.java  # 유스케이스 구현
│       ├── dto/               # Command, Query, Response DTO
│       └── port/              # 포트 인터페이스 (in/out)
├── infrastructure/             # 인프라스트럭처 레이어
│   ├── persistence/           # 데이터 영속성 (JPA)
│   ├── web/                   # 웹 어댑터 (REST Controllers)
│   ├── messaging/             # 이벤트, WebSocket
│   └── external/              # 외부 시스템 연동
└── core/                      # 공통 핵심 기능
    ├── exception/             # 전역 예외 처리
    ├── validation/            # 커스텀 검증
    ├── security/              # 보안 유틸리티
    └── config/                # 공통 설정
```

### 핵심 설계 원칙

1. **의존성 역전 (Dependency Inversion)**: 도메인 레이어는 외부 레이어에 의존하지 않음
2. **포트-어댑터 패턴**: 인바운드/아웃바운드 포트로 외부 시스템과 분리
3. **CQRS 패턴**: Command와 Query를 분리하여 책임 명확화
4. **도메인 이벤트**: 도메인 간 느슨한 결합 및 부수 효과 처리
5. **애그리게이트**: 일관성 경계를 명확히 하여 데이터 무결성 보장

### 주요 컴포넌트

#### Domain Layer
- **User 엔티티**: 사용자의 핵심 비즈니스 로직과 규칙
- **UserId**: 사용자 식별자 Value Object
- **Email**: 이메일 Value Object (형식 검증 포함)
- **UserRepository**: 영속성 추상화 인터페이스
- **UserDomainService**: 복잡한 도메인 로직 처리

#### Application Layer  
- **UserApplicationService**: 유스케이스 오케스트레이션
- **Command/Query DTO**: 입력 데이터 전송 객체
- **UserResponse**: 출력 데이터 전송 객체
- **포트 인터페이스**: 헥사고날 아키텍처의 경계 정의

#### Infrastructure Layer
- **UserJpaEntity**: JPA 영속성 엔티티
- **UserRepositoryImpl**: 도메인 레포지토리 구현체
- **UserController**: REST API 엔드포인트
- **UserEventAdapter**: 도메인 이벤트 발행 어댑터

## 기술 스택 및 설정

### 핵심 기술
- **Framework**: Spring Boot 3.5.5, Spring Security, Spring Data JPA
- **Database**: H2 (개발), PostgreSQL (프로덕션)
- **Caching**: Redis, Spring Cache
- **Messaging**: WebSocket, Spring Events
- **Monitoring**: Sentry, Datadog, Actuator
- **AI Integration**: Spring AI (OpenAI)
- **Architecture**: MapStruct (매핑), SpringDoc (API 문서)

### 환경별 설정
- **개발환경 (`dev`)**: H2 인메모리 DB, H2 콘솔, DevTools, 상세 로깅
- **프로덕션 (`prod`)**: PostgreSQL, Redis, SSL, 압축, 보안 강화

### 보안 설정
- OAuth2 클라이언트 (Google, GitHub)
- Spring Security 기반 인증/인가
- CORS 설정
- JWT 토큰 지원 (프로덕션)
- CSRF 비활성화 (REST API)

## 개발 가이드

### 새로운 도메인 추가 시
1. `domain/{새도메인}/model/` 에 엔티티와 Value Objects 생성
2. `domain/{새도메인}/service/` 에 도메인 서비스 추가
3. `application/{새도메인}/` 에 Application Service와 DTO 구현
4. `infrastructure/persistence/{새도메인}/` 에 JPA 구현체 추가
5. `infrastructure/web/{새도메인}/` 에 컨트롤러 구현

### 테스트 전략
- **단위 테스트**: 도메인 로직 중심
- **통합 테스트**: Application Service 레이어
- **API 테스트**: REST Controller + Spring Security
- **문서화 테스트**: Spring REST Docs

### 코딩 컨벤션
- Lombok 사용으로 보일러플레이트 최소화
- MapStruct로 레이어 간 객체 매핑
- JSR-303 Bean Validation 적용
- 도메인 이벤트를 통한 부수 효과 처리
- 전역 예외 처리기로 일관성 있는 에러 응답

### API 문서화
- SpringDoc OpenAPI 3 사용
- Swagger UI 제공 (`/swagger-ui/index.html`)
- Spring REST Docs로 테스트 기반 문서 생성

이 아키텍처는 확장 가능하고 테스트 가능하며 유지보수가 용이한 엔터프라이즈급 백엔드 시스템을 제공합니다.