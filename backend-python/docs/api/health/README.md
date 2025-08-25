# 🏥 헬스체크 API

시스템 상태 모니터링 및 헬스체크를 위한 API입니다.

## 기본 정보

- **Base URL**: `/api/v1/health`
- **Purpose**: 시스템 상태 확인, 의존성 검증, 모니터링
- **Response Format**: JSON

## 엔드포인트

### GET `/api/v1/health`

전체 시스템 상태를 확인합니다.

#### 응답

##### 200 OK - 모든 시스템 정상
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "database": {
      "status": "healthy",
      "response_time_ms": 12,
      "details": {
        "connection_pool": "active",
        "pending_connections": 0
      }
    },
    "redis": {
      "status": "healthy", 
      "response_time_ms": 3,
      "details": {
        "used_memory": "2.1MB",
        "connected_clients": 5
      }
    },
    "celery": {
      "status": "healthy",
      "details": {
        "active_workers": 2,
        "queued_tasks": 0,
        "processed_tasks_total": 156
      }
    },
    "perplexity_api": {
      "status": "healthy",
      "response_time_ms": 245
    }
  },
  "metrics": {
    "uptime_seconds": 3600,
    "total_requests": 1250,
    "active_research_jobs": 3,
    "memory_usage_mb": 256.5
  }
}
```

##### 503 Service Unavailable - 일부 또는 전체 서비스 장애
```json
{
  "status": "degraded",
  "timestamp": "2024-01-20T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "database": {
      "status": "healthy",
      "response_time_ms": 15
    },
    "redis": {
      "status": "unhealthy",
      "error": "Connection timeout after 5000ms",
      "last_check": "2024-01-20T09:59:45.000Z"
    },
    "celery": {
      "status": "degraded",
      "details": {
        "active_workers": 1,
        "queued_tasks": 25,
        "failed_workers": 1
      }
    },
    "perplexity_api": {
      "status": "healthy",
      "response_time_ms": 189
    }
  },
  "errors": [
    "Redis connection failed - background tasks may be delayed",
    "Celery worker count reduced - processing capacity limited"
  ]
}
```

## 상태 정의

### 전체 시스템 상태
- **healthy**: 모든 서비스 정상
- **degraded**: 일부 서비스 장애, 기능 제한적 동작
- **unhealthy**: 주요 서비스 장애, 서비스 이용 불가

### 개별 서비스 상태
- **healthy**: 정상 동작
- **degraded**: 제한적 동작 (성능 저하, 일부 기능 제한)
- **unhealthy**: 서비스 이용 불가

## 모니터링 권장사항

### 헬스체크 간격
- **Production**: 30초 간격
- **Staging**: 1분 간격  
- **Development**: 5분 간격

### 알람 조건
- **Critical**: status가 "unhealthy"인 경우
- **Warning**: status가 "degraded"인 경우
- **Warning**: 응답 시간이 1000ms 초과하는 경우

### 사용 예시

#### cURL
```bash
curl -X GET http://localhost:8000/api/v1/health
```

#### JavaScript/TypeScript
```typescript
const checkHealth = async (): Promise<HealthResponse> => {
  const response = await fetch('/api/v1/health');
  return response.json();
};

// 모니터링 루프
const monitorHealth = async () => {
  try {
    const health = await checkHealth();
    
    if (health.status !== 'healthy') {
      console.warn('System health warning:', health.errors);
    }
    
    return health;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
```

## 구현 세부사항

### 검사 항목
1. **Database**: PostgreSQL 연결 및 쿼리 응답 시간
2. **Redis**: Redis 연결 및 기본 명령 실행
3. **Celery**: 워커 상태 및 큐 상태 확인
4. **Perplexity API**: 외부 API 연결 상태 (선택적)

### 성능 고려사항
- 헬스체크 응답 시간: < 500ms 목표
- 캐시된 결과 활용 (30초 TTL)
- 동시 헬스체크 요청 처리
- 타임아웃 설정 (각 서비스별 5초)