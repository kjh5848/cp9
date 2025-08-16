# CP9 Frontend - Claude 개발 가이드

## 프로젝트 개요

CP9는 쿠팡 파트너스 상품을 기반으로 AI가 자동으로 SEO 최적화된 블로그 포스트를 생성하는 SaaS 플랫폼입니다.

## 아키텍처 구조

### 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (home)/            # 홈페이지 라우트 그룹
│   ├── api/               # API 라우트들
│   ├── auth/              # 인증 관련 페이지
│   ├── login/             # 로그인 페이지
│   └── ...                # 기타 페이지들
├── shared/                # 🔄 전역 공유 리소스
│   ├── components/        # 공통 복합 컴포넌트
│   │   ├── navbar.tsx     # 네비게이션 바
│   │   ├── advanced-ui/   # 고급 UI 컴포넌트 (애니메이션, 인터랙티브)
│   │   └── index.ts       # 통합 export
│   ├── ui/               # 커스텀 기본 UI 컴포넌트
│   │   ├── button.tsx     # 커스텀 버튼
│   │   ├── card.tsx       # 커스텀 카드
│   │   ├── input.tsx      # 커스텀 입력
│   │   ├── label.tsx      # 커스텀 라벨
│   │   └── index.ts       # 기본 UI export
│   ├── hooks/            # 전역 훅
│   ├── lib/              # 유틸리티 함수
│   └── types/            # 공통 타입 정의
├── features/              # 🎯 기능별 모듈
│   ├── auth/             # 인증 기능
│   │   ├── components/   # 인증 전용 컴포넌트
│   │   ├── hooks/        # 인증 훅
│   │   ├── contexts/     # 인증 컨텍스트
│   │   ├── types/        # 인증 타입
│   │   └── utils/        # 인증 유틸리티
│   ├── product/          # 상품 관련 기능
│   │   ├── components/   # 상품 전용 컴포넌트
│   │   ├── hooks/        # 상품 관련 훅
│   │   ├── types/        # 상품 타입
│   │   └── utils/        # 상품 유틸리티
│   └── workflow/         # 워크플로우 기능
├── infrastructure/        # 🏗️ 인프라 레이어
│   ├── api/              # API 클라이언트
│   ├── cache/            # 캐시 관리
│   ├── queue/            # 큐 시스템
│   ├── scraping/         # 스크래핑 로직
│   └── utils/            # 인프라 유틸리티
└── store/                # 🗄️ 전역 상태 관리
```

### 🏛️ 아키텍처 원칙

#### 1. Feature-Based Architecture
- **기능별 모듈화**: 각 기능은 독립적인 폴더 구조
- **응집도 최대화**: 관련 있는 파일들은 같은 기능 폴더에 위치
- **결합도 최소화**: 기능 간 의존성 최소화

#### 2. 계층별 책임 분리
- **shared/**: 여러 기능에서 공통으로 사용하는 리소스
- **features/**: 특정 기능에만 사용되는 컴포넌트와 로직
- **infrastructure/**: 외부 시스템과의 연동 및 저수준 유틸리티
- **store/**: 전역 상태 관리

#### 3. 컴포넌트 분류 체계
- **shared/ui/**: 커스텀 기본 UI 컴포넌트 (버튼, 카드, 인풋, 라벨)
- **shared/components/advanced-ui/**: 고급 UI 컴포넌트 (애니메이션, 캐러셀, 슬라이드 패널)
- **shared/components/**: 복합 컴포넌트 (네비게이션 바 등)
- **features/{feature}/components/**: 특정 기능 전용 컴포넌트

## 🔧 개발 환경

### 기술 스택
- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Fully custom UI components (no shadcn/ui dependency)
- **State Management**: React Context + Custom Hooks
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL

### 설치 및 실행
```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 타입 체크
pnpm type-check

# 린트
pnpm lint
```

## 🛡️ TypeScript 타입 안전성 규칙

### 핵심 원칙
- **`any` 타입 절대 금지**: 모든 변수와 함수는 명시적 타입 정의 필수
- **인터페이스 우선**: 객체 구조는 인터페이스로 정의하여 재사용성 확보
- **Generic 활용**: 재사용 가능한 컴포넌트와 훅에는 Generic 타입 적극 활용
- **타입 가드 사용**: 런타임 타입 검증을 통한 안전한 타입 변환

### 타입 정의 체계
- **공통 타입**: `src/shared/types/` - 전역에서 사용하는 기본 타입들
- **기능별 타입**: `src/features/{기능}/types/` - 특정 기능에서만 사용하는 타입들
- **Infrastructure 타입**: `src/infrastructure/types/` - API 응답, 캐시, 큐 시스템 타입들

### 필수 타입 패턴

#### 1. 컴포넌트 Props 인터페이스
```typescript
interface ProductItemProps {
  item: ProductItem;
  onSelect: (item: ProductItem) => void;
  isSelected: boolean;
  loading?: boolean;
}
```

#### 2. API 응답 타입 정의
```typescript
interface DeepLinkResponse {
  productId?: string;
  url: string;
  originalUrl?: string;
  deepLink?: string;
  title?: string;
  price?: number;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}
```

#### 3. 상태 관리 타입
```typescript
interface ProductUIState {
  mode: 'link' | 'keyword' | 'category';
  itemCount: number;
  keywordInput: string;
  links: string;
  rocketOnly: boolean;
  sortOrder: 'asc' | 'desc' | 'none';
}
```

#### 4. Hook 반환 타입
```typescript
interface UseDeeplinkConversionReturn {
  links: string;
  setLinks: (value: string) => void;
  linkResults: DeepLinkResponse[];
  deeplinkResult: DeepLinkResponse[];
  handleLinkSubmit: (linksValue?: string) => Promise<void>;
  handleDeeplinkConvert: (selected: string[]) => void;
  loading: boolean;
}
```

#### 5. Infrastructure 타입
```typescript
interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
}

interface CacheConfig {
  ttl: number;
  prefix: string;
}
```

### 타입 안전성 검증 방법

#### 1. 배열 타입 검증
```typescript
// ❌ 잘못된 방법
const results: any[] = data;

// ✅ 올바른 방법
const results: ProductItem[] = Array.isArray(data) ? data : [];
```

#### 2. 타입 가드 활용
```typescript
function isProductItem(item: unknown): item is ProductItem {
  return typeof item === 'object' && 
         item !== null && 
         'productId' in item;
}

// 사용
if (isProductItem(data)) {
  // data는 이제 ProductItem 타입으로 안전하게 사용 가능
}
```

#### 3. Generic 컴포넌트
```typescript
interface GenericButtonProps<T> {
  value: T;
  onClick: (value: T) => void;
  children: React.ReactNode;
}

function GenericButton<T>({ value, onClick, children }: GenericButtonProps<T>) {
  return <button onClick={() => onClick(value)}>{children}</button>;
}
```

### 린트 및 타입 검사 설정
```json
// tsconfig.json 핵심 설정
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true
  }
}
```

### 타입 오류 해결 가이드

#### 1. `any` 타입 발견 시
```bash
# any 타입 사용처 검색
grep -r "any\[\]" src/
grep -r ": any" src/
```

#### 2. 타입 체크 명령어
```bash
# 전체 타입 체크
pnpm type-check

# 특정 파일 타입 체크
npx tsc --noEmit src/path/to/file.ts
```

#### 3. 프로덕션 빌드 전 검증
```bash
# 필수 검증 순서
pnpm type-check  # 타입 오류 확인
pnpm lint        # 코딩 스타일 검증
pnpm build       # 빌드 성공 확인
```

## 📝 컴포넌트 작성 가이드

### Import 순서
```typescript
// 1. 외부 라이브러리
import React from 'react'
import { NextPage } from 'next'

// 2. 내부 shared 리소스
import { Button, Card } from '@/shared/ui'
import { FadeInSection, Carousel } from '@/shared/components/advanced-ui'
import { useModal } from '@/shared/hooks/useModal'

// 3. 내부 features
import { useAuth } from '@/features/auth/hooks'

// 4. 상대 경로 imports
import './component.css'
```

### 컴포넌트 예시
```typescript
'use client'

import { Button, Card } from '@/shared/ui'
import { FadeInSection } from '@/shared/components/advanced-ui'
import { useAuth } from '@/features/auth/hooks'

interface MyComponentProps {
  title: string
  onAction: () => void
}

/**
 * 컴포넌트 설명
 * 
 * @param props - 컴포넌트 props
 * @returns JSX.Element
 */
export default function MyComponent({ title, onAction }: MyComponentProps) {
  const { user, isLoading } = useAuth()

  return (
    <FadeInSection>
      <Card>
        <h2>{title}</h2>
        <Button onClick={onAction} disabled={isLoading}>
          실행
        </Button>
      </Card>
    </FadeInSection>
  )
}
```

## 🔄 최근 변경사항

### 2024-08-16: UI 컴포넌트 구조 완전 재조직화
- **문제**: shadcn/ui 의존성과 커스텀 UI 혼재, 컴포넌트 분류 체계 불명확
- **해결**: 완전한 커스텀 UI 생태계 구축
- **변경사항**:
  - ✅ `shared/ui/` → 완전한 커스텀 기본 UI로 전환
  - ✅ `features/components/ui/` → `shared/components/advanced-ui/`로 이전
  - ✅ shadcn/ui 의존성 제거, 모든 UI 컴포넌트 프로젝트 특화
  - ✅ 체계적인 index.ts 관리 시스템 구축
  - ✅ 애니메이션, 인터랙티브 컴포넌트 통합 관리
  - ✅ 모든 import 경로 새로운 구조로 업데이트

### 2024-08-14: 컴포넌트 구조 리팩토링
- **문제**: `src/components`와 `src/shared` 간 중복, 일관성 없는 구조
- **해결**: Feature-based 아키텍처로 전환
- **변경사항**:
  - ✅ `src/components/common/navbar.tsx` → `src/shared/components/`
  - ✅ `src/components/auth/*` → `src/features/auth/components/`
  - ✅ `src/components/ui/*` 제거 (src/shared/ui 사용)
  - ✅ 모든 import 경로 자동 업데이트
  - ✅ 빈 components 디렉토리 제거

### 개선 효과
- 🎯 **완전한 커스텀 UI**: 모든 UI 컴포넌트가 프로젝트에 최적화
- 🏗️ **체계적 구조**: 기본 UI vs 고급 UI 명확한 분리
- 📦 **통합 관리**: index.ts를 통한 중앙집중식 export 시스템
- 🚀 **확장성**: 새 컴포넌트 추가 시 명확한 위치 가이드
- 🧹 **의존성 정리**: 외부 UI 라이브러리 의존성 제거
- 📚 **개발자 경험**: 일관된 import 패턴과 예측 가능한 구조

## 🎯 주요 기능

### 인증 시스템
- **Location**: `src/features/auth/`
- **Components**: LoginCard, LoginForm, AuthForm, AuthGuard
- **Hooks**: useAuth, useAuthForm
- **Provider**: Supabase Auth

### 상품 검색 및 분석
- **Location**: `src/features/product/`
- **Components**: ProductInput, ProductResultView, ActionModal
- **API**: 쿠팡 파트너스 API, 스크래핑 API

### AI 워크플로우
- **Location**: `src/features/workflow/`
- **Components**: WorkflowProgress
- **API**: LangGraph 기반 워크플로우

## 📋 개발 체크리스트

### 새 컴포넌트 생성 시
- [ ] 적절한 위치에 생성 (shared vs features)
- [ ] TypeScript 인터페이스 정의
- [ ] JSDoc 주석 작성
- [ ] 에러 처리 구현
- [ ] 테스트 작성 고려

### 새 기능 추가 시
- [ ] `src/features/{기능명}/` 폴더 생성
- [ ] components, hooks, types, utils 구조 생성
- [ ] index.ts에서 public API export
- [ ] 관련 문서 업데이트

## 🚨 주의사항

### 금지사항
- `src/components` 폴더 재생성 금지 (제거됨)
- Cross-feature 의존성 최소화
- Circular import 방지

### 권장사항
- 공통 컴포넌트는 shared에서 export
- 기능별 로직은 해당 feature 폴더에서만
- 절대 경로 import 사용 (@/* 패턴)

## 🔍 트러블슈팅

### 빌드 오류 시
```bash
# 타입 체크
pnpm type-check

# 의존성 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Import 오류 시
- `@/shared/ui`: 커스텀 기본 UI 컴포넌트 (Button, Card, Input, Label)
- `@/shared/components/advanced-ui`: 고급 UI 컴포넌트 (애니메이션, 캐러셀, 슬라이드 패널)
- `@/shared/components`: 복합 컴포넌트 (Navbar 등)
- `@/features/{기능}/components`: 기능별 전용 컴포넌트

### 새로운 Import 패턴
```typescript
// 기본 UI 컴포넌트
import { Button, Card, Input, Label } from '@/shared/ui'

// 고급 UI 컴포넌트
import { 
  FadeInSection, 
  Carousel, 
  GradientBackground,
  SlidePanel
} from '@/shared/components/advanced-ui'

// 복합 컴포넌트
import { Navbar } from '@/shared/components'
```

## 📞 지원

개발 중 문제가 발생하면 다음 순서로 확인:
1. 이 문서의 가이드라인 확인
2. TypeScript 에러 메시지 확인
3. 브라우저 개발자 도구 Console 확인
4. 기존 유사한 컴포넌트 구조 참고