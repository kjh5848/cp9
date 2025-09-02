# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Java 17과 Gradle 8.14.3으로 구축된 Spring Boot 3.5.5 백엔드 애플리케이션입니다. **레이어드 아키텍처(Layered Architecture)** 패턴을 적용하여 깨끗하고 유지보수 가능한 코드 구조를 제공합니다.

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

## 레이어드 아키텍처 구조

### 레이어 구조 (Layered Architecture)

```
src/main/java/com/cp9/
├── controller/                 # 프레젠테이션 레이어
│   ├── user/                  # 사용자 전용 컨트롤러
│   │   ├── UserController.java
│   │   └── UserProfileController.java
│   ├── admin/                 # 관리자 전용 컨트롤러
│   │   ├── AdminController.java
│   │   ├── AdminUserController.java
│   │   └── AdminRoleController.java
│   └── auth/                  # 인증 컨트롤러
│       ├── AuthController.java
│       └── RegistrationController.java
│
├── service/                    # 비즈니스 레이어
│   ├── user/                  # 사용자 서비스
│   │   ├── UserService.java
│   │   └── UserProfileService.java
│   ├── admin/                 # 관리자 서비스
│   │   ├── AdminService.java
│   │   └── AdminUserManagementService.java
│   └── auth/                  # 인증/권한 서비스
│       ├── AuthService.java
│       ├── RegistrationService.java
│       ├── TokenService.java
│       └── RoleService.java
│
├── repository/                 # 데이터 액세스 레이어
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   ├── PermissionRepository.java
│   ├── UserRoleRepository.java
│   └── RefreshTokenRepository.java
│
├── entity/                     # 엔티티 (도메인 모델)
│   ├── User.java              # 사용자 엔티티 (Role 관계 포함)
│   ├── Role.java              # 역할 엔티티
│   ├── Permission.java        # 권한 엔티티
│   ├── UserRole.java          # 사용자-역할 매핑
│   ├── RolePermission.java    # 역할-권한 매핑
│   ├── RefreshToken.java      # 리프레시 토큰
│   └── AdminLog.java          # 관리자 활동 로그
│
├── dto/                        # 데이터 전송 객체
│   ├── user/                  # 사용자 DTO
│   │   ├── UserDto.java
│   │   └── UserProfileDto.java
│   ├── admin/                 # 관리자 DTO
│   │   ├── AdminDto.java
│   │   └── UserManagementDto.java
│   └── auth/                  # 인증 DTO
│       ├── LoginRequest.java
│       ├── LoginResponse.java
│       ├── SignUpRequest.java
│       ├── TokenDto.java
│       └── RoleDto.java
│
├── security/                   # 보안 관련 패키지
│   ├── jwt/                   # JWT 처리
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── JwtProperties.java
│   ├── oauth2/                # OAuth2 커스터마이징
│   │   ├── CustomOAuth2UserService.java
│   │   ├── OAuth2SuccessHandler.java
│   │   └── OAuth2FailureHandler.java
│   ├── userdetails/           # UserDetails 구현
│   │   ├── CustomUserDetails.java
│   │   ├── CustomUserDetailsService.java
│   │   └── UserPrincipal.java
│   ├── filter/                # 커스텀 필터
│   │   ├── XssProtectionFilter.java
│   │   └── RequestLoggingFilter.java
│   └── handler/               # 보안 핸들러
│       ├── CustomAccessDeniedHandler.java
│       └── CustomAuthenticationEntryPoint.java
│
├── interceptor/                # 인터셉터
│   ├── auth/                  # 인증 인터셉터
│   │   ├── UserAuthInterceptor.java
│   │   └── AdminAuthInterceptor.java
│   ├── RateLimitInterceptor.java
│   ├── ApiVersionInterceptor.java
│   └── RequestTrackingInterceptor.java
│
├── config/                     # 설정 클래스
│   ├── WebConfig.java         # 웹 설정 (인터셉터 등록)
│   ├── JpaConfig.java         # JPA 설정
│   ├── SecurityConfig.java    # Spring Security 설정
│   ├── RoleHierarchyConfig.java # 역할 계층 설정
│   └── SwaggerConfig.java     # API 문서 설정
│
├── aop/                        # AOP 관점
│   ├── LoggingAspect.java     # 로깅 AOP
│   ├── SecurityAuditAspect.java # 보안 감사 AOP
│   ├── AdminActionAspect.java  # 관리자 활동 로깅
│   ├── UserActionAspect.java   # 사용자 활동 로깅
│   └── PerformanceAspect.java  # 성능 모니터링 AOP
│
├── annotation/                 # 커스텀 어노테이션
│   ├── RequireAdmin.java      # 관리자 권한 필요
│   ├── RequireUser.java       # 사용자 권한 필요
│   ├── RequireRole.java       # 특정 역할 필요
│   ├── RequirePermission.java # 특정 권한 필요
│   ├── AdminAction.java       # 관리자 활동 기록
│   └── RateLimit.java         # Rate Limiting
│
├── exception/                  # 예외 처리
│   ├── GlobalExceptionHandler.java # 전역 예외 처리기
│   ├── BusinessException.java
│   ├── ResourceNotFoundException.java
│   ├── UnauthorizedException.java
│   ├── ForbiddenException.java
│   ├── RoleNotFoundException.java
│   └── TokenException.java
│
├── core/                       # 공통 핵심 기능
│   ├── exception/             # 핵심 예외 처리
│   ├── validation/            # 커스텀 검증
│   ├── security/              # 보안 유틸리티
│   └── config/                # 공통 설정
│
└── utils/                      # 유틸리티 클래스
    ├── SecurityUtils.java     # 보안 유틸리티
    ├── RoleUtils.java         # 역할 유틸리티
    ├── PermissionUtils.java   # 권한 유틸리티
    └── CookieUtils.java       # 쿠키 처리 유틸리티
```

### 핵심 설계 원칙

1. **계층 분리 (Layer Separation)**: 각 레이어는 명확한 책임을 가지며 상위 레이어만 하위 레이어에 의존
2. **관심사 분리 (Separation of Concerns)**: User/Admin 분리, 인증/인가 분리, 비즈니스 로직 분리
3. **Spring Security 통합**: Spring Security 표준을 준수한 인증/인가 시스템
4. **Role 기반 접근 제어 (RBAC)**: 계층적 역할 구조와 세밀한 권한 관리
5. **JWT Stateless 인증**: 확장 가능한 토큰 기반 인증 시스템
6. **AOP 횡단 관심사**: 로깅, 보안, 성능 모니터링의 AOP 처리
7. **Filter-Interceptor-AOP 조합**: 다층 보안 및 요청 처리

### 주요 컴포넌트

#### Presentation Layer (Controller)
- **UserController**: 일반 사용자 API 엔드포인트 (ROLE_USER)
- **AdminController**: 관리자 전용 API 엔드포인트 (ROLE_ADMIN)  
- **AuthController**: 로그인, 토큰 갱신 등 인증 API
- **RegistrationController**: 회원가입 및 이메일 인증

#### Business Layer (Service)  
- **AuthService**: Spring Security 기반 인증 서비스
- **RegistrationService**: 회원가입 비즈니스 로직 (이메일 인증, 역할 할당)
- **UserService**: 사용자 관리 비즈니스 로직
- **AdminService**: 관리자 전용 비즈니스 로직
- **TokenService**: JWT 토큰 생성/검증/갱신 서비스
- **RoleService**: 역할 및 권한 관리 서비스

#### Data Access Layer (Repository)
- **UserRepository**: 사용자 데이터 CRUD 및 인증용 조회
- **RoleRepository**: 역할 데이터 관리
- **PermissionRepository**: 권한 데이터 관리
- **RefreshTokenRepository**: 리프레시 토큰 저장소 (Redis/DB)

#### Security Components
- **CustomUserDetails**: Spring Security UserDetails 구현체
- **CustomUserDetailsService**: 사용자 로드 서비스
- **JwtTokenProvider**: JWT 토큰 생성/검증
- **JwtAuthenticationFilter**: JWT 기반 인증 필터
- **SecurityConfig**: Spring Security 메인 설정 (Role Hierarchy 포함)

#### Cross-Cutting Concerns
- **Interceptors**: API 경로별 접근 제어 (User/Admin 분리)
- **AOP Aspects**: 로깅, 보안 감사, 성능 모니터링
- **Custom Annotations**: @RequireAdmin, @RequireRole, @AdminAction 등

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
- **Spring Security 6.x**: SecurityFilterChain 기반 최신 보안 설정
- **JWT 인증**: Access Token (15분) + Refresh Token (7일) 방식
- **Role 기반 접근제어**: ROLE_SUPER_ADMIN > ROLE_ADMIN > ROLE_MANAGER > ROLE_USER > ROLE_GUEST
- **OAuth2 소셜 로그인**: Google, GitHub 지원 (JWT 토큰 발급)
- **UserDetails 구현**: Spring Security 표준 인증 주체
- **Method Security**: @PreAuthorize, @PostAuthorize, @Secured 지원
- **다층 보안**: Filter → Interceptor → AOP → Method Security
- **회원가입 시스템**: 이메일 인증, 비밀번호 암호화, 역할 자동 할당
- **관리자 분리**: Admin 전용 API, IP 화이트리스트, 활동 로깅
- **CORS 설정**: 개발/프로덕션 환경별 CORS 정책
- **CSRF 비활성화**: REST API 특성에 맞는 보안 설정

## 개발 가이드

### 새로운 기능 추가 시
1. **Entity 생성**: `entity/` 패키지에 JPA 엔티티 정의
2. **Repository 인터페이스**: `repository/` 패키지에 데이터 접근 인터페이스
3. **DTO 생성**: `dto/` 패키지에 요청/응답 DTO 정의
4. **Service 구현**: `service/` 패키지에 비즈니스 로직 구현
5. **Controller 구현**: `controller/` 패키지에 REST API 엔드포인트
6. **보안 설정**: 필요 시 `SecurityConfig`에서 경로별 권한 설정

### User/Admin 분리 개발
1. **사용자 기능**: `controller/user/`, `service/user/` 패키지 사용
2. **관리자 기능**: `controller/admin/`, `service/admin/` 패키지 사용
3. **공통 기능**: `controller/auth/`, `service/auth/` 패키지 사용
4. **권한 체크**: `@PreAuthorize("hasRole('ADMIN')")` 등 어노테이션 사용
5. **인터셉터**: 경로별 추가 권한 검증 필요 시 활용

### 보안 기능 개발
1. **새로운 역할 추가**: `Role` 엔티티 및 `data.sql`에 추가
2. **커스텀 권한**: `Permission` 엔티티 및 `@PreAuthorize` 활용
3. **AOP 감사 로깅**: `@AdminAction`, `@SecurityAudit` 어노테이션 사용
4. **Rate Limiting**: `@RateLimit` 어노테이션으로 API 호출 제한

### 테스트 전략
- **단위 테스트**: Service 레이어 비즈니스 로직 중심
- **통합 테스트**: Repository 레이어 데이터 접근 테스트
- **보안 테스트**: Spring Security Test로 인증/인가 테스트
- **API 테스트**: @WebMvcTest로 Controller + Security 통합 테스트
- **문서화 테스트**: Spring REST Docs로 API 문서 자동 생성

### 코딩 컨벤션
- **Lombok**: @Data, @Builder 등으로 보일러플레이트 최소화
- **MapStruct**: Entity ↔ DTO 변환 자동화
- **Bean Validation**: @Valid, @NotNull 등 입력 검증
- **Global Exception Handler**: 일관성 있는 에러 응답
- **Spring Security**: 표준 방식의 인증/인가 구현
- **JWT**: Stateless 방식의 토큰 기반 인증
- **Role Hierarchy**: 계층적 역할 구조 활용

### API 문서화
- SpringDoc OpenAPI 3 사용
- Swagger UI 제공 (`/swagger-ui/index.html`)
- Spring REST Docs로 테스트 기반 문서 생성

이 아키텍처는 확장 가능하고 테스트 가능하며 유지보수가 용이한 엔터프라이즈급 백엔드 시스템을 제공합니다.