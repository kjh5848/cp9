# 🧪 테스트 가이드

Python 백엔드 프로젝트의 포괄적인 테스트 전략 및 실행 가이드입니다.

## 📋 테스트 전략

### 테스트 피라미드
- **단위 테스트 (70%)**: 도메인 로직, 유틸리티 함수, 개별 컴포넌트
- **통합 테스트 (20%)**: 데이터베이스, 외부 API, 서비스 간 상호작용
- **E2E 테스트 (10%)**: 전체 API 워크플로우, 사용자 시나리오

### 테스트 범위
- **Domain Layer**: 비즈니스 로직 및 엔티티 검증
- **Service Layer**: 도메인-인프라 간 조율 로직
- **Infrastructure Layer**: 데이터베이스, 외부 API 통합
- **API Layer**: HTTP 엔드포인트, 요청/응답 처리

## 🚀 빠른 시작

### 기본 테스트 실행
```bash
# 모든 테스트 실행
poetry run test

# 특정 테스트 파일
pytest app/tests/test_research.py

# 특정 테스트 케이스
pytest app/tests/test_research.py::test_create_research_job

# 테스트와 커버리지
poetry run test --cov=app --cov-report=html

# 병렬 테스트 (빠른 실행)
pytest -n auto
```

### 테스트 환경 설정
```bash
# 테스트 전용 환경변수
export APP_ENV=test
export DATABASE_URL=postgresql+asyncpg://test:test@localhost:5432/test_db

# 테스트 데이터베이스 초기화
alembic -x database_url=$DATABASE_URL upgrade head

# 테스트 실행
pytest
```

## 🏗️ 테스트 구조

### 디렉터리 구조
```
app/tests/
├── __init__.py
├── conftest.py              # pytest 설정 및 픽스처
├── unit/                    # 단위 테스트
│   ├── test_domain.py       # 도메인 로직
│   ├── test_services.py     # 서비스 레이어
│   └── test_utils.py        # 유틸리티
├── integration/             # 통합 테스트
│   ├── test_repositories.py # 데이터베이스
│   ├── test_llm.py         # 외부 API
│   └── test_tasks.py       # Celery 태스크
├── api/                     # API 테스트
│   ├── test_health.py       # 헬스체크
│   └── test_research.py     # 리서치 API
├── fixtures/                # 테스트 데이터
│   ├── research_data.py
│   └── mock_responses.py
└── helpers/                 # 테스트 헬퍼
    ├── assertions.py
    └── mocks.py
```

### 주요 픽스처 (conftest.py)

```python
import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.config import settings
from app.infra.db.session import get_db
from app.infra.db.models import Base

# 테스트 데이터베이스 엔진
@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(
        settings.database_url.replace("test_db", "test_db"),
        echo=settings.debug
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()

# 테스트 세션
@pytest_asyncio.fixture
async def db_session(test_engine):
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()

# 테스트 클라이언트
@pytest_asyncio.fixture
async def client(db_session):
    def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()

# 목 데이터 픽스처
@pytest.fixture
def sample_research_request():
    return {
        "items": [
            {
                "product_name": "테스트 제품",
                "category": "테스트 카테고리",
                "price_exact": 10000.0,
                "currency": "KRW"
            }
        ],
        "priority": 5
    }
```

## 🔬 단위 테스트

### Domain Layer 테스트

```python
# app/tests/unit/test_domain.py
import pytest
from datetime import datetime
from app.domain.entities import ResearchJob, ResearchItem, ResearchResult
from app.domain.enums import ResearchStatus

class TestResearchJob:
    def test_create_research_job(self):
        """리서치 작업 생성 테스트"""
        items = [
            ResearchItem(
                product_name="테스트 제품",
                category="테스트",
                price_exact=10000.0
            )
        ]
        
        job = ResearchJob(items=items)
        
        assert job.status == ResearchStatus.PENDING
        assert len(job.items) == 1
        assert job.items[0].product_name == "테스트 제품"
        assert job.created_at is not None

    def test_job_validation(self):
        """작업 검증 로직 테스트"""
        with pytest.raises(ValueError, match="최소 1개 이상의 아이템이 필요합니다"):
            ResearchJob(items=[])
    
    def test_duplicate_item_removal(self):
        """중복 아이템 제거 테스트"""
        items = [
            ResearchItem(product_name="제품A", category="카테고리", price_exact=1000),
            ResearchItem(product_name="제품A", category="카테고리", price_exact=1000),  # 중복
            ResearchItem(product_name="제품B", category="카테고리", price_exact=2000)
        ]
        
        job = ResearchJob(items=items)
        
        assert len(job.items) == 2
        assert {item.product_name for item in job.items} == {"제품A", "제품B"}

class TestResearchResult:
    def test_create_successful_result(self):
        """성공적인 리서치 결과 생성"""
        result = ResearchResult(
            product_name="테스트 제품",
            brand="테스트 브랜드",
            category="테스트",
            price_exact=10000.0,
            status=ResearchStatus.SUCCESS
        )
        
        assert result.status == ResearchStatus.SUCCESS
        assert result.error_message is None
        assert result.captured_at is not None

    def test_create_failed_result(self):
        """실패한 리서치 결과 생성"""
        result = ResearchResult(
            product_name="실패 제품",
            category="테스트",
            price_exact=0,
            status=ResearchStatus.ERROR,
            error_message="API 호출 실패"
        )
        
        assert result.status == ResearchStatus.ERROR
        assert result.error_message == "API 호출 실패"
```

### Service Layer 테스트

```python
# app/tests/unit/test_services.py
import pytest
from unittest.mock import AsyncMock, Mock, patch
from app.services.research_service import ProductResearchService
from app.domain.entities import ResearchJob, ResearchItem
from app.domain.enums import ResearchStatus

class TestProductResearchService:
    @pytest.fixture
    def mock_repository(self):
        return AsyncMock()

    @pytest.fixture
    def mock_llm_client(self):
        return AsyncMock()

    @pytest.fixture
    def service(self, mock_repository, mock_llm_client):
        return ProductResearchService(
            repository=mock_repository,
            llm_client=mock_llm_client
        )

    @pytest.mark.asyncio
    async def test_create_research_job(self, service, mock_repository):
        """리서치 작업 생성 서비스 테스트"""
        items = [
            ResearchItem(
                product_name="테스트 제품",
                category="테스트",
                price_exact=10000
            )
        ]
        
        mock_repository.save.return_value = AsyncMock()
        
        job = await service.create_research_job(items, priority=5)
        
        assert job.status == ResearchStatus.PENDING
        assert len(job.items) == 1
        mock_repository.save.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_research_job(self, service, mock_repository, mock_llm_client):
        """리서치 처리 서비스 테스트"""
        job = ResearchJob(items=[
            ResearchItem(
                product_name="테스트 제품",
                category="테스트",
                price_exact=10000
            )
        ])
        
        # 목 응답 설정
        mock_llm_client.research_product.return_value = {
            "product_name": "테스트 제품",
            "brand": "테스트 브랜드",
            "specs": {"main": ["스펙1", "스펙2"]},
            "reviews": {"rating_avg": 4.5, "review_count": 100}
        }
        
        results = await service.process_research_job(job)
        
        assert len(results) == 1
        assert results[0].status == ResearchStatus.SUCCESS
        assert results[0].brand == "테스트 브랜드"

    @pytest.mark.asyncio
    async def test_error_handling(self, service, mock_llm_client):
        """에러 처리 테스트"""
        job = ResearchJob(items=[
            ResearchItem(
                product_name="실패 제품",
                category="테스트",
                price_exact=10000
            )
        ])
        
        # API 호출 실패 시뮬레이션
        mock_llm_client.research_product.side_effect = Exception("API 오류")
        
        results = await service.process_research_job(job)
        
        assert len(results) == 1
        assert results[0].status == ResearchStatus.ERROR
        assert "API 오류" in results[0].error_message
```

## 🔗 통합 테스트

### 데이터베이스 통합 테스트

```python
# app/tests/integration/test_repositories.py
import pytest
import asyncio
from app.infra.db.repositories import ResearchJobRepository
from app.domain.entities import ResearchJob, ResearchItem
from app.domain.enums import ResearchStatus

class TestResearchJobRepository:
    @pytest.mark.asyncio
    async def test_save_and_get_job(self, db_session):
        """작업 저장 및 조회 테스트"""
        repo = ResearchJobRepository(db_session)
        
        # 작업 생성
        items = [
            ResearchItem(
                product_name="테스트 제품",
                category="테스트",
                price_exact=10000
            )
        ]
        job = ResearchJob(items=items)
        
        # 저장
        await repo.save(job)
        await db_session.commit()
        
        # 조회
        retrieved_job = await repo.get_by_id(job.id)
        
        assert retrieved_job is not None
        assert retrieved_job.id == job.id
        assert len(retrieved_job.items) == 1
        assert retrieved_job.items[0].product_name == "테스트 제품"

    @pytest.mark.asyncio
    async def test_update_job_status(self, db_session):
        """작업 상태 업데이트 테스트"""
        repo = ResearchJobRepository(db_session)
        
        # 작업 생성 및 저장
        job = ResearchJob(items=[
            ResearchItem(
                product_name="테스트",
                category="테스트",
                price_exact=1000
            )
        ])
        
        await repo.save(job)
        await db_session.commit()
        
        # 상태 업데이트
        job.status = ResearchStatus.SUCCESS
        await repo.update(job)
        await db_session.commit()
        
        # 확인
        updated_job = await repo.get_by_id(job.id)
        assert updated_job.status == ResearchStatus.SUCCESS
```

### 외부 API 통합 테스트

```python
# app/tests/integration/test_llm.py
import pytest
from unittest.mock import patch
from app.infra.llm.perplexity_client import PerplexityResearchClient

class TestPerplexityResearchClient:
    @pytest.fixture
    def client(self):
        return PerplexityResearchClient()

    @pytest.mark.asyncio
    @patch('httpx.AsyncClient.post')
    async def test_research_product(self, mock_post, client):
        """제품 리서치 API 호출 테스트"""
        # 목 응답 설정
        mock_post.return_value.json.return_value = {
            "choices": [{
                "message": {
                    "content": '{"product_name": "테스트 제품", "brand": "테스트 브랜드"}'
                }
            }]
        }
        mock_post.return_value.status_code = 200
        
        result = await client.research_product(
            product_name="테스트 제품",
            category="테스트",
            price=10000
        )
        
        assert result["product_name"] == "테스트 제품"
        assert result["brand"] == "테스트 브랜드"
        mock_post.assert_called_once()

    @pytest.mark.asyncio
    async def test_api_error_handling(self, client):
        """API 에러 처리 테스트"""
        with patch('httpx.AsyncClient.post') as mock_post:
            mock_post.side_effect = Exception("네트워크 오류")
            
            with pytest.raises(Exception, match="네트워크 오류"):
                await client.research_product("테스트", "테스트", 1000)
```

## 🌐 API 테스트

### 엔드포인트 테스트

```python
# app/tests/api/test_research.py
import pytest
from httpx import AsyncClient

class TestResearchAPI:
    @pytest.mark.asyncio
    async def test_create_research_job(self, client: AsyncClient, sample_research_request):
        """리서치 작업 생성 API 테스트"""
        response = await client.post(
            "/api/v1/research/products",
            json=sample_research_request
        )
        
        assert response.status_code == 201
        data = response.json()
        
        assert "job_id" in data
        assert data["status"] == "pending"
        assert data["metadata"]["total_items"] == 1

    @pytest.mark.asyncio
    async def test_get_job_status(self, client: AsyncClient):
        """작업 상태 조회 API 테스트"""
        # 먼저 작업 생성
        create_response = await client.post(
            "/api/v1/research/products",
            json={"items": [{"product_name": "테스트", "category": "테스트", "price_exact": 1000}]}
        )
        job_id = create_response.json()["job_id"]
        
        # 상태 조회
        status_response = await client.get(f"/api/v1/research/products/{job_id}/status")
        
        assert status_response.status_code == 200
        status_data = status_response.json()
        
        assert status_data["job_id"] == job_id
        assert "status" in status_data
        assert "progress" in status_data

    @pytest.mark.asyncio
    async def test_validation_errors(self, client: AsyncClient):
        """입력 검증 에러 테스트"""
        invalid_request = {
            "items": [{
                "product_name": "",  # 빈 문자열 - 에러
                "category": "테스트",
                "price_exact": -1000  # 음수 - 에러
            }]
        }
        
        response = await client.post(
            "/api/v1/research/products",
            json=invalid_request
        )
        
        assert response.status_code == 422
        errors = response.json()["detail"]
        
        # 검증 에러 메시지 확인
        error_messages = [error["msg"] for error in errors]
        assert any("at least 1 character" in msg for msg in error_messages)
        assert any("greater than 0" in msg for msg in error_messages)

    @pytest.mark.asyncio
    async def test_batch_size_limit(self, client: AsyncClient):
        """배치 크기 제한 테스트"""
        # 11개 아이템 (제한은 10개)
        items = [
            {
                "product_name": f"제품{i}",
                "category": "테스트",
                "price_exact": 1000
            }
            for i in range(11)
        ]
        
        response = await client.post(
            "/api/v1/research/products",
            json={"items": items}
        )
        
        assert response.status_code == 422
        assert "배치 크기가 최대 허용 개수를 초과" in response.json()["detail"][0]["msg"]
```

### 헬스체크 테스트

```python
# app/tests/api/test_health.py
import pytest
from httpx import AsyncClient

class TestHealthAPI:
    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """기본 헬스체크 테스트"""
        response = await client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "timestamp" in data
        assert "services" in data
        assert data["status"] in ["healthy", "degraded", "unhealthy"]

    @pytest.mark.asyncio
    async def test_health_services(self, client: AsyncClient):
        """개별 서비스 상태 테스트"""
        response = await client.get("/api/v1/health")
        data = response.json()
        
        services = data["services"]
        
        # 필수 서비스 확인
        assert "database" in services
        assert "redis" in services
        
        # 서비스별 상태 확인
        for service_name, service_data in services.items():
            assert "status" in service_data
            assert service_data["status"] in ["healthy", "degraded", "unhealthy"]
```

## 🎭 모킹 및 픽스처

### 복잡한 목 객체

```python
# app/tests/helpers/mocks.py
from unittest.mock import AsyncMock, Mock
from app.domain.entities import ResearchResult
from app.domain.enums import ResearchStatus

class MockPerplexityClient:
    def __init__(self):
        self.research_product = AsyncMock()
        self.call_count = 0
    
    async def research_product(self, product_name: str, category: str, price: float):
        self.call_count += 1
        
        # 실패 시뮬레이션
        if "실패" in product_name:
            raise Exception("API 호출 실패")
        
        return {
            "product_name": product_name,
            "brand": f"{product_name} 브랜드",
            "category": category,
            "price_exact": price,
            "specs": {
                "main": [f"{product_name} 주요 스펙 1", f"{product_name} 주요 스펙 2"],
                "attributes": [
                    {"name": "색상", "value": "검정"},
                    {"name": "크기", "value": "중간"}
                ]
            },
            "reviews": {
                "rating_avg": 4.2,
                "review_count": 85,
                "summary_positive": ["좋은 품질", "빠른 배송"],
                "summary_negative": ["가격이 비쌈"]
            },
            "sources": ["https://example.com/1", "https://example.com/2"]
        }

class MockResearchJobRepository:
    def __init__(self):
        self.jobs = {}
        self.save_count = 0
        
    async def save(self, job):
        self.save_count += 1
        self.jobs[job.id] = job
        
    async def get_by_id(self, job_id):
        return self.jobs.get(job_id)
        
    async def update(self, job):
        if job.id in self.jobs:
            self.jobs[job.id] = job
```

### 테스트 데이터 팩토리

```python
# app/tests/fixtures/research_data.py
import uuid
from typing import List
from app.domain.entities import ResearchJob, ResearchItem, ResearchResult
from app.domain.enums import ResearchStatus

class ResearchDataFactory:
    @staticmethod
    def create_research_item(
        product_name: str = "테스트 제품",
        category: str = "테스트 카테고리",
        price_exact: float = 10000.0,
        currency: str = "KRW"
    ) -> ResearchItem:
        return ResearchItem(
            product_name=product_name,
            category=category,
            price_exact=price_exact,
            currency=currency
        )
    
    @staticmethod
    def create_research_job(
        items: List[ResearchItem] = None,
        priority: int = 5
    ) -> ResearchJob:
        if items is None:
            items = [ResearchDataFactory.create_research_item()]
            
        return ResearchJob(items=items, priority=priority)
    
    @staticmethod
    def create_research_result(
        product_name: str = "테스트 제품",
        status: ResearchStatus = ResearchStatus.SUCCESS
    ) -> ResearchResult:
        return ResearchResult(
            product_name=product_name,
            brand="테스트 브랜드",
            category="테스트",
            price_exact=10000.0,
            status=status,
            specs={
                "main": ["주요 스펙 1", "주요 스펙 2"],
                "attributes": [{"name": "색상", "value": "검정"}]
            },
            reviews={
                "rating_avg": 4.5,
                "review_count": 100,
                "summary_positive": ["좋은 품질"],
                "summary_negative": ["비쌈"]
            }
        )

# 사용 예시
@pytest.fixture
def sample_items():
    return [
        ResearchDataFactory.create_research_item("제품A", "카테고리1", 1000),
        ResearchDataFactory.create_research_item("제품B", "카테고리2", 2000)
    ]

@pytest.fixture
def sample_job(sample_items):
    return ResearchDataFactory.create_research_job(sample_items)
```

## 📊 성능 테스트

### 로드 테스트

```python
# app/tests/performance/test_load.py
import pytest
import asyncio
from httpx import AsyncClient
from concurrent.futures import ThreadPoolExecutor

class TestPerformance:
    @pytest.mark.asyncio
    async def test_concurrent_requests(self, client: AsyncClient):
        """동시 요청 처리 성능 테스트"""
        request_data = {
            "items": [{
                "product_name": "동시성 테스트",
                "category": "테스트",
                "price_exact": 1000
            }]
        }
        
        # 10개 동시 요청
        tasks = [
            client.post("/api/v1/research/products", json=request_data)
            for _ in range(10)
        ]
        
        import time
        start_time = time.time()
        responses = await asyncio.gather(*tasks)
        end_time = time.time()
        
        # 모든 요청이 성공해야 함
        for response in responses:
            assert response.status_code == 201
        
        # 성능 검증 (10개 요청이 5초 이내)
        total_time = end_time - start_time
        assert total_time < 5.0, f"Too slow: {total_time}s"

    @pytest.mark.asyncio  
    async def test_database_performance(self, db_session):
        """데이터베이스 성능 테스트"""
        from app.infra.db.repositories import ResearchJobRepository
        repo = ResearchJobRepository(db_session)
        
        # 100개 작업 생성
        jobs = [
            ResearchDataFactory.create_research_job()
            for _ in range(100)
        ]
        
        import time
        start_time = time.time()
        
        for job in jobs:
            await repo.save(job)
        
        await db_session.commit()
        end_time = time.time()
        
        # 성능 검증 (100개 작업 저장이 2초 이내)
        total_time = end_time - start_time
        assert total_time < 2.0, f"Database too slow: {total_time}s"
```

## 🔧 테스트 설정

### pytest.ini 설정

```ini
[tool:pytest]
testpaths = app/tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --verbose
    --tb=short
    --strict-markers
    --disable-warnings
    --asyncio-mode=auto
markers =
    slow: 느린 테스트 (통합/E2E)
    unit: 단위 테스트
    integration: 통합 테스트
    api: API 테스트
    performance: 성능 테스트
asyncio_mode = auto
```

### 커버리지 설정 (.coveragerc)

```ini
[run]
source = app
omit = 
    app/tests/*
    app/migrations/*
    app/main.py
    */__init__.py

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    if __name__ == .__main__.:
    raise AssertionError
    raise NotImplementedError
    if TYPE_CHECKING:
```

## 🚀 CI/CD 통합

### GitHub Actions 설정

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_USER: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
          
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
        
    - name: Install Poetry
      run: |
        curl -sSL https://install.python-poetry.org | python3 -
        echo "$HOME/.local/bin" >> $GITHUB_PATH
        
    - name: Install dependencies
      run: |
        poetry install --no-dev
        
    - name: Run tests
      env:
        DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
      run: |
        poetry run pytest --cov=app --cov-report=xml
        
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
```

## 📋 테스트 체크리스트

### 새로운 기능 개발 시
- [ ] 단위 테스트 작성 (도메인 로직)
- [ ] 통합 테스트 작성 (데이터베이스/외부 API)
- [ ] API 테스트 작성 (엔드포인트)
- [ ] 에러 케이스 테스트
- [ ] 경계값 테스트
- [ ] 성능 고려사항 테스트

### 코드 변경 시
- [ ] 기존 테스트 통과 확인
- [ ] 새로운 테스트 케이스 추가
- [ ] 커버리지 유지/향상
- [ ] 통합 테스트 실행
- [ ] 성능 회귀 없음 확인

### 배포 전
- [ ] 전체 테스트 스위트 실행
- [ ] 커버리지 80% 이상 유지
- [ ] 성능 테스트 통과
- [ ] 에러 로그 없음
- [ ] 메모리 누수 없음

이 가이드를 통해 견고하고 신뢰할 수 있는 테스트 코드를 작성하여 코드 품질을 보장할 수 있습니다.