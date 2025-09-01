# DDD 헥사고날 아키텍처 학습 가이드 📚

Spring Boot 프로젝트에서 Domain-Driven Design(DDD)과 헥사고날 아키텍처를 학습하기 위한 완전한 가이드입니다.

## 📋 목차

- [1. 학습 로드맵](#1-학습-로드맵)
- [2. 핵심 개념 이해](#2-핵심-개념-이해)
- [3. 아키텍처 구조 분석](#3-아키텍처-구조-분석)
- [4. 계층별 파일 학습](#4-계층별-파일-학습)
- [5. 실습 가이드](#5-실습-가이드)
- [6. 고급 패턴](#6-고급-패턴)
- [7. 추천 학습 자료](#7-추천-학습-자료)

---

## 1. 학습 로드맵 📈

### 🚀 초급 단계 (1-2주)
```
1. DDD 기본 개념 이해
2. 헥사고날 아키텍처 원리 학습
3. Value Object와 Entity 구분
4. Repository 패턴 이해
```

### 🔥 중급 단계 (2-3주)
```
1. Application Service 역할 이해
2. 포트-어댑터 패턴 실습
3. 도메인 이벤트 구현
4. CQRS 패턴 적용
```

### 🎯 고급 단계 (3-4주)
```
1. 애그리게이트 설계
2. 도메인 서비스 vs 애플리케이션 서비스
3. 이벤트 소싱 적용
4. 마이크로서비스로 확장
```

---

## 2. 핵심 개념 이해 🧠

### 2.1 DDD (Domain-Driven Design)
```markdown
**핵심 철학**: 복잡한 소프트웨어의 중심을 도메인(비즈니스 로직)에 둔다

주요 구성요소:
- 🎯 Entity: 고유 식별자를 가진 도메인 객체
- 💎 Value Object: 불변의 값을 나타내는 객체
- 🏭 Aggregate: 데이터 일관성 경계
- 📚 Repository: 도메인 객체 저장/조회 추상화
- 🔧 Domain Service: 여러 엔티티에 걸친 비즈니스 로직
```

### 2.2 헥사고날 아키텍처 (포트-어댑터)
```markdown
**핵심 철학**: 비즈니스 로직을 외부 기술로부터 격리

구조:
- 🏛️ Domain (중심): 순수 비즈니스 로직
- 🔌 Port: 외부와의 소통 인터페이스
- 🔀 Adapter: 구체적인 기술 구현
- ⚡ Application: 유스케이스 오케스트레이션
```

---

## 3. 아키텍처 구조 분석 🏗️

### 3.1 전체 패키지 구조
```
📁 com.cp9/
├── 🏛️ domain/           # 도메인 레이어 (핵심 비즈니스 로직)
│   ├── user/            # User 도메인
│   └── shared/          # 공유 도메인 객체
├── 🚀 application/      # 애플리케이션 레이어 (유스케이스)
│   └── user/            # User 관련 유스케이스
├── 🔧 infrastructure/   # 인프라스트럭처 레이어
│   ├── persistence/     # 데이터 저장소
│   ├── web/            # REST API
│   ├── messaging/      # 이벤트 처리
│   └── external/       # 외부 시스템 연동
└── ⚙️ core/            # 공통 핵심 기능
    ├── exception/      # 전역 예외 처리
    ├── validation/     # 검증 로직
    ├── security/       # 보안 설정
    └── config/         # 공통 설정
```

### 3.2 의존성 방향
```
🔄 의존성 흐름 (Dependency Inversion)

Infrastructure  -->  Application  -->  Domain
     🔧              🚀              🏛️
   (구현체)          (유스케이스)      (비즈니스)

❌ 잘못된 방향: Domain --> Infrastructure
✅ 올바른 방향: Infrastructure --> Domain (through interfaces)
```

---

## 4. 계층별 파일 학습 📂

### 4.1 Domain Layer (도메인 레이어) - 1순위 학습 🏛️

#### 📍 Value Objects (값 객체)
```java
📁 domain/shared/vo/
├── Email.java                    # 이메일 값 객체
└── ...

🎯 학습 포인트:
- 불변성(Immutability) 보장
- equals/hashCode 구현
- 비즈니스 규칙 내재화
- 원시 타입 대신 도메인 개념 사용
```

**Email.java 핵심 코드**:
```java
public class Email {
    private final String value;
    
    public Email(String value) {
        validateEmail(value);  // 🔍 생성 시점에 검증
        this.value = value.toLowerCase().trim();
    }
    
    // 🛡️ 불변성을 위한 getter만 제공
    public String getValue() { return value; }
}
```

#### 📍 Entity (엔티티)
```java
📁 domain/user/model/
├── UserId.java                   # 사용자 식별자 VO
├── UserStatus.java               # 사용자 상태 열거형
├── User.java                     # 사용자 엔티티 ⭐⭐⭐
└── UserRepository.java           # 레포지토리 인터페이스

🎯 학습 포인트:
- 고유 식별자 존재
- 생명주기 관리
- 비즈니스 메서드 포함
- 상태 변경 제어
```

**User.java 핵심 구조**:
```java
public class User {
    private UserId id;                    // 🆔 고유 식별자
    private String username;
    private Email email;                  // 💎 Value Object 사용
    private UserStatus status;            // 📊 상태 관리
    
    // 🏗️ 생성자 - 비즈니스 규칙 적용
    public User(String username, Email email, String displayName) {
        validateUserCreation(...);
        this.id = UserId.generate();
        // 초기 상태 설정
    }
    
    // 🔧 비즈니스 메서드
    public void activate() { /* 활성화 로직 */ }
    public void deactivate() { /* 비활성화 로직 */ }
}
```

#### 📍 Domain Service (도메인 서비스)
```java
📁 domain/user/service/
└── UserDomainService.java        # 도메인 서비스

🎯 학습 포인트:
- 여러 엔티티에 걸친 비즈니스 로직
- 단일 엔티티로 표현하기 어려운 규칙
- 무상태(Stateless) 서비스
```

### 4.2 Application Layer (애플리케이션 레이어) - 2순위 학습 🚀

#### 📍 Use Case Interfaces (인바운드 포트)
```java
📁 application/user/port/in/
├── CreateUserUseCase.java        # 사용자 생성 유스케이스
├── GetUserUseCase.java           # 사용자 조회 유스케이스
└── UpdateUserUseCase.java        # 사용자 수정 유스케이스

🎯 학습 포인트:
- 비즈니스 기능을 인터페이스로 정의
- 외부에서 시스템을 사용하는 방법
- SOLID 원칙 중 Interface Segregation 적용
```

#### 📍 DTO (Data Transfer Objects)
```java
📁 application/user/dto/
├── CreateUserCommand.java        # 명령 객체
├── UserQuery.java                # 조회 객체
└── UserResponse.java             # 응답 객체

🎯 학습 포인트:
- CQRS 패턴 (Command Query Responsibility Segregation)
- 계층 간 데이터 전송
- 검증 어노테이션 활용
```

#### 📍 Application Service (애플리케이션 서비스)
```java
📁 application/user/
└── UserApplicationService.java   # 애플리케이션 서비스 ⭐⭐⭐

🎯 학습 포인트:
- 유스케이스 오케스트레이션
- 트랜잭션 관리
- 도메인 이벤트 발행
- 포트 인터페이스 구현
```

**UserApplicationService.java 핵심 구조**:
```java
@Service
@Transactional
public class UserApplicationService implements CreateUserUseCase, GetUserUseCase {
    
    // 🔌 포트를 통한 의존성 주입
    private final UserRepository userRepository;
    private final UserDomainService userDomainService;
    private final UserEventPort userEventPort;
    
    @Override
    public UserResponse createUser(CreateUserCommand command) {
        // 1. 🔍 도메인 서비스로 비즈니스 규칙 검증
        userDomainService.validateUserCreation(...);
        
        // 2. 🏗️ 도메인 객체 생성
        User user = new User(...);
        User savedUser = userRepository.save(user);
        
        // 3. 📢 도메인 이벤트 발행
        userEventPort.publishUserCreatedEvent(event);
        
        // 4. 📤 응답 객체 반환
        return new UserResponse(savedUser);
    }
}
```

### 4.3 Infrastructure Layer (인프라스트럭처 레이어) - 3순위 학습 🔧

#### 📍 Persistence Adapter (영속성 어댑터)
```java
📁 infrastructure/persistence/user/
├── UserJpaEntity.java            # JPA 엔티티
├── UserJpaRepository.java        # Spring Data JPA
└── UserRepositoryImpl.java       # 레포지토리 구현체 ⭐⭐

🎯 학습 포인트:
- 도메인 객체 ↔ JPA 엔티티 변환
- 영속성 기술의 격리
- 데이터베이스 스키마 매핑
```

**매핑 패턴**:
```java
// 🔄 도메인 ↔ JPA 변환
public class UserJpaEntity {
    // JPA 어노테이션과 데이터베이스 매핑
    
    // 🏗️ 도메인 → JPA
    public static UserJpaEntity from(User user) { ... }
    
    // 🏗️ JPA → 도메인
    public User toDomain() { ... }
}
```

#### 📍 Web Adapter (웹 어댑터)
```java
📁 infrastructure/web/user/
└── UserController.java           # REST 컨트롤러 ⭐

🎯 학습 포인트:
- HTTP 요청/응답 처리
- 인바운드 포트 호출
- REST API 설계
- 예외 처리
```

#### 📍 Event Adapter (이벤트 어댑터)
```java
📁 infrastructure/messaging/event/
├── UserEventAdapter.java         # 이벤트 발행 어댑터
└── UserEventHandler.java         # 이벤트 처리 핸들러

🎯 학습 포인트:
- 도메인 이벤트 발행
- 비동기 이벤트 처리
- 이벤트 기반 아키텍처
```

### 4.4 Core Layer (공통 레이어) - 4순위 학습 ⚙️

```java
📁 core/
├── exception/
│   ├── GlobalExceptionHandler.java    # 전역 예외 처리기
│   └── ErrorResponse.java            # 에러 응답 DTO
├── validation/
│   ├── ValidEmail.java               # 커스텀 검증 어노테이션
│   └── EmailValidator.java           # 검증 로직
├── security/
│   └── SecurityConfig.java           # Spring Security 설정
└── config/
    └── JpaAuditingConfig.java        # JPA 감사 설정
```

---

## 5. 실습 가이드 🛠️

### 5.1 환경 설정
```bash
# 1. 프로젝트 실행
./gradlew bootRun --args='--spring.profiles.active=dev'

# 2. H2 콘솔 접속
http://localhost:8080/h2-console

# 3. API 문서 확인
http://localhost:8080/swagger-ui/index.html
```

### 5.2 기본 API 테스트
```bash
# 사용자 생성
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "displayName": "테스트 사용자"
  }'

# 사용자 조회
curl http://localhost:8080/api/users/{userId}
```

### 5.3 학습 실습 과제

#### 📝 과제 1: Value Object 만들기
```java
// 전화번호 Value Object 구현하기
public class PhoneNumber {
    private final String value;
    
    // TODO: 
    // 1. 생성자에서 전화번호 형식 검증
    // 2. equals/hashCode 구현
    // 3. toString() 구현
}
```

#### 📝 과제 2: 새로운 도메인 엔티티 추가
```java
// Product 엔티티 구현하기
public class Product {
    private ProductId id;
    private String name;
    private Money price;    // Money Value Object도 만들기
    private ProductStatus status;
    
    // TODO:
    // 1. 생성자에서 비즈니스 규칙 적용
    // 2. 가격 변경 메서드 구현
    // 3. 상태 변경 메서드 구현
}
```

#### 📝 과제 3: Application Service 구현
```java
// ProductApplicationService 구현하기
@Service
public class ProductApplicationService implements CreateProductUseCase {
    // TODO:
    // 1. 의존성 주입 설정
    // 2. 상품 생성 유스케이스 구현
    // 3. 트랜잭션 설정
    // 4. 도메인 이벤트 발행
}
```

---

## 6. 고급 패턴 🚀

### 6.1 Aggregate 설계
```java
// Order Aggregate 예시
public class Order {                     // 🏛️ Aggregate Root
    private OrderId id;
    private List<OrderItem> items;       // 🔗 Aggregate 내부 엔티티
    private OrderStatus status;
    
    // 📏 Aggregate 경계 내에서만 일관성 보장
    public void addItem(Product product, int quantity) {
        // 비즈니스 규칙 검증
        this.items.add(new OrderItem(product, quantity));
    }
}
```

### 6.2 이벤트 소싱 패턴
```java
// 도메인 이벤트 기반 상태 관리
public abstract class AggregateRoot {
    private List<DomainEvent> domainEvents = new ArrayList<>();
    
    protected void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }
    
    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }
}
```

### 6.3 CQRS 심화
```java
// Command Model (쓰기)
public class UserWriteModel {
    // 쓰기 최적화된 구조
}

// Query Model (읽기) 
public class UserReadModel {
    // 읽기 최적화된 구조
}
```

---

## 7. 추천 학습 자료 📚

### 📖 필독서
1. **"도메인 주도 개발 시작하기"** - 최범균
2. **"만들면서 배우는 클린 아키텍처"** - 톰 홈버그
3. **"도메인 주도 설계"** - 에릭 에반스
4. **"구현 패턴"** - 켄트 백

### 🌐 온라인 자료
1. **Martin Fowler Blog**: https://martinfowler.com/
2. **DDD Community**: https://dddcommunity.org/
3. **Clean Architecture Blog**: Uncle Bob's Blog

### 🎥 동영상 강의
1. **DDD 기초 강의** (YouTube)
2. **Spring Boot DDD 실습** (인프런)
3. **Hexagonal Architecture 설명** (YouTube)

### 🛠️ 실습 프로젝트
1. **온라인 쇼핑몰** - Order, Product, User 도메인
2. **도서관 관리 시스템** - Book, Member, Loan 도메인
3. **은행 시스템** - Account, Transaction, Customer 도메인

---

## 🎯 학습 체크리스트

### ✅ 초급 목표
- [ ] DDD 기본 개념 설명할 수 있다
- [ ] Entity vs Value Object 구분할 수 있다
- [ ] Repository 패턴을 이해한다
- [ ] 기존 User API를 테스트할 수 있다

### ✅ 중급 목표  
- [ ] Application Service의 역할을 안다
- [ ] 포트-어댑터 패턴을 구현할 수 있다
- [ ] 도메인 이벤트를 만들 수 있다
- [ ] 새로운 도메인을 추가할 수 있다

### ✅ 고급 목표
- [ ] Aggregate를 설계할 수 있다
- [ ] CQRS 패턴을 적용할 수 있다
- [ ] 마이크로서비스로 분리할 수 있다
- [ ] 이벤트 소싱을 구현할 수 있다

---

## 💡 학습 팁

### 🎯 효과적인 학습 방법
1. **Bottom-Up**: Domain → Application → Infrastructure 순으로 학습
2. **실습 중심**: 이론보다는 코드 구현에 집중
3. **비교 학습**: 기존 레이어드 아키텍처와 비교
4. **점진적 확장**: User 도메인을 완전히 이해한 후 다른 도메인 추가

### 🚫 주의사항
1. **안티패턴 피하기**:
   - Domain에서 Infrastructure 직접 참조 금지
   - Anemic Domain Model 피하기
   - God Class 만들지 않기

2. **과도한 추상화 피하기**:
   - 단순한 CRUD도 DDD로 만들지 않기
   - 불필요한 계층 추가하지 않기

### ⚡ 실무 적용 가이드
1. **단계적 적용**: 전체 시스템을 한 번에 바꾸지 말기
2. **팀 합의**: 팀원들과 충분한 논의 후 도입
3. **문서화**: 설계 결정과 이유를 문서로 남기기
4. **지속적 리팩토링**: 도메인 이해가 깊어지면 구조 개선

---

🎉 **Happy Learning!** 이 가이드를 통해 DDD와 헥사고날 아키텍처를 체계적으로 학습하세요!