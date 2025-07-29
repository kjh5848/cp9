# Supabase Edge Functions 사용 가이드

## 📋 목차
1. [개요](#개요)
2. [환경 설정](#환경-설정)
3. [로컬 개발](#로컬-개발)
4. [배포 및 테스트](#배포-및-테스트)
5. [API 키 관리](#api-키-관리)
6. [실제 사용 예시](#실제-사용-예시)

## 🎯 개요

Supabase Edge Functions는 서버리스 함수로, Deno 런타임에서 실행됩니다. 이 프로젝트에서는 다음과 같은 용도로 사용됩니다:

- **Cache Gateway**: Redis 캐시 검사 및 큐 작업 등록
- **LangGraph API**: AI 워크플로우 처리 및 SEO 글 생성
- **Queue Worker**: 백그라운드 작업 처리

## ⚙️ 환경 설정

### 1. Supabase CLI 설치

```bash
# npx를 사용하여 CLI 실행 (권장)
npx supabase --version

# 또는 전역 설치 (Windows에서는 권한 문제 가능성)
npm install -g supabase
```

### 2. 프로젝트 연결

```bash
# Supabase 로그인
npx supabase login

# 프로젝트 연결
npx supabase link --project-ref bovtkqgdzihoclazkpcq
```

### 3. 환경 변수 설정

#### 프론트엔드 (.env.local)
```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://bovtkqgdzihoclazkpcq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=opZhhO2BwQPJfzi/cFlKcCrAQPiGrcFWZQyrxy7pAZREhCGd3bASChSnHSL7/3EKhuNMrK+FprOQNkHaSO5gRg==

# AI API 키
OPENAI_API_KEY=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
PERPLEXITY_API_KEY=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

# WordPress API 설정
WORDPRESS_API_KEY=nvtc ql72 T22s OkHX 5fe3 NqCZ
WORDPRESS_SITE_URL=https://jupocket.com
```

## 🏠 로컬 개발

### 1. Docker Desktop 실행

로컬에서 Edge Functions를 테스트하려면 Docker Desktop이 필요합니다:

```bash
# Docker 상태 확인
docker --version

# Docker Desktop이 실행 중인지 확인
docker ps
```

### 2. 로컬 서버 시작

```bash
cd backend/supabase

# 환경 변수 파일과 함께 로컬 서버 시작
npx supabase functions serve --no-verify-jwt --env-file ../../frontend/.env.local --debug
```

### 3. 로컬 테스트

```bash
# 로컬 함수 테스트
curl -L -X POST 'http://localhost:54321/functions/v1/hello' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Local Test"}'
```

## 🚀 배포 및 테스트

### 1. 함수 배포

```bash
# 특정 함수 배포
npx supabase functions deploy hello --project-ref bovtkqgdzihoclazkpcq

# 인증 없이 배포 (테스트용)
npx supabase functions deploy hello --project-ref bovtkqgdzihoclazkpcq --no-verify-jwt

# 모든 함수 배포
npx supabase functions deploy --project-ref bovtkqgdzihoclazkpcq
```

### 2. 원격 테스트

```bash
# 인증 없이 테스트
curl -L -X POST 'https://bovtkqgdzihoclazkpcq.supabase.co/functions/v1/hello' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Functions"}'

# JWT 인증으로 테스트
curl -L -X POST 'https://bovtkqgdzihoclazkpcq.supabase.co/functions/v1/hello' \
  -H 'Authorization: Bearer opZhhO2BwQPJfzi/cFlKcCrAQPiGrcFWZQyrxy7pAZREhCGd3bASChSnHSL7/3EKhuNMrK+FprOQNkHaSO5gRg==' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
```

## 🔑 API 키 관리

### 1. Secrets 등록 (선택사항)

프로덕션 환경에서 환경 변수를 안전하게 관리하려면:

```bash
# 개별 secrets 등록
npx supabase secrets set OPENAI_API_KEY=sk-proj-...
npx supabase secrets set PERPLEXITY_API_KEY=pplx-...

# 환경 변수 파일에서 일괄 등록
npx supabase secrets set --env-file ../../frontend/.env.local

# 등록된 secrets 확인
npx supabase secrets list
```

### 2. 환경 변수 우선순위

1. **로컬 개발**: `--env-file` 옵션으로 지정된 파일
2. **원격 배포**: Supabase Dashboard의 Environment Variables
3. **Secrets**: `supabase secrets set`으로 등록된 값

## 💡 실제 사용 예시

### 1. Cache Gateway 함수

```typescript
// 프론트엔드에서 호출
const response = await fetch('https://bovtkqgdzihoclazkpcq.supabase.co/functions/v1/cache-gateway', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productIds: ['product123', 'product456'],
    threadId: 'thread-789',
    forceRefresh: false
  })
});

const result = await response.json();
```

### 2. LangGraph API 함수 (SEO 글 생성)

```typescript
// AI 워크플로우 처리 및 SEO 글 생성
const response = await fetch('https://bovtkqgdzihoclazkpcq.supabase.co/functions/v1/langgraph-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'seo_generation',
    query: '상품 리뷰 및 구매 가이드',
    products: [
      {
        name: '상품명',
        price: 10000,
        category: '카테고리',
        url: '상품URL'
      }
    ],
    seo_type: 'product_review'
  })
});

const result = await response.json();
```

### 3. SEO 글 생성 API (프론트엔드)

```typescript
// 프론트엔드에서 SEO 글 생성
const response = await fetch('/api/langgraph/seo-generation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    products: [
      {
        name: '상품명',
        price: 10000,
        category: '카테고리',
        url: '상품URL'
      }
    ],
    type: 'product_review'
  })
});

const result = await response.json();
```

## 🔧 문제 해결

### 1. 로컬 테스트 문제

**문제**: Docker가 실행되지 않음
```bash
# Docker Desktop 시작 후 다시 시도
npx supabase functions serve --no-verify-jwt --env-file ../../frontend/.env.local
```

**문제**: 포트 충돌
```bash
# 다른 포트 사용
npx supabase functions serve --port 54322 --no-verify-jwt --env-file ../../frontend/.env.local
```

### 2. 배포 문제

**문제**: JWT 인증 오류
```bash
# 인증 없이 배포
npx supabase functions deploy hello --project-ref bovtkqgdzihoclazkpcq --no-verify-jwt
```

**문제**: 환경 변수 누락
```bash
# secrets 등록 확인
npx supabase secrets list
```

### 3. SEO 글 생성 문제

**문제**: OpenAI API 키 누락
```bash
# OpenAI API 키 등록
npx supabase secrets set OPENAI_API_KEY=sk-proj-... --project-ref bovtkqgdzihoclazkpcq
```

**문제**: 함수 인증 오류
```bash
# 인증 없이 재배포
npx supabase functions deploy langgraph-api --project-ref bovtkqgdzihoclazkpcq --no-verify-jwt
```

## 📚 추가 리소스

- [Supabase Edge Functions 공식 문서](https://supabase.com/docs/guides/functions)
- [Deno 런타임 문서](https://deno.land/manual)
- [Supabase CLI 명령어 참조](https://supabase.com/docs/reference/cli)

## ✅ 체크리스트

- [ ] Supabase CLI 설치
- [ ] 프로젝트 연결
- [ ] 환경 변수 설정
- [ ] Docker Desktop 실행 (로컬 테스트용)
- [ ] 함수 배포
- [ ] 원격 테스트 성공
- [ ] 로컬 테스트 성공 (선택사항)
- [ ] SEO 글 생성 기능 테스트 