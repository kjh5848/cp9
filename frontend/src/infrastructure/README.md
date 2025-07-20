# Infrastructure Layer

이 폴더는 애플리케이션의 인프라스트럭처 레이어를 담당합니다. 외부 API, 데이터베이스, 인증 등의 외부 서비스와의 통신을 담당합니다.

## 📁 폴더 구조

```
infrastructure/
├── api/                    # 외부 API 클라이언트
│   ├── coupang.ts         # 쿠팡 파트너스 API
│   ├── coupang-best-category.ts  # 쿠팡 베스트 카테고리 API
│   └── supabase.ts        # Supabase 클라이언트
├── utils/                  # 인프라스트럭처 유틸리티
│   └── coupang-hmac.ts    # 쿠팡 HMAC 서명 생성
├── auth/                   # 인증 관련 인프라스트럭처
└── README.md              # 이 파일
```

## 🔧 API 클라이언트

### 쿠팡 파트너스 API (`api/coupang.ts`)

쿠팡 파트너스 상품 검색 API를 호출하는 클라이언트입니다.

```typescript
import { searchCoupangProducts } from '@/infrastructure/api/coupang';

// 상품 검색
const products = await searchCoupangProducts('노트북', 10);
```

**주요 기능:**
- 상품 키워드 검색
- 환경 변수 검증
- HMAC 서명 자동 생성
- 오류 처리

### 쿠팡 베스트 카테고리 API (`api/coupang-best-category.ts`)

쿠팡 베스트 카테고리 상품 API를 호출하는 클라이언트입니다.

```typescript
import { fetchCoupangBestCategory } from '@/infrastructure/api/coupang-best-category';

// 카테고리 상품 검색
const products = await fetchCoupangBestCategory({
  categoryId: '1001',
  limit: 20,
  imageSize: '512x512'
});
```

**주요 기능:**
- 카테고리별 베스트 상품 조회
- 이미지 크기 설정
- 상품 수 제한
- 타입 안전성 보장

### Supabase 클라이언트 (`api/supabase.ts`)

Supabase 데이터베이스 클라이언트입니다.

```typescript
import { supabase } from '@/infrastructure/api/supabase';

// 데이터 조회
const { data, error } = await supabase
  .from('table_name')
  .select('*');
```

**주요 기능:**
- 데이터베이스 연결
- 인증 관리
- 실시간 구독
- 파일 스토리지

## 🛠️ 유틸리티

### 쿠팡 HMAC 서명 (`utils/coupang-hmac.ts`)

쿠팡 API 호출에 필요한 HMAC 서명을 생성하는 유틸리티입니다.

```typescript
import { generateCoupangSignature } from '@/infrastructure/utils/coupang-hmac';

const signature = generateCoupangSignature(
  'GET',
  '/v2/providers/affiliate_open_api/apis/openapi/products/search?keyword=노트북',
  secretKey,
  accessKey
);
```

**주요 기능:**
- SHA256 HMAC 서명 생성
- UTC 시간 기반 타임스탬프
- 쿠팡 API 표준 형식 준수

## 🔐 인증

### 인증 인프라스트럭처 (`auth/`)

인증 관련 인프라스트럭처를 담당합니다.

- OAuth 클라이언트 설정
- 토큰 관리
- 세션 처리

## 🏗️ 아키텍처 원칙

### 1. 관심사 분리
- 각 API 클라이언트는 단일 책임을 가집니다
- 비즈니스 로직과 인프라스트럭처 로직을 분리합니다

### 2. 타입 안전성
- 모든 API 응답에 대한 타입 정의
- 런타임 타입 검증
- TypeScript strict 모드 준수

### 3. 오류 처리
- 일관된 오류 처리 패턴
- 명확한 오류 메시지
- 적절한 HTTP 상태 코드

### 4. 환경 변수 관리
- 필수 환경 변수 검증
- 개발/프로덕션 환경 구분
- 안전한 기본값 설정

## 🔧 개발 가이드

### 새로운 API 클라이언트 추가하기

1. **파일 생성**:
   ```bash
   touch src/infrastructure/api/new-api.ts
   ```

2. **기본 구조**:
   ```typescript
   // src/infrastructure/api/new-api.ts
   import { generateSignature } from '../utils/signature';

   const API_KEY = process.env.NEW_API_KEY;
   const API_SECRET = process.env.NEW_API_SECRET;

   // 환경 변수 검증
   if (!API_KEY || !API_SECRET) {
     throw new Error('API 키가 설정되지 않았습니다.');
   }

   export async function callNewApi(params: NewApiParams): Promise<NewApiResponse> {
     // API 호출 로직
   }
   ```

3. **타입 정의**:
   ```typescript
   // src/shared/types/api.ts
   export interface NewApiParams {
     // 요청 파라미터 타입
   }

   export interface NewApiResponse {
     // 응답 타입
   }
   ```

### 테스트 작성

```typescript
// src/infrastructure/api/__tests__/new-api.test.ts
import { callNewApi } from '../new-api';

describe('New API', () => {
  it('should call API successfully', async () => {
    const result = await callNewApi({ /* test params */ });
    expect(result).toBeDefined();
  });
});
```

## 📋 체크리스트

새로운 인프라스트럭처 코드를 추가할 때 다음 사항을 확인하세요:

- [ ] 환경 변수 검증 로직 포함
- [ ] 타입 정의 추가
- [ ] 오류 처리 구현
- [ ] JSDoc 주석 작성
- [ ] 테스트 코드 작성
- [ ] README 업데이트

## 🚨 주의사항

1. **보안**: 민감한 정보는 환경 변수로 관리
2. **성능**: 적절한 캐싱 및 최적화 적용
3. **로깅**: 중요한 작업에 대한 로깅 추가
4. **검증**: 입력 데이터 검증 필수
5. **문서화**: API 사용법 명확히 문서화 