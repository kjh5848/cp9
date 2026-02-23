---
name: api-integration
description: CP9 프로젝트의 외부 API(Coupang Partners, Supabase, Google OAuth) 연동 가이드입니다. 환경 변수 추가, Next.js 백엔드 API 라우트에서 외부 연동, 에러 핸들링 로직 작성, 혹은 HMAC 기반 인증 코드를 생성할 때 이 스킬의 패턴을 따르세요.
---

# API Integration

이 스킬 문서는 CP9 (Next.js 기반) 프로젝트에서 **Coupang Partners**, **Supabase**, **Google OAuth** 등의 외부 API를 연동할 때 지켜야 하는 필수 구현 패턴을 안내합니다.

## 필수 환경 변수 검증 (Required Environment Variables)

새로운 API 클라이언트를 연결할 때는 `.env.local` 변수를 사용하며 각 호출부 또는 헬퍼 파일에서 Null Check를 강제해야 합니다. 환경 변수 누락 시 단순히 서버 구동을 멈추거나 500을 뱉기보다는 명확하게 에러를 `throw` 하십시오.

```ts
const COUPANG_ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
const COUPANG_SECRET_KEY = process.env.COUPANG_SECRET_KEY;

if (!COUPANG_ACCESS_KEY || !COUPANG_SECRET_KEY) {
  throw new Error("Coupang API keys are missing. Check .env.local.");
}
```

## API 연동 필수 패턴 (API Integration Patterns)

### 1. Coupang Partners API
요청(Input) 파라미터와 응답(Output) 데이터 모델을 사전에 명확하게 타입화해야 합니다.

- **카테고리별 베스트 상품 조회** (POST `/api/products/bestcategories`): 
  - Input: `{ categoryId: string, limit?: number, imageSize?: string }`
  - Output: `CoupangBestCategoryProduct[]` 
- **키워드 상품 검색** (POST `/api/products/search`): `{ keyword: string, limit?: number }`
- **딥링크 변환** (POST `/api/products/deeplink`): `{ urls: string[] }` -> `{ originalUrl, deepLink }[]`

### 2. Supabase 클라이언트 구조
`@supabase/supabase-js` 라이브러리를 활용할 때 클라이언트 객체를 다음과 같이 구성합니다.
```ts
// src/infrastructure/api/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are missing.");
}

// Database 제네릭 타입을 통해 스키마 지원 활성화
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
```

### 3. 인증 서명 (HMAC Signature) 생성 패턴
Coupang Partners API처럼 추가 서명이 필요한 경우, Node.js 서버 환경이므로 기본 `crypto` 모듈을 권장합니다.
```ts
// src/infrastructure/utils/coupang-hmac.ts
import crypto from 'crypto';

export function generateCoupangSignature(method: string, path: string, secretKey: string, accessKey: string): string {
  const timestamp = Date.now().toString();
  const message = `${method} ${path}\n${timestamp}\n${accessKey}`;
  const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex');
  
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${timestamp}, signature=${signature}`;
}
```

## 예외 및 에러 핸들링 (Robust Error Handling)

백엔드 핸들러 등 요청 처리 시 `try-catch` 블록으로 외부 오류를 감지하고 상태 코드를 `500`으로 통일성 있게 리턴합니다. `e instanceof Error`를 활용해 안전하게 에러 메시지에 접근해야 합니다.

```ts
try {
  const products = await fetchCoupangBestCategory({ categoryId, limit, imageSize });
  return NextResponse.json(products);
} catch (e: unknown) {
  const errorMessage = e instanceof Error ? e.message : 'Server error';
  return NextResponse.json({ error: errorMessage }, { status: 500 });
}
```

## 작업 완료 전 셀프 체크리스트
- [ ] 환경 변수 누락 시 `throw Error`를 수행하는 검증 로직 작성 여부
- [ ] API Input/Output이 `interface` 또는 `type`으로 정의되었는가
- [ ] 쿠팡 파트너스 연동의 경우, HMAC SHA256 클라이언트 인증 코드가 안전하게 구성되었는가
- [ ] `catch (e: unknown)` 블록 내에서 `NextResponse.json({ error: ... }, { status: ... })` 포맷을 따랐는가
- [ ] (개발 환경용) 테스트를 위해 임시 키값을 적용하여 콘솔상 에러가 올바르게 호출되는지 확인했는가
