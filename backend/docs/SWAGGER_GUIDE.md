# Swagger(OpenAPI) API 문서 가이드

## 개요

CP9 백엔드의 모든 Supabase Edge Functions에 대한 완전한 **OpenAPI 3.0.3** 규격 API 문서입니다.

## 문서 위치

- **Swagger YAML 파일**: `backend/swagger.yaml`
- **패키지 설정**: `backend/package.json` (문서 관련 스크립트 포함)

## Swagger UI로 문서 보기

### 1. 온라인 Swagger Editor 사용
```bash
# swagger.yaml 파일을 복사하여 붙여넣기
https://editor.swagger.io/
```

### 2. Edge Function으로 Swagger UI 서빙 ⭐ 추천
```bash
# Supabase 로컬 서비스 시작 (docs 함수 포함)
npm run docs

# 브라우저에서 접속
http://localhost:54321/functions/v1/docs
```

### 3. 로컬 Swagger UI 서버 실행 (대안)
```bash
# 의존성 설치
npm install

# Swagger UI 서버 시작
npm run docs:serve

# 브라우저에서 접속  
http://localhost:3001
```

### 4. VS Code 확장 사용
```bash
# Swagger Viewer 확장 설치
# swagger.yaml 파일을 열고 Shift+Alt+P -> "Preview Swagger"
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
- **완전한 OpenAPI 3.0.3 규격** 준수
- **한글 설명** 및 예제 포함
- **실제 요청/응답** 구조 정의
- **인증 방식** 및 **에러 처리** 표준화
- **태그 기반 분류** (Research, Content Generation, Cache, Queue, Workflow, Test)

## API 스키마 구조

### 공통 응답 형식
```yaml
ApiResponse:
  success: boolean     # API 호출 성공 여부
  data: object        # 응답 데이터 (성공시)
  error: string       # 에러 메시지 (실패시)
  code: string        # 에러 코드 (실패시)
  details: object     # 추가 에러 정보 (실패시)
```

### 주요 데이터 모델
- **ResearchPack**: 상품 리서치 데이터 구조
- **ProductData**: 쿠팡 상품 정보
- **SeoDraft**: 생성된 SEO 콘텐츠
- **QueueJob**: 큐 작업 정의
- **WorkflowExecution**: 워크플로우 실행 정보

### 인증 방식
```yaml
# Bearer Token 사용 (Supabase 인증)
Authorization: Bearer {anon_key_or_access_token}
```

## 사용 예제

### cURL 요청 예제
```bash
# 상품 리서치 API 호출
curl -X POST http://localhost:54321/functions/v1/item-research \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "itemName": "무선 이어폰",
    "projectId": "project_123",
    "itemId": "item_456"
  }'

# SEO 콘텐츠 생성 API 호출
curl -X POST http://localhost:54321/functions/v1/write \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "itemId": "item_456",
    "researchPack": {
      "title": "삼성 갤럭시 버즈3",
      "features": ["노이즈 캔슬링", "24시간 배터리"],
      "pros": ["뛰어난 음질", "편안한 착용감"],
      "cons": ["비싼 가격"],
      "keywords": ["삼성", "갤럭시버즈"]
    }
  }'
```

### JavaScript/TypeScript 예제
```typescript
// Supabase 클라이언트 사용
const { data, error } = await supabase.functions.invoke('item-research', {
  body: {
    itemName: '무선 이어폰',
    projectId: 'project_123',
    itemId: 'item_456'
  }
});

if (error) {
  console.error('API 호출 실패:', error);
} else {
  console.log('리서치 데이터:', data);
}
```

## 코드 생성

### TypeScript 클라이언트 생성
```bash
# TypeScript Fetch 클라이언트 생성
npm run docs:build

# 생성된 파일 위치: ./generated/
```

### 기타 언어 클라이언트 생성
```bash
# Python 클라이언트
swagger-codegen generate -i swagger.yaml -l python -o ./python-client

# Java 클라이언트
swagger-codegen generate -i swagger.yaml -l java -o ./java-client

# Go 클라이언트
swagger-codegen generate -i swagger.yaml -l go -o ./go-client
```

## 문서 유지보수

### 문서 검증
```bash
# Swagger 문서 유효성 검사
npm run docs:validate
```

### 문서 업데이트 시 주의사항
1. **OpenAPI 3.0.3 규격** 준수
2. **실제 Edge Function 구현**과 일치시키기
3. **예제 데이터**는 실제 사용 가능한 값으로 작성
4. **에러 코드 및 메시지** 일관성 유지
5. **한글 설명** 포함하여 개발자 친화적으로 작성

### 새로운 Edge Function 추가시
1. `swagger.yaml`에 경로 및 스키마 추가
2. 태그 및 설명 추가
3. 요청/응답 예제 작성
4. 문서 검증 후 배포

## 배포 및 호스팅

### GitHub Pages로 호스팅
```bash
# docs 브랜치에 swagger.yaml 업로드
# GitHub Pages 설정에서 Swagger UI 자동 렌더링
```

### 별도 문서 사이트
```bash
# Redoc 사용
npx redoc-cli serve swagger.yaml

# Swagger UI 정적 사이트 생성
swagger-ui-dist-cli -f swagger.yaml -d ./swagger-dist
```

## 문서 활용

### API 개발
- **계약 우선 개발** (Contract-First Development)
- **Mock 서버** 생성으로 프론트엔드 개발 가속화
- **API 테스팅** 도구 연동

### 팀 협업
- **API 명세** 공유 및 리뷰
- **클라이언트 코드** 자동 생성
- **API 변경사항** 추적 및 버전 관리

### QA 및 테스트
- **Postman 컬렉션** 자동 생성
- **API 테스트** 자동화
- **문서 기반** 통합 테스트

이 Swagger 문서를 통해 CP9 백엔드 API를 쉽게 이해하고 사용할 수 있습니다!