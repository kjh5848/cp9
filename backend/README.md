# Supabase CLI 환경 변수(secrets) 관리 및 Edge Functions 로컬 테스트 가이드

## 1. Supabase CLI로 secrets(환경 변수) 등록

### 1) CLI 설치
```bash
npm install -g supabase
```

### 2) 로그인
```bash
supabase login
# (토큰은 https://supabase.com/dashboard/account/tokens 에서 발급)
```

### 3) 프로젝트 연결
```bash
supabase link --project-ref <프로젝트-ref>
```

### 4) secrets 등록
```bash
supabase secrets set OPENAI_API_KEY=sk-... PERPLEXITY_API_KEY=pplx-... WORDPRESS_API_KEY=...
```

### 5) 등록된 secrets 확인
```bash
supabase secrets list
```

---

## 2. Edge Functions 로컬 테스트

### 1) Edge Functions serve
```bash
supabase functions serve
```
- 기본적으로 `backend/supabase/functions` 폴더의 함수를 로컬에서 실행
- secrets는 자동으로 환경 변수로 주입됨

### 2) .env 파일로 secrets 일괄 등록
```bash
supabase secrets set --env-file ../frontend/.env.local
```

---

## 3. CI/CD 없이 CLI만 사용하는 이유
- Supabase를 GitHub로 연결(CI/CD)하면 요금제 업그레이드 필요
- CLI로만 secrets/migration/deploy 관리 시 무료 플랜 유지 가능

---

## 4. 참고
- 공식문서: https://supabase.com/docs/guides/cli
- secrets: https://supabase.com/docs/guides/cli/secrets 