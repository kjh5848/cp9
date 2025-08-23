# 🔄 백엔드 API 변경 요청 문서

## 📝 개요
현재 제품 리서치 API를 프론트엔드에서 쿠팡 제품 정보와 함께 활용하기 위한 변경사항 요청서입니다.

## 🔍 현재 API 구조 분석

### 기존 요청 형식 (API_INTEGRATION_GUIDE.md 기준)
```typescript
interface ProductItemRequest {
  product_name: string;           // 1-500자, 필수
  category: string;              // 1-100자, 필수
  price_exact: number;           // 양수, 필수
  currency?: string;             // 기본값: "KRW"
  seller_or_store?: string;      // 최대 200자
  metadata?: Record<string, any>; // 추가 메타데이터
}
```

## 📋 변경 요청 사항

### 1. 쿠팡 제품 정보 필드 추가

#### A. 필수 추가 필드
```typescript
interface ProductItemRequest {
  // 기존 필드
  product_name: string;
  category: string;
  price_exact: number;
  
  // 🆕 추가 요청 필드
  coupang_product_id?: string;    // 쿠팡 제품 ID
  coupang_product_url?: string;   // 쿠팡 제품 페이지 URL
  product_image_url?: string;     // 제품 이미지 URL
  is_rocket_delivery?: boolean;   // 로켓배송 여부
  review_count?: number;          // 리뷰 개수
  rating_average?: number;        // 평균 평점 (0-5)
  
  // 기존 옵션 필드 활용
  seller_or_store: "쿠팡";        // 기본값으로 "쿠팡" 설정
  currency: "KRW";               // 기본값 유지
  metadata?: {
    // 🆕 메타데이터 구조화 요청
    source: "coupang_partners";
    original_data?: any;         // 원본 쿠팡 API 응답 보관용
    selected_at?: string;        // 선택된 시간 (ISO string)
    frontend_session_id?: string; // 프론트엔드 세션 추적용
  }
}
```

### 2. 응답 데이터 개선 요청

#### A. 제품 결과에 쿠팡 정보 포함
```typescript
interface ProductResult {
  // 기존 필드들...
  product_name: string;
  brand: string;
  category: string;
  price_exact: number;
  
  // 🆕 쿠팡 관련 응답 필드 추가 요청
  coupang_info?: {
    product_id?: string;
    product_url?: string;
    image_url?: string;
    is_rocket_delivery?: boolean;
    review_count?: number;
    rating_average?: number;
    price_comparison?: {
      coupang_current_price: number;
      price_difference: number;      // 요청가격 - 현재가격
      price_change_percent: number;  // 가격 변동률
    }
  };
  
  // 기존 필드 유지
  deeplink_or_product_url?: string; // 쿠팡 파트너스 링크 우선
  specs: ProductSpecs;
  reviews: ProductReviews;
  // ... 기타 기존 필드들
}
```

### 3. 배치 처리 개선 요청

#### A. 쿠팡 제품 그룹 처리
```typescript
interface ProductResearchRequest {
  items: ProductItemRequest[];     // 기존 유지
  priority?: number;              // 기존 유지
  callback_url?: string;          // 기존 유지
  
  // 🆕 추가 옵션 요청
  batch_options?: {
    group_by_category?: boolean;   // 카테고리별 그룹화
    enable_price_tracking?: boolean; // 가격 추적 활성화
    compare_with_competitors?: boolean; // 경쟁사 가격 비교
  };
}
```

## 🎯 사용 시나리오

### 시나리오 1: 프론트엔드에서 쿠팡 제품 선택 후 리서치
```typescript
// 프론트엔드에서 보낼 데이터
const researchRequest = {
  items: [
    {
      product_name: "삼성전자 갤럭시 버드3 프로",
      category: "이어폰/헤드폰",
      price_exact: 189000,
      coupang_product_id: "7582946",
      coupang_product_url: "https://www.coupang.com/vp/products/7582946",
      product_image_url: "https://thumbnail10.coupangcdn.com/...",
      is_rocket_delivery: true,
      review_count: 1247,
      rating_average: 4.3,
      seller_or_store: "쿠팡",
      metadata: {
        source: "coupang_partners",
        selected_at: "2024-08-23T10:30:00Z",
        frontend_session_id: "session_abc123"
      }
    }
  ],
  priority: 5,
  batch_options: {
    group_by_category: false,
    enable_price_tracking: true,
    compare_with_competitors: true
  }
};
```

### 시나리오 2: 백엔드 응답에서 쿠팡 정보 활용
```typescript
// 백엔드 응답 예시
{
  job_id: "research_456def",
  status: "success",
  results: [
    {
      product_name: "삼성전자 갤럭시 버드3 프로",
      brand: "삼성전자",
      category: "이어폰/헤드폰",
      price_exact: 189000,
      
      // 쿠팡 정보 포함
      coupang_info: {
        product_id: "7582946",
        product_url: "https://www.coupang.com/vp/products/7582946",
        image_url: "https://thumbnail10.coupangcdn.com/...",
        is_rocket_delivery: true,
        review_count: 1247,
        rating_average: 4.3,
        price_comparison: {
          coupang_current_price: 185000,
          price_difference: 4000,
          price_change_percent: 2.1
        }
      },
      
      deeplink_or_product_url: "https://link.coupang.com/a/partners_link",
      specs: { /* AI 분석된 상세 스펙 */ },
      reviews: { /* AI 분석된 리뷰 요약 */ }
    }
  ]
}
```

## 🔧 기술적 고려사항

### 1. 하위 호환성
- 기존 API 구조는 유지하고 새 필드만 추가
- 기존 클라이언트는 영향 없이 계속 사용 가능

### 2. 선택적 필드 처리
- 모든 새 필드는 옵셔널로 처리
- 쿠팡 정보가 없어도 기본 리서치는 정상 동작

### 3. 성능 최적화
- 쿠팡 정보는 캐싱하여 중복 요청 방지
- 이미지 URL은 CDN 링크 그대로 전달

## 🎨 프론트엔드 활용 방안

### 1. 갤러리 뷰
- 쿠팡 원본 이미지로 더 나은 시각적 표현
- 로켓배송, 평점 등의 배지 표시
- 가격 변동 정보 표시

### 2. 상세 페이지
- 쿠팡 링크와 파트너스 링크 병행 제공
- 실시간 가격 비교 정보
- 리뷰 수, 평점 등의 신뢰도 지표

### 3. 사용자 경험
- 친숙한 쿠팡 UI 요소 활용
- 더 정확한 제품 정보 제공

## ⚡ 우선순위

### Phase 1 (필수)
1. `coupang_product_url`, `product_image_url` 필드 추가
2. 응답에서 쿠팡 정보 반환
3. 하위 호환성 보장

### Phase 2 (권장)
1. 가격 비교 기능
2. 배치 옵션 추가
3. 메타데이터 구조화

### Phase 3 (향후)
1. 실시간 가격 추적
2. 경쟁사 비교 분석
3. 고급 분석 기능

## 📞 문의사항

이 변경사항들에 대한 기술적 검토와 구현 일정에 대해 백엔드 팀과 협의가 필요합니다.

### 주요 검토 포인트
1. 데이터베이스 스키마 변경 필요성
2. 기존 API 호환성 영향도
3. 개발 및 테스트 일정
4. 성능 영향 분석

---

이 변경사항들이 구현되면 프론트엔드에서 쿠팡 제품 정보를 완전히 활용한 리서치 시스템을 구축할 수 있습니다.