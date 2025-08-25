# CLAUDE.md

이 파일은 이 저장소에서 코드 작업을 할 때 Claude Code (claude.ai/code)에게 가이드를 제공합니다.

## 프로젝트 개요

Clean Architecture 원칙으로 구축된 Python 리서치 백엔드 시스템:
- **FastAPI** 기반 비동기 REST API (포트 8000)
- **SQLAlchemy 2.0** + 비동기 PostgreSQL (포트 5432)
- **Celery** + Redis 백그라운드 작업 처리 (포트 6379)
- **Perplexity AI** 통합 리서치 자동화
- **Domain-Driven Design** 적용 Clean Architecture

## 빠른 시작 가이드

### 1. 초기 설정 (최초 1회)
```bash
# Poetry 설치 (없는 경우)
pip install poetry

# 의존성 설치
poetry install
poetry shell

# 환경 변수 설정
cp .env.example .env  # .env 파일 생성 후 수정 필요
```

### 2. 서비스 시작 순서
```bash
# 1단계: Docker 서비스 시작 (PostgreSQL, Redis)
docker-compose up -d

# 2단계: 데이터베이스 마이그레이션
alembic upgrade head

# 3단계: FastAPI 서버 시작
python app/main.py
# 또는
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4단계: Celery 워커 시작 (별도 터미널)
celery -A app.infra.tasks.celery_app worker --loglevel=info

# 5단계: API 문서 확인
# 브라우저에서 http://localhost:8000/docs 접속
```

### 3. 데이터베이스 관리
```bash
# 마이그레이션 실행
alembic upgrade head

# 새 마이그레이션 생성
alembic revision --autogenerate -m "설명"

# 마이그레이션 롤백
alembic downgrade -1

# 현재 상태 확인
alembic current
```

### 4. 개발 명령어
```bash
# 테스트 실행
pytest
pytest --cov=app --cov-report=html  # 커버리지 포함
pytest app/tests/test_research.py   # 특정 파일

# 코드 품질
black app/        # 코드 포맷팅
ruff --fix app/   # 린팅 및 자동 수정
mypy app/         # 타입 체킹

# 서비스 상태 확인
docker-compose ps          # Docker 서비스 상태
docker-compose logs -f     # 로그 확인
```

## Clean Architecture 구조

코드베이스는 명확한 레이어 분리를 통한 Clean Architecture를 따릅니다:

### Domain Layer (`app/domain/`)
- **entities.py**: 순수 비즈니스 객체 (ResearchJob, Item, Result)
- **usecases.py**: 비즈니스 규칙과 유스케이스
- **프레임워크 의존성 없음** - 핵심 비즈니스 로직 포함

### Infrastructure Layer (`app/infra/`)
- **db/**: 데이터베이스 모델, 리포지토리, 세션 관리
- **llm/**: 외부 AI 서비스 통합 (Perplexity API)
- **tasks/**: Celery 설정 및 백그라운드 워커
- **도메인 인터페이스의 프레임워크별 구현체**

### Service Layer (`app/services/`)
- **research_service.py**: 도메인 로직과 인프라를 조율
- **도메인과 인프라 레이어 간 조정**
- **트랜잭션 관리** 및 에러 처리

### API Layer (`app/api/`)
- **v1/endpoints/**: HTTP 엔드포인트 구현
- **v1/router.py**: API 라우트 설정
- **요청/응답 처리** 및 HTTP 관련 사항

### 지원 레이어
- **core/**: 설정 및 로깅 설정
- **schemas/**: API 직렬화를 위한 Pydantic 모델
- **utils/**: 공유 유틸리티 함수

## 주요 패턴 및 규칙

### Domain Entities
- 도메인 객체에 dataclass 사용
- `__post_init__`에 비즈니스 검증 포함
- 직렬화를 위한 `to_dict()` 메서드 제공
- 상태 관리를 위한 Status enum 사용

### Repository Pattern
- 도메인 레이어의 추상 리포지토리
- 인프라에서 구체적 구현
- 데이터 레이어 전반에 Async/await 패턴 적용

### Service Layer 조율
- 서비스가 도메인과 인프라 간 조정
- 트랜잭션 경계 처리
- 에러 처리 및 재시도 로직 관리

### 백그라운드 작업 처리
- 장시간 실행 작업을 위한 Celery 태스크
- Redis를 사용한 큐 기반 처리
- 지수 백오프를 사용한 재시도 로직

## 환경 설정

### 필수 환경 변수 (.env 파일)
```bash
# 애플리케이션
APP_ENV=development
DEBUG=true
API_V1_PREFIX=/api/v1

# 데이터베이스
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/research_db

# Redis & Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/2
CELERY_RESULT_BACKEND=redis://localhost:6379/3

# Perplexity AI (필수)
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx  # 실제 API 키로 교체 필요

# 리서치 설정
MAX_BATCH_SIZE=10
MAX_CONCURRENT_REQUESTS=5
REQUEST_TIMEOUT=30
```

### 설정 관리 (`app/core/config.py`)
- Pydantic Settings로 모든 환경 변수 자동 검증
- 타입 안전성 보장 및 기본값 제공
- 개발/운영 환경 자동 감지

## 데이터베이스 설계

### 핵심 엔티티
- **ResearchJob**: 상태 추적이 포함된 배치 리서치 작업
- **Item**: 연구할 개별 제품/아이템
- **Result**: 성공/에러 상태를 포함한 리서치 결과

### 마이그레이션 전략
- 모든 스키마 변경에 Alembic 사용
- SQLAlchemy 모델로부터 자동 생성
- 환경별 설정

## API 설계

### RESTful 엔드포인트
- `/api/v1/research/jobs` - 작업 관리
- `/api/v1/research/tasks/{task_id}/status` - 태스크 모니터링
- `/api/v1/health` - 헬스 체크

### 요청/응답 패턴
- 검증을 위한 Pydantic 스키마
- 구조화된 에러 응답
- `/docs`에서 OpenAPI/Swagger 문서 제공

## 비즈니스 규칙 및 제약사항

### 리서치 처리
- 작업당 최대 배치 크기: 10개 아이템
- 아이템 해시 기반 자동 중복 제거
- 실패한 API 요청에 대한 지수 백오프
- 작업 크기와 메타데이터 기반 우선순위 점수

### 태스크 관리
- 상태 추적이 포함된 비동기 처리
- 실패한 태스크에 대한 재시도 메커니즘
- 진행 상황 모니터링 및 완료 추적

## 개발 가이드라인

### 코드 구성
- Clean Architecture 레이어 경계 준수
- 도메인 로직을 프레임워크 독립적으로 유지
- 인프라를 위한 의존성 주입 사용
- 추상화를 위한 인터페이스/프로토콜 구현

### 테스트 전략
- 도메인 로직용 단위 테스트
- 리포지토리용 통합 테스트
- 엔드포인트용 API 테스트
- `pyproject.toml`의 테스트 설정

### 에러 처리
- 비즈니스 규칙 위반에 대한 도메인 예외
- 외부 서비스 실패에 대한 인프라 예외
- 상관 ID를 포함한 구조화된 로깅
- 우아한 성능 저하 패턴

## 서비스 의존성 및 포트

### 필수 서비스
| 서비스 | 포트 | 용도 | Docker 명령 |
|--------|------|------|-------------|
| PostgreSQL 16 | 5432 | 주 데이터베이스 | `docker-compose up -d postgres` |
| Redis 7 | 6379 | 캐시 & Celery 브로커 | `docker-compose up -d redis` |
| FastAPI | 8000 | REST API 서버 | `python app/main.py` |
| Celery Worker | - | 백그라운드 작업 | `celery -A app.infra.tasks.celery_app worker` |

### 선택적 서비스
| 서비스 | 포트 | 용도 | 시작 명령 |
|--------|------|------|-----------|
| pgAdmin | 5050 | DB 관리 UI | `docker-compose up -d pgadmin` |
| Flower | 5555 | Celery 모니터링 | `celery -A app.infra.tasks.celery_app flower` |
| Swagger UI | 8000/docs | API 문서 | 자동 제공 |

### 외부 API
- **Perplexity AI**: 리서치 데이터 소스 (API 키 필요)

## 문제 해결 가이드

### 서버 시작 실패
```bash
# Poetry 환경 확인
poetry env info
poetry install

# Docker 서비스 재시작
docker-compose down
docker-compose up -d

# 포트 충돌 확인
netstat -an | findstr :8000  # Windows
lsof -i :8000                # Linux/Mac
```

### 데이터베이스 연결 실패
```bash
# PostgreSQL 상태 확인
docker-compose ps postgres
docker-compose logs postgres

# 데이터베이스 재생성
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE research_db;"
alembic upgrade head
```

### Celery 작업 실패
```bash
# Redis 연결 확인
docker-compose ps redis
redis-cli ping

# Celery 워커 로그 확인
celery -A app.infra.tasks.celery_app worker --loglevel=debug
```