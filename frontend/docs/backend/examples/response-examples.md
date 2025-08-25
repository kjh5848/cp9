# 📤 백엔드 API 응답 예시

쿠팡 제품 정보가 포함된 백엔드 API 응답 구조 및 활용 방안 예시입니다.

## 📋 TypeScript 타입 정의

```typescript
// 기존 응답 타입 (수정 전)
interface ProductResult {
  product_name: string;
  brand: string;
  category: string;
  model_or_variant: string;
  price_exact: number;
  currency: string;
  seller_or_store?: string;
  deeplink_or_product_url?: string;
  specs: ProductSpecs;
  reviews: ProductReviews;
  sources: string[];
  captured_at: string;
  status: 'success' | 'error';
  error_message?: string;
  missing_fields: string[];
  suggested_queries: string[];
}

// 확장된 응답 타입 (실제 쿠팡 API 기준)
interface EnhancedProductResult extends ProductResult {
  coupang_info?: {
    productId?: number;            // 실제: productId (number)
    productUrl?: string;           // 실제: productUrl
    productImage?: string;         // 실제: productImage
    isRocket?: boolean;            // 실제: isRocket
    isFreeShipping?: boolean;      // 실제: isFreeShipping
    categoryName?: string;         // 실제: categoryName
    productPrice?: number;         // 실제: productPrice
    price_comparison?: {
      coupang_current_price: number;
      price_difference: number;
      price_change_percent: number;
    }
  };
}
```

## 🎯 시나리오별 응답 예시

### 1. 단일 제품 성공 응답

```json
{
  "job_id": "research_abc123def456",
  "status": "success",
  "results": [
    {
      "product_name": "삼성전자 갤럭시 버드3 프로",
      "brand": "삼성전자",
      "category": "이어폰/헤드폰",
      "model_or_variant": "Galaxy Buds3 Pro",
      "price_exact": 189000,
      "currency": "KRW",
      "seller_or_store": "쿠팡",
      "deeplink_or_product_url": "https://link.coupang.com/a/bVnqQR",
      
      "coupang_info": {
        "productId": 7582946,
        "productUrl": "https://www.coupang.com/vp/products/7582946",
        "productImage": "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2024/07/10/11/0/c2f8e8d4-8b2e-4f7e-9c84-7a3b9e5f8d12.jpg",
        "isRocket": true,
        "isFreeShipping": true,
        "categoryName": "이어폰/헤드폰",
        "productPrice": 189000,
        "price_comparison": {
          "coupang_current_price": 185000,
          "price_difference": 4000,
          "price_change_percent": 2.1
        }
      },
      
      "specs": {
        "main": [
          "ANC(액티브 노이즈 캐슬링) 지원",
          "블루투스 5.4 연결",
          "최대 6시간 연속 재생",
          "케이스 포함 총 30시간 사용",
          "IPX7 방수 등급"
        ],
        "attributes": [
          {
            "name": "연결방식",
            "value": "블루투스 5.4"
          },
          {
            "name": "방수등급", 
            "value": "IPX7"
          },
          {
            "name": "색상",
            "value": "실버, 화이트"
          }
        ],
        "size_or_weight": "이어버드: 5.4g, 케이스: 59.1g",
        "options": ["실버", "화이트"],
        "included_items": ["이어버드", "충전케이스", "이어팁(S,M,L)", "USB-C 케이블"]
      },
      
      "reviews": {
        "rating_avg": 4.3,
        "review_count": 1247,
        "summary_positive": [
          "뛰어난 노이즈 캐슬링 성능",
          "편안한 착용감",
          "깨끗한 음질",
          "빠른 충전 속도"
        ],
        "summary_negative": [
          "가격이 다소 비쌈",
          "케이스가 다소 큼",
          "터치 감도 조절 필요"
        ],
        "notable_reviews": [
          {
            "source": "쿠팡 구매후기",
            "quote": "노이즈 캐슬링이 정말 좋아요. 지하철에서도 조용합니다.",
            "url": "https://www.coupang.com/vp/products/7582946#review_123"
          }
        ]
      },
      
      "sources": [
        "https://www.samsung.com/sec/audio-sound/galaxy-buds/galaxy-buds3-pro/",
        "https://www.coupang.com/vp/products/7582946",
        "https://blog.naver.com/review-galaxy-buds3-pro"
      ],
      "captured_at": "2024-08-23",
      "status": "success",
      "missing_fields": [],
      "suggested_queries": [
        "삼성 갤럭시 버드3 프로 vs 에어팟 프로",
        "갤럭시 버드3 프로 사용법"
      ]
    }
  ],
  "metadata": {
    "total_items": 1,
    "successful_items": 1,
    "failed_items": 0,
    "success_rate": 1.0,
    "processing_time_ms": 4230,
    "created_at": "2024-08-23T10:30:00Z",
    "updated_at": "2024-08-23T10:30:04Z",
    "started_at": "2024-08-23T10:30:00Z",
    "completed_at": "2024-08-23T10:30:04Z"
  }
}
```

### 2. 다중 제품 성공 응답 (노트북 비교)

```json
{
  "job_id": "research_def456ghi789",
  "status": "success",
  "results": [
    {
      "product_name": "레노버 IdeaPad Slim 1",
      "brand": "레노버",
      "category": "노트북",
      "model_or_variant": "IdeaPad Slim 1 14IAU7",
      "price_exact": 298000,
      "currency": "KRW",
      "seller_or_store": "쿠팡",
      "deeplink_or_product_url": "https://link.coupang.com/a/bVnqQS",
      
      "coupang_info": {
        "productId": 1234567,
        "productUrl": "https://www.coupang.com/vp/products/1234567",
        "productImage": "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/lenovo-ideapad.jpg",
        "isRocket": true,
        "isFreeShipping": false,
        "categoryName": "노트북",
        "productPrice": 298000,
        "price_comparison": {
          "coupang_current_price": 295000,
          "price_difference": 3000,
          "price_change_percent": 1.0
        }
      },
      
      "specs": {
        "main": [
          "Intel Celeron N4020 프로세서",
          "4GB DDR4 메모리",
          "128GB eMMC 저장장치",
          "14인치 FHD 디스플레이",
          "Windows 11 Home"
        ],
        "attributes": [
          {
            "name": "화면크기",
            "value": "14인치"
          },
          {
            "name": "해상도",
            "value": "1920 x 1080 (FHD)"
          }
        ],
        "size_or_weight": "324.9 x 215.7 x 17.9mm, 1.3kg",
        "options": ["그레이"],
        "included_items": ["노트북", "어댑터", "사용설명서"]
      },
      
      "reviews": {
        "rating_avg": 4.1,
        "review_count": 892,
        "summary_positive": [
          "가격 대비 훌륭한 성능",
          "가벼운 무게",
          "조용한 팬 소음"
        ],
        "summary_negative": [
          "저장공간 부족",
          "성능 한계",
          "포트 부족"
        ],
        "notable_reviews": []
      },
      
      "sources": ["https://www.lenovo.com/kr/ko/laptops/ideapad/"],
      "captured_at": "2024-08-23",
      "status": "success",
      "missing_fields": [],
      "suggested_queries": []
    },
    {
      "product_name": "ASUS VivoBook 15",
      "brand": "ASUS",
      "category": "노트북", 
      "model_or_variant": "X1504ZA",
      "price_exact": 359000,
      "currency": "KRW",
      "seller_or_store": "쿠팡",
      "deeplink_or_product_url": "https://link.coupang.com/a/bVnqQT",
      
      "coupang_info": {
        "productId": 2345678,
        "productUrl": "https://www.coupang.com/vp/products/2345678",
        "productImage": "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/asus-vivobook.jpg",
        "isRocket": false,
        "isFreeShipping": true,
        "categoryName": "노트북",
        "productPrice": 359000,
        "price_comparison": {
          "coupang_current_price": 359000,
          "price_difference": 0,
          "price_change_percent": 0.0
        }
      },
      
      "specs": {
        "main": [
          "Intel Core i3-1215U 프로세서",
          "8GB DDR4 메모리",
          "256GB SSD 저장장치",
          "15.6인치 FHD 디스플레이"
        ],
        "attributes": [
          {
            "name": "화면크기",
            "value": "15.6인치"
          }
        ],
        "size_or_weight": "35.9 x 23.2 x 1.99cm, 1.7kg",
        "options": ["실버"],
        "included_items": ["노트북", "어댑터"]
      },
      
      "reviews": {
        "rating_avg": 4.0,
        "review_count": 567,
        "summary_positive": [
          "넉넉한 화면 크기",
          "SSD로 빠른 부팅",
          "적당한 성능"
        ],
        "summary_negative": [
          "무게가 다소 무거움",
          "배터리 지속시간 부족"
        ],
        "notable_reviews": []
      },
      
      "sources": ["https://www.asus.com/kr/laptops/for-home/vivobook/"],
      "captured_at": "2024-08-23",
      "status": "success",
      "missing_fields": [],
      "suggested_queries": []
    }
  ],
  "metadata": {
    "total_items": 3,
    "successful_items": 2,
    "failed_items": 1,
    "success_rate": 0.67,
    "processing_time_ms": 8945,
    "created_at": "2024-08-23T10:35:00Z",
    "updated_at": "2024-08-23T10:35:09Z",
    "started_at": "2024-08-23T10:35:00Z",
    "completed_at": "2024-08-23T10:35:09Z"
  }
}
```

### 3. 부분 실패 응답

```json
{
  "job_id": "research_ghi789jkl012",
  "status": "success",
  "results": [
    {
      "product_name": "알 수 없는 제품",
      "brand": "",
      "category": "기타",
      "model_or_variant": "",
      "price_exact": 99000,
      "currency": "KRW",
      "seller_or_store": "쿠팡",
      
      "coupang_info": {
        "productId": 9999999,
        "productUrl": "https://www.coupang.com/vp/products/9999999",
        "productImage": "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/no-image.jpg",
        "isRocket": false,
        "isFreeShipping": false,
        "categoryName": "기타",
        "productPrice": 99000
      },
      
      "specs": {
        "main": [],
        "attributes": [],
        "options": [],
        "included_items": []
      },
      
      "reviews": {
        "rating_avg": 0,
        "review_count": 0,
        "summary_positive": [],
        "summary_negative": [],
        "notable_reviews": []
      },
      
      "sources": [],
      "captured_at": "2024-08-23",
      "status": "error",
      "error_message": "제품 정보를 찾을 수 없습니다. 제품명이 너무 모호하거나 존재하지 않는 제품일 수 있습니다.",
      "missing_fields": ["brand", "specs", "reviews"],
      "suggested_queries": [
        "더 구체적인 제품명으로 검색해 보세요",
        "브랜드명을 포함해서 검색해 보세요"
      ]
    }
  ],
  "metadata": {
    "total_items": 1,
    "successful_items": 0,
    "failed_items": 1,
    "success_rate": 0.0,
    "processing_time_ms": 2100,
    "created_at": "2024-08-23T11:00:00Z",
    "updated_at": "2024-08-23T11:00:02Z",
    "started_at": "2024-08-23T11:00:00Z",
    "completed_at": "2024-08-23T11:00:02Z"
  }
}
```

### 4. 진행 상태 응답

```json
{
  "job_id": "research_mno345pqr678",
  "status": "processing",
  "progress": 0.6,
  "message": "제품 정보 분석 중... (3/5 완료)",
  "metadata": {
    "current_item": "iPhone 15 Pro 128GB",
    "completed_items": 3,
    "total_items": 5,
    "estimated_completion": "2024-08-23T11:02:30Z"
  }
}
```

## 🎨 프론트엔드 활용 방안

### 1. 갤러리 카드에서 활용

```typescript
const GalleryCard = ({ product }: { product: EnhancedProductResult }) => {
  return (
    <div className="gallery-card">
      {/* 쿠팡 원본 이미지 사용 */}
      <img 
        src={product.coupang_info?.productImage || '/default-image.jpg'} 
        alt={product.product_name}
      />
      
      {/* 제품 정보 */}
      <h3>{product.product_name}</h3>
      <p>{product.brand}</p>
      
      {/* 가격 정보 */}
      <div className="price-info">
        <span className="original-price">₩{product.price_exact.toLocaleString()}</span>
        {product.coupang_info?.price_comparison && (
          <span className="current-price">
            현재가: ₩{product.coupang_info.price_comparison.coupang_current_price.toLocaleString()}
          </span>
        )}
      </div>
      
      {/* 배지들 */}
      <div className="badges">
        {product.coupang_info?.isRocket && (
          <span className="rocket-badge">🚀 로켓배송</span>
        )}
        {product.coupang_info?.isFreeShipping && (
          <span className="shipping-badge">🚚 무료배송</span>
        )}
      </div>
      
      {/* 링크 버튼들 */}
      <div className="action-buttons">
        <a href={product.coupang_info?.productUrl} target="_blank">
          쿠팡에서 보기
        </a>
        <a href={product.deeplink_or_product_url} target="_blank">
          파트너스 링크
        </a>
      </div>
    </div>
  );
};
```

### 2. 상세 페이지에서 활용

```typescript
const ProductDetail = ({ product }: { product: EnhancedProductResult }) => {
  return (
    <div className="product-detail">
      {/* 헤더 섹션 */}
      <div className="product-header">
        <img src={product.coupang_info?.productImage} />
        <div>
          <h1>{product.product_name}</h1>
          <p>{product.brand} • {product.model_or_variant}</p>
          
          {/* 가격 비교 */}
          {product.coupang_info?.price_comparison && (
            <div className="price-comparison">
              <div className="original">요청가: ₩{product.price_exact.toLocaleString()}</div>
              <div className="current">현재가: ₩{product.coupang_info.price_comparison.coupang_current_price.toLocaleString()}</div>
              <div className={`change ${product.coupang_info.price_comparison.price_difference > 0 ? 'up' : 'down'}`}>
                {product.coupang_info.price_comparison.price_change_percent.toFixed(1)}% 
                {product.coupang_info.price_comparison.price_difference > 0 ? '상승' : '하락'}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* AI 분석 결과 */}
      <div className="ai-analysis">
        <h2>AI 분석 결과</h2>
        
        {/* 스펙 정보 */}
        <div className="specs">
          <h3>주요 스펙</h3>
          <ul>
            {product.specs.main.map(spec => <li key={spec}>{spec}</li>)}
          </ul>
        </div>
        
        {/* 리뷰 요약 */}
        <div className="reviews-summary">
          <h3>리뷰 요약</h3>
          <div className="positive">
            <h4>👍 장점</h4>
            <ul>
              {product.reviews.summary_positive.map(point => 
                <li key={point}>{point}</li>
              )}
            </ul>
          </div>
          <div className="negative">
            <h4>👎 단점</h4>
            <ul>
              {product.reviews.summary_negative.map(point => 
                <li key={point}>{point}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 3. 에러 처리

```typescript
const handleAPIResponse = (response: EnhancedProductResult) => {
  if (response.status === 'error') {
    // 에러 메시지 표시
    toast.error(`${response.product_name}: ${response.error_message}`);
    
    // 제안된 쿼리 표시
    if (response.suggested_queries.length > 0) {
      console.log('다음 검색어를 시도해보세요:', response.suggested_queries);
    }
    
    return null;
  }
  
  // 누락된 필드 경고
  if (response.missing_fields.length > 0) {
    console.warn('누락된 정보:', response.missing_fields);
  }
  
  return response;
};
```

---

이 응답 예시들은 백엔드 API 변경사항이 구현된 후의 이상적인 응답 구조를 보여줍니다.