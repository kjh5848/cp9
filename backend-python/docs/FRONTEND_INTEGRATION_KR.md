# 🔗 프론트엔드 통합 가이드

## 개요

이 문서는 제품 리서치 API를 프론트엔드 애플리케이션과 통합하는 방법을 설명합니다.

## TypeScript 타입 정의

### 요청 타입

```typescript
// 제품 아이템 요청
interface ProductItemRequest {
  product_name: string;
  category: string;
  price_exact: number;
  currency?: string;  // 기본: "KRW"
  seller_or_store?: string;
  metadata?: Record<string, any>;
}

// 리서치 옵션
interface ResearchOptions {
  include_coupang_price?: boolean;  // 기본: true
  include_reviews?: boolean;        // 기본: true
  include_specs?: boolean;          // 기본: true
  min_sources?: number;             // 기본: 3
  max_concurrent?: number;          // 기본: 5
}

// 제품 리서치 요청
interface ProductResearchRequest {
  items: ProductItemRequest[];      // 최대 10개
  options?: ResearchOptions;
  callback_url?: string;
  priority?: number;                 // 1-10, 기본: 5
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

// 주목할 만한 리뷰
interface NotableReview {
  source: string;
  quote: string;
  url?: string;
}

// 제품 리뷰
interface ProductReviews {
  rating_avg: number;        // 0-5
  review_count: number;
  summary_positive: string[];
  summary_negative: string[];
  notable_reviews: NotableReview[];
}

// 제품 결과
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
  specs: ProductSpecs;
  reviews: ProductReviews;
  sources: string[];
  captured_at: string;
  status: 'success' | 'error' | 'insufficient_sources';
  error_message?: string;
  missing_fields?: string[];
  suggested_queries?: string[];
}

// 메타데이터
interface ResearchMetadata {
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

// 제품 리서치 응답
interface ProductResearchResponse {
  job_id: string;
  status: string;
  results: ProductResult[];
  metadata: ResearchMetadata;
}
```

## React 통합 예시

### API 클라이언트

```typescript
// api/productResearch.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export class ProductResearchAPI {
  private client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 제품 리서치 요청
  async researchProducts(request: ProductResearchRequest): Promise<ProductResearchResponse> {
    const response = await this.client.post('/research/products', request);
    return response.data;
  }

  // 결과 조회
  async getResults(jobId: string, includeFailed = true): Promise<ProductResearchResponse> {
    const response = await this.client.get(`/research/products/${jobId}`, {
      params: { include_failed: includeFailed },
    });
    return response.data;
  }

  // 상태 확인
  async getStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await this.client.get(`/research/products/${jobId}/status`);
    return response.data;
  }

  // 작업 취소
  async cancelJob(jobId: string): Promise<void> {
    await this.client.delete(`/research/products/${jobId}`);
  }
}
```

### React Hook

```typescript
// hooks/useProductResearch.ts
import { useState, useEffect, useCallback } from 'react';
import { ProductResearchAPI } from '../api/productResearch';

interface UseProductResearchOptions {
  pollingInterval?: number;  // 폴링 간격 (ms)
  onComplete?: (results: ProductResearchResponse) => void;
  onError?: (error: Error) => void;
}

export function useProductResearch(options: UseProductResearchOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [results, setResults] = useState<ProductResearchResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const api = new ProductResearchAPI();
  const { pollingInterval = 2000, onComplete, onError } = options;

  // 제품 리서치 시작
  const startResearch = useCallback(async (items: ProductItemRequest[]) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const response = await api.researchProducts({ items });
      setJobId(response.job_id);
      return response.job_id;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 결과 폴링
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const status = await api.getStatus(jobId);
        setProgress(status.progress);

        if (status.status === 'success' || status.status === 'error') {
          const results = await api.getResults(jobId);
          setResults(results);
          
          if (status.status === 'success') {
            onComplete?.(results);
          }
          
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error);
        clearInterval(interval);
        setLoading(false);
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [jobId, pollingInterval, onComplete, onError]);

  return {
    startResearch,
    loading,
    results,
    error,
    progress,
    jobId,
  };
}
```

### React 컴포넌트

```tsx
// components/ProductResearch.tsx
import React, { useState } from 'react';
import { useProductResearch } from '../hooks/useProductResearch';

export function ProductResearch() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('가전디지털');
  const [price, setPrice] = useState('');

  const { startResearch, loading, results, progress, error } = useProductResearch({
    onComplete: (results) => {
      console.log('리서치 완료:', results);
    },
    onError: (error) => {
      console.error('리서치 실패:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await startResearch([
      {
        product_name: productName,
        category: category,
        price_exact: parseFloat(price),
        currency: 'KRW',
      },
    ]);
  };

  return (
    <div className="product-research">
      <h2>제품 리서치</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>제품명:</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>카테고리:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="가전디지털">가전디지털</option>
            <option value="뷰티">뷰티</option>
            <option value="식품">식품</option>
            <option value="패션">패션</option>
          </select>
        </div>
        
        <div>
          <label>가격:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? '리서치 중...' : '리서치 시작'}
        </button>
      </form>

      {loading && (
        <div className="progress">
          <progress value={progress} max="1" />
          <span>{Math.round(progress * 100)}%</span>
        </div>
      )}

      {error && (
        <div className="error">
          오류: {error.message}
        </div>
      )}

      {results && (
        <div className="results">
          <h3>리서치 결과</h3>
          {results.results.map((product, index) => (
            <div key={index} className="product-result">
              <h4>{product.product_name}</h4>
              <p>브랜드: {product.brand}</p>
              <p>가격: {product.price_exact.toLocaleString()}원</p>
              <p>평점: ⭐ {product.reviews.rating_avg} ({product.reviews.review_count}개 리뷰)</p>
              
              <div className="specs">
                <h5>주요 스펙</h5>
                <ul>
                  {product.specs.main.map((spec, i) => (
                    <li key={i}>{spec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="reviews">
                <h5>리뷰 요약</h5>
                <div className="positive">
                  <strong>장점:</strong>
                  <ul>
                    {product.reviews.summary_positive.map((review, i) => (
                      <li key={i}>{review}</li>
                    ))}
                  </ul>
                </div>
                <div className="negative">
                  <strong>단점:</strong>
                  <ul>
                    {product.reviews.summary_negative.map((review, i) => (
                      <li key={i}>{review}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Vue.js 통합 예시

### Composable

```typescript
// composables/useProductResearch.ts
import { ref, computed } from 'vue';
import { ProductResearchAPI } from '@/api/productResearch';

export function useProductResearch() {
  const api = new ProductResearchAPI();
  
  const loading = ref(false);
  const jobId = ref<string | null>(null);
  const results = ref<ProductResearchResponse | null>(null);
  const error = ref<Error | null>(null);
  const progress = ref(0);

  const startResearch = async (items: ProductItemRequest[]) => {
    loading.value = true;
    error.value = null;
    progress.value = 0;

    try {
      const response = await api.researchProducts({ items });
      jobId.value = response.job_id;
      
      // 결과 폴링
      await pollResults(response.job_id);
      
      return response.job_id;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const pollResults = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await api.getStatus(id);
        progress.value = status.progress;

        if (status.status === 'success' || status.status === 'error') {
          results.value = await api.getResults(id);
          clearInterval(interval);
        }
      } catch (err) {
        error.value = err as Error;
        clearInterval(interval);
      }
    }, 2000);
  };

  return {
    startResearch,
    loading: computed(() => loading.value),
    results: computed(() => results.value),
    error: computed(() => error.value),
    progress: computed(() => progress.value),
    jobId: computed(() => jobId.value),
  };
}
```

## 에러 처리

### 일반적인 에러 처리

```typescript
try {
  const results = await api.researchProducts(request);
} catch (error) {
  if (axios.isAxiosError(error)) {
    const { response } = error;
    
    switch (response?.status) {
      case 400:
        // 잘못된 요청
        console.error('잘못된 요청:', response.data.message);
        break;
      case 404:
        // 작업을 찾을 수 없음
        console.error('작업을 찾을 수 없습니다.');
        break;
      case 429:
        // 요청 제한 초과
        console.error('요청 제한을 초과했습니다. 잠시 후 다시 시도하세요.');
        break;
      case 500:
        // 서버 오류
        console.error('서버 오류가 발생했습니다.');
        break;
      default:
        console.error('알 수 없는 오류:', error.message);
    }
  }
}
```

### 재시도 로직

```typescript
async function researchWithRetry(
  items: ProductItemRequest[],
  maxRetries = 3,
  delay = 1000
): Promise<ProductResearchResponse> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await api.researchProducts({ items });
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}
```

## 성능 최적화

### 1. 배치 처리

여러 제품을 한 번에 리서치:

```typescript
// 나쁜 예: 개별 요청
for (const product of products) {
  await api.researchProducts({ items: [product] });
}

// 좋은 예: 배치 요청
const chunks = chunk(products, 10);  // 10개씩 나누기
for (const batch of chunks) {
  await api.researchProducts({ items: batch });
}
```

### 2. 캐싱

```typescript
const cache = new Map<string, ProductResearchResponse>();

async function getCachedResults(jobId: string): Promise<ProductResearchResponse> {
  if (cache.has(jobId)) {
    return cache.get(jobId)!;
  }
  
  const results = await api.getResults(jobId);
  cache.set(jobId, results);
  return results;
}
```

### 3. 디바운싱

```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (items: ProductItemRequest[]) => {
  await api.researchProducts({ items });
}, 500);
```

## 웹소켓 실시간 업데이트 (옵션)

```typescript
// WebSocket 연결
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'progress') {
    setProgress(data.progress);
  } else if (data.type === 'complete') {
    setResults(data.results);
  }
};

// 작업 구독
ws.send(JSON.stringify({
  action: 'subscribe',
  job_id: jobId,
}));
```