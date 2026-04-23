# API 라우트 가이드

이 폴더는 Next.js App Router의 API 라우트들을 포함합니다.

## 📁 폴더 구조

```
api/
├── products/
│   ├── search/           # 상품 검색 API
│   ├── bestcategories/   # 베스트 카테고리 상품 API
│   └── deeplink/         # 딥링크 변환 API
└── README.md            # 이 파일
```

## 🔌 API 엔드포인트

### 1. 상품 검색 API
- **경로**: `/api/products/search`
- **메서드**: `POST`
- **요청**:
  ```json
  {
    "keyword": "노트북",
    "limit": 10
  }
  ```
- **응답**:
  ```json
  [
    {
      "productName": "상품명",
      "productImage": "이미지URL",
      "productPrice": 100000,
      "productUrl": "상품URL",
      "productId": 12345,
      "isRocket": true,
      "isFreeShipping": false,
      "categoryName": "카테고리명"
    }
  ]
  ```

### 2. 베스트 카테고리 상품 API
- **경로**: `/api/products/bestcategories`
- **메서드**: `POST`
- **요청**:
  ```json
  {
    "categoryId": "1014",
    "limit": 20,
    "imageSize": "512x512"
  }
  ```
- **응답**: 상품 검색 API와 동일한 형식

### 3. 딥링크 변환 API
- **경로**: `/api/products/deeplink`
- **메서드**: `POST`
- **요청**:
  ```json
  {
    "urls": ["https://www.coupang.com/vp/products/..."]
  }
  ```
- **응답**:
  ```json
  [
    {
      "productName": "상품명",
      "productImage": "이미지URL",
      "productPrice": 100000,
      "productUrl": "원본URL",
      "productId": 12345,
      "isRocket": true,
      "isFreeShipping": false,
      "categoryName": "카테고리명",
      "deepLinkUrl": "변환된딥링크URL"
    }
  ]
  ```

## 🏗️ 아키텍처 원칙

### 1. 일관된 응답 형식
모든 API는 동일한 응답 형식을 사용합니다:
- `CoupangProductResponse` 인터페이스 준수
- 표준화된 필드명 사용
- 일관된 오류 처리

### 2. 타입 안전성
- TypeScript 타입 정의 사용
- 요청/응답 타입 검증
- 런타임 타입 안전성 보장

### 3. 오류 처리
- 일관된 오류 응답 형식
- 적절한 HTTP 상태 코드
- 명확한 오류 메시지

### 4. 환경 변수 검증
- 필수 환경 변수 검증
- 개발/프로덕션 환경 구분
- 안전한 기본값 설정

## 🔧 개발 가이드

### 새로운 API 추가하기

1. **폴더 생성**:
   ```bash
   mkdir -p src/app/api/new-feature
   ```

2. **route.ts 파일 생성**:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { normalizeCoupangProduct } from '@/shared/lib/api-utils';
   import { CoupangProductResponse } from '@/shared/types/api';

   export async function POST(req: NextRequest) {
     try {
       // API 로직 구현
       const result: CoupangProductResponse[] = data.map(normalizeCoupangProduct);
       return NextResponse.json(result);
     } catch (e: unknown) {
       const errorMessage = e instanceof Error ? e.message : '서버 오류';
       return NextResponse.json({ error: errorMessage }, { status: 500 });
     }
   }
   ```

3. **타입 정의 추가**:
   ```typescript
   // src/shared/types/api.ts
   export interface NewFeatureRequest {
     // 요청 타입 정의
   }
   ```

### 테스트 작성

```typescript
// src/app/api/__tests__/new-feature.test.ts
import { POST } from '../new-feature/route';

describe('New Feature API', () => {
  it('should return correct response format', async () => {
    const request = new Request('http://localhost:3000/api/new-feature', {
      method: 'POST',
      body: JSON.stringify({ /* test data */ }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data).toHaveProperty('productName');
    expect(data).toHaveProperty('productPrice');
    // ... 기타 필드 검증
  });
});
```

## 📋 체크리스트

새로운 API를 추가할 때 다음 사항을 확인하세요:

- [ ] 일관된 응답 형식 사용
- [ ] TypeScript 타입 정의
- [ ] 오류 처리 로직
- [ ] 환경 변수 검증
- [ ] JSDoc 주석 작성
- [ ] 테스트 코드 작성
- [ ] README 업데이트

## 🚨 주의사항

1. **보안**: 민감한 정보는 클라이언트에 노출하지 않음
2. **성능**: 적절한 캐싱 및 최적화 적용
3. **로깅**: 중요한 작업에 대한 로깅 추가
4. **검증**: 입력 데이터 검증 필수
5. **문서화**: API 사용법 명확히 문서화 