# 🛠️ Coupang Partners Auto-Blog SaaS

## 프로젝트 개요

쿠팡 파트너스 상품 검색, 딥링크 변환, SEO 최적화 블로그 자동생성, 워드프레스 초안 저장까지 원클릭으로 처리하는 SaaS 서비스입니다.

- **Next.js 15 + Zustand + shadcn/ui + Tailwind** 기반 프론트엔드
- **Supabase Edge Functions** 기반 백엔드
- **쿠팡 오픈API** 상품검색/딥링크/카테고리 연동
- **Perplexity API** 기반 LLM SEO 블로그 자동작성
- **LangGraph JS** 기반 자동화 워크플로우
- **검색 이력, 상태 영속화, 반응형 UI/UX**
- **TypeScript 기반 타입 안전성 및 API 일관성**

## 🏗️ 프로젝트 아키텍처

### 폴더 구조

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트 (일관된 응답 형식)
│   │   ├── products/      # 상품 관련 API
│   │   │   ├── search/    # 상품 검색 API
│   │   │   ├── deeplink/  # 딥링크 변환 API
│   │   │   └── bestcategories/ # 베스트 카테고리 API
│   │   └── README.md      # API 가이드
│   ├── auth/              # 인증 페이지
│   ├── login/             # 로그인 페이지
│   ├── product/           # 상품 페이지
│   ├── simple-test/       # LangGraph 노드 테스트 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   └── globals.css        # 전역 스타일
│
├── features/              # 도메인별 기능
│   ├── auth/              # 인증 기능
│   │   ├── components/    # 인증 관련 컴포넌트
│   │   ├── contexts/      # 인증 컨텍스트
│   │   ├── hooks/         # 인증 관련 훅
│   │   ├── types/         # 인증 타입 정의
│   │   └── utils/         # 인증 유틸리티
│   │
│   ├── product/           # 상품 기능
│   │   ├── components/    # 상품 관련 컴포넌트
│   │   ├── hooks/         # 상품 관련 훅
│   │   ├── types/         # 상품 타입 정의
│   │   └── utils/         # 상품 유틸리티
│   │
│   ├── search/            # 검색 기능
│   │   ├── components/    # 검색 관련 컴포넌트
│   │   ├── hooks/         # 검색 관련 훅
│   │   ├── types/         # 검색 타입 정의
│   │   └── utils/         # 검색 유틸리티
│   │
│   └── langgraph/         # LangGraph 자동화 시스템
│       ├── types/         # LangGraph 타입 정의
│       ├── nodes/         # LangGraph 노드들
│       │   ├── extract-ids.ts
│       │   ├── static-crawler.ts
│       │   ├── dynamic-crawler.ts
│       │   ├── fallback-llm.ts
│       │   ├── seo-agent.ts
│       │   └── wordpress-publisher.ts
│       ├── graphs/        # LangGraph 그래프 정의
│       │   └── main-graph.ts
│       ├── memory/        # 메모리 관리 전략
│       └── utils/         # LangGraph 유틸리티
│
├── shared/                # 공통 모듈
│   ├── ui/                # 재사용 가능한 UI 컴포넌트
│   ├── lib/               # 공통 라이브러리
│   │   └── api-utils.ts   # API 응답 정규화 유틸리티
│   ├── hooks/             # 공통 훅
│   ├── types/             # 공통 타입 정의
│   │   └── api.ts         # API 타입 정의
│   └── styles/            # 공통 스타일
│
├── infrastructure/        # 외부 서비스 연동
│   ├── api/               # API 클라이언트
│   │   ├── coupang.ts     # 쿠팡 상품 검색 API
│   │   ├── coupang-best-category.ts # 쿠팡 베스트 카테고리 API
│   │   ├── wordpress.ts   # WordPress REST API 클라이언트
│   │   ├── langgraph.ts   # LangGraph API 클라이언트
│   │   └── supabase.ts    # Supabase 클라이언트
│   ├── queue/             # 큐 시스템
│   │   └── worker.ts      # 큐 워커 클라이언트
│   ├── utils/             # 외부 서비스 유틸리티
│   │   └── coupang-hmac.ts # 쿠팡 HMAC 서명 생성
│   ├── auth/              # 인증 서비스
│   └── README.md          # Infrastructure 가이드
│
├── store/                 # 상태 관리
    └── searchStore.ts     # 검색 상태 관리 (Zustand)

backend/supabase/functions/
├── cache-gateway/         # 캐시 게이트웨이 Edge Function
├── queue-worker/          # 큐 워커 Edge Function
├── langgraph-api/         # LangGraph API Edge Function
└── README.md              # Edge Functions 가이드
```

### 아키텍처 패턴

**Next.js App Router + Feature-Based Architecture + LangGraph Workflow**를 채택했습니다:

- **Feature-First**: 도메인별 기능을 `features/` 폴더로 분리
- **LangGraph Integration**: 자동화 워크플로우를 `features/langgraph/` 폴더로 관리
- **Shared Modules**: 재사용 가능한 모듈을 `shared/` 폴더로 통합
- **Infrastructure Layer**: 외부 서비스 연동을 `infrastructure/` 폴더로 분리
- **API Consistency**: 모든 API가 일관된 응답 형식 사용
- **Type Safety**: TypeScript 기반 엄격한 타입 정의

### 주요 원칙

1. **도메인 분리**: 각 기능은 독립적인 도메인으로 관리
2. **워크플로우 자동화**: LangGraph를 통한 복잡한 비즈니스 로직 자동화
3. **재사용성**: 공통 모듈은 `shared/` 폴더에 배치
4. **확장성**: 새로운 기능 추가 시 `features/` 폴더에 추가
5. **타입 안전성**: TypeScript를 활용한 엄격한 타입 정의 (`any` 타입 제거)
6. **API 일관성**: 모든 API가 동일한 응답 형식 사용
7. **테스트 가능성**: 각 레이어별 독립적인 테스트 작성 가능

---

## 🔌 API 엔드포인트

### 일관된 응답 형식

모든 API는 `CoupangProductResponse` 인터페이스를 따르는 일관된 응답 형식을 사용합니다:

```typescript
interface CoupangProductResponse {
  productName: string;
  productImage: string;
  productPrice: number;
  productUrl: string;
  productId: number;
  isRocket: boolean;
  isFreeShipping: boolean;
  categoryName: string;
}
```

### API 목록

1. **상품 검색 API**
   - `POST /api/products/search`
   - 입력: `{ keyword: string, limit?: number }`
   - 출력: `CoupangProductResponse[]`

2. **베스트 카테고리 상품 API**
   - `POST /api/products/bestcategories`
   - 입력: `{ categoryId: string, limit?: number, imageSize?: string }`
   - 출력: `CoupangProductResponse[]`

3. **딥링크 변환 API**
   - `POST /api/products/deeplink`
   - 입력: `{ urls: string[] }`
   - 출력: `DeepLinkResponse[]`
   ```json
   [
     {
       "originalUrl": "https://www.coupang.com/vp/products/4589310169?itemId=5639449741",
       "shortenUrl": "https://link.coupang.com/a/cFWt0G",
       "landingUrl": "https://link.coupang.com/re/AFFSDP?lptag=AF7133746&pageKey=4589310169&itemId=5639449741&traceid=..."
     }
   ]
   ```

4. **LangGraph API** (Edge Function)
   - `POST /api/langgraph/execute` - 그래프 실행
   - `POST /api/langgraph/resume` - 체크포인트에서 재개
   - `GET /api/langgraph/status/:threadId` - 실행 상태 조회

5. **Cache Gateway API** (Edge Function)
   - `POST /api/cache-gateway` - 캐시 확인 및 큐 작업 추가

6. **Queue Worker API** (Edge Function)
   - `POST /api/queue-worker` - 큐 작업 처리

---

## 전체 플로우

```mermaid
graph TD
A[키워드/카테고리/링크 입력] --> B[상품 검색 API]
B --> C[일관된 응답 형식으로 변환]
C --> D[딥링크 변환 API]
D --> E[딥링크 리스트 반환]
E --> F[LangGraph 자동화 시스템]
F --> G[Cache Gateway]
G --> H[Scrape Graph]
H --> I[SEO Writer Agent]
I --> J[WordPress Publisher]
J --> K[WordPress 초안 저장]
```

---

## 주요 기능

- **키워드/카테고리/링크 기반 상품 검색**
  - 쿠팡 오픈API 상품검색, 카테고리별 베스트 상품, 직접 링크 입력 지원
- **딥링크 일괄 변환**
- **LangGraph 기반 자동화 시스템**
  - 딥링크 → 상품 정보 크롤링 → SEO 콘텐츠 생성 → WordPress 발행
- **SEO 최적화 블로그 자동작성 (Perplexity API)**
- **검색 이력/상태 영속화 (Zustand + localStorage)**
- **카테고리/가격/로켓배송/무료배송/필터링**
  - 카테고리별 셀렉트, 이미지 사이즈/비율, limit, 가격대(프리셋/직접입력), 로켓/무료배송 뱃지, 실시간 필터링
- **반응형 UI/UX**
  - 그리드/리스트 뷰, 검색 이력 모달, 카드 디자인, 전체선택, 수정 등
- **검색 이력 삭제/상세 모달**
- **타입 안전성**: `any` 타입 제거, 명시적 타입 정의
- **API 일관성**: 모든 API가 동일한 응답 형식 사용

---

## 🛠️ 기술 스택

### 프론트엔드
- **Next.js 15**: App Router 기반 SSR/SSG
- **TypeScript**: 엄격한 타입 정의 및 타입 안전성
- **Zustand**: 상태 관리 (검색 결과, 이력, 설정)
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **shadcn/ui**: 재사용 가능한 UI 컴포넌트
- **React Hook Form**: 폼 상태 관리

### 백엔드
- **Supabase**: 데이터베이스, 인증, 실시간 기능
- **Supabase Edge Functions**: 서버리스 함수
- **쿠팡 오픈API**: 상품 검색, 딥링크 변환
- **Perplexity API**: LLM 기반 블로그 자동 생성
- **WordPress REST API**: 블로그 포스트 발행
- **Redis**: 캐싱, 체크포인트, 큐 시스템

### 자동화 시스템
- **LangGraph JS**: 워크플로우 자동화 프레임워크
- **Cheerio**: 정적 HTML 파싱
- **Playwright**: 동적 웹 크롤링 (구현 예정)

### 개발 도구
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Vitest**: 단위 테스트
- **Playwright**: E2E 테스트

---

## 개발 단계

- [x] 상품 검색 API 구현
- [x] 딥링크 변환 API 구현
- [x] SEO 블로그 자동생성 API 구현
- [x] 카테고리/가격/로켓/무료배송/필터/검색이력 등 프론트 UX 개선
- [x] **API 일관성 개선** - 모든 API가 동일한 응답 형식 사용
- [x] **타입 안전성 강화** - `any` 타입 제거, 명시적 타입 정의
- [x] **Infrastructure 정리** - 외부 API 클라이언트 구조화
- [x] **딥링크 API 수정** - 쿠팡 API 실제 응답 구조에 맞게 수정
- [x] **LangGraph 통합 준비** - 프로젝트 상태 분석 및 아키텍처 설계
- [x] **LangGraph 노드 구현** - extractIds, staticCrawler, dynamicCrawler, fallbackLLM, seoAgent, wordpressPublisher 노드 구현
- [x] **LangGraph 노드 테스트** - 브라우저 기반 노드 테스트 완료
- [ ] **메모리 관리 구현** - RedisSaver, MemorySaver, Cross-thread KV 구현
- [ ] **프론트엔드 통합** - 기존 CP9 UI에 LangGraph 기반 자동화 플로우 통합
- [ ] **E2E 테스트 및 최적화** - 전체 플로우 E2E 테스트, 성능 최적화, 오류 처리 개선
- [ ] 워드프레스 초안 저장 기능
- [ ] E2E/유닛 테스트, 배포 자동화

---

## 🚀 개발 가이드

### 새로운 기능 추가하기

1. **새로운 도메인 기능 추가**
   ```bash
   # features 폴더에 새로운 도메인 생성
   mkdir -p src/features/new-feature/{components,hooks,types,utils}
   ```

2. **공통 컴포넌트 추가**
   ```bash
   # shared/ui 폴더에 재사용 가능한 컴포넌트 추가
   touch src/shared/ui/NewComponent.tsx
   ```

3. **외부 서비스 연동**
   ```bash
   # infrastructure 폴더에 API 클라이언트 추가
   touch src/infrastructure/api/new-service.ts
   ```

4. **새로운 API 추가**
   ```bash
   # API 라우트 추가
   mkdir -p src/app/api/new-feature
   touch src/app/api/new-feature/route.ts
   
   # 타입 정의 추가
   # src/shared/types/api.ts에 타입 추가
   ```

5. **LangGraph 노드 추가**
   ```bash
   # LangGraph 노드 추가
   touch src/features/langgraph/nodes/new-node.ts
   
   # 그래프에 노드 통합
   # src/features/langgraph/graphs/main-graph.ts 수정
   ```

### 코딩 컨벤션

- **파일명**: PascalCase (컴포넌트), camelCase (함수, 변수)
- **폴더명**: kebab-case
- **타입 정의**: 각 도메인별로 `types/` 폴더에 정의
- **API 응답**: `CoupangProductResponse` 인터페이스 준수
- **타입 안전성**: `any` 타입 사용 금지, 명시적 타입 정의
- **테스트**: 각 기능과 동일한 구조로 `__tests__/` 폴더에 배치
- **LangGraph 노드**: `'use server'` 지시어 사용, 서버 사이드에서만 실행

### API 개발 가이드

새로운 API를 추가할 때 다음 사항을 확인하세요:

1. **타입 정의**: `src/shared/types/api.ts`에 요청/응답 타입 정의
2. **응답 형식**: `CoupangProductResponse` 인터페이스 준수 (딥링크 API 제외)
3. **오류 처리**: 일관된 오류 처리 패턴 적용
4. **환경 변수**: 필수 환경 변수 검증
5. **문서화**: JSDoc 주석 작성

#### 딥링크 API 특별 처리

딥링크 API는 상품 정보를 포함하지 않고 딥링크 URL만 반환하므로 별도 처리:

```typescript
// 딥링크 API 응답 처리
const deeplinkResults: DeepLinkResponse[] = deeplinkList.map(normalizeDeepLinkResponse);
```

#### 일반 상품 API 응답 처리

상품 정보를 포함하는 API는 표준 형식 사용:

```typescript
// 예시: 새로운 API 라우트
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

---

## 🔧 환경 설정

### 필수 환경 변수

```bash
# .env.local

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 쿠팡 파트너스 API
COUPANG_ACCESS_KEY=your_coupang_access_key
COUPANG_SECRET_KEY=your_coupang_secret_key

# Perplexity API
PERPLEXITY_API_KEY=your_perplexity_api_key

# WordPress 설정
WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_PASSWORD=your_wordpress_application_password
WORDPRESS_DEFAULT_STATUS=draft
WORDPRESS_CATEGORIES=1,2,3
WORDPRESS_TAGS=쿠팡,상품,리뷰

# LangGraph 설정
NEXT_PUBLIC_LANGGRAPH_API_URL=/api/langgraph
LANGGRAPH_REDIS_URL=your_redis_url
LANGGRAPH_QUEUE_NAME=langgraph-queue
LANGGRAPH_MAX_CONCURRENCY=5

# Redis 설정 (Supabase Edge Functions용)
REDIS_URL=your_redis_url
REDIS_PASSWORD=your_redis_password
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 테스트 실행
npm run test

# LangGraph 노드 테스트
# 브라우저에서 http://localhost:3000/simple-test 접속
```

---

## 🚀 LangGraph 기반 자동화 시스템

### 전체 플로우
```mermaid
graph TD
A[딥링크 입력] --> B[extractIds]
B --> C{상품 ID 추출 성공?}
C -->|Yes| D[staticCrawler]
C -->|No| END
D --> E{정적 크롤링 성공?}
E -->|Yes| F[seoAgent]
E -->|No| G[dynCrawler]
G --> H{동적 크롤링 성공?}
H -->|Yes| F
H -->|No| I[fallbackLLM]
I --> J{LLM 보강 성공?}
J -->|Yes| F
J -->|No| END
F --> K{SEO 콘텐츠 생성 성공?}
K -->|Yes| L[wordpressPublisher]
K -->|No| END
L --> M{포스트 발행 성공?}
M -->|Yes| END
M -->|No| END
```

### 핵심 노드 및 기능

#### 1. **extractIds 노드**
- 쿠팡 URL에서 상품 ID 추출
- 정규표현식을 사용한 패턴 매칭
- 실패 시 프로세스 종료

#### 2. **staticCrawler 노드**
- Cheerio를 사용한 정적 HTML 파싱
- 상품명, 가격, 이미지, 카테고리 등 기본 정보 추출
- 성공 시 SEO Agent로 진행, 실패 시 동적 크롤링으로 폴백

#### 3. **dynamicCrawler 노드**
- Playwright를 사용한 동적 웹 크롤링 (구현 예정)
- JavaScript 렌더링 후 상품 정보 추출
- 성공 시 SEO Agent로 진행, 실패 시 LLM 보강으로 폴백

#### 4. **fallbackLLM 노드**
- Perplexity API를 사용한 상품 정보 보강
- 크롤링 실패 시 대체 정보 생성
- 상품 특징, 장점, 타겟 고객층 등 상세 정보 제공

#### 5. **seoAgent 노드**
- ReAct 패턴을 사용한 SEO 콘텐츠 생성
- Think → Act → Observe → Reflect 순서로 진행
- 제목, 본문, 키워드, 요약 자동 생성

#### 6. **wordpressPublisher 노드**
- WordPress REST API를 사용한 포스트 발행
- 중복 게시 방지 (product_id 메타데이터, 제목 유사도)
- 기존 포스트 업데이트 또는 새 포스트 생성

### LangGraph 메모리 전략 (구현 예정)

#### 1. **RedisSaver**
- Scrape Graph 체크포인트 저장
- 장시간 실행되는 크롤링 작업의 상태 보존
- TTL 기반 자동 정리

#### 2. **MemorySaver**
- SEO Agent 대화 히스토리 요약
- 컨텍스트 윈도우 오버플로우 방지
- 토큰 제한 기반 메모리 관리

#### 3. **Cross-thread KV**
- 중복 게시 방지를 위한 크로스 스레드 저장소
- Redis 기반 키-값 저장소
- 상품 ID별 발행 이력 추적

### 배포 방식

#### 1. **GitHub 연동 (권장)**
```bash
# Supabase Dashboard → Settings → Git integration
# GitHub 저장소 연결 후 브랜치 선택
# backend/supabase/functions/ 폴더 변경사항 자동 감지
git add .
git commit -m "feat: LangGraph Edge Functions 업데이트"
git push origin main
```

#### 2. **Supabase CLI (로컬 개발용)**
```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 개발 환경 설정
supabase init
supabase start

# Edge Functions 배포
supabase functions deploy cache-gateway
supabase functions deploy queue-worker
supabase functions deploy langgraph-api
```

### 테스트 방법

#### 1. **개별 노드 테스트**
```bash
# 브라우저에서 테스트 페이지 접속
http://localhost:3000/simple-test

# 각 노드별 테스트 버튼 클릭
# JSON 결과 확인
```

#### 2. **전체 플로우 테스트**
```bash
# LangGraph API 호출
curl -X POST http://localhost:3000/api/langgraph/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "urls": ["https://www.coupang.com/vp/products/123456"],
      "keyword": "테스트"
    }
  }'
```

## 참고/확장 예정

- 쿠팡 오픈API 공식문서: https://developers.coupang.com/
- LangGraph JS 공식문서: https://langchain-ai.github.io/langgraph/
- Perplexity API 문서: https://docs.perplexity.ai/
- WordPress REST API 문서: https://developer.wordpress.org/rest-api/
- 카테고리별 상품 랭킹, 다양한 필터, 멀티채널 발행, A/B 프롬프트, CLI 등 확장 가능
- **향후 계획**: 메모리 관리 구현, 프론트엔드 통합, E2E 테스트, 성능 최적화, 모니터링 시스템 