# CLAUDE.md

이 파일은 이 저장소에서 코드 작업을 할 때 Claude Code (claude.ai/code)에게 가이드를 제공합니다.

## 프로젝트 개요

이 프로젝트는 Clean Architecture 원칙으로 구축된 Python 리서치 백엔드로, 다음 기능들을 포함합니다:
- **FastAPI**를 사용한 REST API 엔드포인트
- **SQLAlchemy 2.0**과 비동기 PostgreSQL 지원
- **Celery**와 Redis를 사용한 백그라운드 작업 처리
- 리서치 자동화를 위한 **Perplexity AI** 통합
- 도메인 주도 설계를 적용한 **Clean Architecture**

## 개발 명령어

### 환경 설정
```bash
# Poetry로 의존성 설치
poetry install
poetry shell

# 인프라 서비스 시작
docker-compose up -d

# 서비스 실행 상태 확인
docker-compose ps
```

### 데이터베이스 관리
```bash
# 데이터베이스 마이그레이션 실행
alembic upgrade head

# 새 마이그레이션 생성
alembic revision --autogenerate -m "마이그레이션 설명"

# 마이그레이션 롤백
alembic downgrade -1

# 현재 마이그레이션 상태 확인
alembic current
```

### 애플리케이션 명령어
```bash
# 개발 서버 시작
python app/main.py
# 또는
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Celery 워커 시작 (별도 터미널)
celery -A app.infra.tasks.celery_app worker --loglevel=info

# Celery flower 모니터링 시작 (선택사항)
celery -A app.infra.tasks.celery_app flower
```

### 코드 품질 및 테스트
```bash
# 모든 테스트 실행
pytest

# 커버리지와 함께 테스트 실행
pytest --cov=app --cov-report=html

# 특정 테스트 파일 실행
pytest app/tests/test_research.py

# 코드 포맷팅
black app/

# 린트 및 코드 수정
ruff --fix app/

# 타입 체킹
mypy app/
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

## 설정 관리

### 환경 변수
`app/core/config.py`의 Pydantic Settings를 통한 모든 설정:

```python
# 주요 설정 카테고리:
- Application: APP_ENV, DEBUG, API_V1_PREFIX
- Database: DATABASE_URL, pool settings
- Redis: REDIS_URL, CELERY_BROKER_URL
- Perplexity: PERPLEXITY_API_KEY
- Research: MAX_BATCH_SIZE, MAX_CONCURRENT_REQUESTS
```

### 설정 검증
- Pydantic이 모든 환경 변수 검증
- 자동 URL 검증 및 변환
- 개발/운영 모드 감지

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

## 서비스 및 의존성

### 필수 서비스
- **PostgreSQL 16**: 주 데이터베이스
- **Redis 7**: 캐시 및 Celery 브로커
- **Perplexity AI API**: 리서치 데이터 소스

### 선택적 서비스
- **pgAdmin**: 데이터베이스 관리 (localhost:5050)
- **Flower**: Celery 모니터링
- **Monitoring**: 집계 준비가 완료된 구조화된 JSON 로깅