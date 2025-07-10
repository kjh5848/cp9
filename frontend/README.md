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
- **ESLint 9**

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

### 🔄 진행 예정

#### 3. shadcn/ui 컴포넌트 시스템
- [ ] shadcn/ui 설치 및 설정
- [ ] 기본 컴포넌트 (Button, Card, Input 등) 추가
- [ ] 컴포넌트 스토리북 구성

#### 4. Supabase 인증 시스템
- [ ] Supabase 프로젝트 설정
- [ ] 카카오톡 OAuth 연동
- [ ] 구글 OAuth 연동
- [ ] 인증 플로우 구현

#### 5. 핵심 기능 구현
- [ ] 키워드 입력 폼
- [ ] 쿠팡 상품 검색 API 연동
- [ ] 딥링크 변환 기능
- [ ] LLM 컨텐츠 생성
- [ ] 워드프레스 자동 발행

#### 6. 테스트 및 품질 관리
- [ ] Jest/Vitest 유닛 테스트
- [ ] Playwright E2E 테스트
- [ ] ESLint + Prettier 설정
- [ ] Husky + lint-staged 설정

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
│   │   └── globals.css     # 전역 스타일
│   ├── components/         # 재사용 컴포넌트
│   ├── lib/               # 유틸리티 함수
│   └── types/             # TypeScript 타입 정의
├── public/                # 정적 파일
├── package.json
└── README.md
```

## 🎨 디자인 시스템

### 색상 팔레트
- Primary: Blue (bg-blue-600)
- Secondary: Gray (bg-gray-100)
- Success: Green
- Warning: Yellow
- Error: Red

### 컴포넌트 스타일
- `.btn-primary`: 기본 액션 버튼
- `.btn-secondary`: 보조 액션 버튼
- `.card`: 카드 컴포넌트
- `.card-header`: 카드 헤더
- `.card-title`: 카드 제목
- `.card-description`: 카드 설명
- `.card-content`: 카드 내용
- `.card-footer`: 카드 푸터

## 📈 로드맵

### Phase 1: 기본 인프라 (현재)
- [x] Next.js 15 프로젝트 설정
- [x] Tailwind CSS v4 통합
- [ ] shadcn/ui 컴포넌트 시스템
- [ ] Supabase 인증 시스템

### Phase 2: 핵심 기능 개발
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

## 📞 연락처

프로젝트 관련 문의: [GitHub Issues](https://github.com/your-repo/cp9/issues)
