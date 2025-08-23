# 🎯 제품 리서치 API

## 개요

Perplexity AI를 활용하여 최대 10개의 제품을 동시에 리서치하는 API입니다. 각 제품에 대해 상세 스펙, 리뷰, 가격 비교 등을 수집하여 구조화된 데이터로 제공합니다.

## 기본 정보

- **Base URL**: `/api/v1/research/products`
- **Authentication**: 현재 인증 불필요 (프로덕션에서는 API 키 추가 권장)
- **Content-Type**: `application/json`
- **Rate Limiting**: 환경변수로 제어 (기본값: 최대 5개 동시 요청)

## 비즈니스 규칙

### 품질 보증
- **필수 리뷰 데이터**: rating_avg > 0, review_count > 0
- **최소 정보 출처**: 3개 이상의 신뢰할 수 있는 소스
- **제조사 우선순위**: 공식 도메인 1개 이상 포함

### 처리 제한
- **최대 배치 크기**: 10개 제품 (MAX_RESEARCH_BATCH_SIZE)
- **타임아웃**: 60초 (REQUEST_TIMEOUT)  
- **재시도**: 최대 3회 (RETRY_MAX_ATTEMPTS)
- **동시성**: 최대 5개 요청 (MAX_CONCURRENT_REQUESTS)

## 엔드포인트 목록

### 1. 제품 리서치 생성
- **Method**: `POST /`
- **목적**: 새로운 제품 리서치 작업 시작
- **처리 방식**: 비동기 또는 Celery 백그라운드 작업

### 2. 리서치 결과 조회  
- **Method**: `GET /{job_id}`
- **목적**: 완료된 리서치 작업의 전체 결과 조회
- **필터링**: 실패한 아이템 포함/제외 옵션

### 3. 작업 상태 확인
- **Method**: `GET /{job_id}/status`  
- **목적**: 리서치 진행 상황 실시간 모니터링
- **지원**: 일반 작업 및 Celery 작업 상태

### 4. 작업 취소
- **Method**: `DELETE /{job_id}`
- **목적**: 진행 중인 리서치 작업 중단
- **제한**: 완료된 작업은 취소 불가

## 데이터 플로우

```
1. 클라이언트 요청 → POST /research/products
2. 요청 검증 → Pydantic 스키마 검증
3. 작업 생성 → ProductResearchJob 엔티티
4. 처리 시작 → Service Layer에서 Perplexity API 호출
5. 결과 저장 → 데이터베이스에 구조화된 데이터 저장
6. 상태 업데이트 → 실시간 진행률 추적
7. 완료 통지 → 콜백 URL 호출 (옵션)
```

## 아키텍처 레이어

### Domain Layer
- `ProductResearchItem`: 입력 제품 정보
- `ProductResearchResult`: 리서치 결과
- `ProductResearchJob`: 배치 작업 관리
- `ResearchStatus`: 상태 관리 enum

### Service Layer  
- `ProductResearchService`: 비즈니스 로직 조율
- 도메인 엔티티와 인프라 간 중재
- 트랜잭션 관리 및 에러 처리

### Infrastructure Layer
- `PerplexityResearchClient`: AI API 통합
- `ResearchJobRepository`: 데이터 영속성
- `CeleryApp`: 백그라운드 작업 처리

## 성능 특성

### 처리 시간
- **단일 제품**: 평균 3-5초
- **배치(10개)**: 평균 15-30초  
- **복잡한 제품**: 최대 60초

### 리소스 사용량
- **메모리**: 제품당 약 2-5MB
- **CPU**: Perplexity API 호출 중 중간 수준
- **네트워크**: 제품당 평균 3-5개 HTTP 요청

### 확장성
- **동시 작업**: Redis + Celery로 수평 확장
- **데이터베이스**: PostgreSQL 연결 풀링
- **캐싱**: Redis 기반 결과 캐싱 (구현 예정)

## 에러 처리

### 비즈니스 로직 에러
- **ValidationError**: 입력 데이터 검증 실패
- **TooManyItemsError**: 배치 크기 초과
- **InsufficientSourcesError**: 신뢰할 수 있는 소스 부족

### 시스템 에러
- **APITimeoutError**: Perplexity API 타임아웃
- **DatabaseError**: 데이터베이스 연결/쿼리 오류
- **CeleryError**: 백그라운드 작업 실패

### 재시도 정책
```python
# 지수 백오프로 재시도
base_delay = 1초
max_attempts = 3회  
backoff_multiplier = 2
```

## 모니터링 및 로깅

### 구조화된 로깅
- **요청 로깅**: 모든 API 호출 추적
- **성능 메트릭**: 처리 시간, 성공률
- **에러 추적**: 상세한 에러 컨텍스트
- **비즈니스 이벤트**: 작업 생성/완료/실패

### 메트릭 수집
- 작업 처리량 (jobs/minute)
- 평균 처리 시간 (processing_time_ms)
- 성공률 (success_rate)
- API 응답 시간 (response_time)

## 개발 가이드

### 로컬 테스트
```bash
# 개발 환경 시작
poetry run dev

# API 테스트
curl -X POST http://localhost:8000/api/v1/research/products \
  -H "Content-Type: application/json" \
  -d '{"items": [{"product_name": "테스트 제품", "category": "테스트", "price_exact": 10000}]}'
```

### 디버깅
```bash
# 상세 로그 확인
docker-compose logs -f

# 데이터베이스 상태 확인
poetry run python -c "
from app.infra.db.session import get_engine
import asyncio
async def test(): 
    engine = get_engine()
    async with engine.connect() as conn:
        result = await conn.execute('SELECT 1')
        print('DB OK')
asyncio.run(test())
"
```

## 관련 문서

- [`endpoints.md`](endpoints.md) - 엔드포인트 상세 명세
- [`schemas.md`](schemas.md) - 스키마 및 검증 규칙  
- [`implementation.md`](implementation.md) - 구현 세부사항
- [`../../frontend/API_INTEGRATION_GUIDE.md`](../../frontend/API_INTEGRATION_GUIDE.md) - 프론트엔드 통합 가이드