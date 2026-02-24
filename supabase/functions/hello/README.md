# hello Edge Function

## 개요
가장 단순한 테스트용 Edge Function으로, Supabase Edge Functions의 기본 동작을 확인하고 공유 유틸리티 사용 예제를 제공합니다.

**주요 기능:**
- 기본적인 POST 요청 처리
- 공유 유틸리티 사용 예제
- CORS 및 에러 처리 데모
- Edge Functions 동작 상태 확인

## API 명세

**엔드포인트:** `POST /functions/v1/hello`

### 요청 형식
```json
{
  "name": "Claude",
  "message": "Hello World"
}
```

### 응답 형식
```json
{
  "success": true,
  "data": {
    "greeting": "Hello, Claude!",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "message": "Hello World",
    "server": "Supabase Edge Functions",
    "version": "1.0.0"
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "name is required",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "name",
    "received": null
  }
}
```

## 사용법

### cURL 예제
```bash
# 기본 요청
curl -X POST http://localhost:54321/functions/v1/hello \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "name": "Claude",
    "message": "Hello World"
  }'

# 에러 테스트 (name 누락)
curl -X POST http://localhost:54321/functions/v1/hello \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "message": "Hello World"
  }'
```

### JavaScript/TypeScript 예제
```typescript
// 기본 사용법
const { data, error } = await supabase.functions.invoke('hello', {
  body: {
    name: 'Claude',
    message: 'Hello from TypeScript!'
  }
});

if (error) {
  console.error('Hello function failed:', error);
} else {
  console.log('Response:', data);
}

// React 컴포넌트에서 사용
import { useSupabaseClient } from '@supabase/auth-helpers-react';

function HelloTest() {
  const supabase = useSupabaseClient();
  
  const testHelloFunction = async () => {
    const { data, error } = await supabase.functions.invoke('hello', {
      body: {
        name: 'React User',
        message: 'Testing Edge Function'
      }
    });
    
    if (data?.success) {
      alert(data.data.greeting);
    }
  };
  
  return (
    <button onClick={testHelloFunction}>
      Test Hello Function
    </button>
  );
}
```

## 필수 환경 변수

```bash
# 기본적으로는 환경 변수가 필요하지 않음
# Supabase 기본 설정만으로 동작

SUPABASE_URL=your-supabase-url (자동 주입)
SUPABASE_ANON_KEY=your-anon-key (자동 주입)
```

## 구현 세부사항

### 주요 프로세스
1. **요청 파싱**: JSON 요청 body를 안전하게 파싱
2. **입력 검증**: name 필드 필수 여부 확인
3. **응답 생성**: 표준화된 성공 응답 생성
4. **에러 처리**: 유효성 검사 실패시 표준 에러 응답

### 공유 유틸리티 사용 예제
```typescript
// hello/index.ts 구현 예제
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createEdgeFunctionHandler, safeJsonParse } from "../_shared/server.ts";
import { ok, fail } from "../_shared/response.ts";

interface HelloRequest {
  name: string;
  message?: string;
}

async function handleHello(req: Request): Promise<Response> {
  // 안전한 JSON 파싱 (공유 유틸리티 사용)
  const body = await safeJsonParse<HelloRequest>(req);
  
  // 입력 검증
  if (!body?.name) {
    return fail("name is required", "VALIDATION_ERROR", 400, {
      field: "name",
      received: body?.name || null
    });
  }
  
  // 성공 응답 (공유 유틸리티 사용)
  return ok({
    greeting: `Hello, ${body.name}!`,
    timestamp: new Date().toISOString(),
    message: body.message || "No message provided",
    server: "Supabase Edge Functions",
    version: "1.0.0"
  });
}

// Edge Function 핸들러 래퍼 사용 (자동 CORS, 에러 처리)
serve(createEdgeFunctionHandler(handleHello));
```

### 테스트 시나리오
1. **정상 요청**: name과 message를 포함한 완전한 요청
2. **부분 요청**: name만 포함한 최소 요청
3. **에러 요청**: name이 누락된 요청
4. **OPTIONS 요청**: CORS preflight 요청 테스트

## 테스트 방법

### 로컬 테스트
```bash
# Supabase 로컬 서비스 시작
supabase start

# hello 함수만 서빙
supabase functions serve hello

# 정상 요청 테스트
curl -X POST http://localhost:54321/functions/v1/hello \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "message": "Local test"}'

# 에러 요청 테스트 (name 누락)
curl -X POST http://localhost:54321/functions/v1/hello \
  -H "Content-Type: application/json" \
  -d '{"message": "Missing name"}'

# OPTIONS 요청 테스트 (CORS)
curl -X OPTIONS http://localhost:54321/functions/v1/hello \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"
```

### 프로덕션 테스트
```bash
# 프로덕션 엔드포인트 테스트
curl -X POST https://[project-ref].supabase.co/functions/v1/hello \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"name": "Production User", "message": "Production test"}'
```

### 성능 테스트
```bash
# Apache Bench를 사용한 부하 테스트
ab -n 100 -c 10 -p hello-payload.json -T application/json \
  http://localhost:54321/functions/v1/hello

# hello-payload.json 내용:
# {"name": "Load Test", "message": "Performance testing"}
```

## 문제 해결

### 일반적인 오류

**`Function not found`**
```bash
# 해결: 함수 배포 확인
supabase functions deploy hello

# 로컬에서 확인
supabase functions list
```

**`CORS error in browser`**
- 브라우저에서 직접 호출시 CORS 에러
- createEdgeFunctionHandler가 자동으로 CORS 처리
- Authorization 헤더 필요

**`name is required`**
```bash
# 해결: name 필드 포함하여 요청
curl -d '{"name": "Your Name", "message": "Optional message"}'
```

**`JSON parsing error`**
- 잘못된 JSON 형식
- Content-Type 헤더 확인
- JSON 문법 검증

### 디버깅 방법

**로그 확인:**
```bash
supabase functions logs hello --tail
```

**함수 상태 확인:**
```bash
# 함수 목록 및 상태
supabase functions list

# 특정 함수 정보
supabase functions inspect hello
```

**요청/응답 분석:**
```bash
# 상세한 curl 출력
curl -v -X POST http://localhost:54321/functions/v1/hello \
  -H "Content-Type: application/json" \
  -d '{"name": "Debug Test"}'
```

**공유 유틸리티 동작 확인:**
- `createEdgeFunctionHandler`의 CORS 처리 동작
- `safeJsonParse`의 에러 처리 동작
- `ok`/`fail` 함수의 응답 형식 통일

## 활용 사례

### 1. Health Check 엔드포인트
```typescript
// 서비스 상태 확인용
const healthCheck = {
  name: "system",
  message: "health-check"
};
```

### 2. Edge Functions 동작 테스트
```typescript
// 새로운 함수 개발시 기본 패턴 확인
// 공유 유틸리티 동작 검증
// CORS 설정 테스트
```

### 3. 개발환경 확인
```typescript
// 로컬 Supabase 설정 확인
// API 키 및 권한 테스트
// 네트워크 연결 검증
```

### 4. 학습 및 예제
```typescript
// Edge Functions 개발 학습용
// 공유 유틸리티 사용법 예제
// 표준 패턴 데모
```

## 성능 고려사항

- **응답 시간**: < 100ms (로직이 단순함)
- **메모리 사용량**: 최소 (상태 저장 없음)
- **동시 처리**: 제한 없음 (상태 없는 함수)
- **비용**: 최소 (처리 시간과 리소스 사용량이 적음)
- **확장성**: 무제한 (상태 없는 순수 함수)
- **캐싱**: 불필요 (동적 응답이므로 캐시 효과 없음)