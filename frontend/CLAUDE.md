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
│   ├── components/        # 공통 복합 컴포넌트 (navbar 등)
│   ├── ui/               # 기본 UI 컴포넌트 (button, input, card)
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
- **shared/ui/**: 기본 UI 컴포넌트 (버튼, 인풋 등)
- **shared/components/**: 공통 복합 컴포넌트 (네비바 등)
- **features/{feature}/components/**: 특정 기능 전용 컴포넌트

## 🔧 개발 환경

### 기술 스택
- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
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

## 📝 컴포넌트 작성 가이드

### Import 순서
```typescript
// 1. 외부 라이브러리
import React from 'react'
import { NextPage } from 'next'

// 2. 내부 shared 리소스
import { Button } from '@/shared/ui/button'
import { useModal } from '@/shared/hooks/useModal'

// 3. 내부 features
import { useAuth } from '@/features/auth/hooks'

// 4. 상대 경로 imports
import './component.css'
```

### 컴포넌트 예시
```typescript
'use client'

import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
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
    <Card>
      <h2>{title}</h2>
      <Button onClick={onAction} disabled={isLoading}>
        실행
      </Button>
    </Card>
  )
}
```

## 🔄 최근 변경사항

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
- 🎯 **명확한 책임 분리**: 기능별 vs 공통 컴포넌트
- 🚀 **확장성 향상**: 새 기능 추가 시 일관된 구조
- 🧹 **중복 제거**: 동일한 UI 컴포넌트의 중복 해결
- 📚 **유지보수성**: 컴포넌트 위치 예측 가능

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
- `@/shared/ui/*`: 기본 UI 컴포넌트
- `@/shared/components/*`: 공통 복합 컴포넌트  
- `@/features/{기능}/components/*`: 기능별 컴포넌트

## 📞 지원

개발 중 문제가 발생하면 다음 순서로 확인:
1. 이 문서의 가이드라인 확인
2. TypeScript 에러 메시지 확인
3. 브라우저 개발자 도구 Console 확인
4. 기존 유사한 컴포넌트 구조 참고