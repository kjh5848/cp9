# docs Edge Function

## 개요
CP9 백엔드의 모든 Supabase Edge Functions에 대한 **Swagger UI 기반 API 문서**를 제공하는 함수입니다.

**주요 기능:**
- OpenAPI 3.0.3 규격 기반 API 문서
- 대화형 Swagger UI 인터페이스
- 실시간 API 테스트 기능
- 한글 설명 및 예제 포함

## 접속 방법

### 로컬 개발환경
```bash
# Supabase 로컬 서비스 시작
supabase start

# docs 함수 서빙 (선택사항 - 자동으로 모든 함수 서빙됨)
supabase functions serve docs

# 브라우저에서 접속
http://localhost:54321/functions/v1/docs
```

### 프로덕션 환경
```bash
# 함수 배포
supabase functions deploy docs

# 브라우저에서 접속
https://[your-project-ref].supabase.co/functions/v1/docs
```

## API 문서 구성

### 포함된 Edge Functions (6개)
1. **item-research** - Perplexity 기반 상품 리서치
2. **write** - OpenAI GPT 기반 SEO 콘텐츠 생성  
3. **cache-gateway** - Redis 캐싱 시스템
4. **queue-worker** - 백그라운드 작업 큐 관리
5. **langgraph-api** - AI 워크플로우 오케스트레이션
6. **hello** - 테스트용 기본 함수

### 주요 특징
- **대화형 API 테스트**: "Try it out" 기능으로 직접 API 호출 가능
- **실시간 인증**: Bearer 토큰을 통한 실제 API 테스트
- **한글 문서**: 모든 설명과 예제가 한글로 작성
- **태그 분류**: Research, Content Generation, Cache, Queue, Workflow, Test
- **자동 서버 감지**: 로컬/프로덕션 환경 자동 인식

## 사용법

### 1. 기본 문서 보기
- 브라우저에서 `/functions/v1/docs` 접속
- 모든 API 엔드포인트와 스키마 확인
- 요청/응답 예제 및 설명 열람

### 2. API 테스트하기
```bash
# 1. "Authorize" 버튼 클릭
# 2. Bearer 토큰 입력 (Supabase anon key 또는 access token)
# 3. 원하는 API 선택
# 4. "Try it out" 클릭
# 5. 파라미터 입력 후 "Execute" 실행
```

### 3. curl 명령어 복사
- 각 API 테스트 후 자동 생성된 curl 명령어 복사 가능
- 터미널에서 바로 실행하여 검증

### 4. OpenAPI 스펙 다운로드
```bash
# swagger.yaml 파일 직접 접근
http://localhost:54321/functions/v1/docs/swagger.yaml

# 또는 브라우저에서 우클릭 -> "다른 이름으로 저장"
```

## 개발자 활용

### API 개발 워크플로우
1. **API 설계**: Swagger UI에서 스펙 확인
2. **개발**: 실제 Edge Function 구현  
3. **테스트**: Swagger UI에서 직접 테스트
4. **문서 업데이트**: `docs/index.ts` 내 스펙 수정

### 프론트엔드 개발 지원
```javascript
// Swagger UI에서 테스트한 API 호출을 코드로 변환
const { data, error } = await supabase.functions.invoke('item-research', {
  body: {
    itemName: '무선 이어폰',
    projectId: 'project_123', 
    itemId: 'item_456'
  }
});
```

### 팀 협업
- **API 명세 공유**: 팀원들과 표준화된 API 문서 공유
- **변경사항 추적**: 문서를 통한 API 변경 이력 관리
- **QA 테스트**: QA 팀이 직접 API 동작 확인

## 구현 세부사항

### 주요 프로세스
1. **요청 라우팅**: pathname에 따라 HTML 또는 YAML 반환
2. **CORS 처리**: 브라우저에서 접근 가능하도록 CORS 헤더 설정
3. **동적 서버**: 로컬/프로덕션 환경 자동 감지
4. **정적 서빙**: Swagger UI 정적 파일 CDN 로드

### 파일 구조
```typescript
// docs/index.ts
├── swaggerYaml        // OpenAPI 스펙 (YAML 형식)
├── swaggerUiHtml      // Swagger UI HTML 템플릿
└── serve()            // HTTP 요청 처리 로직
```

### 자동 서버 감지
```javascript
// 로컬 개발시 자동으로 localhost:54321 사용
requestInterceptor: function(request) {
  if (currentHost.includes('localhost')) {
    request.url = request.url.replace(/https?:\/\/[^/]+/, 'http://localhost:54321');
  }
  return request;
}
```

## 문서 업데이트 방법

### 새로운 Edge Function 추가시
1. `docs/index.ts` 파일 내 `swaggerYaml` 수정
2. `paths` 섹션에 새로운 API 경로 추가
3. `components/schemas`에 필요한 스키마 추가
4. 태그 및 설명 업데이트

### API 스펙 변경시
```typescript
// 요청/응답 스키마 수정 예시
'/new-endpoint':
  post:
    tags:
      - New Feature
    summary: 새로운 기능 API
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              newField:
                type: string
                description: 새로운 필드
```

## 문제 해결

### 일반적인 오류

**`문서 페이지가 로드되지 않음`**
```bash
# 해결: docs 함수 배포 확인
supabase functions deploy docs

# 함수 목록 확인
supabase functions list
```

**`API 테스트시 CORS 에러`**
- Swagger UI 내에서 테스트시에는 CORS가 자동 처리됨
- 브라우저 콘솔에서 직접 fetch 호출시만 CORS 에러 발생 가능

**`Bearer 토큰 인증 실패`**
```bash
# 올바른 토큰 형식 확인
Authorization: Bearer YOUR_SUPABASE_ANON_KEY

# 토큰 유효성 검증
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:54321/functions/v1/hello
```

**`swagger.yaml 파일 접근 불가`**
- `/docs/swagger.yaml` 경로로 직접 접근 가능
- 브라우저에서 우클릭 → "다른 이름으로 저장" 사용

### 디버깅 방법

**로그 확인:**
```bash
supabase functions logs docs --tail
```

**로컬 테스트:**
```bash
# docs 함수만 개별 서빙
supabase functions serve docs

# 브라우저에서 접속 테스트  
http://localhost:54321/functions/v1/docs
```

**스펙 유효성 검증:**
```bash
# 온라인 Swagger Editor에서 검증
https://editor.swagger.io/

# yaml 내용 복사하여 붙여넣기 후 문법 확인
```

## 성능 고려사항

- **응답 시간**: 정적 HTML/YAML 서빙으로 매우 빠름 (<50ms)
- **메모리 사용량**: 문서 데이터가 메모리에 상주하므로 적은 사용량
- **CDN 활용**: Swagger UI 리소스는 외부 CDN에서 로드
- **캐싱**: 브라우저 캐싱으로 재방문시 빠른 로딩
- **동시 접속**: 상태 없는 정적 서빙으로 제한 없음

이제 **`localhost:54321/functions/v1/docs`**로 접속하여 완전한 API 문서를 확인할 수 있습니다! 🚀