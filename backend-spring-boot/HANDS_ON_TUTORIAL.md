# DDD 실습 튜토리얼 🛠️

DDD 헥사고날 아키텍처를 실제 코드로 체험하며 학습하는 단계별 실습 가이드입니다.

## 📋 목차
- [1. 환경 설정 및 프로젝트 실행](#1-환경-설정-및-프로젝트-실행)
- [2. 기본 API 테스트](#2-기본-api-테스트)
- [3. 도메인 모델 실습](#3-도메인-모델-실습)
- [4. 새로운 도메인 추가 실습](#4-새로운-도메인-추가-실습)
- [5. 고급 패턴 실습](#5-고급-패턴-실습)
- [6. 트러블슈팅 가이드](#6-트러블슈팅-가이드)

---

## 1. 환경 설정 및 프로젝트 실행 🚀

### 1.1 개발환경으로 실행
```bash
# 개발 프로파일로 애플리케이션 실행
./gradlew bootRun --args='--spring.profiles.active=dev'

# 또는 IDE에서 실행 시
# VM options: -Dspring.profiles.active=dev
```

### 1.2 접속 확인
```bash
# 1. H2 데이터베이스 콘솔
http://localhost:8080/h2-console

# H2 접속 정보
JDBC URL: jdbc:h2:mem:testdb
Username: sa
Password: (빈 값)

# 2. API 문서 (Swagger UI)
http://localhost:8080/swagger-ui/index.html

# 3. 액추에이터 헬스 체크
http://localhost:8080/management/health
```

### 1.3 로그 확인
```bash
# 애플리케이션 시작 시 확인할 로그
INFO  - Started Cp9Application in x.xxx seconds
INFO  - H2 console available at '/h2-console'
INFO  - Swagger UI available at '/swagger-ui/index.html'
```

---

## 2. 기본 API 테스트 🧪

### 2.1 사용자 생성 API 테스트

#### curl 명령어
```bash
# 사용자 생성
curl -X POST "http://localhost:8080/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe"
  }'
```

#### 예상 응답
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john@example.com",
  "displayName": "John Doe",
  "status": "ACTIVE",
  "statusDescription": "활성",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "lastLoginAt": null
}
```

#### 🎯 실습 포인트
- `UserController.createUser()` 메서드 실행
- `CreateUserCommand` 검증 과정 확인
- `UserApplicationService.createUser()` 호출
- `UserCreatedEvent` 발행 및 처리

### 2.2 사용자 조회 API 테스트

```bash
# ID로 사용자 조회 (위에서 받은 ID 사용)
curl "http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000"

# 사용자명으로 조회
curl "http://localhost:8080/api/users/username/johndoe"

# 모든 사용자 조회
curl "http://localhost:8080/api/users"
```

### 2.3 H2 데이터베이스 확인

1. H2 콘솔 접속: `http://localhost:8080/h2-console`
2. 접속 후 SQL 실행:
```sql
-- 사용자 테이블 확인
SELECT * FROM users;

-- 테이블 구조 확인
DESCRIBE users;
```

#### 🎯 실습 포인트
- `UserJpaEntity`가 어떻게 테이블로 매핑되는지 확인
- `@CreatedDate`, `@LastModifiedDate`의 자동 설정 확인
- 인덱스 생성 확인

---

## 3. 도메인 모델 실습 🏛️

### 3.1 Value Object 동작 확인

#### Email Value Object 테스트
```java
// 테스트 코드를 만들어보자
// src/test/java/com/cp9/domain/shared/vo/EmailTest.java

@Test
public void 올바른_이메일_생성() {
    // Given
    String validEmail = "test@example.com";
    
    // When
    Email email = new Email(validEmail);
    
    // Then
    assertEquals("test@example.com", email.getValue());
    assertEquals("example.com", email.getDomain());
    assertEquals("test", email.getLocalPart());
}

@Test
public void 잘못된_이메일_예외발생() {
    // Given
    String invalidEmail = "invalid-email";
    
    // When & Then
    assertThrows(IllegalArgumentException.class, 
                () -> new Email(invalidEmail));
}
```

#### 🎯 실습 과제
1. 위 테스트 코드를 작성하고 실행
2. 다양한 이메일 형식으로 테스트
3. 정규화 기능 확인 (대소문자, 공백)

### 3.2 Entity 비즈니스 로직 테스트

#### User Entity 테스트
```java
// src/test/java/com/cp9/domain/user/model/UserTest.java

@Test
public void 사용자_생성_테스트() {
    // Given
    String username = "testuser";
    Email email = new Email("test@example.com");
    String displayName = "Test User";
    
    // When
    User user = new User(username, email, displayName);
    
    // Then
    assertNotNull(user.getId());
    assertEquals(username, user.getUsername());
    assertEquals(email, user.getEmail());
    assertEquals(UserStatus.ACTIVE, user.getStatus());
    assertTrue(user.canLogin());
}

@Test
public void 사용자_비활성화_테스트() {
    // Given
    User user = createTestUser();
    
    // When
    user.deactivate();
    
    // Then
    assertEquals(UserStatus.INACTIVE, user.getStatus());
    assertFalse(user.canLogin());
}
```

#### 🎯 실습 과제
1. User의 모든 상태 변경 메서드 테스트
2. 잘못된 입력값에 대한 예외 처리 확인
3. 비즈니스 규칙 위반 시 예외 발생 확인

### 3.3 Domain Service 테스트

```java
@Test
public void 중복_사용자명_검증() {
    // Given
    String duplicateUsername = "existing";
    when(userRepository.existsByUsername(duplicateUsername))
        .thenReturn(true);
    
    // When & Then
    assertThrows(IllegalArgumentException.class,
        () -> userDomainService.validateUniqueUsername(duplicateUsername));
}
```

---

## 4. 새로운 도메인 추가 실습 🎯

### 4.1 Product 도메인 구현

#### 📝 과제: Product Value Objects 구현

```java
// Money.java - 가격 Value Object
public class Money {
    private final BigDecimal amount;
    private final Currency currency;
    
    // TODO: 구현해보기
    // 1. 생성자에서 음수 검증
    // 2. 통화별 계산 메서드
    // 3. equals/hashCode 구현
}

// ProductId.java - 상품 식별자
public class ProductId {
    private final String value;
    
    // TODO: UserId와 유사하게 구현
}

// Category.java - 카테고리 Value Object  
public class Category {
    private final String name;
    
    // TODO: 카테고리명 검증 로직 구현
}
```

#### 📝 과제: Product Entity 구현

```java
// Product.java
public class Product {
    private ProductId id;
    private String name;
    private String description;
    private Money price;
    private Category category;
    private ProductStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // TODO: 구현해보기
    // 1. 생성자에서 비즈니스 규칙 검증
    // 2. 가격 변경 메서드 (changePrice)
    // 3. 재고 관리 메서드
    // 4. 상태 변경 메서드 (activate, deactivate, discontinue)
}
```

#### 📝 과제: ProductRepository 인터페이스 구현

```java
// ProductRepository.java
public interface ProductRepository {
    Product save(Product product);
    Optional<Product> findById(ProductId id);
    List<Product> findByCategory(Category category);
    List<Product> findByStatus(ProductStatus status);
    boolean existsByName(String name);
    // TODO: 추가 메서드 정의
}
```

### 4.2 Application Layer 구현

#### 📝 과제: Product DTO 구현

```java
// CreateProductCommand.java
public class CreateProductCommand {
    @NotBlank
    private String name;
    
    @NotBlank  
    private String description;
    
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal price;
    
    @NotBlank
    private String category;
    
    // TODO: 생성자와 getter 구현
}

// ProductResponse.java
public class ProductResponse {
    // TODO: Product 엔티티를 API 응답용으로 변환
}
```

#### 📝 과제: Product Use Cases 구현

```java
// CreateProductUseCase.java
public interface CreateProductUseCase {
    ProductResponse createProduct(CreateProductCommand command);
}

// ProductApplicationService.java
@Service
@Transactional
public class ProductApplicationService implements CreateProductUseCase {
    
    // TODO: 의존성 주입 및 메서드 구현
    // 1. 상품명 중복 체크
    // 2. Product 도메인 객체 생성
    // 3. 저장 및 이벤트 발행
    // 4. Response 변환
}
```

### 4.3 Infrastructure Layer 구현

#### 📝 과제: Product JPA 구현

```java
// ProductJpaEntity.java
@Entity
@Table(name = "products")
public class ProductJpaEntity {
    
    @Id
    private String id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    // TODO: 필드 매핑 및 변환 메서드 구현
    // 1. Money를 amount, currency 필드로 분리
    // 2. Category를 String으로 매핑
    // 3. from/toDomain 메서드 구현
}

// ProductController.java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    // TODO: REST API 엔드포인트 구현
    // POST /api/products - 상품 생성
    // GET /api/products/{id} - 상품 조회
    // GET /api/products - 상품 목록
    // PUT /api/products/{id} - 상품 수정
}
```

### 4.4 테스트 및 검증

```bash
# 구현 후 테스트
curl -X POST "http://localhost:8080/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "description": "Latest iPhone model",
    "price": 999.99,
    "category": "Electronics"
  }'
```

---

## 5. 고급 패턴 실습 🚀

### 5.1 Aggregate 패턴 실습

#### 📝 과제: Order Aggregate 구현

```java
// Order.java - Aggregate Root
public class Order {
    private OrderId id;
    private UserId userId;                    // User에 대한 참조
    private List<OrderItem> items;            // Aggregate 내부 엔티티
    private OrderStatus status;
    private Money totalAmount;
    private LocalDateTime createdAt;
    
    // TODO: 구현해보기
    // 1. 주문 생성 시 최소 1개 아이템 검증
    // 2. addItem() 메서드로 아이템 추가
    // 3. calculateTotal() 메서드로 총액 계산
    // 4. confirm() 메서드로 주문 확정
    // 5. cancel() 메서드로 주문 취소
}

// OrderItem.java - Aggregate 내부 엔티티
public class OrderItem {
    private OrderItemId id;
    private ProductId productId;              // Product에 대한 참조
    private String productName;               // 스냅샷 데이터
    private Money unitPrice;                  // 주문 시점 가격
    private int quantity;
    private Money subtotal;
    
    // TODO: 구현해보기
    // 1. 생성자에서 소계 자동 계산
    // 2. 수량 변경 메서드
    // 3. 소계 재계산 로직
}
```

#### 🎯 Aggregate 설계 원칙 확인
- **일관성 경계**: Order와 OrderItem은 함께 저장/수정
- **참조 방식**: 다른 Aggregate는 ID로만 참조
- **불변식 보장**: Order 내부의 모든 비즈니스 규칙 검증

### 5.2 Event Sourcing 실습 (고급)

#### 📝 과제: 이벤트 기반 상태 관리

```java
// AggregateRoot.java - 이벤트 소싱 기반
public abstract class AggregateRoot {
    private List<DomainEvent> domainEvents = new ArrayList<>();
    private long version = 0;
    
    protected void applyEvent(DomainEvent event) {
        domainEvents.add(event);
        handle(event);
        version++;
    }
    
    protected abstract void handle(DomainEvent event);
    
    public List<DomainEvent> getUncommittedEvents() {
        return new ArrayList<>(domainEvents);
    }
    
    public void markEventsAsCommitted() {
        domainEvents.clear();
    }
}

// User를 이벤트 소싱으로 구현
public class User extends AggregateRoot {
    
    // 상태 변경을 이벤트로 처리
    public void activate() {
        if (this.status != UserStatus.DELETED) {
            applyEvent(new UserActivatedEvent(this.id));
        }
    }
    
    @Override
    protected void handle(DomainEvent event) {
        if (event instanceof UserActivatedEvent) {
            this.status = UserStatus.ACTIVE;
            this.updatedAt = LocalDateTime.now();
        }
        // 다른 이벤트 처리...
    }
}
```

### 5.3 CQRS 패턴 심화 실습

#### 📝 과제: Read Model 분리

```java
// UserReadModel.java - 조회 최적화 모델
@Entity
@Table(name = "user_read_model")
public class UserReadModel {
    @Id
    private String id;
    private String username;
    private String email;
    private String displayName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private int loginCount;              // 집계 데이터
    
    // TODO: 조회에 최적화된 구조 설계
}

// UserQueryService.java - 조회 전용 서비스
@Service
@Transactional(readOnly = true)
public class UserQueryService {
    
    // TODO: 복잡한 조회 쿼리 구현
    // 1. 통계 정보 포함 조회
    // 2. 페이징 처리
    // 3. 검색 및 필터링
    public Page<UserSummary> searchUsers(UserSearchCriteria criteria, Pageable pageable) {
        // 구현...
    }
}
```

---

## 6. 트러블슈팅 가이드 🔧

### 6.1 자주 발생하는 오류들

#### 오류 1: H2 콘솔 접속 불가
```
증상: H2 콘솔 페이지가 로드되지 않음
원인: 개발 프로파일이 활성화되지 않음

해결책:
1. application-dev.yml의 h2.console.enabled 확인
2. 프로파일 활성화: --spring.profiles.active=dev
3. SecurityConfig에서 H2 콘솔 경로 허용 확인
```

#### 오류 2: 도메인 이벤트가 처리되지 않음
```
증상: UserCreatedEvent가 발생하지만 핸들러가 실행되지 않음
원인: 이벤트 발행과 처리가 같은 트랜잭션 내에서 실행

해결책:
1. @Async 어노테이션 추가
2. @EnableAsync 설정 확인
3. @TransactionalEventListener 사용 고려
```

#### 오류 3: JPA 연관관계 매핑 오류
```
증상: LazyInitializationException 발생
원인: 트랜잭션 외부에서 지연 로딩 시도

해결책:
1. @Transactional(readOnly = true) 추가
2. 필요한 연관관계를 명시적으로 fetch
3. DTO 변환을 트랜잭션 내부에서 수행
```

### 6.2 성능 최적화 팁

#### 1. N+1 쿼리 문제 해결
```java
// 문제 코드
List<User> users = userRepository.findAll();
users.forEach(user -> {
    // 각 사용자마다 추가 쿼리 발생
    user.getOrders().size();
});

// 해결책: Join Fetch 사용
@Query("SELECT u FROM UserJpaEntity u LEFT JOIN FETCH u.orders")
List<UserJpaEntity> findAllWithOrders();
```

#### 2. 캐시 활용
```java
@Cacheable("users")
public Optional<UserResponse> getUserById(String userId) {
    // 자주 조회되는 데이터는 캐시 적용
}
```

### 6.3 테스트 실행 가이드

#### 단위 테스트 실행
```bash
# 전체 테스트 실행
./gradlew test

# 특정 클래스 테스트
./gradlew test --tests UserTest

# 특정 메서드 테스트  
./gradlew test --tests UserTest.사용자_생성_테스트
```

#### 통합 테스트 작성
```java
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class UserIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void 사용자_생성_API_테스트() {
        // Given
        CreateUserCommand command = new CreateUserCommand(
            "testuser", "test@example.com", "Test User"
        );
        
        // When
        ResponseEntity<UserResponse> response = restTemplate
            .postForEntity("/api/users", command, UserResponse.class);
        
        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody().getId());
    }
}
```

---

## 🎯 실습 체크리스트

### ✅ 기본 실습 완료 목표
- [ ] 개발환경으로 애플리케이션 실행 성공
- [ ] H2 콘솔에서 사용자 데이터 확인
- [ ] Swagger UI에서 API 테스트 성공
- [ ] curl로 사용자 CRUD 기능 테스트
- [ ] 도메인 이벤트 로그 확인

### ✅ 중급 실습 완료 목표
- [ ] User 도메인 테스트 코드 작성 및 실행
- [ ] Product 도메인 추가 구현 완료
- [ ] Product API 테스트 성공
- [ ] 도메인 서비스 테스트 작성

### ✅ 고급 실습 완료 목표  
- [ ] Order Aggregate 구현 완료
- [ ] Event Sourcing 패턴 적용
- [ ] CQRS Read Model 구현
- [ ] 통합 테스트 작성 및 실행

---

## 💡 다음 단계 학습 가이드

### 🎯 실무 적용을 위한 추가 학습
1. **마이크로서비스 분리**: 도메인별 독립 서비스 구성
2. **API Gateway**: 서비스 간 통신 관리
3. **분산 트랜잭션**: Saga 패턴 구현
4. **이벤트 스트리밍**: Kafka를 활용한 이벤트 처리
5. **CQRS + Event Sourcing**: 완전한 이벤트 기반 시스템

### 📚 추천 추가 실습 프로젝트
1. **전자상거래**: Order, Product, Payment, Inventory 도메인
2. **SNS 플랫폼**: User, Post, Comment, Like, Follow 도메인  
3. **예약 시스템**: Booking, Resource, Schedule, Payment 도메인

🎉 **행복한 실습되세요!** 이 튜토리얼을 통해 DDD의 실제 구현을 체험하고 마스터하시기 바랍니다!