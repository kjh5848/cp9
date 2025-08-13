# queue-worker Edge Function

## 개요
백그라운드 작업 처리를 위한 큐 워커 시스템으로, LangGraph 기반의 비동기 작업을 관리하고 실행하는 함수입니다.

**주요 기능:**
- LangGraph 기반 워크플로우 작업 처리
- 우선순위 기반 작업 큐 관리
- 작업 상태 추적 및 모니터링
- 실패 작업 재시도 메커니즘
- 체크포인트 기반 작업 복구

## API 명세

**엔드포인트:** `POST /functions/v1/queue-worker`

### 요청 형식

#### 작업 추가 (Enqueue)
```json
{
  "action": "enqueue",
  "job": {
    "id": "job_12345",
    "type": "research_workflow",
    "payload": {
      "itemName": "무선 이어폰",
      "itemId": "item_001",
      "projectId": "proj_001"
    },
    "priority": "high",
    "maxRetries": 3
  }
}
```

#### 작업 상태 조회
```json
{
  "action": "status",
  "jobId": "job_12345"
}
```

#### 작업 큐 통계
```json
{
  "action": "stats",
  "queueName": "langgraph-queue"
}
```

#### 작업 취소
```json
{
  "action": "cancel",
  "jobId": "job_12345"
}
```

### 응답 형식

#### 작업 추가 응답
```json
{
  "success": true,
  "data": {
    "jobId": "job_12345",
    "status": "queued",
    "priority": "high",
    "estimatedWaitTime": 120,
    "queuePosition": 3
  }
}
```

#### 작업 상태 응답
```json
{
  "success": true,
  "data": {
    "jobId": "job_12345",
    "status": "running",
    "progress": 65,
    "currentStep": "generating_content",
    "startedAt": "2024-01-15T10:30:00Z",
    "estimatedCompletion": "2024-01-15T10:45:00Z",
    "retryCount": 0,
    "result": null
  }
}
```

#### 완료된 작업 응답
```json
{
  "success": true,
  "data": {
    "jobId": "job_12345",
    "status": "completed",
    "progress": 100,
    "startedAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:42:00Z",
    "result": {
      "researchData": {...},
      "draftContent": {...}
    }
  }
}
```

#### 큐 통계 응답
```json
{
  "success": true,
  "data": {
    "queueName": "langgraph-queue",
    "totalJobs": 25,
    "queuedJobs": 5,
    "runningJobs": 2,
    "completedJobs": 18,
    "failedJobs": 0,
    "averageProcessTime": 180
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "error_message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

## 사용법

### cURL 예제
```bash
# 작업 큐에 추가
curl -X POST http://localhost:54321/functions/v1/queue-worker \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "action": "enqueue",
    "job": {
      "id": "test_job_001",
      "type": "research_workflow",
      "payload": {
        "itemName": "테스트 상품",
        "itemId": "test_001"
      },
      "priority": "medium"
    }
  }'

# 작업 상태 확인
curl -X POST http://localhost:54321/functions/v1/queue-worker \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "action": "status",
    "jobId": "test_job_001"
  }'
```

### JavaScript/TypeScript 예제
```typescript
// 작업을 큐에 추가
const { data: jobData, error } = await supabase.functions.invoke('queue-worker', {
  body: {
    action: 'enqueue',
    job: {
      id: generateJobId(),
      type: 'research_workflow',
      payload: {
        itemName: '무선 이어폰',
        itemId: 'item_001',
        projectId: 'proj_001'
      },
      priority: 'high',
      maxRetries: 3
    }
  }
});

if (error) {
  console.error('Job enqueue failed:', error);
} else {
  console.log('Job queued:', jobData.data.jobId);
  
  // 상태 폴링
  const pollStatus = setInterval(async () => {
    const { data: statusData } = await supabase.functions.invoke('queue-worker', {
      body: {
        action: 'status',
        jobId: jobData.data.jobId
      }
    });
    
    if (statusData?.data?.status === 'completed') {
      console.log('Job completed:', statusData.data.result);
      clearInterval(pollStatus);
    } else if (statusData?.data?.status === 'failed') {
      console.error('Job failed:', statusData.data.error);
      clearInterval(pollStatus);
    }
  }, 5000); // 5초마다 상태 확인
}
```

## 필수 환경 변수

```bash
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password (선택사항)
LANGGRAPH_API_URL=http://localhost:8000
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 구현 세부사항

### 주요 프로세스
1. **작업 수신**: 큐 작업 요청 검증 및 처리
2. **우선순위 관리**: high > medium > low 순으로 처리
3. **LangGraph 호출**: 워크플로우 실행을 위한 API 호출
4. **상태 추적**: Redis를 통한 실시간 상태 업데이트
5. **에러 처리**: 실패시 재시도 및 에러 로깅

### 지원되는 작업 타입
```typescript
enum JobType {
  RESEARCH_WORKFLOW = 'research_workflow',
  CONTENT_GENERATION = 'content_generation',
  BATCH_PROCESSING = 'batch_processing',
  DATA_SYNC = 'data_sync'
}
```

### 우선순위 시스템
```typescript
enum Priority {
  HIGH = 'high',      // 점수: 100
  MEDIUM = 'medium',  // 점수: 50
  LOW = 'low'         // 점수: 10
}
```

### 작업 상태 생명주기
```
queued → running → completed
         ↓
       failed → (retry) → running
```

### LangGraph 워크플로우 통합
```typescript
// LangGraph API 호출 예시
const workflowResponse = await fetch(`${LANGGRAPH_API_URL}/workflows/execute`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    workflow_id: job.type,
    input: job.payload,
    config: {
      checkpoint: true,
      max_iterations: 10
    }
  })
});
```

### 체크포인트 시스템
```typescript
// 작업 진행상황 체크포인트 저장
const checkpoint = {
  jobId: job.id,
  step: 'research_complete',
  progress: 50,
  intermediateResult: {...},
  timestamp: new Date().toISOString()
};
```

## 테스트 방법

### 로컬 테스트
```bash
# Redis 및 LangGraph 서비스 시작
docker-compose up -d redis langgraph

# Supabase 로컬 서비스 시작
supabase start

# 함수 서빙
supabase functions serve queue-worker --env-file .env.local

# 작업 추가 테스트
curl -X POST http://localhost:54321/functions/v1/queue-worker \
  -H "Content-Type: application/json" \
  -d '{
    "action": "enqueue",
    "job": {
      "id": "test_001",
      "type": "research_workflow",
      "payload": {"itemName": "테스트"},
      "priority": "high"
    }
  }'

# 상태 확인 테스트
curl -X POST http://localhost:54321/functions/v1/queue-worker \
  -H "Content-Type: application/json" \
  -d '{"action": "status", "jobId": "test_001"}'
```

### 부하 테스트
```bash
# 여러 작업을 동시에 큐에 추가
for i in {1..10}; do
  curl -X POST http://localhost:54321/functions/v1/queue-worker \
    -H "Content-Type: application/json" \
    -d "{
      \"action\": \"enqueue\",
      \"job\": {
        \"id\": \"load_test_$i\",
        \"type\": \"research_workflow\",
        \"payload\": {\"itemName\": \"테스트상품$i\"},
        \"priority\": \"medium\"
      }
    }" &
done
```

## 문제 해결

### 일반적인 오류

**`Redis connection failed`**
```bash
# 해결: Redis 서버 상태 확인
docker ps | grep redis
redis-cli ping

# 연결 설정 확인
supabase secrets list | grep REDIS
```

**`LangGraph API unavailable`**
```bash
# 해결: LangGraph 서비스 상태 확인
curl -X GET http://localhost:8000/health

# 서비스 재시작
docker-compose restart langgraph
```

**`Job not found`**
- 잘못된 jobId 또는 만료된 작업
- Redis에서 키 존재 여부 확인

**`Invalid job type`**
- 지원하지 않는 작업 타입
- JobType enum 값 확인

**`Queue is full`**
- 큐 용량 초과 (기본: 1000개)
- 완료된 작업 정리 또는 큐 크기 증가 필요

### 디버깅 방법

**로그 확인:**
```bash
supabase functions logs queue-worker --tail
```

**Redis 큐 상태 확인:**
```bash
redis-cli

# 큐에 있는 모든 작업 확인
LRANGE langgraph-queue:jobs 0 -1

# 특정 작업 상태 확인
GET job:status:job_12345

# 실패한 작업 확인
LRANGE langgraph-queue:failed 0 -1
```

**작업 실행 추적:**
```bash
# 실행 중인 작업 확인
GET langgraph-queue:running

# 작업 히스토리 확인
LRANGE job:history:job_12345 0 -1
```

**성능 모니터링:**
```bash
# 큐 통계 API 활용
curl -X POST http://localhost:54321/functions/v1/queue-worker \
  -d '{"action": "stats", "queueName": "langgraph-queue"}'
```

## 성능 고려사항

- **처리 용량**: 동시 최대 5개 작업 처리 (설정 가능)
- **큐 크기**: 기본 1000개 작업 큐잉 지원
- **재시도 정책**: 지수 백오프를 사용한 최대 3회 재시도
- **메모리 관리**: 완료된 작업 결과는 24시간 후 자동 삭제
- **모니터링**: 작업 처리 시간 및 성공률 추적
- **확장성**: 워커 인스턴스 수평 확장 지원