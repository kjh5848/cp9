# cache-gateway Edge Function

## 개요
Redis를 활용한 캐싱 시스템 및 요청 최적화를 담당하는 게이트웨이 함수입니다.

**주요 기능:**
- Redis 기반 데이터 캐싱 및 조회
- API 응답 캐싱으로 성능 최적화
- TTL(Time To Live) 기반 자동 만료 관리
- 캐시 무효화 및 강제 갱신
- 통계 및 모니터링 데이터 제공

## API 명세

**엔드포인트:** `POST /functions/v1/cache-gateway`

### 요청 형식

#### 캐시 조회
```json
{
  "action": "get",
  "key": "product:123",
  "namespace": "products"
}
```

#### 캐시 저장
```json
{
  "action": "set",
  "key": "product:123",
  "value": {
    "productName": "상품명",
    "productPrice": 29900
  },
  "ttl": 3600,
  "namespace": "products"
}
```

#### 캐시 삭제
```json
{
  "action": "delete",
  "key": "product:123",
  "namespace": "products"
}
```

#### 캐시 통계 조회
```json
{
  "action": "stats",
  "namespace": "products"
}
```

### 응답 형식

#### 캐시 조회 응답
```json
{
  "success": true,
  "data": {
    "hit": true,
    "value": {
      "productName": "상품명",
      "productPrice": 29900
    },
    "ttl": 2847,
    "cached_at": "2024-01-15T10:30:00Z"
  }
}
```

#### 캐시 저장 응답
```json
{
  "success": true,
  "data": {
    "cached": true,
    "key": "products:product:123",
    "ttl": 3600
  }
}
```

#### 통계 응답
```json
{
  "success": true,
  "data": {
    "namespace": "products",
    "keys_count": 45,
    "hit_rate": 0.89,
    "total_requests": 1250,
    "cache_hits": 1112,
    "cache_misses": 138
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "error_message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

## 사용법

### cURL 예제
```bash
# 캐시 조회
curl -X POST http://localhost:54321/functions/v1/cache-gateway \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "action": "get",
    "key": "product:123",
    "namespace": "products"
  }'

# 캐시 저장
curl -X POST http://localhost:54321/functions/v1/cache-gateway \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "action": "set",
    "key": "product:123",
    "value": {"name": "상품", "price": 29900},
    "ttl": 3600,
    "namespace": "products"
  }'
```

### JavaScript/TypeScript 예제
```typescript
// 캐시에서 데이터 조회
const { data: cacheData, error } = await supabase.functions.invoke('cache-gateway', {
  body: {
    action: 'get',
    key: 'product:123',
    namespace: 'products'
  }
});

if (cacheData?.data?.hit) {
  console.log('캐시 히트:', cacheData.data.value);
} else {
  console.log('캐시 미스 - 새로운 데이터 필요');
}

// 캐시에 데이터 저장
const { data: saveResult } = await supabase.functions.invoke('cache-gateway', {
  body: {
    action: 'set',
    key: 'product:123',
    value: productData,
    ttl: 3600, // 1시간
    namespace: 'products'
  }
});
```

## 필수 환경 변수

```bash
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password (선택사항)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 구현 세부사항

### 주요 프로세스
1. **요청 검증**: action, key 필수 필드 확인
2. **Redis 연결**: 공유 Redis 클라이언트 활용
3. **네임스페이스 처리**: `namespace:key` 형태로 키 생성
4. **작업 실행**: get/set/delete/stats 작업 수행
5. **응답 표준화**: 통일된 응답 형식으로 반환

### 지원되는 액션

#### GET 액션
```typescript
// 캐시에서 값을 조회하고 TTL 정보 포함
const result = await redis.get(cacheKey);
const ttl = await redis.ttl(cacheKey);
```

#### SET 액션
```typescript
// TTL과 함께 값을 저장
if (ttl > 0) {
  await redis.setex(cacheKey, ttl, JSON.stringify(value));
} else {
  await redis.set(cacheKey, JSON.stringify(value));
}
```

#### DELETE 액션
```typescript
// 특정 키를 삭제
const deleted = await redis.del(cacheKey);
```

#### STATS 액션
```typescript
// 네임스페이스별 통계 조회
const keys = await redis.keys(`${namespace}:*`);
// 히트율, 요청 수 등 통계 계산
```

### 캐시 키 생성 규칙
```typescript
// 네임스페이스를 포함한 키 생성
const cacheKey = generateCacheKey(namespace, key);
// 결과: "products:product:123"

// 공통 네임스페이스
const namespaces = {
  products: 'products',
  research: 'research',
  drafts: 'drafts',
  workflows: 'workflows'
};
```

### TTL 기본값
```typescript
const DEFAULT_TTL = {
  products: 3600,    // 1시간
  research: 7200,    // 2시간
  drafts: 1800,      // 30분
  workflows: 900     // 15분
};
```

## 테스트 방법

### 로컬 테스트
```bash
# Redis 서버 시작 (Docker 사용 권장)
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Supabase 로컬 서비스 시작
supabase start

# 함수 서빙
supabase functions serve cache-gateway --env-file .env.local

# 캐시 저장 테스트
curl -X POST http://localhost:54321/functions/v1/cache-gateway \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "key": "test:001",
    "value": {"test": true},
    "ttl": 60,
    "namespace": "test"
  }'

# 캐시 조회 테스트
curl -X POST http://localhost:54321/functions/v1/cache-gateway \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get",
    "key": "test:001",
    "namespace": "test"
  }'
```

### 프로덕션 테스트
```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/cache-gateway \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "action": "get",
    "key": "product:real_001",
    "namespace": "products"
  }'
```

## 문제 해결

### 일반적인 오류

**`Redis connection failed`**
```bash
# 해결: Redis 서버 상태 확인
docker ps | grep redis
redis-cli ping

# Redis URL 확인
supabase secrets list | grep REDIS
```

**`action and key are required`**
```bash
# 해결: 필수 필드 포함하여 요청
curl -d '{
  "action": "get",
  "key": "your-key",
  "namespace": "your-namespace"
}'
```

**`Invalid action`**
- 지원하는 액션: get, set, delete, stats
- 대소문자 정확히 입력 필요

**`JSON parsing error`**
- value 필드가 유효한 JSON 형태인지 확인
- 복잡한 객체는 문자열로 직렬화 후 저장

**`TTL must be positive integer`**
- TTL은 양의 정수만 허용
- 0 또는 음수 입력시 TTL 없이 저장

### 디버깅 방법

**로그 확인:**
```bash
supabase functions logs cache-gateway --tail
```

**Redis 직접 확인:**
```bash
# Redis CLI 접속
redis-cli

# 모든 키 조회
KEYS *

# 특정 키 값 확인
GET products:product:123

# 키의 TTL 확인
TTL products:product:123

# 네임스페이스별 키 조회
KEYS products:*
```

**캐시 통계 모니터링:**
```bash
# 통계 API로 캐시 상태 확인
curl -X POST http://localhost:54321/functions/v1/cache-gateway \
  -d '{"action": "stats", "namespace": "products"}'
```

## 성능 고려사항

- **응답 시간**: 캐시 히트시 < 10ms, 캐시 미스시 원본 API 호출 시간
- **메모리 사용량**: Redis 인스턴스 메모리 제한 고려
- **네트워크 지연**: Redis 서버와의 네트워크 지연 최소화
- **TTL 전략**: 데이터 특성에 따른 적절한 만료 시간 설정
- **키 관리**: 네임스페이스를 활용한 체계적 키 관리
- **모니터링**: 히트율 추적을 통한 캐시 효율성 모니터링