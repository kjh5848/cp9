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

### Testing
- **Vitest** (유닛 테스트)
- **@testing-library/react** (컴포넌트 테스트)
- **jsdom** (브라우저 환경 시뮬레이션)
- **TDD 방식** (Given-When-Then 구조)

### Backend (예정)
- **Supabase** (인증, 데이터베이스)
- **Supabase Edge Functions** (서버리스 함수)
- **PostgreSQL** (데이터베이스)

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

### 🔄 진행 예정

#### 5. Supabase 인증 시스템
- [ ] Supabase 프로젝트 설정
- [ ] 카카오톡 OAuth 연동
- [ ] 구글 OAuth 연동
- [ ] 인증 플로우 구현

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
npm run test:watch
npm run test:coverage

# 린트 검사
npm run lint
```

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # 루트 레이아웃
│   │   ├── page.tsx        # 홈페이지
│   │   ├── globals.css     # 전역 스타일
│   │   └── __tests__/      # 페이지 테스트
│   ├── components/
│   │   └── ui/             # shadcn/ui 컴포넌트
│   │       ├── button.tsx  # Button 컴포넌트
│   │       ├── card.tsx    # Card 컴포넌트
│   │       ├── input.tsx   # Input 컴포넌트
│   │       ├── label.tsx   # Label 컴포넌트
│   │       └── __tests__/  # 컴포넌트 테스트
│   ├── lib/
│   │   ├── utils.ts        # 유틸리티 함수
│   │   └── __tests__/      # 유틸리티 테스트
│   └── test/
│       └── setup.ts        # 테스트 환경 설정
├── public/                 # 정적 파일
├── vitest.config.ts        # Vitest 설정
├── package.json
└── README.md
```

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

### Phase 1: 기본 인프라 (현재 완료)
- [x] Next.js 15 프로젝트 설정
- [x] Tailwind CSS v4 통합
- [x] shadcn/ui 컴포넌트 시스템
- [x] TDD 테스트 환경 설정

### Phase 2: 백엔드 연동 (진행 예정)
- [ ] Supabase 인증 시스템
- [ ] 데이터베이스 설계
- [ ] API 엔드포인트 구현

### Phase 3: 핵심 기능 개발
- [ ] 쿠팡 파트너스 API 연동
- [ ] LLM 컨텐츠 생성 엔진
- [ ] 워드프레스 자동 발행

### Phase 4: 고도화 및 확장
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

## 📞 연락처

프로젝트 관련 문의: [GitHub Issues](https://github.com/your-repo/cp9/issues)
