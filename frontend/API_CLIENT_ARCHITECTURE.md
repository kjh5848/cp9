# 🏗️ CP9 Frontend - 통합 API 클라이언트 아키텍처 설계

## 📊 현재 API 사용 현황 분석

### 🔍 발견된 API들
1. **Products API** (쿠팡 상품 관련)
   - `/api/products/search` - 키워드 검색
   - `/api/products/bestcategories` - 카테고리별 베스트 상품
   - `/api/products/deeplink` - 딥링크 변환

2. **Research API** (리서치 시스템)
   - `/api/v1/research/products` ✅ (실제 백엔드 API - 쿠팡 즉시 리턴 지원)
   - `/api/research/sessions` - 세션 목록/생성 (레거시)
   - `/api/research/sessions/{id}` - 특정 세션 조회 (레거시)
   - `/api/research/results` - 리서치 결과 조회 (레거시)

3. **LangGraph API** (AI 워크플로우)
   - `/api/langgraph/seo-generation` - SEO 글 생성
   - `/api/workflow` - 워크플로우 실행
   - `/api/workflow/stream` - 스트리밍 워크플로우

4. **External API** (백엔드 연동)
   - Backend Python API: `http://localhost:8000/api/v1/`
   - Supabase Edge Functions
   - WordPress API
   - Perplexity API

5. **Test APIs** (테스트용)
   - `/api/test-perplexity`
   - `/api/crawler-test`
   - `/api/test/` (여러 테스트 엔드포인트)

## 🎯 통합 API 클라이언트 설계

### 📁 제안하는 디렉토리 구조
```
src/infrastructure/api/
├── core/                          # 핵심 API 인프라
│   ├── BaseApiClient.ts          # 기본 API 클라이언트 클래스
│   ├── ApiResponse.ts            # 공통 응답 타입
│   ├── ApiError.ts               # 통합 에러 클래스
│   ├── interceptors.ts           # 요청/응답 인터셉터
│   └── config.ts                 # API 설정 관리
├── clients/                      # 도메인별 API 클라이언트
│   ├── ProductApiClient.ts       # 상품 관련 API
│   ├── ResearchApiClient.ts      # 리서치 시스템 API
│   ├── LangGraphApiClient.ts     # AI 워크플로우 API
│   ├── ExternalApiClient.ts      # 외부 API 연동
│   └── TestApiClient.ts          # 테스트 API
├── types/                        # API 관련 타입 정의
│   ├── common.ts                 # 공통 타입
│   ├── product.ts                # 상품 API 타입
│   ├── research.ts               # 리서치 API 타입
│   ├── langgraph.ts              # LangGraph API 타입
│   └── external.ts               # 외부 API 타입
├── utils/                        # API 유틸리티
│   ├── urlBuilder.ts             # URL 빌더
│   ├── requestUtils.ts           # 요청 유틸리티
│   └── responseUtils.ts          # 응답 처리 유틸리티
└── index.ts                      # 통합 export
```

## 🔧 핵심 클래스 설계

### 1. BaseApiClient (기본 클래스)
```typescript
abstract class BaseApiClient {
  protected baseUrl: string
  protected defaultHeaders: Headers
  
  // 기본 HTTP 메서드
  protected async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>>
  protected async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
  protected async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>>
  
  // 에러 처리
  protected handleError(error: any): ApiError
  protected validateResponse<T>(response: Response): Promise<ApiResponse<T>>
}
```

### 2. ProductApiClient (상품 API)
```typescript
class ProductApiClient extends BaseApiClient {
  // 키워드 검색
  async searchByKeyword(params: KeywordSearchParams): Promise<ProductSearchResponse>
  
  // 카테고리 검색
  async searchByCategory(params: CategorySearchParams): Promise<CategorySearchResponse>
  
  // 딥링크 변환
  async convertDeeplinks(urls: string[]): Promise<DeeplinkResponse>
  
  // 베스트 카테고리 조회
  async getBestCategories(categoryId: string, limit?: number): Promise<BestCategoryResponse>
}
```

### 3. ResearchApiClient (리서치 API)
```typescript
class ResearchApiClient extends BaseApiClient {
  // 쿠팡 즉시 리턴 리서치 생성 (수정된 엔드포인트)
  async createResearchWithCoupangPreview(items: ProductItemRequest[]): Promise<ResearchCreateResponse>
  
  // 일반 리서치 생성
  async createResearch(params: ResearchCreateParams): Promise<ResearchCreateResponse>
  
  // 리서치 세션 목록 조회
  async getResearchSessions(params: SessionListParams): Promise<SessionListResponse>
  
  // 특정 리서치 세션 조회
  async getResearchSession(sessionId: string): Promise<SessionDetailResponse>
  
  // 리서치 결과 조회
  async getResearchResults(jobId: string): Promise<ResearchResultsResponse>
  
  // 리서치 상태 조회
  async getResearchStatus(jobId: string): Promise<ResearchStatusResponse>
  
  // 리서치 취소
  async cancelResearch(jobId: string): Promise<void>
}
```

### 4. LangGraphApiClient (AI 워크플로우)
```typescript
class LangGraphApiClient extends BaseApiClient {
  // SEO 글 생성
  async generateSEO(params: SEOGenerationParams): Promise<SEOGenerationResponse>
  
  // 워크플로우 실행
  async runWorkflow(params: WorkflowParams): Promise<WorkflowResponse>
  
  // 스트리밍 워크플로우
  async runStreamingWorkflow(params: WorkflowParams): Promise<ReadableStream>
  
  // Perplexity 테스트
  async testPerplexity(query: string): Promise<PerplexityResponse>
}
```

### 5. ExternalApiClient (외부 API)
```typescript
class ExternalApiClient extends BaseApiClient {
  // 백엔드 Python API 직접 호출
  async callBackendAPI<T>(endpoint: string, method: string, data?: any): Promise<T>
  
  // Supabase Edge Function 호출
  async callEdgeFunction(functionName: string, params: any): Promise<any>
  
  // WordPress API 연동
  async wordpressOperation(operation: WordPressOperation): Promise<any>
  
  // Perplexity API 직접 호출
  async queryPerplexity(params: PerplexityParams): Promise<PerplexityResponse>
}
```

## 🛡️ 에러 처리 시스템

### ApiError 클래스 계층
```typescript
class ApiError extends Error {
  code: string
  statusCode: number
  details?: any
}

class NetworkError extends ApiError {}
class ValidationError extends ApiError {}
class ServerError extends ApiError {}
class AuthenticationError extends ApiError {}
class RateLimitError extends ApiError {}
```

## 🔧 인터셉터 시스템

### Request Interceptor
- 자동 인증 토큰 추가
- 공통 헤더 설정
- 요청 로깅
- Rate Limiting

### Response Interceptor
- 자동 에러 처리
- 응답 로깅
- 토큰 갱신
- 캐시 처리

## 📊 설정 관리

### ApiConfig 클래스
```typescript
class ApiConfig {
  static getBaseUrl(service: 'internal' | 'backend' | 'supabase'): string
  static getHeaders(service: string): Headers
  static getTimeout(service: string): number
  static getRetryConfig(service: string): RetryConfig
}
```

## 🎨 사용 예시

### Before (현재)
```typescript
// 이전 방식 (레거시 - 500 에러 발생)
const response = await fetch('/api/research/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

if (!response.ok) {
  // 개별적인 에러 처리
  throw new Error('API call failed');
}

const result = await response.json();
```

### After (개선 후)
```typescript
import { apiClients } from '@/infrastructure/api';

try {
  // 타입 안전하고 간결한 API 호출
  const result = await apiClients.research.createResearchWithCoupangPreview(items);
  console.log('Research created:', result);
} catch (error) {
  // 통합된 에러 처리
  if (error instanceof NetworkError) {
    // 네트워크 에러 처리
  } else if (error instanceof ValidationError) {
    // 유효성 검사 에러 처리
  }
}
```

## 🚀 예상 효과

### 📈 개발 생산성
- API 호출 코드 70% 감소
- 타입 안전성으로 런타임 에러 90% 감소
- 통합된 에러 처리로 디버깅 시간 50% 단축

### 🛡️ 코드 품질
- 단일 책임 원칙 준수
- DRY 원칙 적용 (중복 코드 제거)
- 일관된 API 호출 패턴

### 🔧 유지보수성
- API 변경 시 클라이언트 한 곳만 수정
- 환경별 설정 자동 관리
- 통합된 로깅 및 모니터링

## 📝 마이그레이션 계획

### 1단계: 핵심 인프라 구축
- BaseApiClient 클래스 생성
- 공통 타입 및 에러 클래스 정의
- ApiConfig 설정 시스템 구축

### 2단계: 우선순위별 클라이언트 생성
1. **ResearchApiClient** (현재 500 오류 해결)
2. **ProductApiClient** (가장 많이 사용됨)
3. **LangGraphApiClient** (SEO 기능 핵심)
4. **ExternalApiClient** (백엔드 연동)

### 3단계: 기존 코드 마이그레이션
- 각 hook에서 직접 fetch 호출을 API 클라이언트로 교체
- 에러 처리 로직 통일
- 테스트 코드 업데이트

### 4단계: 최적화 및 고도화
- 캐싱 시스템 추가
- Request/Response 인터셉터 고도화
- 성능 모니터링 추가

## ⏰ 예상 작업 시간
- **1단계**: 1-2시간 (핵심 인프라)
- **2단계**: 3-4시간 (클라이언트 생성)
- **3단계**: 2-3시간 (마이그레이션)
- **4단계**: 1-2시간 (최적화)
- **총 예상 시간**: 7-11시간

## 🎯 해결 완료된 문제들 ✅
1. **useProductActions.ts:248** - `/api/research/create` → `apiClients.research.createResearchWithCoupangPreview()` 수정 완료 ✅
2. **ResearchApiClient 생성** - 백엔드 API 직접 호출로 500 오류 해결 완료 ✅  
3. **타입 안전성 확보** - 모든 API 클라이언트에 TypeScript 타입 적용 완료 ✅
4. **통합 API 클라이언트** - BaseApiClient, 에러 처리, 설정 관리 완료 ✅
5. **레거시 코드 정리** - 더 이상 사용되지 않는 엔드포인트 deprecated 처리 완료 ✅