# langgraph-api Edge Function

## 개요
LangGraph 기반의 복잡한 AI 워크플로우를 오케스트레이션하고 관리하는 API 함수입니다.

**주요 기능:**
- AI 에이전트 기반 워크플로우 실행
- 상태 기반 그래프 워크플로우 관리
- 체크포인트를 활용한 중단/재개 지원
- 실시간 워크플로우 상태 스트리밍
- 멀티 스텝 AI 작업 체인 처리

## API 명세

**엔드포인트:** `POST /functions/v1/langgraph-api`

### 요청 형식

#### 워크플로우 실행
```json
{
  "action": "execute",
  "workflow": {
    "id": "research-to-content",
    "input": {
      "keyword": "무선 이어폰",
      "productData": {
        "productName": "삼성 갤럭시 버즈3",
        "productPrice": 199000
      }
    },
    "config": {
      "maxSteps": 10,
      "timeout": 300,
      "enableCheckpoints": true
    }
  }
}
```

#### 워크플로우 상태 조회
```json
{
  "action": "status",
  "workflowId": "research-to-content",
  "executionId": "exec_12345"
}
```

#### 워크플로우 중단
```json
{
  "action": "cancel",
  "executionId": "exec_12345"
}
```

#### 체크포인트에서 재개
```json
{
  "action": "resume",
  "executionId": "exec_12345",
  "checkpointId": "checkpoint_step_3"
}
```

### 응답 형식

#### 워크플로우 실행 응답
```json
{
  "success": true,
  "data": {
    "executionId": "exec_12345",
    "workflowId": "research-to-content",
    "status": "running",
    "currentStep": "product_research",
    "progress": 25,
    "estimatedCompletion": "2024-01-15T10:45:00Z",
    "checkpoints": ["checkpoint_step_1", "checkpoint_step_2"]
  }
}
```

#### 완료된 워크플로우 응답
```json
{
  "success": true,
  "data": {
    "executionId": "exec_12345",
    "status": "completed",
    "progress": 100,
    "result": {
      "researchData": {
        "features": ["기능1", "기능2"],
        "pros": ["장점1", "장점2"],
        "cons": ["단점1"]
      },
      "generatedContent": {
        "title": "삼성 갤럭시 버즈3 완벽 가이드",
        "content": "# 완벽 가이드\n\n## 1장: 소개\n...",
        "metaTitle": "삼성 갤럭시 버즈3 리뷰"
      }
    },
    "executionTime": 245,
    "stepsCompleted": 8
  }
}
```

#### 상태 스트리밍 응답 (Server-Sent Events)
```
data: {"step": "product_research", "progress": 25, "message": "상품 리서치 진행 중..."}

data: {"step": "content_generation", "progress": 50, "message": "콘텐츠 생성 중..."}

data: {"step": "completed", "progress": 100, "result": {...}}
```

### 에러 응답
```json
{
  "success": false,
  "error": "error_message",
  "code": "ERROR_CODE",
  "details": {
    "step": "product_research",
    "checkpoint": "checkpoint_step_2"
  }
}
```

## 사용법

### cURL 예제
```bash
# 워크플로우 실행
curl -X POST http://localhost:54321/functions/v1/langgraph-api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "action": "execute",
    "workflow": {
      "id": "research-to-content",
      "input": {
        "keyword": "무선 이어폰",
        "itemId": "test_001"
      },
      "config": {
        "maxSteps": 10,
        "enableCheckpoints": true
      }
    }
  }'

# 워크플로우 상태 확인
curl -X POST http://localhost:54321/functions/v1/langgraph-api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "action": "status",
    "executionId": "exec_12345"
  }'
```

### JavaScript/TypeScript 예제
```typescript
// 워크플로우 실행
const { data: execution, error } = await supabase.functions.invoke('langgraph-api', {
  body: {
    action: 'execute',
    workflow: {
      id: 'research-to-content',
      input: {
        keyword: '무선 이어폰',
        itemId: 'item_001',
        productData: {
          productName: '삼성 갤럭시 버즈3',
          productPrice: 199000
        }
      },
      config: {
        maxSteps: 10,
        timeout: 300,
        enableCheckpoints: true
      }
    }
  }
});

if (error) {
  console.error('Workflow execution failed:', error);
} else {
  console.log('Workflow started:', execution.data.executionId);
  
  // 상태 폴링
  const pollStatus = async () => {
    const { data: status } = await supabase.functions.invoke('langgraph-api', {
      body: {
        action: 'status',
        executionId: execution.data.executionId
      }
    });
    
    if (status?.data?.status === 'completed') {
      console.log('Workflow completed:', status.data.result);
      return true;
    } else if (status?.data?.status === 'failed') {
      console.error('Workflow failed:', status.data.error);
      return true;
    }
    
    console.log(`Progress: ${status?.data?.progress}% - ${status?.data?.currentStep}`);
    return false;
  };
  
  // 5초마다 상태 확인
  const statusInterval = setInterval(async () => {
    const completed = await pollStatus();
    if (completed) {
      clearInterval(statusInterval);
    }
  }, 5000);
}
```

### 실시간 스트리밍 예제
```typescript
// Server-Sent Events를 통한 실시간 상태 업데이트
const eventSource = new EventSource(
  `${supabaseUrl}/functions/v1/langgraph-api/stream?executionId=exec_12345`,
  {
    headers: {
      'Authorization': `Bearer ${anonKey}`
    }
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`Step: ${data.step}, Progress: ${data.progress}%`);
  
  if (data.step === 'completed') {
    console.log('Workflow result:', data.result);
    eventSource.close();
  }
};

eventSource.onerror = (error) => {
  console.error('Stream error:', error);
  eventSource.close();
};
```

## 필수 환경 변수

```bash
LANGGRAPH_RUNTIME_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-your-openai-api-key
PERPLEXITY_API_KEY=pplx-your-perplexity-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 구현 세부사항

### 주요 프로세스
1. **워크플로우 검증**: 워크플로우 ID 및 입력 데이터 유효성 검사
2. **그래프 초기화**: LangGraph 런타임에 워크플로우 그래프 로드
3. **실행 관리**: 단계별 실행 및 상태 추적
4. **체크포인트 처리**: 중요 단계에서 상태 저장
5. **결과 반환**: 최종 결과 및 중간 데이터 제공

### 지원되는 워크플로우

#### research-to-content
```yaml
steps:
  1. product_search    # 상품 검색 및 선택
  2. product_research  # Perplexity를 통한 상품 리서치
  3. content_planning  # 콘텐츠 구조 계획
  4. content_generation # OpenAI를 통한 SEO 콘텐츠 생성
  5. content_review    # 생성된 콘텐츠 품질 검토
  6. final_output      # 최종 결과 정리
```

#### batch-processing
```yaml
steps:
  1. input_validation  # 배치 데이터 유효성 검사
  2. parallel_research # 여러 상품 병렬 리서치
  3. content_batch     # 배치 콘텐츠 생성
  4. quality_check     # 품질 검증
  5. batch_output      # 배치 결과 취합
```

### LangGraph 노드 구성
```python
# 워크플로우 그래프 정의 (Python LangGraph)
from langgraph.graph import StateGraph

def create_research_workflow():
    workflow = StateGraph(WorkflowState)
    
    # 노드 추가
    workflow.add_node("product_search", product_search_node)
    workflow.add_node("product_research", research_node)
    workflow.add_node("content_generation", content_node)
    
    # 엣지 정의
    workflow.add_edge("product_search", "product_research")
    workflow.add_edge("product_research", "content_generation")
    
    # 조건부 엣지
    workflow.add_conditional_edges(
        "content_generation",
        should_continue,
        {
            "continue": "quality_check",
            "end": END
        }
    )
    
    return workflow.compile(checkpointer=MemorySaver())
```

### 체크포인트 시스템
```typescript
// 체크포인트 데이터 구조
interface CheckpointData {
  executionId: string;
  step: string;
  timestamp: string;
  state: {
    input: any;
    output: any;
    intermediate: any;
  };
  metadata: {
    progress: number;
    estimatedRemaining: number;
  };
}
```

### 상태 관리
```typescript
// 워크플로우 상태 열거형
enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
```

## 테스트 방법

### 로컬 테스트
```bash
# LangGraph 런타임 시작 (별도 Python 환경)
cd langgraph-runtime
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Redis 시작
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Supabase 로컬 서비스 시작
supabase start

# 함수 서빙
supabase functions serve langgraph-api --env-file .env.local

# 간단한 워크플로우 테스트
curl -X POST http://localhost:54321/functions/v1/langgraph-api \
  -H "Content-Type: application/json" \
  -d '{
    "action": "execute",
    "workflow": {
      "id": "research-to-content",
      "input": {
        "keyword": "테스트 상품",
        "itemId": "test_001"
      }
    }
  }'
```

### 복잡한 워크플로우 테스트
```bash
# 배치 처리 워크플로우 테스트
curl -X POST http://localhost:54321/functions/v1/langgraph-api \
  -H "Content-Type: application/json" \
  -d '{
    "action": "execute",
    "workflow": {
      "id": "batch-processing",
      "input": {
        "items": [
          {"keyword": "무선 이어폰", "itemId": "item_001"},
          {"keyword": "스마트워치", "itemId": "item_002"},
          {"keyword": "노트북", "itemId": "item_003"}
        ]
      },
      "config": {
        "parallel": true,
        "maxConcurrency": 3
      }
    }
  }'
```

## 문제 해결

### 일반적인 오류

**`LangGraph runtime not available`**
```bash
# 해결: LangGraph 런타임 서버 확인
curl -X GET http://localhost:8000/health

# 런타임 재시작
cd langgraph-runtime
python -m uvicorn main:app --reload
```

**`Workflow not found`**
- 지원하지 않는 워크플로우 ID
- 사용 가능한 워크플로우: research-to-content, batch-processing

**`Execution timeout`**
- 워크플로우 실행 시간 초과 (기본: 300초)
- config.timeout 값을 늘려서 재시도

**`Checkpoint restore failed`**
- 유효하지 않은 체크포인트 ID
- Redis에서 체크포인트 데이터 확인

**`Invalid workflow state`**
- 워크플로우 상태 데이터 손상
- 체크포인트에서 복원 또는 새로 시작

### 디버깅 방법

**로그 확인:**
```bash
supabase functions logs langgraph-api --tail
```

**LangGraph 런타임 로그:**
```bash
# Python 런타임 로그 확인
docker logs langgraph-runtime

# 또는 직접 실행시
tail -f langgraph.log
```

**워크플로우 상태 추적:**
```bash
# Redis에서 실행 상태 확인
redis-cli
GET workflow:exec_12345:status
HGETALL workflow:exec_12345:state

# 체크포인트 확인
KEYS checkpoint:exec_12345:*
```

**그래프 시각화:**
```python
# LangGraph 워크플로우 시각화 (개발용)
workflow.get_graph().draw_mermaid_png(output_file_path="workflow.png")
```

## 성능 고려사항

- **실행 시간**: 워크플로우 복잡도에 따라 30초~10분
- **동시 실행**: 최대 10개 워크플로우 동시 처리
- **메모리 사용량**: 체크포인트 데이터로 인한 메모리 증가 주의
- **타임아웃**: 기본 5분, 복잡한 워크플로우는 증가 필요
- **체크포인트**: 상태 저장으로 인한 Redis 사용량 증가
- **스트리밍**: 실시간 상태 업데이트로 인한 연결 수 제한