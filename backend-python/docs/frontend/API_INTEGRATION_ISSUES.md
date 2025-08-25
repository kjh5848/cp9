# 프론트엔드-백엔드 API 통합 문제점 및 해결 방안

## 🚨 발견된 문제점

### 1. 존재하지 않는 엔드포인트 호출
**문제**: 프론트엔드가 존재하지 않는 `/api/v1/research/sessions` 엔드포인트를 호출
**에러**: `404 Not Found`

**현재 프론트엔드 요청**:
```
GET /api/v1/research/sessions?page=1&limit=10&sort=created_at&order=desc
```

**해결 방안**:
- 이 엔드포인트는 존재하지 않음
- 대신 사용 가능한 엔드포인트: `GET /api/v1/research/jobs`

### 2. 요청 데이터 형식 불일치
**문제**: 프론트엔드가 잘못된 필드명으로 데이터 전송
**에러**: `Field required: items`

**현재 프론트엔드 요청**:
```json
{
  "session_id": "research-5",
  "product_ids": []
}
```

**올바른 요청 형식**:
```json
{
  "items": [
    {
      "product_name": "제품명",
      "category": "카테고리",
      "price_exact": 1000,
      "currency": "KRW",
      "seller_or_store": "판매자"
    }
  ],
  "priority": 5
}
```

## 🔧 수정 사항

### 프론트엔드에서 수정해야 할 사항

#### 1. API 엔드포인트 수정
```typescript
// 잘못된 방식
const response = await fetch('/api/v1/research/sessions');

// 올바른 방식  
const response = await fetch('/api/v1/research/jobs');
```

#### 2. 요청 데이터 구조 수정
```typescript
// 잘못된 방식
const requestData = {
  session_id: "research-5",
  product_ids: []
};

// 올바른 방식
const requestData = {
  items: [
    {
      product_name: "곰곰 무항생제 신선한 대란",
      category: "로켓프레시", 
      price_exact: 8490,
      currency: "KRW",
      seller_or_store: "쿠팡",
      // 추가 쿠팡 필드들
      product_id: 1271064981,
      product_url: "https://link.coupang.com/...",
      product_image: "https://thumbnail13.coupangcdn.com/...",
      is_rocket: true,
      is_free_shipping: false,
      category_name: "로켓프레시"
    }
  ],
  priority: 5
};
```

#### 3. 올바른 API 엔드포인트 사용
```typescript
// 제품 리서치 요청
POST /api/v1/research/products

// 작업 목록 조회
GET /api/v1/research/jobs

// 특정 작업 결과 조회
GET /api/v1/research/products/{job_id}

// 작업 상태 확인
GET /api/v1/research/products/{job_id}/status
```

## 📋 백엔드 API 스펙 요약

### 제품 리서치 API (`/research/products`)
- **생성**: `POST /api/v1/research/products`
- **조회**: `GET /api/v1/research/products/{job_id}`
- **상태**: `GET /api/v1/research/products/{job_id}/status`
- **취소**: `DELETE /api/v1/research/products/{job_id}`

### 작업 관리 API (`/research/jobs`)  
- **목록**: `GET /api/v1/research/jobs`
- **조회**: `GET /api/v1/research/jobs/{job_id}`
- **시작**: `POST /api/v1/research/jobs/{job_id}/start`
- **수정**: `PUT /api/v1/research/jobs/{job_id}`

### 태스크 상태 API
- **상태 조회**: `GET /api/v1/research/tasks/{task_id}/status`

## 🔍 필수 필드 검증

### ProductItemRequest 필수 필드:
- `product_name` (string): 제품명 
- `category` (string): 카테고리
- `price_exact` (float): 정확한 가격
- `currency` (string): 통화 단위 (기본값: "KRW")

### 선택적 필드:
- `seller_or_store`: 판매자/스토어명
- `product_id`: 쿠팡 제품 ID
- `product_url`: 제품 URL
- `product_image`: 제품 이미지 URL
- `is_rocket`: 로켓배송 여부
- `is_free_shipping`: 무료배송 여부
- `metadata`: 추가 메타데이터

## 🚀 권장 수정 순서

1. **즉시 수정**: API 엔드포인트 URL 변경
2. **중요**: 요청 데이터 구조를 올바른 형식으로 변경  
3. **선택적**: 응답 데이터 처리 로직 업데이트
4. **테스트**: 수정된 API 호출 테스트

이 수정사항들을 적용하면 프론트엔드와 백엔드 간의 API 통합이 정상적으로 작동할 것입니다.