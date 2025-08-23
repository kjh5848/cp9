# 🔄 백엔드 API 요청 예시

쿠팡 제품 정보를 포함한 다양한 API 요청 시나리오 예시 모음입니다.

## 📋 TypeScript 타입 정의

```typescript
// 기존 타입 (수정 전)
interface ProductItemRequest {
  product_name: string;
  category: string;
  price_exact: number;
  currency?: string;
  seller_or_store?: string;
  metadata?: Record<string, any>;
}

// 확장된 타입 (실제 쿠팡 API 기준)
interface EnhancedProductItemRequest extends ProductItemRequest {
  product_id?: number;            // 실제: productId (number)
  product_url?: string;           // 실제: productUrl
  product_image?: string;         // 실제: productImage
  is_rocket?: boolean;            // 실제: isRocket
  is_free_shipping?: boolean;     // 실제: isFreeShipping
  category_name?: string;         // 실제: categoryName
  keyword?: string;               // 키워드 검색용
  rank?: number;                  // 검색 순위
  metadata?: {
    source: "coupang_partners";
    original_coupang_response?: any;
    selected_at?: string;
    frontend_session_id?: string;
  }
}
```

## 🎯 시나리오별 요청 예시

### 1. 단일 제품 리서치 (기본)

```typescript
const singleProductRequest = {
  items: [
    {
      product_name: "삼성전자 갤럭시 버드3 프로",
      category: "이어폰/헤드폰",
      price_exact: 189000,
      currency: "KRW",
      seller_or_store: "쿠팡"
    }
  ],
  priority: 5
};
```

### 2. 단일 제품 리서치 (쿠팡 정보 포함)

```typescript
const enhancedSingleRequest = {
  items: [
    {
      product_name: "삼성전자 갤럭시 버드3 프로",
      category: "이어폰/헤드폰",
      price_exact: 189000,
      currency: "KRW",
      seller_or_store: "쿠팡",
      
      // 쿠팡 추가 정보 (실제 API 기준)
      product_id: 7582946,
      product_url: "https://www.coupang.com/vp/products/7582946",
      product_image: "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2024/07/10/11/0/c2f8e8d4-8b2e-4f7e-9c84-7a3b9e5f8d12.jpg",
      is_rocket: true,
      is_free_shipping: true,
      category_name: "이어폰/헤드폰",
      
      metadata: {
        source: "coupang_partners",
        selected_at: "2024-08-23T10:30:00Z",
        frontend_session_id: "session_abc123",
        original_coupang_response: {
          productId: 7582946,
          productName: "삼성전자 갤럭시 버드3 프로",
          productPrice: 189000,
          categoryName: "이어폰/헤드폰",
          isRocket: true,
          isFreeShipping: true
        }
      }
    }
  ],
  priority: 7,
  batch_options: {
    enable_price_tracking: true,
    compare_with_competitors: false
  }
};
```

### 3. 다중 제품 리서치 (노트북 비교)

```typescript
const multipleProductsRequest = {
  items: [
    {
      product_name: "레노버 IdeaPad Slim 1",
      category: "노트북",
      price_exact: 298000,
      product_id: 1234567,
      product_url: "https://www.coupang.com/vp/products/1234567",
      product_image: "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/lenovo-ideapad.jpg",
      is_rocket: true,
      is_free_shipping: false,
      category_name: "노트북",
      seller_or_store: "쿠팡",
      metadata: {
        source: "coupang_partners",
        selected_at: "2024-08-23T10:35:00Z",
        frontend_session_id: "session_def456"
      }
    },
    {
      product_name: "ASUS VivoBook 15",
      category: "노트북",
      price_exact: 359000,
      product_id: 2345678,
      product_url: "https://www.coupang.com/vp/products/2345678",
      product_image: "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/asus-vivobook.jpg",
      is_rocket: false,
      is_free_shipping: true,
      category_name: "노트북",
      seller_or_store: "쿠팡",
      metadata: {
        source: "coupang_partners",
        selected_at: "2024-08-23T10:35:00Z",
        frontend_session_id: "session_def456"
      }
    },
    {
      product_name: "HP 15s",
      category: "노트북", 
      price_exact: 419000,
      product_id: 3456789,
      product_url: "https://www.coupang.com/vp/products/3456789",
      product_image: "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/hp-15s.jpg",
      is_rocket: true,
      is_free_shipping: true,
      category_name: "노트북",
      seller_or_store: "쿠팡",
      metadata: {
        source: "coupang_partners",
        selected_at: "2024-08-23T10:35:00Z",
        frontend_session_id: "session_def456"
      }
    }
  ],
  priority: 8,
  callback_url: "https://your-domain.com/webhook/research-complete",
  batch_options: {
    group_by_category: true,
    enable_price_tracking: true,
    compare_with_competitors: true
  }
};
```

### 4. 고급 옵션 활용 (스마트폰)

```typescript
const advancedOptionsRequest = {
  items: [
    {
      product_name: "iPhone 15 Pro 128GB",
      category: "스마트폰",
      price_exact: 1350000,
      product_id: 9876543,
      product_url: "https://www.coupang.com/vp/products/9876543",
      product_image: "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/iphone15pro.jpg",
      is_rocket: true,
      is_free_shipping: false,
      category_name: "스마트폰",
      seller_or_store: "쿠팡",
      metadata: {
        source: "coupang_partners",
        selected_at: "2024-08-23T11:00:00Z",
        frontend_session_id: "session_ghi789",
        original_data: {
          color: "Natural Titanium",
          storage: "128GB",
          carrier: "unlocked"
        }
      }
    },
    {
      product_name: "갤럭시 S24 Ultra 256GB",
      category: "스마트폰",
      price_exact: 1298000,
      product_id: 8765432,
      product_url: "https://www.coupang.com/vp/products/8765432",
      product_image: "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/galaxy-s24-ultra.jpg",
      is_rocket: true,
      is_free_shipping: true,
      category_name: "스마트폰",
      seller_or_store: "쿠팡",
      metadata: {
        source: "coupang_partners",
        selected_at: "2024-08-23T11:00:00Z",
        frontend_session_id: "session_ghi789",
        original_data: {
          color: "Titanium Black",
          storage: "256GB",
          with_spen: true
        }
      }
    }
  ],
  priority: 10, // 최고 우선순위
  callback_url: "https://your-domain.com/webhook/research-complete",
  batch_options: {
    group_by_category: false,
    enable_price_tracking: true,
    compare_with_competitors: true
  }
};
```

### 5. 최소 정보만 포함 (하위 호환성)

```typescript
const minimalRequest = {
  items: [
    {
      product_name: "무선 마우스",
      category: "컴퓨터/IT",
      price_exact: 25000
    }
  ]
};
```

## 🔧 실제 구현 예시

### React Hook에서 사용

```typescript
import { useState } from 'react';
import { ProductItem } from '@/features/product/types';

export const useBackendResearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startResearch = async (selectedProducts: ProductItem[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // 쿠팡 제품을 백엔드 형식으로 변환
      const items = selectedProducts.map(product => ({
        product_name: product.productName,
        category: product.categoryName || "기타",
        price_exact: product.productPrice,
        currency: "KRW",
        seller_or_store: "쿠팡",
        
        // 쿠팡 추가 정보 (실제 API 기준)
        product_id: product.productId,
        product_url: product.productUrl,
        product_image: product.productImage,
        is_rocket: product.isRocket,
        is_free_shipping: product.isFreeShipping,
        category_name: product.categoryName,
        
        metadata: {
          source: "coupang_partners" as const,
          selected_at: new Date().toISOString(),
          frontend_session_id: `session_${Date.now()}`,
          original_coupang_response: product
        }
      }));

      const response = await fetch('/api/v1/research/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          priority: 7,
          batch_options: {
            enable_price_tracking: true,
            compare_with_competitors: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      return result.job_id;

    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { startResearch, isLoading, error };
};
```

## 📝 요청 검증

### 필수 필드 검증
```typescript
const validateRequest = (items: EnhancedProductItemRequest[]) => {
  for (const item of items) {
    if (!item.product_name || item.product_name.length > 500) {
      throw new Error('제품명은 1-500자 사이여야 합니다.');
    }
    if (!item.category || item.category.length > 100) {
      throw new Error('카테고리는 1-100자 사이여야 합니다.');
    }
    if (!item.price_exact || item.price_exact <= 0) {
      throw new Error('가격은 양수여야 합니다.');
    }
  }
  
  if (items.length > 10) {
    throw new Error('한 번에 최대 10개 제품까지 처리할 수 있습니다.');
  }
};
```

---

이 예시들은 백엔드 API 변경사항이 구현된 후의 이상적인 사용법을 보여줍니다.