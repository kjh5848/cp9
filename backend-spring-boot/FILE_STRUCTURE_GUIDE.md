# 파일 구조 상세 가이드 📁

DDD 헥사고날 아키텍처의 모든 파일에 대한 상세한 설명과 역할을 정리한 가이드입니다.

## 📋 목차
- [1. 전체 구조 개요](#1-전체-구조-개요)
- [2. Domain Layer 상세](#2-domain-layer-상세)
- [3. Application Layer 상세](#3-application-layer-상세)
- [4. Infrastructure Layer 상세](#4-infrastructure-layer-상세)
- [5. Core Layer 상세](#5-core-layer-상세)
- [6. Configuration 파일들](#6-configuration-파일들)

---

## 1. 전체 구조 개요 🎯

```
📁 src/main/java/com/cp9/
├── 🏛️ domain/                     # 도메인 레이어 (비즈니스 핵심)
│   ├── user/                      # 사용자 도메인
│   │   ├── model/                 # 도메인 모델
│   │   ├── service/               # 도메인 서비스  
│   │   └── event/                 # 도메인 이벤트
│   └── shared/                    # 공유 도메인 요소
│       ├── vo/                    # 공통 Value Objects
│       └── exception/             # 도메인 예외
├── 🚀 application/                # 애플리케이션 레이어 (유스케이스)
│   └── user/                      # 사용자 애플리케이션 서비스
│       ├── dto/                   # 데이터 전송 객체
│       ├── port/                  # 포트 인터페이스
│       │   ├── in/                # 인바운드 포트 (외부→내부)
│       │   └── out/               # 아웃바운드 포트 (내부→외부)
│       └── UserApplicationService.java
├── 🔧 infrastructure/             # 인프라스트럭처 레이어 (기술 구현)
│   ├── persistence/               # 데이터 영속성
│   │   ├── user/                  # 사용자 영속성 구현
│   │   └── config/                # 영속성 설정
│   ├── web/                       # 웹 인터페이스
│   │   ├── user/                  # 사용자 웹 컨트롤러
│   │   ├── config/                # 웹 설정
│   │   └── security/              # 보안 설정
│   ├── messaging/                 # 메시징 및 이벤트
│   │   ├── event/                 # 이벤트 처리
│   │   └── websocket/             # WebSocket 설정
│   └── external/                  # 외부 시스템 연동
│       ├── ai/                    # AI 서비스 연동
│       ├── oauth/                 # OAuth 연동
│       └── monitoring/            # 모니터링 연동
└── ⚙️ core/                       # 공통 핵심 기능
    ├── exception/                 # 전역 예외 처리
    ├── validation/                # 커스텀 검증
    ├── security/                  # 보안 유틸리티
    └── config/                    # 공통 설정
```

---

## 2. Domain Layer 상세 🏛️

### 2.1 도메인 모델 (`domain/user/model/`)

#### 📄 `User.java` - 사용자 엔티티 (핵심 🌟)
```java
경로: src/main/java/com/cp9/domain/user/model/User.java

역할:
✨ 사용자의 핵심 비즈니스 로직 담당
✨ 생명주기 관리 (생성, 활성화, 비활성화, 삭제)
✨ 불변식(Invariant) 보장
✨ 상태 변경 메서드 제공

주요 메서드:
- 생성자: 비즈니스 규칙 검증 후 사용자 생성
- updateProfile(): 프로필 정보 업데이트
- changeEmail(): 이메일 변경
- activate()/deactivate(): 상태 변경
- recordLogin(): 로그인 시간 기록

학습 포인트:
🎯 Rich Domain Model 패턴
🎯 캡슐화를 통한 데이터 보호
🎯 비즈니스 규칙의 중앙화
```

#### 📄 `UserId.java` - 사용자 식별자 Value Object
```java
경로: src/main/java/com/cp9/domain/user/model/UserId.java

역할:
💎 사용자의 고유 식별자
💎 UUID 기반 식별자 생성
💎 타입 안전성 제공 (String 대신 강타입 사용)

주요 메서드:
- generate(): 새 UUID 생성
- of(String): 문자열에서 UserId 생성
- equals()/hashCode(): 동등성 비교

학습 포인트:
🎯 Primitive Obsession 해결
🎯 Value Object 불변성
🎯 타입 안전성 확보
```

#### 📄 `UserStatus.java` - 사용자 상태 열거형
```java
경로: src/main/java/com/cp9/domain/user/model/UserStatus.java

역할:
📊 사용자의 상태를 타입 안전하게 표현
📊 상태별 비즈니스 로직 제공

값:
- ACTIVE: 활성 사용자
- INACTIVE: 비활성 사용자  
- SUSPENDED: 정지된 사용자
- DELETED: 삭제된 사용자

학습 포인트:
🎯 Enum을 통한 제한된 선택지 표현
🎯 상태별 비즈니스 메서드
```

#### 📄 `UserRepository.java` - 레포지토리 인터페이스
```java
경로: src/main/java/com/cp9/domain/user/model/UserRepository.java

역할:
📚 사용자 영속성 추상화
📚 도메인과 인프라 계층 분리
📚 데이터 접근 인터페이스 정의

주요 메서드:
- save(User): 사용자 저장
- findById(UserId): ID로 조회
- findByUsername(String): 사용자명으로 조회
- findByEmail(Email): 이메일로 조회
- existsByUsername(): 중복 체크

학습 포인트:
🎯 Repository 패턴
🎯 의존성 역전 원칙
🎯 도메인 중심 인터페이스 설계
```

### 2.2 도메인 서비스 (`domain/user/service/`)

#### 📄 `UserDomainService.java` - 도메인 서비스
```java
경로: src/main/java/com/cp9/domain/user/service/UserDomainService.java

역할:
🔧 여러 엔티티에 걸친 비즈니스 로직
🔧 단일 엔티티로 표현하기 어려운 도메인 규칙
🔧 중복 검사 및 복잡한 검증 로직

주요 메서드:
- validateUniqueUsername(): 사용자명 중복 검사
- validateUniqueEmail(): 이메일 중복 검사
- validateUserCreation(): 사용자 생성 전 종합 검증
- validateEmailChange(): 이메일 변경 검증

학습 포인트:
🎯 도메인 서비스 vs 애플리케이션 서비스 구분
🎯 무상태(Stateless) 서비스
🎯 도메인 로직의 응집성
```

### 2.3 도메인 이벤트 (`domain/user/event/`)

#### 📄 `UserCreatedEvent.java` - 사용자 생성 이벤트
```java
경로: src/main/java/com/cp9/domain/user/event/UserCreatedEvent.java

역할:
📢 사용자 생성 시 발생하는 도메인 이벤트
📢 다른 바운디드 컨텍스트와의 통신
📢 부수 효과(Side Effect) 처리

포함 정보:
- 사용자 ID, 사용자명, 이메일, 표시명
- 이벤트 발생 시각

학습 포인트:
🎯 도메인 이벤트 패턴
🎯 느슨한 결합 달성
🎯 이벤트 기반 아키텍처
```

### 2.4 공유 도메인 (`domain/shared/`)

#### 📄 `Email.java` - 이메일 Value Object
```java
경로: src/main/java/com/cp9/domain/shared/vo/Email.java

역할:
💎 이메일 주소의 도메인 표현
💎 이메일 형식 검증
💎 도메인 개념의 명시적 표현

특징:
- 불변성 보장
- 생성 시점 검증
- 정규화 (소문자 변환, 공백 제거)
- 도메인/로컬 파트 분리 기능

학습 포인트:
🎯 Value Object 설계 원칙
🎯 원시타입 대신 도메인 타입 사용
🎯 검증 로직 내재화
```

#### 📄 `DomainException.java` - 도메인 예외 기본 클래스
```java
경로: src/main/java/com/cp9/domain/shared/exception/DomainException.java

역할:
🚨 도메인 계층 예외의 기본 클래스
🚨 에러 코드와 메시지 표준화
🚨 계층별 예외 구분

특징:
- 추상 클래스로 직접 생성 불가
- errorCode 필드로 에러 분류
- RuntimeException 상속

학습 포인트:
🎯 도메인 예외 설계
🎯 예외 계층 구조
🎯 에러 코드 관리
```

---

## 3. Application Layer 상세 🚀

### 3.1 애플리케이션 서비스 (`application/user/`)

#### 📄 `UserApplicationService.java` - 애플리케이션 서비스 (핵심 🌟)
```java
경로: src/main/java/com/cp9/application/user/UserApplicationService.java

역할:
🎭 유스케이스 오케스트레이션
🎭 트랜잭션 경계 설정
🎭 도메인 서비스 조합
🎭 DTO 변환 및 이벤트 발행

주요 패턴:
- 여러 인바운드 포트 구현
- @Transactional을 통한 트랜잭션 관리
- 도메인 서비스와 레포지토리 조합
- 도메인 이벤트 발행

예시 플로우 (createUser):
1. Command 검증
2. 도메인 서비스로 비즈니스 규칙 확인
3. 도메인 객체 생성 및 저장
4. 도메인 이벤트 발행
5. Response 변환 후 반환

학습 포인트:
🎯 애플리케이션 서비스의 역할과 책임
🎯 얇은 애플리케이션 레이어 구현
🎯 트랜잭션과 이벤트 처리
```

### 3.2 DTO (Data Transfer Objects) (`application/user/dto/`)

#### 📄 `CreateUserCommand.java` - 사용자 생성 명령
```java
경로: src/main/java/com/cp9/application/user/dto/CreateUserCommand.java

역할:
📨 사용자 생성 요청 데이터 전송
📨 입력값 검증
📨 불변 데이터 구조

검증 어노테이션:
- @NotBlank: 필수값 검증
- @Email: 이메일 형식 검증  
- @Size: 길이 제한 검증
- @Pattern: 정규식 패턴 검증

학습 포인트:
🎯 Command 패턴
🎯 Bean Validation 활용
🎯 불변 객체 설계
```

#### 📄 `UserResponse.java` - 사용자 응답 객체
```java
경로: src/main/java/com/cp9/application/user/dto/UserResponse.java

역할:
📤 사용자 정보 응답 데이터
📤 민감한 정보 필터링
📤 JSON 직렬화 최적화

특징:
- final 필드로 불변성 보장
- Jackson 어노테이션으로 직렬화 제어
- 생성자에서 도메인 객체 변환
- 정적 팩터리 메서드 제공

학습 포인트:
🎯 DTO 설계 원칙
🎯 도메인 → DTO 변환
🎯 API 응답 설계
```

#### 📄 `UserQuery.java` - 사용자 조회 쿼리
```java
경로: src/main/java/com/cp9/application/user/dto/UserQuery.java

역할:
🔍 사용자 조회 조건 표현
🔍 다양한 검색 조건 지원
🔍 정적 팩터리 메서드로 편의성 제공

조회 조건:
- ID, 사용자명, 이메일
- 상태별 필터링
- 표시명 검색

학습 포인트:
🎯 Query Object 패턴
🎯 CQRS의 Query 측면
🎯 유연한 조회 API 설계
```

### 3.3 포트 인터페이스 (`application/user/port/`)

#### 📄 인바운드 포트 (`port/in/`)
```java
CreateUserUseCase.java      - 사용자 생성 유스케이스
GetUserUseCase.java         - 사용자 조회 유스케이스  
UpdateUserUseCase.java      - 사용자 수정 유스케이스

공통 역할:
🔌 외부에서 애플리케이션을 사용하는 방법 정의
🔌 비즈니스 기능을 인터페이스로 표현
🔌 의존성 역전을 통한 결합도 감소

학습 포인트:
🎯 헥사고날 아키텍처의 포트 개념
🎯 Interface Segregation Principle
🎯 유스케이스 중심 인터페이스 설계
```

#### 📄 아웃바운드 포트 (`port/out/`)
```java
UserEventPort.java          - 이벤트 발행 포트

역할:
🔌 애플리케이션에서 외부로 나가는 요청 정의
🔌 외부 시스템과의 결합도 감소
🔌 테스트에서 Mock 객체 사용 가능

학습 포인트:
🎯 아웃바운드 포트 설계
🎯 외부 의존성 추상화
🎯 테스트 용이성 확보
```

---

## 4. Infrastructure Layer 상세 🔧

### 4.1 영속성 계층 (`infrastructure/persistence/`)

#### 📄 `UserJpaEntity.java` - JPA 엔티티
```java
경로: src/main/java/com/cp9/infrastructure/persistence/user/UserJpaEntity.java

역할:
💾 데이터베이스 테이블과 매핑
💾 도메인 객체 ↔ JPA 엔티티 변환
💾 영속성 기술 격리

주요 어노테이션:
- @Entity: JPA 엔티티 선언
- @Table: 테이블 매핑 및 제약조건
- @Index: 성능을 위한 인덱스 정의
- @EntityListeners: JPA Auditing

변환 메서드:
- from(User): 도메인 → JPA 엔티티
- toDomain(): JPA 엔티티 → 도메인
- updateFrom(User): 기존 엔티티 업데이트

학습 포인트:
🎯 도메인-데이터베이스 매핑 전략
🎯 JPA 어노테이션 활용
🎯 영속성 기술 격리
```

#### 📄 `UserJpaRepository.java` - Spring Data JPA 레포지토리
```java
경로: src/main/java/com/cp9/infrastructure/persistence/user/UserJpaRepository.java

역할:
🗃️ Spring Data JPA 인터페이스 정의
🗃️ 기본 CRUD + 커스텀 쿼리 메서드
🗃️ 데이터베이스 접근 구현

제공 기능:
- 기본 CRUD (JpaRepository 상속)
- 사용자 정의 find 메서드
- @Query를 통한 JPQL 쿼리
- 존재 여부 체크 메서드

학습 포인트:
🎯 Spring Data JPA 활용
🎯 메서드 명명 규칙
🎯 커스텀 쿼리 작성
```

#### 📄 `UserRepositoryImpl.java` - 레포지토리 구현체 (핵심 🌟)
```java
경로: src/main/java/com/cp9/infrastructure/persistence/user/UserRepositoryImpl.java

역할:
🔗 도메인 레포지토리 인터페이스 구현
🔗 JPA와 도메인 객체 간 변환
🔗 영속성 계층의 어댑터 역할

구현 패턴:
1. JPA 레포지토리 호출
2. JPA 엔티티 ↔ 도메인 객체 변환
3. Optional 처리
4. 예외 변환

학습 포인트:
🎯 Adapter 패턴 구현
🎯 도메인 인터페이스 구현
🎯 영속성 기술 캡슐화
```

### 4.2 웹 계층 (`infrastructure/web/`)

#### 📄 `UserController.java` - REST 컨트롤러 (핵심 🌟)
```java
경로: src/main/java/com/cp9/infrastructure/web/user/UserController.java

역할:
🌐 HTTP 요청/응답 처리
🌐 인바운드 포트 호출
🌐 REST API 엔드포인트 제공
🌐 웹 어댑터 구현

제공 API:
POST /api/users              - 사용자 생성
GET /api/users/{id}          - 사용자 조회
PUT /api/users/{id}          - 사용자 수정  
DELETE /api/users/{id}       - 사용자 삭제
GET /api/users/active        - 활성 사용자 목록

처리 패턴:
1. HTTP 요청 수신
2. DTO 검증 (@Valid)
3. 유스케이스 포트 호출
4. HTTP 응답 생성

학습 포인트:
🎯 REST API 설계 원칙
🎯 HTTP 상태 코드 활용
🎯 입력 검증과 예외 처리
```

#### 📄 `WebConfig.java` - 웹 설정
```java
경로: src/main/java/com/cp9/infrastructure/web/config/WebConfig.java

역할:
⚙️ CORS 설정
⚙️ 인터셉터 설정
⚙️ 메시지 컨버터 설정

설정 내용:
- CORS 정책 정의
- Allowed Origins/Methods/Headers 설정
- 환경별 설정값 바인딩

학습 포인트:
🎯 Spring MVC 설정
🎯 CORS 보안 정책
🎯 환경별 설정 관리
```

#### 📄 `SecurityConfig.java` - Spring Security 설정
```java
경로: src/main/java/com/cp9/infrastructure/web/security/SecurityConfig.java

역할:
🛡️ 인증/인가 설정
🛡️ OAuth2 클라이언트 설정
🛡️ 보안 정책 정의

보안 설정:
- CSRF 비활성화 (REST API)
- OAuth2 로그인 (Google, GitHub)
- 엔드포인트별 접근 권한
- H2 콘솔 접근 허용 (개발환경)

학습 포인트:
🎯 Spring Security 설정
🎯 OAuth2 클라이언트 구성
🎯 REST API 보안 패턴
```

### 4.3 메시징 계층 (`infrastructure/messaging/`)

#### 📄 `UserEventAdapter.java` - 이벤트 어댑터
```java
경로: src/main/java/com/cp9/infrastructure/messaging/event/UserEventAdapter.java

역할:
📡 아웃바운드 포트 구현
📡 도메인 이벤트를 Spring 이벤트로 변환
📡 이벤트 발행 어댑터

구현:
- UserEventPort 인터페이스 구현
- ApplicationEventPublisher 사용
- 도메인 이벤트 발행

학습 포인트:
🎯 이벤트 어댑터 패턴
🎯 Spring Events 활용
🎯 도메인 이벤트 발행
```

#### 📄 `UserEventHandler.java` - 이벤트 핸들러
```java
경로: src/main/java/com/cp9/infrastructure/messaging/event/UserEventHandler.java

역할:
👂 도메인 이벤트 수신 및 처리
👂 부수 효과(Side Effect) 구현
👂 비동기 이벤트 처리

처리 내용:
- 환영 이메일 발송 (예시)
- 외부 시스템 연동
- 통계 업데이트
- 로깅 및 모니터링

학습 포인트:
🎯 이벤트 핸들러 패턴
🎯 @EventListener 활용
🎯 비동기 이벤트 처리
```

---

## 5. Core Layer 상세 ⚙️

### 5.1 예외 처리 (`core/exception/`)

#### 📄 `GlobalExceptionHandler.java` - 전역 예외 처리기 (핵심 🌟)
```java
경로: src/main/java/com/cp9/core/exception/GlobalExceptionHandler.java

역할:
🚨 애플리케이션 전체 예외 처리
🚨 일관성 있는 에러 응답
🚨 로깅 및 모니터링 연동

처리 예외:
- DomainException: 도메인 비즈니스 규칙 위반
- MethodArgumentNotValidException: 입력 검증 실패
- IllegalArgumentException: 잘못된 인수
- RuntimeException: 기타 런타임 예외

응답 형식:
- 표준 ErrorResponse 객체
- 적절한 HTTP 상태 코드
- 상세한 에러 정보

학습 포인트:
🎯 전역 예외 처리 패턴
🎯 @RestControllerAdvice 활용
🎯 예외별 처리 전략
```

#### 📄 `ErrorResponse.java` - 에러 응답 객체
```java
경로: src/main/java/com/cp9/core/exception/ErrorResponse.java

역할:
📋 API 에러 응답 표준화
📋 클라이언트 친화적 에러 정보
📋 JSON 직렬화 최적화

포함 필드:
- timestamp: 에러 발생 시각
- status: HTTP 상태 코드
- error: 에러 종류
- message: 에러 메시지
- errorCode: 커스텀 에러 코드
- validationErrors: 필드별 검증 에러

학습 포인트:
🎯 표준 에러 응답 설계
🎯 클라이언트 경험 고려
🎯 JSON 직렬화 제어
```

### 5.2 커스텀 검증 (`core/validation/`)

#### 📄 `ValidEmail.java` + `EmailValidator.java` - 이메일 검증
```java
경로: 
- src/main/java/com/cp9/core/validation/ValidEmail.java
- src/main/java/com/cp9/core/validation/EmailValidator.java

역할:
✅ 커스텀 이메일 검증 어노테이션
✅ 도메인 특화 검증 로직
✅ Bean Validation 확장

구현:
- @ValidEmail 어노테이션 정의
- EmailValidator 검증 로직
- 정규식 패턴 매칭
- 길이 및 형식 검증

학습 포인트:
🎯 커스텀 Validation 어노테이션
🎯 ConstraintValidator 구현
🎯 도메인 특화 검증
```

### 5.3 설정 (`core/config/`)

#### 📄 `JpaAuditingConfig.java` - JPA 감사 설정
```java
경로: src/main/java/com/cp9/core/config/JpaAuditingConfig.java

역할:
🕒 엔티티 생성/수정 시간 자동 관리
🕒 @CreatedDate, @LastModifiedDate 활성화
🕒 감사(Auditing) 기능 설정

설정 효과:
- 엔티티 저장 시 createdAt 자동 설정
- 엔티티 수정 시 updatedAt 자동 업데이트
- 수동 시간 설정 불필요

학습 포인트:
🎯 JPA Auditing 활용
🎯 엔티티 생명주기 관리
🎯 메타데이터 자동화
```

---

## 6. Configuration 파일들 📄

### 6.1 애플리케이션 설정

#### 📄 `application.yml` - 공통 설정
```yaml
경로: src/main/resources/application.yml

설정 내용:
📋 공통 애플리케이션 설정
📋 프로파일 활성화
📋 JPA, Jackson, 캐시 설정
📋 서버 및 액추에이터 설정

주요 설정:
- 기본 활성 프로파일: dev
- JPA 방언 및 성능 설정
- Jackson 시간대 설정
- Redis 캐시 설정
- WebSocket 설정
```

#### 📄 `application-dev.yml` - 개발환경 설정
```yaml
경로: src/main/resources/application-dev.yml

설정 내용:
🛠️ H2 인메모리 데이터베이스
🛠️ H2 콘솔 활성화
🛠️ DevTools 설정
🛠️ 상세 로깅 설정
🛠️ CORS 개발 설정

개발 편의 기능:
- H2 콘솔: /h2-console
- 자동 재시작 (DevTools)
- 모든 액추에이터 엔드포인트 노출
- 테스트 데이터 자동 생성
```

#### 📄 `application-prod.yml` - 프로덕션 설정  
```yaml
경로: src/main/resources/application-prod.yml

설정 내용:
🏭 PostgreSQL 데이터베이스
🏭 Redis 세션 스토어
🏭 SSL/TLS 설정
🏭 압축 및 캐싱
🏭 보안 강화 설정

프로덕션 최적화:
- 커넥션 풀 설정
- HTTP/2 활성화
- Gzip 압축
- 보안 헤더 설정
- 에러 스택 트레이스 숨김
```

### 6.2 빌드 설정

#### 📄 `build.gradle` - Gradle 빌드 스크립트
```gradle
경로: build.gradle

설정 내용:
🔧 Spring Boot 3.5.5
🔧 Java 17 툴체인
🔧 의존성 관리
🔧 플러그인 설정

추가된 의존성:
- MapStruct: 객체 매핑
- SpringDoc: API 문서화
- Spring Boot Starters
- 테스트 라이브러리
```

---

## 💡 학습 우선순위 및 팁

### 🎯 1단계: 도메인 레이어 완전 이해
```
1. Email.java (Value Object 패턴 학습)
2. User.java (Entity 패턴과 비즈니스 로직)
3. UserRepository.java (Repository 패턴)
4. UserDomainService.java (도메인 서비스)
```

### 🎯 2단계: 애플리케이션 레이어 구조 파악
```
1. CreateUserCommand.java (Command 패턴)
2. UserResponse.java (DTO 패턴)
3. CreateUserUseCase.java (포트 인터페이스)
4. UserApplicationService.java (유스케이스 구현)
```

### 🎯 3단계: 인프라스트럭처 레이어 구현 이해
```
1. UserJpaEntity.java (도메인-JPA 매핑)
2. UserRepositoryImpl.java (어댑터 패턴)
3. UserController.java (웹 어댑터)
4. UserEventAdapter.java (이벤트 어댑터)
```

### 🎯 4단계: 공통 기능 및 설정 이해
```
1. GlobalExceptionHandler.java (전역 예외 처리)
2. SecurityConfig.java (보안 설정)
3. application-*.yml (환경별 설정)
```

### 📚 각 파일 학습 시 확인할 점
- **역할과 책임**: 이 클래스가 담당하는 기능
- **의존성**: 다른 클래스와의 관계
- **패턴**: 적용된 디자인 패턴
- **테스트**: 어떻게 테스트할 수 있는지

이 가이드를 통해 각 파일의 역할과 전체 아키텍처에서의 위치를 명확히 이해하시기 바랍니다! 🚀