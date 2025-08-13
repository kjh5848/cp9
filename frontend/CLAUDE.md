# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 15** TypeScript project for the CP9 Coupang Partners Auto-Blog SaaS frontend. It's a React-based application with Supabase integration, AI workflow automation, and comprehensive testing setup.

## Development Commands

### Package Management
- `npm install` - Install dependencies
- `npm ci` - Install dependencies for CI/CD (uses package-lock.json)
- `npm update` - Update dependencies

### Build Commands
- `npm run dev` - Start Next.js development server (port 3000)
- `npm run build` - Build the project for production
- `npm run start` - Start production server
- `npm run lint` - Run Next.js ESLint

### Testing Commands
- `npm run test` - Run Vitest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report (80% threshold)
- `npm run test:ui` - Run tests with UI interface

### Code Quality Commands
- `npm run lint` - Run ESLint with Next.js configuration

## Technology Stack

### Core Technologies
- **Next.js 15.1.3** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Node.js** - Runtime environment (check version compatibility)

### Frameworks & Libraries
- **Supabase** - Backend as a Service (auth, database, edge functions)
- **LangChain/LangGraph** - AI workflow automation
- **Zustand** - State management
- **React Hook Form** - Form management
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui components** - Radix UI based components

### Testing Framework
- **Vitest** - Fast unit test framework
- **Testing Library** - React testing utilities
- **Playwright** - E2E testing (installed as dependency)
- **jsdom** - DOM implementation for testing

### Code Quality Tools
- **ESLint 9** - JavaScript/TypeScript linter with Next.js config
- **TypeScript** - Strict mode enabled

## Project Structure Guidelines

### File Organization
```
src/
├── app/                # Next.js App Router pages and API routes
│   ├── api/           # API route handlers (proxy to Supabase)
│   └── [page]/        # Page components
├── components/         # Common UI components
│   ├── auth/          # Authentication components
│   ├── common/        # Shared components (navbar, etc.)
│   ├── product/       # Product-related components
│   └── ui/            # Base UI components (shadcn/ui)
├── features/          # Feature-based modules (main business logic)
│   ├── auth/          # Authentication feature
│   ├── product/       # Product search & management
│   ├── research/      # Research data management
│   ├── search/        # Search functionality
│   └── workflow/      # AI workflow orchestration
├── infrastructure/    # External service integrations
│   ├── api/          # API clients (Coupang, WordPress, etc.)
│   ├── auth/         # Authentication services
│   ├── cache/        # Redis cache system
│   ├── queue/        # Queue management
│   └── scraping/     # Web scraping utilities
├── shared/           # Shared resources across features
│   ├── hooks/        # Common React hooks
│   ├── lib/          # Utility functions
│   ├── types/        # TypeScript type definitions
│   └── ui/           # Reusable UI components
├── store/            # Zustand global state stores
└── test/             # Test setup and utilities
```

### Naming Conventions
- **Files**: Use kebab-case for files, PascalCase for components (`ResearchCard.tsx`)
- **Components**: Use PascalCase (`ResearchCard`, `WorkflowProgress`)
- **Functions**: Use camelCase (`getUserData`, `normalizeCoupangProduct`)
- **Constants**: Use UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: Use PascalCase (`CoupangProductResponse`, `ResearchPack`)

## TypeScript Guidelines

### Type Safety
- Strict mode enabled in `tsconfig.json`
- Target: ES2017 with DOM libraries
- Module resolution: bundler
- Path alias: `@/` maps to `./src/`
- JSX: preserve mode for Next.js

### Best Practices
- Use explicit types for API responses and data models
- Leverage shared types from `@/shared/types/`
- Use type guards for runtime validation
- Create domain-specific types in feature folders
- Document complex types with JSDoc comments

## Code Quality Standards

### ESLint Configuration
- Next.js Core Web Vitals rules enabled
- TypeScript ESLint rules configured
- Uses ESLint 9 with flat config

### Testing Standards
- Coverage thresholds: 80% for all metrics
- Test setup file: `./src/test/setup.ts`
- Environment: jsdom for React component testing
- Vitest globals enabled for Jest-like API
- Test files: `__tests__/` folders or `.test.tsx` files

## Performance Optimization

### Next.js Specific Optimizations
- App Router with React Server Components
- Image optimization configured for Coupang CDNs
- Webpack fallbacks for Node.js modules in client bundle
- Dynamic imports for code splitting
- Built-in font optimization

### Runtime Performance
- Zustand for efficient state management
- React Hook Form for optimized form handling
- Proper memoization with React 19 features
- Tailwind CSS for optimized styling

## Security Guidelines

### Environment Variables
- Supabase credentials in `.env.local`
- API keys managed in Supabase Edge Functions
- Never expose secrets in frontend code

### Authentication
- Supabase Auth integration
- Session management via AuthContext
- Protected routes with AuthGuard

## Development Workflow

### Before Starting
1. Check Node.js version compatibility
2. Install dependencies: `npm install`
3. Set up `.env.local` with Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
4. Start development server: `npm run dev`

### During Development
1. Use TypeScript with strict mode
2. Follow feature-based architecture pattern
3. Write tests for new features
4. Use shared types and utilities
5. Leverage Supabase for backend operations

### Before Committing
1. Run tests: `npm test`
2. Check linting: `npm run lint`
3. Build for production: `npm run build`
4. Verify no TypeScript errors

## Key Project Features

### AI Workflow Integration
- LangChain/LangGraph for workflow automation
- Product research and SEO content generation
- Real-time status tracking with WorkflowProgress

### Supabase Integration
- Edge Functions for serverless backend
- Authentication and user management
- Database operations via Supabase client

### Coupang API Integration
- Product search and deep linking
- Best category products
- HMAC signature generation for API calls

## Important Notes

- Main branch: `master`
- API routes proxy to Supabase Edge Functions
- Use `@/` path alias for imports from `src/`
- Follow existing patterns in `features/` folders
- Test pages available in `app/[feature]-test/`

---

# 📋 CP9 Frontend 작업 지침 (파일 폭증 방지)

## 🎯 핵심 원칙
**필요한 최소 변경**으로 효율적 개발 - 기존 파일 수정 우선, 새 파일 생성 최소화

## 1️⃣ 출력 구조 (고정 형식)

모든 응답은 다음 구조로:

1. **TL;DR** – 3줄 요약
2. **Plan** – 기존 파일 활용 계획 및 수정 범위
3. **Code** – 핵심 코드 (기존 패턴 준수, 주석 최소화)
4. **Tests** – Vitest 테스트 1개 (기존 테스트 패턴 참조)
5. **Run** – 실행 명령어 (`npm run dev`, `npm test`)
6. **Next** – 다음 단계 제안 (Research → SEO → Publishing)

## 2️⃣ CP9 프로젝트 파일 구조 활용

### 기존 구조 최대 활용
```
features/           # 비즈니스 로직은 여기에
├── product/       # 상품 검색, 필터링, 액션
├── research/      # ResearchPack 관리 (이미 구현됨)
├── workflow/      # AI 워크플로우 상태 관리
└── search/        # 검색 히스토리

shared/            # 공통 유틸은 여기에
├── types/         # api.ts, research.ts, common.ts
├── lib/           # api-utils.ts, utils.ts
└── ui/            # shadcn 컴포넌트

infrastructure/    # 외부 API는 여기에
├── api/          # coupang.ts, perplexity.ts, wordpress.ts
└── scraping/     # coupang-scraper.ts, scrapfly-scraper.ts
```

### ❌ 새 파일 생성 금지
- hooks는 기존 `features/*/hooks/` 활용
- 타입은 `shared/types/` 기존 파일에 추가
- API 클라이언트는 `infrastructure/api/` 기존 파일 수정
- 유틸 함수는 `shared/lib/utils.ts`에 추가

### ✅ 새 파일 생성 허용 (RFC 필수)
- 새로운 app 라우트 페이지 (`app/*/page.tsx`)
- 새로운 API 엔드포인트 (`app/api/*/route.ts`)
- 완전히 새로운 feature 모듈

## 3️⃣ CP9 코드 패턴 준수

### 기존 컴포넌트 패턴 활용
```tsx
// ✅ CP9 패턴: ResearchCard 스타일 따르기
// features/research/components/ResearchCard.tsx 참조
export const ProductActionCard = ({ product, onAction }: Props) => {
  const { executeResearch } = useProductActions(); // 기존 hook 활용
  
  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>{product.productName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => onAction(product)}>
          리서치 생성
        </Button>
      </CardContent>
    </Card>
  );
};
```

### API 라우트 패턴
```tsx
// ✅ CP9 패턴: 기존 API 프록시 패턴 따르기
// app/api/research/route.ts 스타일
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Supabase Edge Function 호출
    const response = await fetch(`${SUPABASE_URL}/functions/v1/item-research`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### 타입 정의 패턴
```tsx
// ✅ shared/types/research.ts에 추가 (새 파일 X)
export interface DraftContent extends ResearchPack {
  content?: string;
  status: 'pending' | 'generated' | 'published';
}
```

## 4️⃣ CP9 테스트 패턴

### 기존 테스트 위치 활용
```tsx
// components/ui/__tests__/button.test.tsx 패턴 따르기
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

describe('ResearchCard', () => {
  it('리서치 카드 렌더링', () => {
    const mockResearch = {
      itemId: 'test-001',
      title: '무선 이어폰',
      priceKRW: 50000,
    };
    render(<ResearchCard research={mockResearch} />);
    expect(screen.getByText('무선 이어폰')).toBeInTheDocument();
  });
});
```

### API 테스트 패턴
```tsx
// app/api/research/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';

test('리서치 생성 API', async () => {
  const req = new NextRequest('http://localhost:3000/api/research', {
    method: 'POST',
    body: JSON.stringify({ itemId: 'test-001' }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
});
```

## 5️⃣ CP9 작업 플래그

- `/plan` – 기존 파일 활용 계획만 제시
- `/patch` – 기존 파일 수정 (features/*, shared/*)
- `/minimal` – 최소 구현 (새 파일 절대 금지)
- `/test` – 기존 테스트 패턴으로 테스트 추가
- `/workflow` – Product → Research → SEO → Publish 플로우

## 6️⃣ CP9 체크리스트

### 코드 작성 전
- [ ] 기존 `features/` 폴더 확인
- [ ] `shared/types/` 타입 재사용 가능?
- [ ] `infrastructure/api/` 클라이언트 있는지?
- [ ] 비슷한 컴포넌트 있는지? (ResearchCard, ProductCard)

### PR 전 필수
- [ ] 새 파일 0개 (라우트 제외)
- [ ] 기존 hook 활용 (useProductActions, useResearch)
- [ ] Supabase Edge Function 프록시 패턴 준수
- [ ] `npm run test` 통과
- [ ] `npm run build` 성공

## 7️⃣ CP9 실제 워크플로우

### 상품 검색 → 리서치 → SEO 생성
```bash
# 1. 상품 검색 기능 개선
"/patch features/product/hooks/useProductActions.ts"

# 2. 리서치 데이터 표시 개선  
"/patch features/research/components/ResearchCard.tsx"

# 3. SEO 콘텐츠 생성 버튼 추가
"/patch features/research/hooks/useResearch.ts에 generateSEO 추가"

# 4. 테스트
npm run test
npm run dev

# 5. 실제 플로우 테스트
# http://localhost:3000/product → 검색
# http://localhost:3000/research → 리서치 확인
# http://localhost:3000/research/[id] → 상세 편집
```

### CP9 주요 페이지
- `/product` - 상품 검색 및 선택
- `/research` - 리서치 데이터 관리
- `/research/[id]` - 리서치 상세 편집
- `/simple-test` - LangGraph 노드 테스트
- `/test` - 통합 워크플로우 테스트

## 📌 CP9 개발 원칙

> "이미 있는 걸 다시 만들지 마세요"

**CP9는 이미 구조가 잘 잡혀있습니다:**
- `features/` - 비즈니스 로직 완비
- `infrastructure/` - API 클라이언트 구현됨
- `shared/types/` - 타입 정의 완료

**새로 만들지 말고 기존 것을 활용하세요!**