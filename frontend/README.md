# CP9 Frontend

> AI-Powered Product Research Platform for Coupang Partners

CP9는 쿠팡 파트너스 상품을 기반으로 AI가 자동으로 SEO 최적화된 블로그 포스트를 생성하는 Next.js 기반 SaaS 플랫폼입니다.

## 🚀 주요 기능

- **🔍 상품 검색**: 쿠팡 파트너스 API를 통한 실시간 상품 검색
- **🤖 AI 콘텐츠 생성**: LangGraph 기반 AI 워크플로우로 SEO 최적화된 블로그 포스트 자동 생성
- **📊 실시간 모니터링**: 워크플로우 진행 상황 실시간 추적
- **🔐 인증 시스템**: Supabase Auth 기반 사용자 관리
- **📱 반응형 디자인**: Tailwind CSS 기반 모던 UI/UX

## 🏛️ 아키텍처

### 프로젝트 구조

```
src/
├── shared/                # 🌐 전역 공유 리소스
│   ├── components/        # 공통 복합 컴포넌트 (navbar 등)
│   ├── ui/               # 기본 UI 컴포넌트 (button, input, card)
│   ├── hooks/            # 전역 훅
│   ├── lib/              # 유틸리티 함수
│   └── types/            # 공통 타입 정의
├── features/              # 🎯 기능별 모듈
│   ├── auth/             # 인증 시스템
│   ├── product/          # 상품 검색 및 관리
│   ├── workflow/         # AI 워크플로우
│   └── home/             # 홈페이지
├── infrastructure/        # 🏗️ 인프라 레이어
│   ├── api/              # API 클라이언트
│   ├── cache/            # 캐시 관리
│   ├── scraping/         # 웹 스크래핑
│   └── utils/            # 저수준 유틸리티
├── app/                  # 📄 Next.js App Router
└── store/                # 🗄️ 전역 상태 관리
```

### 기술 스택

- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **State Management**: React Context + Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI Workflow**: LangGraph
- **Testing**: Vitest + Testing Library

## 🛠️ 설치 및 실행

### 사전 요구사항

- Node.js 18+ 
- pnpm (권장) 또는 npm

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd cp9/frontend

# 의존성 설치
pnpm install
```

### 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.local.example .env.local
```

필요한 환경 변수:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
COUPANG_ACCESS_KEY=your_coupang_access_key
COUPANG_SECRET_KEY=your_coupang_secret_key
COUPANG_PARTNER_ID=your_coupang_partner_id
```

### 개발 서버 실행

```bash
# 개발 서버 시작
pnpm dev

# 브라우저에서 http://localhost:3000 접속
```

## 📋 사용 가능한 스크립트

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm lint         # ESLint 실행
pnpm type-check   # TypeScript 타입 체크
pnpm test         # 테스트 실행
pnpm test:watch   # 테스트 감시 모드
```

## 🎯 주요 기능 상세

### 인증 시스템
- **위치**: `src/features/auth/`
- **기능**: 이메일/비밀번호, 구글 소셜 로그인
- **컴포넌트**: `LoginCard`, `AuthForm`, `AuthGuard`

### 상품 검색
- **위치**: `src/features/product/`
- **기능**: 키워드/카테고리/링크 기반 상품 검색
- **API**: 쿠팡 파트너스 API, 웹 스크래핑

### AI 워크플로우
- **위치**: `src/features/workflow/`
- **기능**: LangGraph 기반 SEO 콘텐츠 자동 생성
- **모니터링**: 실시간 진행 상황 추적

## 🏗️ 아키텍처 원칙

### Feature-Based Architecture
- **모듈화**: 기능별 독립적인 폴더 구조
- **응집도**: 관련 파일들의 그룹화
- **결합도**: 기능 간 의존성 최소화

### 컴포넌트 분류
- **shared/ui**: 기본 UI 컴포넌트 (버튼, 인풋 등)
- **shared/components**: 공통 복합 컴포넌트 (네비바 등)
- **features/{기능}/components**: 특정 기능 전용 컴포넌트

### Import 규칙
```typescript
// ✅ 권장: 절대 경로 사용
import { Button } from '@/shared/ui/button'
import { useAuth } from '@/features/auth/hooks'

// ❌ 비권장: 상대 경로 남용
import { Button } from '../../../shared/ui/button'
```

## 🧪 테스팅

### 테스트 실행
```bash
# 모든 테스트 실행
pnpm test

# 감시 모드로 테스트
pnpm test:watch

# 커버리지와 함께 테스트
pnpm test:coverage
```

### 테스트 구조
```
src/
├── shared/lib/__tests__/
├── features/auth/components/__tests__/
└── app/__tests__/
```

## 🚀 배포

### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### Docker 배포
```bash
# Docker 이미지 빌드
docker build -t cp9-frontend .

# 컨테이너 실행
docker run -p 3000:3000 cp9-frontend
```

## 🤝 개발 가이드라인

### 새 컴포넌트 생성
1. 적절한 위치 선택 (shared vs features)
2. TypeScript 인터페이스 정의
3. JSDoc 주석 작성
4. 에러 처리 구현

### 새 기능 추가
1. `src/features/{기능명}/` 폴더 생성
2. `components`, `hooks`, `types`, `utils` 구조 생성
3. `index.ts`에서 public API export
4. 문서 업데이트

### 코드 스타일
- **Prettier**: 코드 포맷팅 자동화
- **ESLint**: 코드 품질 검사
- **TypeScript**: 타입 안정성 보장

## 📚 추가 문서

- [개발 가이드](./CLAUDE.md) - 상세한 개발 가이드라인
- [API 문서](./src/app/api/README.md) - API 엔드포인트 문서
- [Hook 마이그레이션](./src/HOOK_MIGRATION_GUIDE.md) - Hook 리팩토링 가이드

## 🔧 트러블슈팅

### 빌드 오류
```bash
# 타입 체크
pnpm type-check

# 의존성 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 스타일 오류
```bash
# Tailwind 캐시 클리어
rm -rf .next
pnpm dev
```

## 🤝 기여하기

1. Fork 저장소
2. Feature 브랜치 생성 (`git checkout -b feature/새기능`)
3. 변경사항 커밋 (`git commit -am '새기능 추가'`)
4. 브랜치에 Push (`git push origin feature/새기능`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면:
- Issues 탭에 문제를 등록해 주세요
- 개발 문서를 먼저 확인해 주세요
- 커뮤니티 가이드라인을 준수해 주세요