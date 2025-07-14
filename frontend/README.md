# 🛠️ CP9 - 쿠팡 파트너스 자동 블로그 SaaS

> **키워드만 입력하면 쿠팡 상품 검색 → 딥링크 변환 → LLM 요약 → 워드프레스 초안 저장까지 원-클릭으로 완료**

## 📋 프로젝트 개요

CP9은 쿠팡 파트너스를 활용한 자동 블로그 컨텐츠 생성 SaaS입니다. 사용자가 키워드를 입력하면 자동으로 상품을 검색하고, AI가 블로그 글을 작성하여 워드프레스에 발행하는 완전 자동화된 시스템입니다.

## 🚀 기술 스택

### Frontend
- **Next.js 15.3.5** (App Router 구조)
- **React 19.0.0**
- **TypeScript 5**
- **Tailwind CSS v4**
- **shadcn/ui** (컴포넌트 시스템)
- **ESLint 9**

### Backend & Database
- **Supabase** (인증, 데이터베이스)
- **PostgreSQL** (Supabase 관리형 데이터베이스)
- **Supabase Edge Functions** (서버리스 함수)

### Authentication
- **Supabase Auth** (인증 시스템)
- **Google OAuth** (소셜 로그인)
- **이메일/비밀번호** 로그인

### Testing
- **Vitest** (유닛 테스트)
- **@testing-library/react** (컴포넌트 테스트)
- **jsdom** (브라우저 환경 시뮬레이션)
- **TDD 방식** (Given-When-Then 구조)

## Github 레포 클론
- 회사에서 ssh Key 발행

## 🏗️ 진행 상황

### ✅ 완료된 작업

#### 1. Next.js 15 프로젝트 초기화
- [x] Next.js 15.3.5 설정 완료
- [x] TypeScript 5 적용
- [x] App Router 구조 설정
- [x] 기본 프로젝트 구조 생성

#### 2. Tailwind CSS v4 설정
- [x] Tailwind CSS v4 통합 완료
- [x] 코드 스타일 가이드 적용
- [x] 재사용 가능한 컴포넌트 스타일 클래스 생성
- [x] 다크 모드 지원
- [x] 프로젝트 맞춤형 랜딩 페이지 구현

#### 3. shadcn/ui 컴포넌트 시스템 (완료 ✅)
- [x] shadcn/ui 의존성 설치 및 설정
- [x] cn 유틸리티 함수 구현 (clsx + tailwind-merge)
- [x] 기본 UI 컴포넌트 추가:
  - Button (variant, size, disabled 등)
  - Card (Header, Title, Description, Content, Footer)
  - Input (type, placeholder, disabled 등)
  - Label (htmlFor, 접근성 지원)
- [x] 메인 페이지에 shadcn/ui 적용
- [x] 키워드 입력 폼 구현

#### 4. TDD 테스트 환경 설정 (완료 ✅)
- [x] Vitest 설정 및 구성
- [x] 테스트 환경 설정 (@testing-library/react, jsdom)
- [x] Given-When-Then 시나리오 구조 적용
- [x] 컴포넌트 단위 테스트 작성:
  - Button 컴포넌트 (variant, size, 클릭 이벤트 등)
  - Card 컴포넌트 (전체 구조 및 하위 컴포넌트)
  - Input 컴포넌트 (type, value, disabled 등)
  - Label 컴포넌트 (htmlFor, 접근성 등)
  - cn 유틸리티 함수 (클래스 병합, 조건부 클래스)
- [x] 메인 페이지 테스트 (렌더링, 구조, 접근성)
- [x] 커버리지 80% 이상 목표 설정

#### 5. Supabase 설정 및 인증 시스템 (완료 ✅)
- [x] Supabase 클라이언트 라이브러리 설치 및 설정
- [x] TypeScript 타입 정의 (users, keywords, blog_posts 테이블)
- [x] 인증 시스템 구현:
  - AuthForm 컴포넌트 (로그인/회원가입 통합)
  - 이메일/비밀번호 로그인
  - 구글 OAuth 로그인
  - 인증 콜백 처리 페이지 (auth/callback)
- [x] AuthContext를 통한 전역 인증 상태 관리
- [x] 메인 페이지 인증 상태 반영 (조건부 UI)
- [x] 로그인/로그아웃 기능
- [x] TDD 방식 인증 테스트 추가

#### 6. 의존성 오류 해결 및 품질 개선 (완료 ✅)
- [x] class-variance-authority 모듈 오류 해결
- [x] 누락된 의존성 설치 완료:
  - class-variance-authority, clsx, tailwind-merge
  - @tailwindcss/postcss (Tailwind CSS v4 지원)
  - @supabase/supabase-js, @supabase/auth-ui-react
- [x] ESLint 오류 수정:
  - require() 스타일 import를 ES6 import로 변경
  - any 타입을 구체적인 타입으로 변경
  - 빈 인터페이스를 타입 별칭으로 변경
- [x] 테스트 환경 개선 (setup.ts JSX 오류 수정)
- [x] 개발 서버 테스트 완료 (메인 페이지, 로그인 페이지 정상 동작)
- [x] UI 컴포넌트 모든 기능 정상 작동 확인

### 🔄 진행 예정

#### 6. 핵심 기능 구현
- [ ] 키워드 입력 폼 백엔드 연동
- [ ] 쿠팡 상품 검색 API 연동
- [ ] 딥링크 변환 기능
- [ ] LLM 컨텐츠 생성
- [ ] 워드프레스 자동 발행

#### 7. 추가 테스트 및 품질 관리
- [ ] E2E 테스트 (Playwright)
- [ ] 통합 테스트
- [ ] 성능 테스트
- [ ] 접근성 테스트

## 🎯 주요 기능

### 1. 스마트 상품 검색
- 키워드 기반 쿠팡 상품 자동 검색
- 인기도 및 수수료율 기반 상품 정렬
- 딥링크 자동 생성

### 2. AI 컨텐츠 생성
- OpenAI GPT 기반 블로그 글 자동 작성
- SEO 최적화된 제목 및 메타 태그 생성
- 상품 리뷰 및 비교 컨텐츠 생성

### 3. 자동 발행 시스템
- 워드프레스 REST API 연동
- 예약 발행 기능
- 다중 블로그 관리

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn
- Git
- Supabase 프로젝트 (인증 및 데이터베이스)



### 설치 및 실행
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 Supabase 설정 추가

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 테스트 실행
npm run test
npm run test:watch
npm run test:coverage

# 린트 검사
npm run lint
```

### 환경 변수 설정
`.env.local` 파일에 다음 환경 변수를 설정하세요:
```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 쿠팡 파트너스 API (예정)
COUPANG_ACCESS_KEY=your-coupang-access-key
COUPANG_SECRET_KEY=your-coupang-secret-key
COUPANG_PARTNER_ID=your-partner-id

# OpenAI API (예정)
OPENAI_API_KEY=your-openai-api-key
```

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃 (AuthProvider 포함)
│   │   ├── page.tsx            # 홈페이지 (인증 상태 반영)
│   │   ├── login/
│   │   │   └── page.tsx        # 로그인 페이지
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── page.tsx    # OAuth 콜백 페이지
│   │   ├── globals.css         # 전역 스타일
│   │   └── __tests__/          # 페이지 테스트
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   │   ├── button.tsx      # Button 컴포넌트
│   │   │   ├── card.tsx        # Card 컴포넌트
│   │   │   ├── input.tsx       # Input 컴포넌트
│   │   │   ├── label.tsx       # Label 컴포넌트
│   │   │   └── __tests__/      # 컴포넌트 테스트
│   │   └── auth/
│   │       ├── AuthForm.tsx    # 인증 폼 컴포넌트
│   │       └── __tests__/      # 인증 컴포넌트 테스트
│   ├── contexts/
│   │   └── AuthContext.tsx     # 인증 상태 관리 컨텍스트
│   ├── lib/
│   │   ├── supabase.ts         # Supabase 클라이언트 설정
│   │   ├── utils.ts            # 유틸리티 함수
│   │   └── __tests__/          # 유틸리티 테스트
│   └── test/
│       └── setup.ts            # 테스트 환경 설정
├── public/                     # 정적 파일
├── vitest.config.ts            # Vitest 설정
├── package.json
└── README.md
```

## 🔐 인증 시스템

### 지원하는 인증 방식
- **이메일/비밀번호** 로그인
- **Google OAuth** 소셜 로그인
- **회원가입** 기능
- **자동 로그인 상태 관리**

### 인증 플로우
1. 사용자가 로그인 페이지 접근
2. 이메일/비밀번호 또는 Google OAuth 선택
3. 인증 성공 시 메인 페이지로 리디렉션
4. 인증 상태는 AuthContext를 통해 전역 관리
5. 로그인 상태에 따른 조건부 UI 렌더링

## 🧪 테스트 전략

### TDD 방식 적용
- **Given-When-Then** 시나리오 구조
- **유닛 테스트**: 컴포넌트 및 함수 단위
- **통합 테스트**: 컴포넌트 간 상호작용
- **E2E 테스트**: 사용자 플로우 검증

### 테스트 커버리지 목표
- **전체 커버리지**: 80% 이상
- **함수 커버리지**: 80% 이상
- **라인 커버리지**: 80% 이상
- **브랜치 커버리지**: 80% 이상

### 테스트 범위
- UI 컴포넌트 테스트
- 인증 시스템 테스트
- 유틸리티 함수 테스트
- 페이지 렌더링 테스트

### 실제 테스트 결과
#### 개발 서버 테스트 (✅ 완료)
- **메인 페이지**: 제목, 네비게이션, 기능 소개 정상 렌더링
- **로그인 페이지**: 인증 폼, 로그인/회원가입 모드 전환 정상 동작
- **UI 컴포넌트**: Button, Card, Input, Label 등 정상 작동
- **폼 기능**: 이메일/비밀번호 입력, 검증 정상 동작
- **페이지 네비게이션**: 메인 ↔ 로그인 페이지 이동 정상
- **반응형 디자인**: 브라우저에서 정상 표시

## 🎨 디자인 시스템

### 색상 팔레트
- Primary: Blue (bg-blue-600)
- Secondary: Gray (bg-gray-100)
- Success: Green
- Warning: Yellow
- Error: Red

### 컴포넌트 스타일
- shadcn/ui 기반 컴포넌트 시스템
- Tailwind CSS v4 활용
- 반응형 디자인 지원
- 접근성 표준 준수

## 📈 로드맵

### Phase 1: 기본 인프라 (✅ 완료)
- [x] Next.js 15 프로젝트 설정
- [x] Tailwind CSS v4 통합
- [x] shadcn/ui 컴포넌트 시스템
- [x] TDD 테스트 환경 설정
- [x] Supabase 설정 및 인증 시스템
- [x] 의존성 오류 해결 및 품질 개선
- [x] 개발 서버 테스트 완료

### Phase 2: 핵심 기능 개발 (진행 예정)
- [ ] 쿠팡 파트너스 API 연동
- [ ] LLM 컨텐츠 생성 엔진
- [ ] 워드프레스 자동 발행

### Phase 3: 고도화 및 확장
- [ ] A/B 테스트 시스템
- [ ] 분석 및 리포팅
- [ ] 다중 플랫폼 지원

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🔧 트러블슈팅

### 해결된 문제점들

#### 1. class-variance-authority 모듈 오류
**문제**: `'class-variance-authority' 모듈 또는 해당 형식 선언을 찾을 수 없습니다.`
**원인**: 의존성 패키지가 설치되지 않음
**해결**: 
```bash
npm install class-variance-authority clsx tailwind-merge
```

#### 2. @tailwindcss/postcss 오류
**문제**: `Cannot find module '@tailwindcss/postcss'`
**원인**: Tailwind CSS v4에 필요한 postcss 플러그인 누락
**해결**:
```bash
npm install @tailwindcss/postcss
```

#### 3. Supabase 환경 변수 오류
**문제**: `Missing Supabase environment variables`
**원인**: 환경 변수 설정 없음
**해결**: 테스트를 위해 기본값 설정 또는 .env.local 파일 생성

#### 4. ESLint 오류들
**문제**: require() import, any 타입, 빈 인터페이스 오류
**해결**: 
- require() → ES6 import 변경
- any → 구체적 타입으로 변경
- 빈 인터페이스 → 타입 별칭으로 변경

## 📞 연락처

프로젝트 관련 문의: [GitHub Issues](https://github.com/your-repo/cp9/issues)
