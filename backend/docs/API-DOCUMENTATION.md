# CP9 Backend API Documentation

**CP9 Coupang Partners Auto-Blog SaaS** - Supabase Edge Functions API 문서

## 📋 목차

- [개요](#개요)
- [공통 규칙](#공통-규칙)
- [Edge Functions](#edge-functions)
- [공통 모듈](#공통-모듈)
- [타입 정의](#타입-정의)
- [에러 코드](#에러-코드)
- [환경 변수](#환경-변수)

## 🎯 개요

CP9 백엔드는 Supabase Edge Functions를 활용한 서버리스 아키텍처로 구성되어 있습니다. 각 함수는 특정 도메인을 담당하며, 공통 모듈을 통해 코드 중복을 최소화하고 일관성을 유지합니다.

### 아키텍처 특징

- **서버리스**: Supabase Edge Functions (Deno 런타임)
- **모듈화**: 공통 기능을 `_shared/` 디렉토리에 집중
- **표준화**: 일관된 에러 처리, CORS, 응답 형식
- **타입 안정성**: TypeScript 기반 타입 안전성

## 🔄 공통 규칙

### 요청/응답 형식

모든 API는 다음 형식을 따릅니다:

```typescript
// 성공 응답
{
  "success": true,
  "data": T
}

// 에러 응답  
{
  "success": false,
  "error": "error_message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### CORS 정책

- **Origin**: `*` (개발용, 운영시 도메인 제한 권장)
- **Methods**: `GET, POST, OPTIONS`
- **Headers**: `authorization, content-type, apikey`

### 인증

- Supabase JWT 토큰 기반 인증
- `Authorization: Bearer <token>` 헤더 필요
- Service Role Key는 서버 측 작업에만 사용

---

## 🚀 Edge Functions

### 1. item-research

**목적**: Perplexity API를 통한 상품 리서치 데이터 생성

**URL**: `/functions/v1/item-research`  
**Method**: `POST`

#### Request Body
```typescript
{
  itemName: string;        // 상품명
  projectId: string;       // 프로젝트 ID
  itemId: string;          // 상품 고유 ID
  productData?: {          // 선택적 상품 데이터
    productName: string;
    productPrice: number;
    productImage: string;
    productUrl: string;
    categoryName: string;
    isRocket: boolean;
    isFreeShipping: boolean;
  };
}
```

#### Response
```typescript
{
  success: true;
  data: {
    itemName: string;
    researchData: {
      overview: string;
      features: string[];
      benefits: string[];
      targetAudience: string;
      marketAnalysis: string;
      recommendations: string[];
      priceRange: string;
      popularBrands: string[];
    };
  };
}
```

#### 동작 과정
1. Perplexity API를 통한 AI 상품 분석
2. ResearchPack 데이터 구조로 변환
3. Supabase `research` 테이블에 저장
4. 한글 인코딩 및 JSON 파싱 최적화

#### 필수 환경 변수
- `PERPLEXITY_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### 2. write

**목적**: OpenAI GPT를 통한 SEO 최적화 블로그 콘텐츠 생성

**URL**: `/functions/v1/write`  
**Method**: `POST`

#### Request Body
```typescript
{
  projectId: string;           // 프로젝트 ID
  itemIds?: string[];          // 특정 아이템 ID 목록 (선택)
  promptVersion?: string;      // 프롬프트 버전 (기본: "v1")
  force?: boolean;             // 기존 초안 덮어쓰기 (기본: false)
  maxWords?: number;           // 최대 단어 수 (기본: 1100, 범위: 400-2000)
}
```

#### Response
```typescript
{
  success: true;
  data: {
    written: number;     // 생성된 초안 수
    failed: string[];    // 실패한 아이템 ID 목록
  };
}
```

#### 동작 과정
1. `research` 테이블에서 ResearchPack 데이터 로드
2. 기존 초안 존재 여부 확인 (force=false인 경우)
3. OpenAI Chat Completions API를 통한 SEO 콘텐츠 생성
4. 키워드 반복 최적화 처리
5. `drafts` 테이블에 저장

#### SEO 콘텐츠 구조
- **메타데이터**: 제목, 설명, 슬러그, 태그
- **마크다운**: 구조화된 본문 (H1 1개, H2/H3 섹션, 불릿 포인트)
- **최적화**: 키워드 밀도 조절, 읽기 쉬운 구조

#### 필수 환경 변수
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### 3. cache-gateway

**목적**: Redis 캐시 관리 및 작업 큐 연동

**URL**: `/functions/v1/cache-gateway`  
**Method**: `POST`

#### Request Body
```typescript
{
  productIds: string[];     // 상품 ID 목록
  threadId: string;         // 스레드 ID
  forceRefresh?: boolean;   // 강제 새로고침 (기본: false)
}
```

#### Response
```typescript
{
  success: true;
  data: {
    cachedData?: any[];     // 캐시된 데이터 (있는 경우)
    jobId?: string;         // 큐 작업 ID (캐시 미스시)
    message: string;        // 상태 메시지
  };
}
```

#### 동작 과정
1. 각 상품 ID에 대해 캐시 조회
2. 캐시 히트: 데이터 반환
3. 캐시 미스: 작업 큐에 추가
4. 부분 히트: 캐시된 데이터 + 큐 작업 병행

#### 필수 환경 변수
- `REDIS_URL`
- `REDIS_PASSWORD` (선택)
- `LANGGRAPH_QUEUE_NAME` (기본: "langgraph-queue")

---

### 4. queue-worker

**목적**: 백그라운드 작업 큐 처리

**URL**: `/functions/v1/queue-worker`  
**Method**: `POST`

#### Request Body (action: "process")
```typescript
{
  action: "process"
}
```

#### Request Body (action: "status")
```typescript
{
  action: "status",
  jobId: string
}
```

#### Response (process)
```typescript
{
  success: true;
  data: {
    message: string;
    jobId?: string;
  };
}
```

#### Response (status)
```typescript
{
  success: true;
  data: {
    status: {
      status: "pending" | "running" | "completed" | "failed" | "cancelled";
      updatedAt: number;
      result?: JobResult;
    };
  };
}
```

#### 지원 작업 타입
- **scrape**: 상품 데이터 스크래핑
- **seo**: SEO 콘텐츠 생성
- **publish**: WordPress 발행

#### 재시도 로직
- 최대 3회 재시도
- 지수 백오프: 1초 → 5초 → 15초
- 실패한 작업은 재시도 큐로 이동

---

### 5. langgraph-api

**목적**: LangGraph 워크플로우 실행 및 체크포인트 관리

**URL**: `/functions/v1/langgraph-api`  
**Method**: `POST`

#### Request Body (execute)
```typescript
{
  action: "execute";
  initialState: unknown;
  threadId: string;
  config?: unknown;
}
```

#### Request Body (resume)
```typescript
{
  action: "resume";
  checkpointId: string;
  threadId: string;
  config?: unknown;
}
```

#### Request Body (seo_generation)
```typescript
{
  action: "seo_generation";
  query: string;
  products: Array<{
    name: string;
    price: number;
    category: string;
    url: string;
    image?: string;
  }>;
  seo_type: "product_review" | "comparison" | "guide";
}
```

#### 주요 기능
- **워크플로우 실행**: 전체 파이프라인 실행
- **체크포인트**: 중간 상태 저장 및 복구
- **SEO 생성**: OpenAI를 통한 타입별 SEO 콘텐츠 생성
- **상태 관리**: 진행 상황 추적

#### 노드 구조
1. `extractIds`: ID 추출
2. `cacheGateway`: 캐시 확인
3. `staticCrawler`: 정적 크롤링
4. `dynCrawler`: 동적 크롤링 (필요시)
5. `fallbackLLM`: LLM 대체 (필요시)
6. `seoAgent`: SEO 에이전트
7. `wordpressPublisher`: WordPress 발행

---

### 6. hello

**목적**: API 테스트 및 헬스체크

**URL**: `/functions/v1/hello`  
**Method**: `POST`

#### Request Body
```typescript
{
  name: string;
}
```

#### Response
```typescript
{
  success: true;
  data: {
    message: string;
    timestamp: string;
  };
}
```

---

## 🔧 공통 모듈

### _shared/cors.ts
```typescript
export const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-version, content-type, accept-charset",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8",
};
```

### _shared/response.ts
```typescript
export function ok<T>(data: T, init?: ResponseInit): Response;
export function fail(message: string, code?: string, status?: number, extra?: Record<string, unknown>): Response;
```

### _shared/server.ts
```typescript
export function createEdgeFunctionHandler(
  handler: (req: Request) => Promise<Response>,
  options?: {
    allowedMethods?: string[];
    requireAuth?: boolean;
    rateLimited?: boolean;
  }
): (req: Request) => Promise<Response>;

export function safeJsonParse<T>(req: Request): Promise<T | null>;
export function validateEnvVars(required: string[]): string[];
```

### _shared/redis.ts
```typescript
export interface RedisClient {
  get(key: string): Promise<string | null>;
  setex(key: string, ttl: number, value: string): Promise<void>;
  // ... 기타 Redis 메서드
}

export function createRedisClient(): RedisClient;
export function generateCacheKey(namespace: string, id: string): string;
export function generateJobId(): string;
```

### _shared/type.ts
공통 타입 정의:
- `ApiResponse<T>`, `ApiSuccess<T>`, `ApiError`
- `ResearchPack`, `SeoDraft`
- `QueueJob`, `JobResult`
- `CheckpointData`, `GraphStatus`

---

## 🏷️ 에러 코드

### 공통 에러
- `VALIDATION_ERROR`: 요청 데이터 검증 실패
- `INVALID_JSON`: JSON 파싱 실패
- `METHOD_NOT_ALLOWED`: 허용되지 않은 HTTP 메서드
- `INTERNAL_ERROR`: 서버 내부 오류

### 기능별 에러
- `ENV_VARS_MISSING`: 필수 환경 변수 누락
- `DATABASE_ERROR`: 데이터베이스 작업 실패
- `PROJECT_ID_REQUIRED`: 프로젝트 ID 누락
- `UNAUTHORIZED`: 인증 실패
- `NO_RESEARCH_PACKS`: 리서치 데이터 없음

---

## 🌍 환경 변수

### Supabase 관련
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### AI 서비스
```bash
OPENAI_API_KEY=your-openai-api-key
PERPLEXITY_API_KEY=your-perplexity-api-key
```

### 쿠팡 API
```bash
COUPANG_ACCESS_KEY=your-access-key
COUPANG_SECRET_KEY=your-secret-key
```

### Redis & 큐
```bash
REDIS_URL=redis://your-redis-url
REDIS_PASSWORD=your-redis-password
LANGGRAPH_QUEUE_NAME=langgraph-queue
```

### WordPress (선택)
```bash
WORDPRESS_URL=https://your-site.com
WORDPRESS_USERNAME=your-username
WORDPRESS_PASSWORD=your-app-password
```

---

## 📊 성능 최적화

### 응답 시간 목표
- **단순 조회**: < 200ms
- **AI 생성**: < 30s
- **캐시 응답**: < 50ms

### 최적화 기법
- Redis 캐싱
- 비동기 작업 큐
- 체크포인트 기반 복구
- 병렬 처리
- 토큰 효율적 프롬프트

### 모니터링
- 함수별 실행 시간
- 에러율 추적
- 캐시 히트율
- 큐 처리량

---

## 🔒 보안 고려사항

### 데이터 보호
- API 키는 환경 변수로만 관리
- 사용자 입력 검증
- SQL 인젝션 방지 (Supabase ORM 사용)
- XSS 방지 (JSON 응답만 사용)

### 접근 제어
- JWT 토큰 기반 인증
- Service Role 키 보호
- CORS 정책 설정
- Rate Limiting (향후 구현)

---

## 📝 개발 가이드

### 새 함수 추가
1. `functions/new-function/` 디렉토리 생성
2. `index.ts` 파일에 핸들러 구현
3. 공통 모듈 import 및 활용
4. 타입 정의 추가 (`_shared/type.ts`)
5. 환경 변수 문서화

### 코딩 규칙
- TypeScript 엄격 모드 사용
- 공통 모듈 우선 활용
- 에러 처리 표준화
- JSDoc 주석 권장
- 테스트 가능한 구조

### 배포
```bash
# 개별 함수 배포
supabase functions deploy function-name

# 전체 함수 배포
supabase functions deploy

# 환경 변수는 Supabase Dashboard에서 설정
```

이 문서는 CP9 백엔드 API의 전체적인 이해를 돕기 위해 작성되었습니다. 각 함수의 구체적인 구현은 소스 코드를 참조하시기 바랍니다.