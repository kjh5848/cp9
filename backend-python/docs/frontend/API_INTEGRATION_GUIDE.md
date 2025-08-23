# 🚀 프론트엔드 개발자를 위한 완전한 API 통합 가이드

Perplexity AI 기반 제품 리서치 API를 프론트엔드에 통합하는 모든 것을 다루는 완전한 가이드입니다.

## 🎯 빠른 시작

### 1. API 기본 정보
- **Base URL**: `http://localhost:8000/api/v1`
- **Content-Type**: `application/json`
- **인증**: 현재 불필요 (프로덕션에서는 API 키 추가 예정)
- **Swagger UI**: http://localhost:8000/docs

### 2. 핵심 워크플로우

#### A. 일반 리서치 워크플로우
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

#### B. 🆕 쿠팡 즉시 리턴 워크플로우
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
      // 🆕 쿠팡 실제 API 필드들
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
// results에 즉시 쿠팡 정보 포함! 🎉
// 백그라운드에서 전체 리서치 계속 진행
```

## 📋 TypeScript 타입 정의

### 요청 타입

```typescript
// 🆕 확장된 제품 정보 (쿠팡 API 실제 구조 기반)
interface ProductItemRequest {
  // 기본 필수 필드
  product_name: string;           // 1-500자, 필수
  category: string;              // 1-100자, 필수
  price_exact: number;           // 양수, 필수
  currency?: string;             // 기본값: "KRW"
  seller_or_store?: string;      // 최대 200자
  
  // 🆕 쿠팡 API 실제 구조 기반 필드들
  product_id?: number;           // productId (쿠팡 실제 필드)
  product_image?: string;        // productImage (쿠팡 실제 필드)
  product_url?: string;          // productUrl (쿠팡 실제 필드)
  is_rocket?: boolean;           // isRocket (쿠팡 실제 필드)
  is_free_shipping?: boolean;    // isFreeShipping (쿠팡 실제 필드)
  category_name?: string;        // categoryName (쿠팡 실제 필드)
  
  // 키워드 검색 전용 필드
  keyword?: string;              // keyword (키워드 검색 시)
  rank?: number;                 // rank (키워드 검색 시 순위)
  
  metadata?: Record<string, any>; // 추가 메타데이터
}

// 리서치 요청
interface ProductResearchRequest {
  items: ProductItemRequest[];    // 1-10개
  priority?: number;             // 1-10, 기본값: 5
  callback_url?: string;         // 완료 시 콜백 URL
}

// 상태 확인 요청
interface JobStatusRequest {
  job_id: string;               // UUID 또는 Celery 태스크 ID
  is_celery?: boolean;          // 기본값: false
}
```

### 응답 타입

```typescript
// 제품 속성
interface ProductAttribute {
  name: string;
  value: string;
}

// 제품 스펙
interface ProductSpecs {
  main: string[];
  attributes: ProductAttribute[];
  size_or_weight?: string;
  options: string[];
  included_items: string[];
}

// 리뷰 정보
interface NotableReview {
  source: string;
  quote: string;
  url?: string;
}

interface ProductReviews {
  rating_avg: number;           // 0-5
  review_count: number;
  summary_positive: string[];
  summary_negative: string[];
  notable_reviews: NotableReview[];
}

// 🆕 쿠팡 정보 응답
interface CoupangInfo {
  product_id?: number;         // 쿠팡 제품 ID (productId)
  product_url?: string;        // 쿠팡 제품 URL (productUrl)
  product_image?: string;      // 쿠팡 제품 이미지 URL (productImage)
  is_rocket?: boolean;         // 로켓배송 여부 (isRocket)
  is_free_shipping?: boolean;  // 무료배송 여부 (isFreeShipping)
  category_name?: string;      // 쿠팡 카테고리명 (categoryName)
  product_price?: number;      // 쿠팡 현재 가격 (productPrice)
  price_comparison?: {         // 가격 비교 정보
    coupang_current_price: number;
    price_difference: number;
    price_change_percent: number;
  };
}

// 제품 리서치 결과
interface ProductResult {
  product_name: string;
  brand: string;
  category: string;
  model_or_variant: string;
  price_exact: number;
  currency: string;
  seller_or_store?: string;
  deeplink_or_product_url?: string;
  coupang_price?: number;
  
  // 🆕 쿠팡 정보 (실제 API 구조 기준)
  coupang_info?: CoupangInfo;
  
  specs: ProductSpecs;
  reviews: ProductReviews;
  sources: string[];
  captured_at: string;         // YYYY-MM-DD
  status: 'success' | 'error';
  error_message?: string;
  missing_fields: string[];
  suggested_queries: string[];
}

// 메타데이터
interface ResearchMetadata {
  total_items: number;
  successful_items: number;
  failed_items: number;
  success_rate: number;        // 0.0-1.0
  processing_time_ms?: number;
  created_at: string;          // ISO datetime
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

// 최종 응답
interface ProductResearchResponse {
  job_id: string;
  status: string;
  results: ProductResult[];
  metadata: ResearchMetadata;
}

// 작업 상태 응답
interface JobStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;            // 0.0-1.0
  message?: string;
  metadata?: Record<string, any>;
}
```

## 🔌 API 엔드포인트 상세

### 1. 제품 리서치 생성
**POST** `/api/v1/research/products`

#### A. 일반 리서치
```typescript
// 일반 리서치 요청
const createResearch = async (items: ProductItemRequest[]) => {
  const response = await fetch('/api/v1/research/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items,
      priority: 5,
      callback_url: 'https://your-domain.com/webhook'  // 선택사항
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Research creation failed: ${error.detail}`);
  }

  return response.json() as Promise<ProductResearchResponse>;
};
```

#### B. 🆕 쿠팡 즉시 리턴 리서치
```typescript
// 쿠팡 정보 즉시 리턴 요청
const createCoupangPreviewResearch = async (items: ProductItemRequest[]) => {
  const response = await fetch('/api/v1/research/products?return_coupang_preview=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map(item => ({
        ...item,
        // 쿠팡 메타데이터 구조화
        metadata: {
          source: "coupang_partners",
          selected_at: new Date().toISOString(),
          frontend_session_id: `session_${Date.now()}`,
          ...item.metadata
        }
      })),
      priority: 5
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Coupang preview research failed: ${error.detail}`);
  }

  const result = await response.json() as ProductResearchResponse;
  
  // 즉시 쿠팡 정보가 results에 포함됨!
  console.log('즉시 받은 쿠팡 정보:', result.results);
  
  return result;
};
```

### 2. 작업 상태 확인
**GET** `/api/v1/research/products/{job_id}/status`

```typescript
const checkJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
  const response = await fetch(`/api/v1/research/products/${jobId}/status`);
  
  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }

  return response.json();
};
```

### 3. 리서치 결과 조회
**GET** `/api/v1/research/products/{job_id}`

```typescript
const getResults = async (
  jobId: string, 
  includeFailed: boolean = true
): Promise<ProductResearchResponse> => {
  const url = new URL(`/api/v1/research/products/${jobId}`, window.location.origin);
  url.searchParams.set('include_failed', String(includeFailed));

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Results fetch failed: ${response.statusText}`);
  }

  return response.json();
};
```

### 4. 작업 취소
**DELETE** `/api/v1/research/products/{job_id}`

```typescript
const cancelJob = async (jobId: string): Promise<void> => {
  const response = await fetch(`/api/v1/research/products/${jobId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(`Job cancellation failed: ${response.statusText}`);
  }
};
```

## ⚛️ React/Next.js 통합 예제

### 커스텀 훅

```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseResearchOptions {
  pollingInterval?: number;      // 기본값: 2000ms
  maxPollingTime?: number;       // 기본값: 300000ms (5분)
}

export const useProductResearch = (options: UseResearchOptions = {}) => {
  const { pollingInterval = 2000, maxPollingTime = 300000 } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [status, setStatus] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCoupangPreview, setHasCoupangPreview] = useState(false);

  const startResearch = useCallback(async (
    items: ProductItemRequest[], 
    useCoupangPreview: boolean = false
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 🆕 쿠팡 즉시 리턴 또는 일반 리서치 선택
      const research = useCoupangPreview 
        ? await createCoupangPreviewResearch(items)
        : await createResearch(items);
      
      const jobId = research.job_id;
      setHasCoupangPreview(useCoupangPreview);
      
      // 🆕 쿠팡 즉시 리턴의 경우 바로 결과 표시
      if (useCoupangPreview && research.results.length > 0) {
        setResults(research.results);
        console.log('🎉 쿠팡 정보 즉시 표시:', research.results);
      }
      
      // 폴링 시작 (백그라운드 리서치 완료 확인)
      const startTime = Date.now();
      const pollStatus = async (): Promise<void> => {
        if (Date.now() - startTime > maxPollingTime) {
          throw new Error('작업 시간 초과');
        }

        const statusResult = await checkJobStatus(jobId);
        setStatus(statusResult);

        if (statusResult.status === 'success') {
          const finalResults = await getResults(jobId);
          // 🆕 쿠팡 즉시 리턴의 경우 기존 결과와 병합하거나 업데이트
          if (useCoupangPreview) {
            console.log('🔄 백그라운드 리서치 완료, 결과 업데이트:', finalResults.results);
          }
          setResults(finalResults.results);
          setIsLoading(false);
        } else if (statusResult.status === 'error') {
          throw new Error(`작업 실패: ${statusResult.message}`);
        } else {
          // 계속 폴링
          setTimeout(pollStatus, pollingInterval);
        }
      };

      await pollStatus();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      setIsLoading(false);
    }
  }, [pollingInterval, maxPollingTime]);

  return {
    startResearch,
    isLoading,
    results,
    status,
    error,
    hasCoupangPreview
  };
};
```

### React 컴포넌트 예제

```tsx
import React, { useState } from 'react';
import { useProductResearch } from './hooks/useProductResearch';

const ProductResearcher: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  
  // 🆕 쿠팡 정보 필드들
  const [coupangInfo, setCoupangInfo] = useState({
    product_id: '',
    product_url: '',
    product_image: '',
    is_rocket: false,
    is_free_shipping: false
  });
  const [useCoupangPreview, setUseCoupangPreview] = useState(false);
  
  const { startResearch, isLoading, results, status, error } = useProductResearch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const items: ProductItemRequest[] = [{
      product_name: productName,
      category,
      price_exact: parseFloat(price),
      // 🆕 쿠팡 정보 포함 (선택사항)
      ...(useCoupangPreview && {
        product_id: coupangInfo.product_id ? parseInt(coupangInfo.product_id) : undefined,
        product_url: coupangInfo.product_url || undefined,
        product_image: coupangInfo.product_image || undefined,
        is_rocket: coupangInfo.is_rocket,
        is_free_shipping: coupangInfo.is_free_shipping,
        seller_or_store: "쿠팡"
      })
    }];

    await startResearch(items, useCoupangPreview);
  };

  return (
    <div className="product-researcher">
      <form onSubmit={handleSubmit} className="research-form">
        <div>
          <label>제품명:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            maxLength={500}
          />
        </div>
        
        <div>
          <label>카테고리:</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            maxLength={100}
          />
        </div>
        
        <div>
          <label>가격:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        
        {/* 🆕 쿠팡 즉시 리턴 옵션 */}
        <div className="coupang-section">
          <label>
            <input
              type="checkbox"
              checked={useCoupangPreview}
              onChange={(e) => setUseCoupangPreview(e.target.checked)}
            />
            쿠팡 정보 즉시 받기
          </label>
          
          {useCoupangPreview && (
            <div className="coupang-fields">
              <div>
                <label>쿠팡 제품 ID:</label>
                <input
                  type="number"
                  value={coupangInfo.product_id}
                  onChange={(e) => setCoupangInfo(prev => ({ ...prev, product_id: e.target.value }))}
                  placeholder="7582946"
                />
              </div>
              
              <div>
                <label>쿠팡 제품 URL:</label>
                <input
                  type="url"
                  value={coupangInfo.product_url}
                  onChange={(e) => setCoupangInfo(prev => ({ ...prev, product_url: e.target.value }))}
                  placeholder="https://www.coupang.com/vp/products/7582946"
                />
              </div>
              
              <div>
                <label>제품 이미지 URL:</label>
                <input
                  type="url"
                  value={coupangInfo.product_image}
                  onChange={(e) => setCoupangInfo(prev => ({ ...prev, product_image: e.target.value }))}
                  placeholder="https://thumbnail10.coupangcdn.com/..."
                />
              </div>
              
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={coupangInfo.is_rocket}
                    onChange={(e) => setCoupangInfo(prev => ({ ...prev, is_rocket: e.target.checked }))}
                  />
                  로켓배송
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    checked={coupangInfo.is_free_shipping}
                    onChange={(e) => setCoupangInfo(prev => ({ ...prev, is_free_shipping: e.target.checked }))}
                  />
                  무료배송
                </label>
              </div>
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="submit-btn"
        >
          {isLoading ? '리서치 중...' : (useCoupangPreview ? '쿠팡 정보 + 리서치 시작' : '리서치 시작')}
        </button>
      </form>

      {/* 진행 상황 표시 */}
      {status && (
        <div className="progress-status">
          <div className="status-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${status.progress * 100}%` }}
            />
          </div>
          <p>{status.message}</p>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="error-message">
          <p>오류: {error}</p>
        </div>
      )}

      {/* 결과 표시 */}
      {results.length > 0 && (
        <div className="results">
          <h3>리서치 결과</h3>
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <h4>{result.product_name}</h4>
              <p><strong>브랜드:</strong> {result.brand}</p>
              <p><strong>가격:</strong> {result.price_exact.toLocaleString()}원</p>
              
              {/* 🆕 쿠팡 정보 표시 */}
              {result.coupang_info && (
                <div className="coupang-info">
                  <h5>🛍️ 쿠팡 정보</h5>
                  {result.coupang_info.product_image && (
                    <img 
                      src={result.coupang_info.product_image} 
                      alt={result.product_name}
                      className="product-image"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="coupang-badges">
                    {result.coupang_info.is_rocket && <span className="badge rocket">🚀 로켓배송</span>}
                    {result.coupang_info.is_free_shipping && <span className="badge free-ship">📦 무료배송</span>}
                  </div>
                  {result.coupang_info.product_price && (
                    <p><strong>쿠팡 현재가:</strong> {result.coupang_info.product_price.toLocaleString()}원</p>
                  )}
                  {result.coupang_info.price_comparison && (
                    <div className="price-comparison">
                      <p><strong>가격 차이:</strong> {result.coupang_info.price_comparison.price_difference.toLocaleString()}원</p>
                      <p><strong>변동률:</strong> {result.coupang_info.price_comparison.price_change_percent.toFixed(1)}%</p>
                    </div>
                  )}
                </div>
              )}
              
              <p><strong>평점:</strong> {result.reviews.rating_avg}/5 ({result.reviews.review_count}개 리뷰)</p>
              
              {result.specs.main.length > 0 && (
                <div className="specs">
                  <strong>주요 스펙:</strong>
                  <ul>
                    {result.specs.main.map((spec, i) => (
                      <li key={i}>{spec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.deeplink_or_product_url && (
                <a 
                  href={result.deeplink_or_product_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="product-link"
                >
                  제품 보기
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductResearcher;
```

## 🎨 UI 컴포넌트 가이드

### 진행 상황 표시기

```tsx
interface ProgressIndicatorProps {
  status: JobStatusResponse;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기 중';
      case 'processing': return '처리 중';
      case 'success': return '완료';
      case 'error': return '오류';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="progress-indicator">
      <div className="status-header">
        <span 
          className="status-badge" 
          style={{ backgroundColor: getStatusColor(status.status) }}
        >
          {getStatusText(status.status)}
        </span>
        <span className="progress-percent">
          {Math.round(status.progress * 100)}%
        </span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{
            width: `${status.progress * 100}%`,
            backgroundColor: getStatusColor(status.status)
          }}
        />
      </div>
      
      {status.message && (
        <p className="progress-message">{status.message}</p>
      )}
    </div>
  );
};
```

### 제품 결과 카드

```tsx
interface ProductCardProps {
  product: ProductResult;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const handleBuyClick = () => {
    if (product.deeplink_or_product_url) {
      window.open(product.deeplink_or_product_url, '_blank');
    }
  };

  return (
    <div className="product-card">
      <div className="product-header">
        <h3 className="product-name">{product.product_name}</h3>
        <span className="product-brand">{product.brand}</span>
      </div>

      <div className="product-pricing">
        <span className="current-price">
          {product.price_exact.toLocaleString()}원
        </span>
        {product.coupang_price && product.coupang_price < product.price_exact && (
          <span className="compare-price">
            쿠팡 {product.coupang_price.toLocaleString()}원
          </span>
        )}
      </div>

      <div className="product-reviews">
        <div className="rating">
          <span className="rating-score">{product.reviews.rating_avg}</span>
          <span className="rating-stars">★★★★★</span>
          <span className="review-count">({product.reviews.review_count})</span>
        </div>
      </div>

      {product.specs.main.length > 0 && (
        <div className="product-specs">
          <h4>주요 스펙</h4>
          <ul>
            {product.specs.main.slice(0, 3).map((spec, index) => (
              <li key={index}>{spec}</li>
            ))}
          </ul>
        </div>
      )}

      {product.reviews.summary_positive.length > 0 && (
        <div className="product-highlights">
          <h4>장점</h4>
          <ul>
            {product.reviews.summary_positive.slice(0, 2).map((point, index) => (
              <li key={index} className="positive-point">{point}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="product-actions">
        <button 
          onClick={handleBuyClick} 
          className="buy-button"
          disabled={!product.deeplink_or_product_url}
        >
          제품 보기
        </button>
        
        <button className="compare-button">
          비교하기
        </button>
      </div>

      <div className="product-meta">
        <span className="capture-date">
          수집일: {product.captured_at}
        </span>
        <span className="source-count">
          {product.sources.length}개 출처
        </span>
      </div>
    </div>
  );
};
```

## ❌ 에러 처리 가이드

### 공통 에러 타입

```typescript
interface APIError {
  detail: string | ValidationError[];
}

interface ValidationError {
  type: string;
  loc: (string | number)[];
  msg: string;
  input: any;
  ctx?: Record<string, any>;
}

// 에러 처리 유틸리티
export class ResearchAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ResearchAPIError';
  }
}

export const handleAPIError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    if (errorData.detail) {
      if (Array.isArray(errorData.detail)) {
        // 검증 에러
        const validationErrors = errorData.detail.map((err: ValidationError) => 
          `${err.loc.join('.')}: ${err.msg}`
        ).join(', ');
        errorMessage = `검증 오류: ${validationErrors}`;
      } else {
        errorMessage = errorData.detail;
      }
    }
    
    throw new ResearchAPIError(errorMessage, response.status, errorData);
  }
  
  return response;
};
```

### 에러 상황별 처리

```typescript
export const createResearchWithErrorHandling = async (
  items: ProductItemRequest[]
): Promise<ProductResearchResponse> => {
  try {
    const response = await fetch('/api/v1/research/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    await handleAPIError(response);
    return response.json();
    
  } catch (error) {
    if (error instanceof ResearchAPIError) {
      switch (error.status) {
        case 400:
          throw new Error(`요청 오류: ${error.message}`);
        case 422:
          throw new Error(`입력 검증 실패: ${error.message}`);
        case 429:
          throw new Error('요청 제한 초과. 잠시 후 다시 시도하세요.');
        case 500:
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도하세요.');
        default:
          throw new Error(`API 오류 (${error.status}): ${error.message}`);
      }
    }
    
    throw error;
  }
};
```

## ⚡ 성능 최적화

### 요청 최적화

```typescript
// 배치 처리로 여러 제품 한번에 리서치
const optimizedResearch = async (products: Array<{name: string, category: string, price: number}>) => {
  // 최대 10개씩 배치 처리
  const batches = chunkArray(products, 10);
  
  const allResults: ProductResult[] = [];
  
  for (const batch of batches) {
    const items: ProductItemRequest[] = batch.map(p => ({
      product_name: p.name,
      category: p.category,
      price_exact: p.price
    }));
    
    const result = await createResearch(items);
    // 결과 수집...
  }
  
  return allResults;
};

// 유틸리티 함수
function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}
```

### 캐싱 전략

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, ttlMs: number = 300000): void { // 5분 기본 TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const apiCache = new APICache();

// 캐시를 활용한 결과 조회
export const getCachedResults = async (jobId: string): Promise<ProductResearchResponse> => {
  const cacheKey = `research_${jobId}`;
  const cached = apiCache.get<ProductResearchResponse>(cacheKey);
  
  if (cached) return cached;
  
  const results = await getResults(jobId);
  
  // 성공한 경우만 캐시
  if (results.status === 'success') {
    apiCache.set(cacheKey, results, 600000); // 10분 캐시
  }
  
  return results;
};
```

## 🧪 테스트 전략

### API 모킹

```typescript
// Mock 데이터
export const mockProductResult: ProductResult = {
  product_name: "테스트 제품",
  brand: "테스트 브랜드",
  category: "테스트",
  model_or_variant: "v1.0",
  price_exact: 100000,
  currency: "KRW",
  deeplink_or_product_url: "https://example.com/product",
  specs: {
    main: ["테스트 스펙 1", "테스트 스펙 2"],
    attributes: [{ name: "색상", value: "검정" }],
    options: ["기본"],
    included_items: ["본체"]
  },
  reviews: {
    rating_avg: 4.5,
    review_count: 100,
    summary_positive: ["좋은 품질"],
    summary_negative: ["배송 지연"],
    notable_reviews: []
  },
  sources: ["https://example.com"],
  captured_at: "2024-01-20",
  status: "success",
  missing_fields: [],
  suggested_queries: []
};

// API 모킹
export const mockResearchAPI = {
  createResearch: jest.fn(() => 
    Promise.resolve({
      job_id: "test-job-id",
      status: "pending",
      results: [],
      metadata: {
        total_items: 1,
        successful_items: 0,
        failed_items: 0,
        success_rate: 0.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })
  ),
  
  checkJobStatus: jest.fn(() =>
    Promise.resolve({
      job_id: "test-job-id",
      status: "success",
      progress: 1.0,
      message: "완료"
    })
  ),
  
  getResults: jest.fn(() =>
    Promise.resolve({
      job_id: "test-job-id",
      status: "success",
      results: [mockProductResult],
      metadata: {
        total_items: 1,
        successful_items: 1,
        failed_items: 0,
        success_rate: 1.0,
        processing_time_ms: 3500,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      }
    })
  )
};
```

### React 컴포넌트 테스트

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductResearcher } from './ProductResearcher';
import * as api from '../api/research';

// API 모킹
jest.mock('../api/research', () => ({
  ...mockResearchAPI
}));

describe('ProductResearcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('제품 리서치 폼이 정상적으로 렌더링된다', () => {
    render(<ProductResearcher />);
    
    expect(screen.getByLabelText('제품명:')).toBeInTheDocument();
    expect(screen.getByLabelText('카테고리:')).toBeInTheDocument();
    expect(screen.getByLabelText('가격:')).toBeInTheDocument();
    expect(screen.getByText('리서치 시작')).toBeInTheDocument();
  });

  test('폼 제출 시 API가 호출된다', async () => {
    render(<ProductResearcher />);
    
    fireEvent.change(screen.getByLabelText('제품명:'), {
      target: { value: '테스트 제품' }
    });
    fireEvent.change(screen.getByLabelText('카테고리:'), {
      target: { value: '테스트' }
    });
    fireEvent.change(screen.getByLabelText('가격:'), {
      target: { value: '100000' }
    });
    
    fireEvent.click(screen.getByText('리서치 시작'));

    await waitFor(() => {
      expect(api.createResearch).toHaveBeenCalledWith([{
        product_name: '테스트 제품',
        category: '테스트',
        price_exact: 100000
      }]);
    });
  });

  test('리서치 결과가 정상적으로 표시된다', async () => {
    render(<ProductResearcher />);
    
    // 폼 제출...
    fireEvent.change(screen.getByLabelText('제품명:'), {
      target: { value: '테스트 제품' }
    });
    fireEvent.change(screen.getByLabelText('카테고리:'), {
      target: { value: '테스트' }
    });
    fireEvent.change(screen.getByLabelText('가격:'), {
      target: { value: '100000' }
    });
    
    fireEvent.click(screen.getByText('리서치 시작'));

    await waitFor(() => {
      expect(screen.getByText('리서치 결과')).toBeInTheDocument();
      expect(screen.getByText('테스트 제품')).toBeInTheDocument();
      expect(screen.getByText('테스트 브랜드')).toBeInTheDocument();
    });
  });
});
```

## 🚀 배포 고려사항

### 환경변수 설정

```typescript
// 환경별 API 설정
const getAPIConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  const configs = {
    development: {
      baseURL: 'http://localhost:8000/api/v1',
      timeout: 60000,
      retries: 3
    },
    staging: {
      baseURL: process.env.REACT_APP_API_URL || 'https://api-staging.example.com/api/v1',
      timeout: 30000,
      retries: 2
    },
    production: {
      baseURL: process.env.REACT_APP_API_URL || 'https://api.example.com/api/v1',
      timeout: 30000,
      retries: 2
    }
  };
  
  return configs[env as keyof typeof configs] || configs.development;
};
```

### CORS 설정 확인

백엔드 CORS 설정이 프론트엔드 도메인을 허용하는지 확인:

```python
# 백엔드 main.py에서 확인
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트엔드 도메인 추가
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 프로덕션 최적화

```typescript
// API 클라이언트 설정
export class ResearchAPIClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;

  constructor(config = getAPIConfig()) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.retries = config.retries;
  }

  private async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    retries = this.retries
  ): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      if (retries > 0 && error.name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  async createResearch(items: ProductItemRequest[]): Promise<ProductResearchResponse> {
    const response = await this.fetchWithRetry(`${this.baseURL}/research/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    await handleAPIError(response);
    return response.json();
  }

  // 다른 메서드들...
}

export const apiClient = new ResearchAPIClient();
```

## 📞 지원 및 문제 해결

### 일반적인 문제

1. **CORS 에러**
   - 백엔드 CORS 설정 확인
   - 프론트엔드 도메인이 허용 목록에 있는지 확인

2. **타임아웃**
   - 리서치 작업은 최대 60초 소요
   - 적절한 타임아웃 설정 (최소 65초)

3. **폴링 과부하**
   - 2-5초 간격으로 상태 확인
   - 최대 5분 후 타임아웃 처리

4. **배치 크기 제한**
   - 최대 10개 제품까지 한번에 처리
   - 더 많은 제품은 여러 배치로 분할

### 디버깅 팁

```typescript
// 디버그 모드 활성화
const debugAPI = process.env.NODE_ENV === 'development';

const apiDebugger = {
  log: (message: string, data?: any) => {
    if (debugAPI) {
      console.log(`[API Debug] ${message}`, data);
    }
  },
  
  logRequest: (url: string, options: RequestInit) => {
    if (debugAPI) {
      console.group(`[API Request] ${options.method || 'GET'} ${url}`);
      console.log('Options:', options);
      console.log('Body:', options.body);
      console.groupEnd();
    }
  },
  
  logResponse: (response: Response, data?: any) => {
    if (debugAPI) {
      console.group(`[API Response] ${response.status} ${response.statusText}`);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Data:', data);
      console.groupEnd();
    }
  }
};
```

### 성능 모니터링

```typescript
// 성능 메트릭 수집
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(key: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.addMetric(key, duration);
    };
  }

  addMetric(key: string, value: number): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key)!.push(value);
  }

  getAverageMetric(key: string): number {
    const values = this.metrics.get(key) || [];
    return values.reduce((a, b) => a + b, 0) / values.length || 0;
  }

  reportMetrics(): void {
    console.group('API Performance Metrics');
    for (const [key, values] of this.metrics) {
      console.log(`${key}: ${this.getAverageMetric(key).toFixed(2)}ms (${values.length} samples)`);
    }
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// 사용 예시
const timer = performanceMonitor.startTimer('research_create');
const result = await createResearch(items);
timer();
```

## 🛍️ 쿠팡 통합 특별 가이드

### 쿠팡 즉시 리턴 기능의 장점

1. **빠른 사용자 경험**: 쿠팡 정보를 즉시 표시하여 사용자 만족도 향상
2. **백그라운드 처리**: AI 리서치는 백그라운드에서 계속 진행
3. **점진적 개선**: 먼저 쿠팡 정보를 보여주고, 나중에 완전한 분석 결과 제공
4. **실제 데이터 활용**: 실제 쿠팡 API 구조를 활용한 정확한 정보

### 실제 사용 시나리오

```typescript
// 시나리오 1: 쿠팡에서 제품 선택 → 즉시 정보 표시 → AI 분석 추가
const handleCoupangProductSelect = async (coupangProduct: any) => {
  const items = [{
    product_name: coupangProduct.productName,
    category: coupangProduct.categoryName,
    price_exact: coupangProduct.productPrice,
    product_id: coupangProduct.productId,
    product_url: coupangProduct.productUrl,
    product_image: coupangProduct.productImage,
    is_rocket: coupangProduct.isRocket,
    is_free_shipping: coupangProduct.isFreeShipping,
    seller_or_store: "쿠팡"
  }];
  
  // 즉시 쿠팡 정보 받기 + 백그라운드 AI 리서치
  const research = await createCoupangPreviewResearch(items);
  
  // 사용자는 즉시 쿠팡 정보를 볼 수 있음
  console.log('즉시 표시:', research.results);
  
  // 백그라운드에서 AI 분석 계속 진행...
};

// 시나리오 2: 키워드 검색 결과와 함께 활용
const handleKeywordSearch = async (keyword: string, searchResults: any[]) => {
  const items = searchResults.map((result, index) => ({
    product_name: result.productName,
    category: result.categoryName,
    price_exact: result.productPrice,
    keyword: keyword,
    rank: index + 1,
    product_id: result.productId,
    product_url: result.productUrl,
    // ... 기타 쿠팡 필드
  }));
  
  // 검색 결과를 즉시 표시하면서 AI 분석도 시작
  return await createCoupangPreviewResearch(items);
};
```

### CSS 스타일 예제

```css
/* 쿠팡 정보 표시를 위한 스타일 */
.coupang-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  background-color: #fef9e7;
}

.coupang-fields {
  margin-top: 1rem;
  display: grid;
  gap: 0.5rem;
}

.coupang-info {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.coupang-badges {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.rocket {
  background-color: #3b82f6;
  color: white;
}

.badge.free-ship {
  background-color: #10b981;
  color: white;
}

.price-comparison {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.product-image {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.checkbox-group {
  display: flex;
  gap: 1rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 로딩 상태에서 쿠팡 정보가 있는 경우 */
.has-coupang-preview .progress-status {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border-radius: 8px;
  padding: 1rem;
}

.has-coupang-preview .progress-status::before {
  content: "🛍️ ";
}
```

### 모바일 최적화

```tsx
// 모바일에서 쿠팡 정보를 카드 형태로 표시
const CoupangProductCard: React.FC<{ product: ProductResult }> = ({ product }) => {
  if (!product.coupang_info) return null;
  
  return (
    <div className="coupang-card">
      {product.coupang_info.product_image && (
        <div className="card-image">
          <img 
            src={product.coupang_info.product_image} 
            alt={product.product_name}
            loading="lazy"
          />
        </div>
      )}
      
      <div className="card-content">
        <h3 className="product-title">{product.product_name}</h3>
        
        <div className="price-info">
          <span className="current-price">
            {product.price_exact.toLocaleString()}원
          </span>
          {product.coupang_info.product_price && (
            <span className="coupang-price">
              쿠팡 {product.coupang_info.product_price.toLocaleString()}원
            </span>
          )}
        </div>
        
        <div className="badges">
          {product.coupang_info.is_rocket && (
            <span className="badge rocket">🚀 로켓배송</span>
          )}
          {product.coupang_info.is_free_shipping && (
            <span className="badge free-ship">📦 무료배송</span>
          )}
        </div>
        
        {product.coupang_info.product_url && (
          <a 
            href={product.coupang_info.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="coupang-link-btn"
          >
            쿠팡에서 보기
          </a>
        )}
      </div>
    </div>
  );
};
```

---

## 🎉 마무리

이 가이드는 프론트엔드 개발자가 제품 리서치 API를 완전히 통합하는데 필요한 모든 정보를 제공합니다. 

### 🆕 새로운 쿠팡 즉시 리턴 기능으로:
- **즉시 응답**: 쿠팡 제품 정보를 선택과 동시에 표시
- **백그라운드 처리**: AI 리서치는 백그라운드에서 계속 진행
- **실제 데이터**: 실제 쿠팡 API 구조를 활용한 정확한 정보
- **점진적 개선**: 기본 정보 → AI 분석 결과로 단계적 업그레이드

추가 질문이나 특정 사용 사례에 대한 도움이 필요하면 백엔드 팀에 문의하세요.