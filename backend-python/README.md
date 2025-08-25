# 🚀 제품 리서치 백엔드 API

클린 아키텍처 기반의 Python 리서치 백엔드 시스템. FastAPI, SQLAlchemy, Celery, Perplexity AI를 통합하여 자동화된 리서치 처리를 제공합니다.

## 🏗️ 시스템 아키텍처

Clean Architecture 원칙에 따른 명확한 관심사 분리:

```
backend-python/
backend-python/
├── app/
│   ├── core/           # 🔧 설정 & 로깅
│   ├── domain/         # 🎯 순수 비즈니스 로직 (프레임워크 독립)
│   ├── infra/          # 🔌 외부 어댑터 (DB, LLM, Tasks)
│   ├── services/       # 🎭 조율 계층
│   ├── api/            # 🌐 REST API 컨트롤러
│   ├── schemas/        # 📝 데이터 전송 객체
│   ├── utils/          # 🛠️ 유틸리티 함수
│   └── tests/          # 🧪 테스트 스위트
├── alembic/            # 📊 데이터베이스 마이그레이션
└── docker-compose.yml  # 🐳 로컬 개발 환경
```

### 계층별 책임

- **Domain Layer**: 순수 비즈니스 엔티티와 규칙 (프레임워크 의존성 없음)
- **Infrastructure Layer**: 데이터베이스, 외부 API, 태스크 큐 구현
- **Service Layer**: 도메인 로직과 인프라 조율
- **API Layer**: HTTP 엔드포인트 및 요청/응답 처리
- **Core Layer**: 공통 관심사 (설정, 로깅)

## 🚀 주요 기능

- **리서치 자동화**: Perplexity AI를 활용한 배치 리서치 처리
- **비동기 처리**: Celery + Redis 기반 백그라운드 작업
- **클린 아키텍처**: 테스트 가능하고 유지보수가 쉬운 프레임워크 독립적 도메인 로직
- **타입 안전성**: Pydantic 검증을 통한 완전한 타이핑
- **데이터베이스**: 비동기 SQLAlchemy와 Alembic 마이그레이션을 사용하는 PostgreSQL
- **API 문서화**: OpenAPI/Swagger 자동 생성 문서
- **모니터링**: 구조화된 로깅 및 헬스 체크

## 🛠️ 기술 스택

- **프레임워크**: FastAPI 0.109+
- **데이터베이스**: PostgreSQL 16 with asyncpg
- **ORM**: SQLAlchemy 2.0 (async)
- **작업 큐**: Celery with Redis
- **AI 통합**: Perplexity AI API
- **검증**: Pydantic 2.0
- **마이그레이션**: Alembic
- **테스팅**: pytest with async support
- **코드 품질**: Black, Ruff, MyPy

## 📋 필수 요구사항

- Python 3.11+
- Poetry (의존성 관리)
- Docker & Docker Compose (로컬 서비스)
- Poetry (의존성 관리)
- Docker & Docker Compose (로컬 서비스)
- PostgreSQL 16
- Redis 7
- Perplexity AI API 키

## 🚀 빠른 시작

### 1. 프로젝트 설정

```bash
# 환경 변수 파일 생성
cp .env.example .env
# .env 파일을 열어 PERPLEXITY_API_KEY 설정 필요
```

### 2. 의존성 설치

```bash
# Poetry 설치 (없는 경우)
pip install poetry

# 프로젝트 의존성 설치
poetry install
poetry shell
```

### 3. Docker 서비스 시작

```bash
# PostgreSQL과 Redis 시작
docker-compose up -d

# 서비스 상태 확인
docker-compose ps
```

### 4. 데이터베이스 설정

```bash
# 마이그레이션 실행
alembic upgrade head
```

### 5. 애플리케이션 시작

```bash
# 개발 서버 시작
python app/main.py

# 또는 uvicorn 사용
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Celery 워커 시작

```bash
# 새 터미널에서
celery -A app.infra.tasks.celery_app worker --loglevel=info
```

### 7. API 문서 확인

브라우저에서 http://localhost:8000/docs 접속하여 대화형 API 문서 확인.

## 📖 API 사용 예제

### 리서치 작업 생성

```bash
curl -X POST "http://localhost:8000/api/v1/research/products" \
     -H "Content-Type: application/json" \
     -d '{
       "items": [
         {
           "product_name": "베이직스 2024 베이직북 14 N-시리즈",
           "category": "가전디지털",
           "price_exact": 388000,
           "currency": "KRW",
           "seller_or_store": "베이직스",
           "metadata": {
             "source": "official_store"
           }
         },
         {
           "name": "Samsung Galaxy S24",
           "price": 899.99,
           "category": "Electronics"
         }
       ],
       "metadata": {
         "priority": "high"
       }
     }'
```

### 리서치 작업 시작

```bash
curl -X POST "http://localhost:8000/api/v1/research/jobs/{job_id}/start"
```

### 작업 상태 확인
### 작업 상태 확인

```bash
curl "http://localhost:8000/api/v1/research/jobs/{job_id}"
```

### 태스크 진행 상황 모니터링

```bash
curl "http://localhost:8000/api/v1/research/tasks/{task_id}/status"
```

## 🧪 테스트

```bash
# 모든 테스트 실행
pytest

# 커버리지와 함께 실행
pytest --cov=app --cov-report=html

# 특정 테스트 파일 실행
pytest app/tests/test_research.py

# 상세 출력과 함께 실행
pytest -v
```

## 🔧 환경 설정

`.env` 파일의 주요 환경 변수:

```bash
# 애플리케이션
# 애플리케이션
APP_ENV=development
DEBUG=true
API_V1_PREFIX=/api/v1

# 데이터베이스
# 데이터베이스
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/research_db

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/2
CELERY_RESULT_BACKEND=redis://localhost:6379/3

# Perplexity API (필수)
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx  # 실제 API 키로 교체

# 리서치 설정
MAX_BATCH_SIZE=10
MAX_CONCURRENT_REQUESTS=5
REQUEST_TIMEOUT=30
```

## 📊 데이터베이스 스키마

시스템은 세 가지 주요 엔티티를 사용:

- **ResearchJob**: 배치 리서치 작업 관리
- **Item**: 리서치할 개별 제품
- **Result**: 각 아이템의 리서치 결과

## 🎯 비즈니스 규칙

- 최대 배치 크기: 10개 아이템
- 아이템 해시 기반 자동 중복 제거
- 실패한 요청에 대한 지수 백오프
- 크기와 메타데이터 기반 작업 우선순위 점수

## 🔄 태스크 처리 흐름

1. **작업 생성**: 아이템 검증 및 데이터베이스 레코드 생성
2. **태스크 디스패치**: 비동기 처리를 위한 Celery 태스크 큐잉
3. **리서치 실행**: 각 아이템에 대한 Perplexity API 호출
4. **결과 저장**: 리서치 결과를 데이터베이스에 저장
5. **작업 완료**: 작업 상태 및 통계 업데이트

## 📝 개발 가이드

### 코드 스타일

```bash
# 코드 포맷팅
black app/
ruff --fix app/

# 타입 체킹
mypy app/
```

### 데이터베이스 마이그레이션

```bash
# 새 마이그레이션 생성
alembic revision --autogenerate -m "설명"

# 마이그레이션 적용
alembic upgrade head

# 롤백
alembic downgrade -1
```

### 새 기능 추가 순서

1. `app/domain/entities.py`에 도메인 엔티티 정의
2. `app/domain/usecases.py`에 비즈니스 규칙 추가
3. `app/infra/`에 인프라 어댑터 구현
4. `app/services/`에 서비스 조율 로직 생성
5. `app/api/v1/endpoints/`에 API 엔드포인트 추가
6. `app/tests/`에 테스트 작성

## 🚦 헬스 체크

- **API 상태**: `GET /api/v1/health`
- **데이터베이스**: 연결 및 마이그레이션 상태
- **Redis**: 연결 및 큐 상태
- **Celery**: 워커 상태 및 태스크 처리

## 📈 모니터링

구조화된 JSON 로깅 제공:

- 요청/응답 로깅
- 성능 메트릭
- 에러 추적
- 태스크 진행 상황 모니터링

## 🔒 보안

- Pydantic을 통한 입력 검증
- SQLAlchemy로 SQL 인젝션 방지
- API 레이트 리미팅 준비
- 환경 기반 설정
- 코드에 비밀 정보 없음

## 🤝 기여 가이드

1. Clean Architecture 원칙 준수
2. 테스트 커버리지 80% 이상 유지
3. 모든 곳에 타입 힌트 사용
4. Conventional Commits 준수
5. 문서 업데이트

## 📚 참고 자료

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [Celery User Guide](https://docs.celeryq.dev/en/stable/userguide/)

## 🐛 문제 해결

### 일반적인 문제와 해결 방법

1. **Poetry 설치 실패**: `pip install --upgrade pip` 후 재시도
2. **Docker 서비스 시작 실패**: Docker Desktop이 실행 중인지 확인
3. **데이터베이스 연결 실패**: PostgreSQL 포트(5432)가 사용 중인지 확인
4. **Celery 태스크 실패**: Redis 연결 상태 확인 (`redis-cli ping`)
5. **포트 충돌**: 8000번 포트가 이미 사용 중인 경우 다른 포트 지정

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다.