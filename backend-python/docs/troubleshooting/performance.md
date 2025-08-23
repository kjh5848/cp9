# ⚡ 성능 최적화 가이드

시스템 성능 모니터링, 분석, 최적화를 위한 종합 가이드입니다.

## 📊 성능 메트릭 및 목표

### 핵심 성능 지표 (KPI)

#### API 응답 시간
- **헬스체크**: < 100ms (목표), < 200ms (허용)
- **제품 리서치 요청**: < 500ms (생성), < 60초 (완료)
- **상태 조회**: < 200ms
- **결과 조회**: < 1초

#### 처리량 (Throughput)
- **동시 요청**: 최소 50 RPS
- **제품 리서치**: 배치당 평균 15-30초 (10개 제품)
- **데이터베이스**: 1000 쿼리/초

#### 리소스 사용량
- **메모리**: < 512MB (일반), < 1GB (피크)
- **CPU**: < 50% (평균), < 80% (피크)
- **디스크 I/O**: < 100MB/s
- **네트워크**: < 10MB/s

### 가용성 및 신뢰성
- **업타임**: 99.9% (월 8.7시간 다운타임 허용)
- **에러율**: < 0.1% (성공률 99.9% 이상)
- **복구 시간**: < 5분 (평균 장애 복구 시간)

## 🔍 성능 모니터링

### 실시간 모니터링 도구

#### 1. 시스템 리소스 모니터링
```bash
# CPU 및 메모리 사용량
top -p $(pgrep -d',' python)

# 실시간 시스템 상태
htop

# 디스크 I/O 모니터링
iotop

# 네트워크 사용량
iftop

# 종합 시스템 정보
glances
```

#### 2. 애플리케이션 성능 모니터링
```python
# app/core/monitoring.py
import time
import psutil
from typing import Dict, Any
from contextlib import asynccontextmanager

class PerformanceMonitor:
    def __init__(self):
        self.metrics = {}
        self.start_time = time.time()
    
    @asynccontextmanager
    async def measure_execution_time(self, operation: str):
        start_time = time.time()
        try:
            yield
        finally:
            execution_time = time.time() - start_time
            self.record_metric(f"{operation}_execution_time", execution_time)
    
    def record_metric(self, name: str, value: float):
        if name not in self.metrics:
            self.metrics[name] = []
        self.metrics[name].append(value)
    
    def get_system_metrics(self) -> Dict[str, Any]:
        return {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent,
            "network_io": psutil.net_io_counters()._asdict(),
            "uptime_seconds": time.time() - self.start_time
        }
    
    def get_average_metric(self, name: str) -> float:
        values = self.metrics.get(name, [])
        return sum(values) / len(values) if values else 0.0

monitor = PerformanceMonitor()

# 사용 예시
async def research_with_monitoring():
    async with monitor.measure_execution_time("product_research"):
        # 리서치 로직 실행
        pass
```

#### 3. 데이터베이스 성능 모니터링
```python
# app/infra/db/monitoring.py
import time
from sqlalchemy import event
from sqlalchemy.engine import Engine
from app.core.logging import logger

class DatabaseMonitor:
    def __init__(self):
        self.query_times = []
        self.slow_queries = []
        self.query_count = 0
    
    def setup_monitoring(self, engine: Engine):
        @event.listens_for(engine.sync_engine, "before_cursor_execute")
        def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            context._query_start_time = time.time()
        
        @event.listens_for(engine.sync_engine, "after_cursor_execute")
        def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            total_time = time.time() - context._query_start_time
            
            self.query_count += 1
            self.query_times.append(total_time)
            
            # 느린 쿼리 기록 (100ms 이상)
            if total_time > 0.1:
                self.slow_queries.append({
                    "query": statement[:200],  # 처음 200자만
                    "time": total_time,
                    "timestamp": time.time()
                })
                logger.warning(f"Slow query detected: {total_time:.3f}s")
    
    def get_stats(self) -> dict:
        if not self.query_times:
            return {"message": "No queries executed yet"}
        
        avg_time = sum(self.query_times) / len(self.query_times)
        max_time = max(self.query_times)
        
        return {
            "total_queries": self.query_count,
            "average_time": avg_time,
            "max_time": max_time,
            "slow_queries_count": len(self.slow_queries),
            "recent_slow_queries": self.slow_queries[-5:]  # 최근 5개
        }

db_monitor = DatabaseMonitor()
```

### 성능 대시보드 구현

#### FastAPI 메트릭 엔드포인트
```python
# app/api/v1/endpoints/metrics.py
from fastapi import APIRouter, Depends
from app.core.monitoring import monitor
from app.infra.db.monitoring import db_monitor

router = APIRouter()

@router.get("/metrics/system")
async def get_system_metrics():
    """시스템 성능 메트릭 조회"""
    return monitor.get_system_metrics()

@router.get("/metrics/database")
async def get_database_metrics():
    """데이터베이스 성능 메트릭 조회"""
    return db_monitor.get_stats()

@router.get("/metrics/application")  
async def get_application_metrics():
    """애플리케이션 성능 메트릭 조회"""
    return {
        "research_avg_time": monitor.get_average_metric("product_research_execution_time"),
        "api_avg_time": monitor.get_average_metric("api_request_execution_time"),
        "total_requests": monitor.metrics.get("api_requests", 0)
    }
```

## 🚀 성능 최적화 전략

### 1. 데이터베이스 최적화

#### 쿼리 최적화
```python
# ❌ 비효율적인 N+1 쿼리
async def get_jobs_with_items_bad():
    jobs = await session.execute(select(ResearchJob))
    for job in jobs.scalars():
        # 각 job마다 별도 쿼리 실행 (N+1 문제)
        items = await session.execute(
            select(ResearchItem).where(ResearchItem.job_id == job.id)
        )

# ✅ 최적화된 Join 쿼리
async def get_jobs_with_items_good():
    result = await session.execute(
        select(ResearchJob)
        .options(joinedload(ResearchJob.items))  # Eager loading
        .where(ResearchJob.status == ResearchStatus.PENDING)
    )
    return result.unique().scalars().all()
```

#### 인덱스 최적화
```sql
-- 성능 향상을 위한 인덱스 추가
CREATE INDEX CONCURRENTLY idx_research_jobs_status_created 
ON research_jobs(status, created_at) 
WHERE status IN ('pending', 'processing');

CREATE INDEX CONCURRENTLY idx_research_items_job_id 
ON research_items(job_id);

-- 부분 인덱스로 저장공간 절약
CREATE INDEX CONCURRENTLY idx_research_jobs_active 
ON research_jobs(created_at) 
WHERE status IN ('pending', 'processing');
```

#### 연결 풀 최적화
```python
# app/infra/db/session.py
from sqlalchemy.ext.asyncio import create_async_engine

def create_optimized_engine():
    return create_async_engine(
        DATABASE_URL,
        # 연결 풀 설정 최적화
        pool_size=20,           # 기본 연결 수
        max_overflow=30,        # 최대 추가 연결 수
        pool_pre_ping=True,     # 연결 상태 확인
        pool_recycle=3600,      # 1시간마다 연결 재생성
        
        # 쿼리 최적화
        echo=False,             # 운영환경에서는 비활성화
        echo_pool=True,         # 연결 풀 로그는 활성화
        
        # 타임아웃 설정
        connect_args={
            "command_timeout": 60,
            "server_settings": {
                "jit": "off",          # JIT 컴파일 비활성화로 일관된 성능
                "statement_timeout": "30s"  # 쿼리 타임아웃
            }
        }
    )
```

### 2. 비동기 처리 최적화

#### 동시 처리 개선
```python
# app/services/research_service.py
import asyncio
from asyncio import Semaphore

class OptimizedResearchService:
    def __init__(self):
        self.semaphore = Semaphore(5)  # 최대 5개 동시 처리
    
    async def process_research_batch_optimized(self, items: List[ResearchItem]):
        """최적화된 배치 처리"""
        async def process_single_item(item: ResearchItem):
            async with self.semaphore:
                try:
                    return await self.llm_client.research_product(
                        product_name=item.product_name,
                        category=item.category,
                        price=item.price_exact
                    )
                except Exception as e:
                    logger.error(f"Research failed for {item.product_name}: {e}")
                    return None
        
        # 모든 아이템을 동시에 처리 (세마포어로 제한)
        tasks = [process_single_item(item) for item in items]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return [r for r in results if r is not None]
```

#### HTTP 클라이언트 최적화
```python
# app/infra/llm/optimized_client.py
import httpx
from typing import Optional

class OptimizedPerplexityClient:
    def __init__(self):
        # 연결 풀 재사용으로 성능 향상
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(60.0),
            limits=httpx.Limits(
                max_keepalive_connections=20,
                max_connections=50,
                keepalive_expiry=30.0
            ),
            http2=True  # HTTP/2 사용
        )
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    async def batch_research(self, items: List[dict]) -> List[dict]:
        """배치 요청으로 API 호출 수 최소화"""
        # API가 배치 요청을 지원한다면
        batch_request = {
            "items": items,
            "batch_size": len(items)
        }
        
        response = await self.client.post(
            "https://api.perplexity.ai/batch_research",
            json=batch_request,
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        
        return response.json()["results"]
```

### 3. 캐싱 전략

#### Redis 캐싱 구현
```python
# app/infra/cache/redis_cache.py
import json
import redis.asyncio as redis
from typing import Optional, Any
from app.core.config import settings

class RedisCache:
    def __init__(self):
        self.redis = redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20
        )
    
    async def get(self, key: str) -> Optional[Any]:
        """캐시에서 값 조회"""
        try:
            value = await self.redis.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """캐시에 값 저장"""
        try:
            await self.redis.setex(
                key, 
                ttl, 
                json.dumps(value, default=str)
            )
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """캐시에서 값 삭제"""
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False

cache = RedisCache()

# 사용 예시: 리서치 결과 캐싱
async def get_cached_research_result(product_name: str, price: float) -> Optional[dict]:
    cache_key = f"research:{product_name}:{price}"
    result = await cache.get(cache_key)
    
    if result is None:
        # 캐시에 없으면 새로 조회
        result = await perform_research(product_name, price)
        await cache.set(cache_key, result, ttl=86400)  # 24시간 캐시
    
    return result
```

#### 응용 레벨 캐싱
```python
# app/services/cached_research_service.py
from functools import lru_cache
from cachetools import TTLCache
import asyncio

class CachedResearchService:
    def __init__(self):
        # 메모리 캐시 (임시 데이터용)
        self.memory_cache = TTLCache(maxsize=1000, ttl=300)  # 5분 TTL
    
    @lru_cache(maxsize=128)
    def get_category_mapping(self, category: str) -> str:
        """카테고리 매핑 캐시 (변경되지 않는 데이터)"""
        mapping = {
            "가전디지털": "electronics",
            "패션": "fashion", 
            "뷰티": "beauty"
        }
        return mapping.get(category, category)
    
    async def get_research_with_cache(self, product_name: str, category: str, price: float):
        """다층 캐시를 활용한 리서치"""
        # 1. 메모리 캐시 확인
        cache_key = f"{product_name}:{price}"
        if cache_key in self.memory_cache:
            return self.memory_cache[cache_key]
        
        # 2. Redis 캐시 확인
        result = await cache.get(f"research:{cache_key}")
        if result:
            self.memory_cache[cache_key] = result
            return result
        
        # 3. 실제 리서치 수행
        result = await self.perform_research(product_name, category, price)
        
        # 4. 캐시에 저장
        self.memory_cache[cache_key] = result
        await cache.set(f"research:{cache_key}", result, ttl=3600)
        
        return result
```

### 4. Celery 최적화

#### 워커 설정 최적화
```python
# app/infra/tasks/celery_config.py
from celery import Celery

def create_optimized_celery():
    app = Celery('research_tasks')
    
    app.conf.update(
        # 성능 최적화 설정
        worker_prefetch_multiplier=1,    # 메모리 사용량 제어
        task_acks_late=True,            # 태스크 완료 후 ACK
        worker_max_tasks_per_child=1000, # 메모리 누수 방지
        
        # 결과 백엔드 최적화
        result_expires=3600,            # 결과 1시간 후 삭제
        result_compression='gzip',      # 결과 압축
        
        # 라우팅 최적화
        task_routes={
            'app.infra.tasks.research_task': {'queue': 'research'},
            'app.infra.tasks.cleanup_task': {'queue': 'maintenance'}
        },
        
        # 연결 풀 설정
        broker_pool_limit=20,
        broker_connection_retry_on_startup=True,
    )
    
    return app
```

#### 태스크 최적화
```python
# app/infra/tasks/optimized_tasks.py
from celery import current_task
from app.infra.tasks.celery_app import app

@app.task(bind=True)
def research_product_optimized(self, items_batch: List[dict]):
    """최적화된 리서치 태스크"""
    total_items = len(items_batch)
    results = []
    
    for i, item in enumerate(items_batch):
        try:
            # 진행률 업데이트
            current_task.update_state(
                state='PROGRESS',
                meta={'current': i + 1, 'total': total_items}
            )
            
            # 리서치 수행
            result = perform_single_research(item)
            results.append(result)
            
        except Exception as e:
            logger.error(f"Item research failed: {e}")
            results.append({
                "error": str(e),
                "item": item
            })
    
    return {
        'results': results,
        'total_processed': len(results),
        'success_rate': len([r for r in results if 'error' not in r]) / len(results)
    }
```

## 📈 성능 테스트

### 부하 테스트

#### Apache Bench (ab) 테스트
```bash
# 기본 부하 테스트
ab -n 1000 -c 10 http://localhost:8000/api/v1/health

# POST 요청 테스트
ab -n 100 -c 5 -T "application/json" -p research_payload.json \
   http://localhost:8000/api/v1/research/products

# research_payload.json 내용
echo '{
  "items": [
    {
      "product_name": "테스트 제품",
      "category": "테스트",
      "price_exact": 10000
    }
  ]
}' > research_payload.json
```

#### wrk를 이용한 고성능 테스트
```bash
# wrk 설치 (Ubuntu/Debian)
sudo apt-get install wrk

# 기본 테스트 (12스레드, 400연결, 30초 동안)
wrk -t12 -c400 -d30s http://localhost:8000/api/v1/health

# 스크립트를 이용한 복잡한 테스트
wrk -t4 -c100 -d30s -s research_test.lua http://localhost:8000/

# research_test.lua 내용
wrk.method = "POST"
wrk.body = '{"items": [{"product_name": "성능 테스트", "category": "테스트", "price_exact": 1000}]}'
wrk.headers["Content-Type"] = "application/json"
```

#### Python을 이용한 커스텀 부하 테스트
```python
# performance_test.py
import asyncio
import aiohttp
import time
from typing import List

async def make_request(session: aiohttp.ClientSession, url: str, data: dict) -> dict:
    """단일 요청 실행"""
    start_time = time.time()
    try:
        async with session.post(url, json=data) as response:
            result = await response.json()
            return {
                "status": response.status,
                "time": time.time() - start_time,
                "success": response.status == 201
            }
    except Exception as e:
        return {
            "status": 0,
            "time": time.time() - start_time,
            "success": False,
            "error": str(e)
        }

async def load_test(concurrent_users: int, requests_per_user: int):
    """부하 테스트 실행"""
    url = "http://localhost:8000/api/v1/research/products"
    test_data = {
        "items": [{
            "product_name": "부하테스트 제품",
            "category": "테스트",
            "price_exact": 1000
        }]
    }
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        
        # 동시 사용자별로 요청 생성
        for user in range(concurrent_users):
            for request in range(requests_per_user):
                task = make_request(session, url, test_data)
                tasks.append(task)
        
        print(f"Starting load test: {len(tasks)} total requests")
        start_time = time.time()
        
        # 모든 요청 동시 실행
        results = await asyncio.gather(*tasks)
        
        total_time = time.time() - start_time
        
        # 결과 분석
        successful_requests = sum(1 for r in results if r["success"])
        total_requests = len(results)
        avg_response_time = sum(r["time"] for r in results) / total_requests
        requests_per_second = total_requests / total_time
        
        print(f"\n=== 부하 테스트 결과 ===")
        print(f"총 요청 수: {total_requests}")
        print(f"성공한 요청: {successful_requests}")
        print(f"성공률: {successful_requests/total_requests*100:.1f}%")
        print(f"평균 응답 시간: {avg_response_time*1000:.1f}ms")
        print(f"초당 요청 수: {requests_per_second:.1f} RPS")
        print(f"총 실행 시간: {total_time:.2f}s")
        
        # 응답 시간 분포
        response_times = [r["time"] * 1000 for r in results]  # ms로 변환
        response_times.sort()
        
        print(f"\n=== 응답 시간 분포 ===")
        print(f"최소: {min(response_times):.1f}ms")
        print(f"50%: {response_times[len(response_times)//2]:.1f}ms")
        print(f"90%: {response_times[int(len(response_times)*0.9)]:.1f}ms")
        print(f"95%: {response_times[int(len(response_times)*0.95)]:.1f}ms")
        print(f"99%: {response_times[int(len(response_times)*0.99)]:.1f}ms")
        print(f"최대: {max(response_times):.1f}ms")

if __name__ == "__main__":
    # 10명의 동시 사용자가 각각 10개의 요청을 보냄
    asyncio.run(load_test(concurrent_users=10, requests_per_user=10))
```

### 프로파일링

#### Python 코드 프로파일링
```python
# app/utils/profiler.py
import cProfile
import pstats
from functools import wraps
from typing import Callable

def profile_function(func: Callable) -> Callable:
    """함수 실행시간 프로파일링 데코레이터"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        profiler = cProfile.Profile()
        profiler.enable()
        
        result = func(*args, **kwargs)
        
        profiler.disable()
        stats = pstats.Stats(profiler)
        stats.sort_stats('cumulative')
        stats.print_stats(10)  # 상위 10개 함수만 출력
        
        return result
    
    return wrapper

# 사용 예시
@profile_function
def slow_research_function():
    # 느린 함수 로직
    pass
```

#### 메모리 프로파일링
```python
# memory_profiler 사용
from memory_profiler import profile

@profile
def memory_intensive_function():
    data = []
    for i in range(100000):
        data.append(f"item_{i}")
    return data

# 실행: python -m memory_profiler script.py
```

## ⚡ 최적화 체크리스트

### 🗄️ 데이터베이스 최적화
- [ ] **인덱스 최적화**: 자주 쿼리하는 컬럼에 인덱스 생성
- [ ] **쿼리 최적화**: N+1 문제 해결, JOIN 사용
- [ ] **연결 풀 튜닝**: 적절한 pool_size, max_overflow 설정
- [ ] **타임아웃 설정**: 긴 쿼리 방지를 위한 statement_timeout
- [ ] **통계 업데이트**: ANALYZE 명령으로 쿼리 플래너 최적화

### 🔄 비동기 처리 최적화  
- [ ] **동시성 제어**: Semaphore로 적절한 동시 실행 수 제한
- [ ] **배치 처리**: 개별 요청보다 배치 요청 선호
- [ ] **연결 재사용**: HTTP 클라이언트 연결 풀 활용
- [ ] **타임아웃 설정**: 적절한 타임아웃으로 리소스 보호

### 💾 캐싱 전략
- [ ] **Redis 캐싱**: 자주 조회되는 데이터 캐싱
- [ ] **메모리 캐싱**: 단기간 사용하는 데이터 메모리 저장
- [ ] **TTL 설정**: 적절한 캐시 만료 시간 설정
- [ ] **캐시 무효화**: 데이터 변경 시 관련 캐시 삭제

### 🔧 Celery 최적화
- [ ] **워커 설정**: prefetch_multiplier, max_tasks_per_child 조정
- [ ] **큐 분리**: 작업 유형별 전용 큐 사용
- [ ] **결과 관리**: 불필요한 결과는 빠른 만료 설정
- [ ] **모니터링**: Flower로 워커 상태 모니터링

### 📊 모니터링 및 알람
- [ ] **성능 메트릭 수집**: 응답 시간, 처리량, 에러율
- [ ] **리소스 모니터링**: CPU, 메모리, 디스크, 네트워크
- [ ] **로그 분석**: 구조화된 로그로 성능 이슈 추적
- [ ] **알람 설정**: 임계값 초과 시 자동 알림

### 🧪 성능 테스트
- [ ] **부하 테스트**: 예상 트래픽의 2배 수준 테스트
- [ ] **스트레스 테스트**: 시스템 한계점 파악
- [ ] **엔듀런스 테스트**: 장시간 실행 시 성능 확인
- [ ] **회귀 테스트**: 코드 변경 후 성능 영향 확인

이 가이드를 통해 시스템의 성능을 체계적으로 모니터링하고 최적화할 수 있습니다. 성능 최적화는 지속적인 과정이므로 정기적인 모니터링과 개선이 필요합니다.