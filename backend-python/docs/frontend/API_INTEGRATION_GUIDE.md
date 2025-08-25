# 🚀 Product Research API 통합 가이드

Perplexity AI 기반 제품 리서치 API의 로직과 에러 처리에 대한 기술 가이드입니다.

## 🎯 API 기본 정보

- **Base URL**: `http://localhost:8000/api/v1`
- **Content-Type**: `application/json`
- **인증**: 현재 불필요 (프로덕션에서는 API 키 추가 예정)
- **API 문서**: 
  - **Swagger UI**: http://localhost:8000/docs
  - **ReDoc**: http://localhost:8000/redoc

## 📋 핵심 워크플로우

### 1. 일반 리서치 워크플로우

```javascript
// 1. 제품 리서치 요청
const response = await fetch('/api/v1/research/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{
      product_name: "베이직스 2024 베이직북 14",
      category: "가전디지털",
      price_exact: 388000
    }]
  })
});

const { job_id } = await response.json();

// 2. 상태 확인 (폴링)
const checkStatus = async () => {
  const status = await fetch(`/api/v1/research/products/${job_id}/status`);
  return status.json();
};

// 3. 결과 조회
const getResults = async () => {
  const results = await fetch(`/api/v1/research/products/${job_id}`);
  return results.json();
};
```

### 2. 쿠팡 즉시 리턴 워크플로우

```javascript
// 쿠팡 제품 정보와 함께 즉시 결과 받기
const response = await fetch('/api/v1/research/products?return_coupang_preview=true', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{
      product_name: "삼성전자 갤럭시 버드3 프로",
      category: "이어폰/헤드폰",
      price_exact: 189000,
      product_id: 7582946,
      product_url: "https://www.coupang.com/vp/products/7582946",
      product_image: "https://thumbnail10.coupangcdn.com/...",
      is_rocket: true,
      is_free_shipping: true,
      category_name: "이어폰/헤드폰",
      seller_or_store: "쿠팡"
    }]
  })
});

const { job_id, results } = await response.json();
// results에 즉시 쿠팡 정보 포함됨
// 백그라운드에서 전체 리서치 계속 진행됨
```

## 📋 TypeScript 타입 정의

### 요청 타입

```typescript
interface ProductItemRequest {
  // 기본 필수 필드
  product_name: string;           // 1-500자, 필수
  category: string;              // 1-100자, 필수
  price_exact: number;           // 양수, 필수
  currency?: string;             // 기본값: "KRW"
  seller_or_store?: string;      // 최대 200자
  
  // 쿠팡 API 필드들
  product_id?: number;           // productId
  product_image?: string;        // productImage
  product_url?: string;          // productUrl
  is_rocket?: boolean;           // isRocket
  is_free_shipping?: boolean;    // isFreeShipping
  category_name?: string;        // categoryName
  
  // 키워드 검색 필드
  keyword?: string;              // keyword
  rank?: number;                 // rank
  
  metadata?: Record<string, any>; // 추가 메타데이터
}

interface ProductResearchRequest {
  items: ProductItemRequest[];   // 최대 10개
  priority?: number;             // 1-10 (높을수록 우선순위 높음)
}
```

### 응답 타입

```typescript
// 작업 생성 응답
interface ProductResearchResponse {
  job_id: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  results?: ResearchResultItem[]; // 쿠팡 즉시 리턴 시에만
  message?: string;
}

// 작업 상태 응답
interface JobStatusResponse {
  job_id: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  total_items: number;
  successful_items: number;
  failed_items: number;
  success_rate: number;
  processing_time_ms?: number;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

// 리서치 결과
interface ResearchResultItem {
  item_hash: string;
  status: "success" | "failed";
  
  // 성공 시 데이터
  research_data?: {
    summary: string;
    rating: number;
    review_count: number;
    pros: string[];
    cons: string[];
    price_analysis: {
      current_price: number;
      is_reasonable: boolean;
      price_trend: string;
      alternatives?: Array<{
        name: string;
        price: number;
        url?: string;
      }>;
    };
    specifications?: Record<string, any>;
    recommendations?: string;
    sources?: string[];
  };
  
  // 쿠팡 데이터 (있는 경우)
  coupang_data?: {
    product_id: number;
    product_url: string;
    product_image?: string;
    is_rocket: boolean;
    is_free_shipping: boolean;
    category_name: string;
  };
  
  // 실패 시 에러 정보
  error?: {
    error_code: string;
    message: string;
    details?: string;
  };
  
  created_at: string;
  processing_time_ms?: number;
}
```

## 🔌 API 엔드포인트 상세

### 1. POST /api/v1/research/products

제품 리서치 작업을 생성합니다.

#### 요청 파라미터
- `return_coupang_preview`: (선택) 쿠팡 데이터 즉시 리턴 여부

#### 응답 케이스

**성공 (201)**
```json
{
  "job_id": "uuid-string",
  "status": "pending",
  "message": "Research job created successfully"
}
```

**쿠팡 즉시 리턴 성공 (201)**
```json
{
  "job_id": "uuid-string", 
  "status": "pending",
  "results": [/* 쿠팡 데이터 포함 결과들 */],
  "message": "Job created with Coupang preview data"
}
```

### 2. GET /api/v1/research/products/{job_id}/status

작업 진행 상태를 확인합니다.

```json
{
  "job_id": "uuid-string",
  "status": "in_progress",
  "total_items": 3,
  "successful_items": 1,
  "failed_items": 0,
  "success_rate": 33.33,
  "processing_time_ms": 15000,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:15Z",
  "started_at": "2024-01-01T00:00:01Z"
}
```

### 3. GET /api/v1/research/products/{job_id}

완료된 리서치 결과를 조회합니다.

```json
{
  "job_id": "uuid-string",
  "status": "completed",
  "results": [
    {
      "item_hash": "hash-string",
      "status": "success",
      "research_data": {
        "summary": "상품 요약...",
        "rating": 4.5,
        "review_count": 1234,
        "pros": ["장점1", "장점2"],
        "cons": ["단점1"],
        "price_analysis": {
          "current_price": 388000,
          "is_reasonable": true,
          "price_trend": "stable"
        }
      },
      "coupang_data": {
        "product_id": 7582946,
        "product_url": "https://www.coupang.com/...",
        "is_rocket": true
      }
    }
  ]
}
```

### 4. DELETE /api/v1/research/products/{job_id}

진행 중인 작업을 취소합니다.

## ❌ 에러 처리 가이드

> 📚 **상세한 에러 처리 가이드**: [SHARED_ERROR_HANDLING_GUIDE.md](../SHARED_ERROR_HANDLING_GUIDE.md)  
> 모든 백엔드 서비스의 공통 에러 처리 패턴과 상세한 구현 방법을 확인하세요.

### 🎯 표준 에러 응답 구조

모든 API 에러는 일관된 구조로 반환됩니다:

```typescript
interface StandardError {
  error_code: string;           // 표준화된 에러 코드
  message: string;              // 사용자 친화적 메시지
  details?: string;             // 기술적 상세 정보
  severity: "low" | "medium" | "high" | "critical";
  recommended_action: "retry" | "retry_later" | "check_input" | "contact_support" | "no_action";
  retry_after?: number;         // 재시도 권장 시간 (초)
  metadata?: Record<string, any>; // 추가 컨텍스트 데이터
  request_id?: string;          // 요청 추적 ID
  timestamp: string;            // 에러 발생 시간
}
```

### Product Research 전용 에러 코드

```typescript
type ProductResearchErrorCode = 
  | 'VALIDATION_ERROR'          // 입력 검증 실패 (422)
  | 'BATCH_SIZE_EXCEEDED'       // 배치 크기 초과 (400)
  | 'JOB_NOT_FOUND'            // 작업 없음 (404)
  | 'JOB_CANNOT_BE_CANCELLED'  // 취소 불가 (400)
  | 'RATE_LIMIT_EXCEEDED'      // 요청 한도 초과 (429)
  | 'PERPLEXITY_API_ERROR'     // AI 서비스 오류 (503)
  | 'PERPLEXITY_API_TIMEOUT'   // AI 서비스 시간초과 (503)
  | 'COUPANG_DATA_UNAVAILABLE' // 쿠팡 데이터 없음 (200)
  | 'COUPANG_PARTIAL_DATA'     // 쿠팡 부분 데이터 (200)
  | 'INTERNAL_SERVER_ERROR';   // 내부 서버 오류 (500)
```

### 에러 처리 로직 예시

```typescript
const handleAPIResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    
    switch (errorData.error_code) {
      case 'BATCH_SIZE_EXCEEDED':
        throw new Error('한 번에 최대 10개 제품만 리서치 가능합니다.');
        
      case 'RATE_LIMIT_EXCEEDED':
        const retryAfter = errorData.retry_after || 3600;
        throw new Error(`요청 한도 초과. ${retryAfter}초 후 재시도하세요.`);
        
      case 'PERPLEXITY_API_UNAVAILABLE':
        throw new Error('AI 리서치 서비스가 일시적으로 사용불가합니다.');
        
      case 'JOB_NOT_FOUND':
        throw new Error('요청한 작업을 찾을 수 없습니다.');
        
      default:
        throw new Error(errorData.message || '알 수 없는 오류가 발생했습니다.');
    }
  }
  
  return response.json();
};
```

### Circuit Breaker와 Rate Limiting

API는 다음과 같은 보호 메커니즘을 가지고 있습니다:

- **Rate Limiting**: 엔드포인트당 분당 100회 제한
- **Circuit Breaker**: 외부 API (Perplexity) 장애 시 자동 차단
- **Graceful Degradation**: 쿠팡 데이터 실패 시 일반 리서치로 계속 진행

## 🔄 실시간 WebSocket 업데이트

### WebSocket 연결

기존 폴링 방식을 대체하는 실시간 WebSocket 연결:

```typescript
// WebSocket 연결 생성
const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/research/${jobId}`);

ws.onopen = (event) => {
  console.log('WebSocket 연결됨');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleJobUpdate(message);
};

ws.onerror = (error) => {
  console.error('WebSocket 오류:', error);
  // 폴링으로 fallback
  startPolling(jobId);
};

ws.onclose = (event) => {
  console.log(`WebSocket 연결 종료: ${event.code} - ${event.reason}`);
};
```

### WebSocket 메시지 타입

```typescript
interface WebSocketMessage {
  type: "job_status" | "job_progress" | "job_complete" | "job_error";
  job_id: string;
  data: any;
  timestamp: string;
}

// job_status 메시지
{
  "type": "job_status",
  "job_id": "uuid-string",
  "data": {
    "status": "in_progress",
    "total_items": 3,
    "successful_items": 1,
    "failed_items": 0,
    "success_rate": 33.33,
    "processing_time_ms": 15000
  },
  "timestamp": "2024-01-01T00:00:15Z"
}

// job_progress 메시지
{
  "type": "job_progress", 
  "job_id": "uuid-string",
  "data": {
    "current_item": 2,
    "total_items": 3,
    "progress_percentage": 66.67,
    "current_item_name": "삼성 갤럭시북"
  },
  "timestamp": "2024-01-01T00:00:20Z"
}

// job_complete 메시지
{
  "type": "job_complete",
  "job_id": "uuid-string", 
  "data": {
    "status": "completed",
    "results_count": 3,
    "total_processing_time_ms": 45000
  },
  "timestamp": "2024-01-01T00:00:45Z"
}
```

### 실시간 업데이트 처리

```typescript
const handleJobUpdate = (message: WebSocketMessage) => {
  switch (message.type) {
    case 'job_status':
      updateJobStatus(message.data);
      break;
      
    case 'job_progress':
      updateProgressBar(message.data.progress_percentage);
      updateCurrentItem(message.data.current_item_name);
      break;
      
    case 'job_complete':
      showCompletionMessage();
      fetchFinalResults(message.job_id);
      ws.close();
      break;
      
    case 'job_error':
      showErrorMessage(message.data.error_message);
      ws.close();
      break;
  }
};
```

### WebSocket + Polling Fallback

```typescript
class JobStatusTracker {
  private ws: WebSocket | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  
  constructor(private jobId: string) {}
  
  start() {
    // WebSocket 연결 시도
    this.connectWebSocket();
    
    // 5초 후 WebSocket 연결 실패 시 폴링으로 fallback
    setTimeout(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.log('WebSocket 연결 실패, 폴링으로 전환');
        this.startPolling();
      }
    }, 5000);
  }
  
  private connectWebSocket() {
    this.ws = new WebSocket(`ws://localhost:8000/api/v1/ws/research/${this.jobId}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket 연결 성공');
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleUpdate(message);
    };
    
    this.ws.onerror = () => {
      console.log('WebSocket 오류, 폴링으로 전환');
      this.startPolling();
    };
    
    this.ws.onclose = (event) => {
      if (event.code !== 1000) { // 정상 종료가 아닌 경우
        console.log('WebSocket 비정상 종료, 폴링으로 전환');
        this.startPolling();
      }
    };
  }
  
  private startPolling() {
    if (this.pollingInterval) return; // 이미 폴링 중
    
    this.pollingInterval = setInterval(async () => {
      try {
        const status = await fetch(`/api/v1/research/products/${this.jobId}/status`);
        const data = await status.json();
        
        // WebSocket 메시지 형식으로 변환
        this.handleUpdate({
          type: 'job_status',
          job_id: this.jobId,
          data: data,
          timestamp: new Date().toISOString()
        });
        
        if (data.status === 'completed' || data.status === 'failed') {
          this.stop();
        }
      } catch (error) {
        console.error('폴링 중 오류:', error);
      }
    }, 2000);
  }
  
  private handleUpdate(message: WebSocketMessage) {
    // 동일한 핸들러로 WebSocket과 폴링 메시지 처리
    handleJobUpdate(message);
  }
  
  stop() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}

// 사용법
const tracker = new JobStatusTracker(jobId);
tracker.start();
```

### 상태별 폴링 로직 (Fallback)

WebSocket 연결 실패 시 사용되는 폴링 로직:

```typescript
const pollJobStatus = async (jobId: string, maxAttempts = 60) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status = await checkStatus(jobId);
      
      if (status.status === 'completed') {
        return await getResults(jobId);
      }
      
      if (status.status === 'failed') {
        throw new Error('리서치 작업이 실패했습니다.');
      }
      
      if (status.status === 'cancelled') {
        throw new Error('리서치 작업이 취소되었습니다.');
      }
      
      // 2초 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('리서치 작업 시간이 초과되었습니다.');
};
```

## 📚 관련 문서

- **[공통 에러 처리 가이드](../SHARED_ERROR_HANDLING_GUIDE.md)**: 모든 백엔드 서비스 공통 에러 처리
- **[Swagger UI](http://localhost:8000/docs)**: 대화형 API 문서
- **[ReDoc](http://localhost:8000/redoc)**: 읽기 전용 API 문서
- **[헬스 체크](http://localhost:8000/api/v1/health)**: 서비스 상태 모니터링
- **[개발 환경 설정](../CLAUDE.md)**: 프로젝트 설정 및 개발 명령어

---

*이 가이드는 Product Research API의 로직과 에러 처리에 초점을 맞춰 작성되었습니다. UI/UX 구현은 프론트엔드 팀의 디자인 시스템을 따라 자유롭게 구현하세요.*