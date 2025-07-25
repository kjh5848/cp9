# Supabase Edge Functions - LangGraph 자동화 시스템

## 개요

이 디렉토리는 LangGraph 기반 자동화 시스템을 위한 Supabase Edge Functions를 포함합니다.

## Edge Functions 목록

### 1. Cache Gateway (`cache-gateway`)
- **기능**: Redis 캐시 검사 및 큐 작업 등록
- **엔드포인트**: `/functions/v1/cache-gateway`
- **메서드**: POST

**요청 예시:**
```json
{
  "productIds": ["123456", "789012"],
  "threadId": "thread_1234567890",
  "forceRefresh": false
}
```

**응답 예시:**
```json
{
  "success": true,
  "cachedData": [...],
  "jobId": "job_1234567890",
  "message": "캐시 미스: 2개 상품이 큐에 추가되었습니다."
}
```

### 2. Queue Worker (`queue-worker`)
- **기능**: LangGraph 작업 큐 처리 및 실행
- **엔드포인트**: `/functions/v1/queue-worker`
- **메서드**: POST

**요청 예시:**
```json
{
  "action": "process"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "작업 처리 완료: job_1234567890",
  "jobId": "job_1234567890"
}
```

### 3. LangGraph API (`langgraph-api`)
- **기능**: LangGraph 실행 및 체크포인트 관리
- **엔드포인트**: `/functions/v1/langgraph-api`
- **메서드**: POST

**요청 예시:**
```json
{
  "action": "execute",
  "initialState": {
    "input": {
      "urls": ["https://www.coupang.com/vp/products/123456"],
      "productIds": ["123456"]
    }
  },
  "threadId": "thread_1234567890"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "state": {...},
    "completedNodes": ["extractIds", "cacheGateway", "staticCrawler"],
    "checkpointId": "checkpoint_1234567890"
  },
  "message": "LangGraph 실행 완료"
}
```

## 배포 방법

### 방법 1: GitHub 연동 (권장)

#### 1. Supabase 프로젝트 설정
- Supabase Dashboard → Settings → Git integration
- GitHub 저장소 연결
- 브랜치 선택 (main/master)

#### 2. 자동 배포
```bash
# 코드 변경 후 GitHub에 push
git add .
git commit -m "feat: Edge Functions 업데이트"
git push origin main
```
- `backend/supabase/functions/` 폴더의 변경사항이 자동으로 감지
- GitHub에 push하면 자동으로 Supabase에 배포

#### 3. 환경변수 설정
- Supabase Dashboard → Settings → Environment variables
- 또는 GitHub Secrets 사용

### 방법 2: Supabase CLI (로컬 개발용)

#### 1. Supabase CLI 설치
```bash
npm install -g supabase
```

#### 2. Supabase 프로젝트 연결
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

#### 3. Edge Functions 배포
```bash
# 모든 함수 배포
supabase functions deploy

# 특정 함수만 배포
supabase functions deploy cache-gateway
supabase functions deploy queue-worker
supabase functions deploy langgraph-api
```

### 4. 환경변수 설정
```bash
# Redis 설정
supabase secrets set REDIS_URL=your_redis_url
supabase secrets set REDIS_PASSWORD=your_redis_password

# LangGraph 설정
supabase secrets set LANGGRAPH_QUEUE_NAME=langgraph-queue
supabase secrets set LANGGRAPH_MAX_CONCURRENCY=5

# WordPress 설정
supabase secrets set WORDPRESS_API_URL=your_wordpress_api_url
supabase secrets set WORDPRESS_USERNAME=your_username
supabase secrets set WORDPRESS_PASSWORD=your_password

# 기타 API 키
supabase secrets set OPENAI_API_KEY=your_openai_api_key
supabase secrets set PERPLEXITY_API_KEY=your_perplexity_api_key
```

## 로컬 개발

### 1. 로컬 Supabase 시작
```bash
supabase start
```

### 2. Edge Functions 로컬 실행
```bash
# 모든 함수 실행
supabase functions serve

# 특정 함수만 실행
supabase functions serve cache-gateway
```

### 3. 로컬 테스트
```bash
# Cache Gateway 테스트
curl -X POST http://localhost:54321/functions/v1/cache-gateway \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["123456"], "threadId": "test_thread"}'

# Queue Worker 테스트
curl -X POST http://localhost:54321/functions/v1/queue-worker \
  -H "Content-Type: application/json" \
  -d '{"action": "process"}'

# LangGraph API 테스트
curl -X POST http://localhost:54321/functions/v1/langgraph-api \
  -H "Content-Type: application/json" \
  -d '{"action": "status", "threadId": "test_thread"}'
```

## 아키텍처

### 데이터 플로우
```
1. 클라이언트 → Cache Gateway
   - productIds와 threadId 전송
   - 캐시 히트/미스 확인
   - 미스 시 큐에 작업 추가

2. Queue Worker → LangGraph API
   - 큐에서 작업 가져오기
   - 작업 타입별 처리 (scrape/seo/publish)
   - 결과 저장 및 상태 업데이트

3. LangGraph API → Redis
   - 체크포인트 저장/복구
   - 그래프 상태 관리
   - 스레드별 실행 관리
```

### Redis 키 구조
```
# 캐시
langgraph:product:{productId}

# 큐
{queueName}:job:{jobId}
{queueName}:queue
{queueName}:retry_queue
{queueName}:status:{jobId}

# 체크포인트
langgraph:checkpoint:{threadId}
langgraph:checkpoint:{threadId}:{node}

# 그래프 상태
langgraph:status:{threadId}
```

## 모니터링 및 로그

### 로그 확인
```bash
# 실시간 로그
supabase functions logs --follow

# 특정 함수 로그
supabase functions logs cache-gateway --follow
```

### 상태 확인
```bash
# 함수 목록
supabase functions list

# 함수 정보
supabase functions info cache-gateway
```

## 오류 처리

### 일반적인 오류
1. **Redis 연결 실패**: 환경변수 확인
2. **메모리 부족**: 함수 설정에서 메모리 증가
3. **타임아웃**: 함수 실행 시간 설정 조정

### 디버깅
```bash
# 로컬에서 디버그 모드 실행
supabase functions serve --debug

# 로그 레벨 설정
supabase functions serve --log-level debug
```

## 성능 최적화

### 설정 권장사항
- **메모리**: 512MB 이상
- **타임아웃**: 30초 이상
- **동시 실행**: 5개 이하
- **Redis 연결 풀**: 10개 이상

### 캐시 전략
- **TTL**: 24시간 (86400초)
- **캐시 키**: productId 기반
- **무효화**: forceRefresh 옵션

## 보안 고려사항

### 인증
- Supabase JWT 토큰 검증
- API 키 환경변수 관리
- CORS 설정

### 데이터 보호
- 민감한 정보 암호화
- 로그에서 개인정보 제거
- Redis 접근 제한

## 확장 계획

### 향후 추가 예정
1. **실시간 알림**: WebSocket 기반 상태 업데이트
2. **배치 처리**: 대량 작업 최적화
3. **메트릭 수집**: Prometheus/Grafana 연동
4. **자동 스케일링**: 로드에 따른 동적 확장 