# CP9 프로젝트 정보

## 📋 프로젝트 개요
- **이름**: CP9 Frontend  
- **타입**: Next.js TypeScript 프로젝트
- **프레임워크**: Next.js 15
- **설명**: Coupang Partners Auto-Blog SaaS Frontend

## 🏗️ 아키텍처
- **패턴**: Feature-based architecture
- **API 레이어**: Next.js API Routes  
- **백엔드 통합**: Supabase Edge Functions
- **상태 관리**: Zustand
- **스타일링**: Tailwind CSS
- **테스팅**: Vitest

## 📁 주요 폴더 구조
```
src/
├── app/           - Next.js pages and API routes
├── features/      - Business logic modules  
├── infrastructure/ - External integrations
├── shared/        - Shared resources
├── components/    - UI components
└── store/         - Global state
```

## 🔧 주요 명령어
- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run test` - 테스트 실행
- `npm run lint` - 린터 실행
- `npm run test:coverage` - 테스트 커버리지
- `npm run test:watch` - 테스트 감시 모드

## 📦 핵심 의존성
### Core
- next@15.1.3
- react@19  
- typescript@5
- tailwindcss@4
- zustand@5

### Backend
- @supabase/supabase-js
- @langchain/langgraph
- @langchain/openai

### UI
- @radix-ui/react-*
- lucide-react
- react-hook-form
- react-hot-toast

### Testing  
- vitest
- @testing-library/react
- playwright

## 🌍 환경 변수
### 필수
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

### 참고
추가 API 키들은 Supabase Dashboard에서 관리됩니다.

## 🧪 테스트 설정
- **프레임워크**: Vitest
- **환경**: jsdom
- **커버리지 임계값**: 80%
- **리포터**: text, json, html
- **설정 파일**: ./src/test/setup.ts

## 🔧 빌드 설정
- **출력 디렉토리**: .next
- **공개 디렉토리**: public
- **TypeScript**: Strict mode, ES2017 target
- **Webpack**: Node.js polyfills for LangGraph

## 🤖 AI 워크플로우 통합
### Primary
LangChain/LangGraph

### Edge Functions
- item-research
- write  
- cache-gateway
- queue-worker

### External APIs
- Coupang Open API
- Perplexity API
- OpenAI API
- WordPress REST API

## 📏 개발 규칙
- **파일명**: kebab-case (파일), PascalCase (컴포넌트)
- **컴포넌트**: Function components with TypeScript
- **상태 관리**: Zustand stores in src/store
- **API 라우트**: Proxy pattern to Supabase Edge Functions
- **에러 핸들링**: Consistent error format with toast notifications
- **타입**: Shared types in @/shared/types, feature types in feature folders