# 🚀 제품 리서치 백엔드 API

Perplexity AI를 활용한 제품 정보 리서치 시스템입니다. Clean Architecture 원칙을 따라 구축되었으며, FastAPI, SQLAlchemy, Celery를 사용합니다.

## 🏗️ 시스템 아키텍처

Clean Architecture 원칙에 따른 레이어별 구조:

```
backend-python/
├── app/
│   ├── core/            # 🔧 설정 및 로깅
│   ├── domain/          # 🎯 비즈니스 로직 (프레임워크 독립)
│   ├── infra/           # 🔌 외부 시스템 어댑터 (DB, AI, Tasks)
│   ├── services/        # 🎭 오케스트레이션 레이어
│   ├── api/             # 🌐 REST API 컨트롤러
│   ├── schemas/         # 📝 데이터 전송 객체
│   ├── utils/           # 🛠️ 유틸리티 함수
│   └── tests/           # 🧪 테스트 스위트
├── docs/                # 📚 API 문서 (한글)
├── alembic/             # 📊 데이터베이스 마이그레이션
└── docker-compose.yml   # 🐳 로컬 개발 환경
```

### 레이어 역할

- **Domain Layer**: 순수 비즈니스 엔티티 및 규칙 (프레임워크 의존성 없음)
- **Infrastructure Layer**: 데이터베이스, 외부 API, 작업 큐 구현체
- **Service Layer**: 도메인 로직과 인프라 간 오케스트레이션
- **API Layer**: HTTP 엔드포인트 및 요청/응답 처리
- **Core Layer**: 횡단 관심사 (설정, 로깅)

## 🎯 주요 기능

- **🔍 제품 리서치**: 최대 10개 제품 동시 리서치 (환경변수로 조정 가능)
- **📊 상세 정보 수집**: 제품 스펙, 리뷰, 가격 비교
- **⭐ 필수 리뷰 데이터**: 평점, 리뷰 수 검증 및 수집
- **🔗 신뢰도 높은 출처**: 제조사/공식 도메인 우선순위
- **⚡ 비동기 처리**: Celery 백그라운드 작업 지원
- **📈 실시간 진행 추적**: 작업 상태 및 진행률 모니터링
- **🔧 Clean Architecture**: 테스트 가능하고 유지보수성 높은 설계
- **📝 타입 안전성**: Pydantic을 통한 완전한 타입 검증
- **📚 API 문서화**: Swagger/OpenAPI 자동 생성 (한글 지원)

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

## 📋 요구사항

- Python 3.11+
- Poetry (의존성 관리)
- Docker & Docker Compose (로컬 서비스)
- PostgreSQL 16
- Redis 7
- Perplexity AI API 키

## 🚀 빠른 시작 (Docker 기반)

### 방법 1: Windows 배치 스크립트 (Windows 추천) 

```cmd
git clone <repository-url>
cd backend-python

# 초기 설정 (최초 1회)
dev.bat setup

# 개발 시작
dev.bat start

# 개발 완료
dev.bat stop
```

### 방법 2: Makefile 사용 (Linux/Mac 추천)

```bash
git clone <repository-url>
cd backend-python

# 초기 설정 (최초 1회)
make setup

# 개발 시작
make start

# 개발 완료
make stop
```

### 방법 3: Poetry 스크립트 사용 (크로스 플랫폼)

```bash
git clone <repository-url>
cd backend-python

# 초기 설정 (최초 1회)
poetry run setup

# 개발 시작  
poetry run dev

# 개발 완료
poetry run stop
```

### 방법 4: Dev Container 사용 (VS Code/Cursor)

```bash
git clone <repository-url>
cd backend-python
cursor .  # 또는 code .

# Command Palette에서 "Dev Containers: Reopen in Container" 선택
# 자동으로 모든 환경이 구성됩니다!
```

### 초기 설정이 자동으로 처리하는 작업:
- ✅ Docker 이미지 빌드 (asyncpg 컴파일 문제 해결)
- ✅ Python 의존성 설치 (Poetry)
- ✅ 인프라 서비스 시작 (PostgreSQL, Redis)
- ✅ 데이터베이스 마이그레이션 실행
- ✅ 개발환경 준비 완료

## 📱 개발 중 사용법

### Windows 배치 스크립트 (Windows 추천)
```cmd
dev.bat start       # 개발환경 시작
dev.bat logs        # 로그 확인
dev.bat shell       # 앱 컨테이너 접근
dev.bat test        # 테스트 실행
dev.bat stop        # 모든 서비스 정지

# API 테스트
curl http://localhost:8000/api/v1/health
```

### Makefile 명령어 (Linux/Mac 추천)
```bash
make start          # 개발환경 시작
make logs           # 로그 확인
make shell          # 앱 컨테이너 접근
make test           # 테스트 실행
make lint           # 코드 품질 검사
make stop           # 모든 서비스 정지

# API 테스트
curl http://localhost:8000/api/v1/health

# 데이터베이스 관리
make migrate        # 마이그레이션 실행
make shell-postgres # PostgreSQL 접근
```

### Poetry 명령어 (크로스 플랫폼)
```bash
poetry run dev      # 개발환경 시작  
poetry run test     # 테스트 실행
poetry run lint     # 코드 품질 검사
poetry run stop     # 서비스 정지
```

### 컨테이너 내부 작업
```bash
# 앱 컨테이너 접근
make shell
# 또는
docker-compose exec app bash

# 컨테이너 내부에서
poetry run pytest
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload
```

## 🔗 접속 주소

- **API 서버**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs  
- **ReDoc**: http://localhost:8000/redoc
- **pgAdmin**: http://localhost:5050 (admin@example.com / admin)

## 📖 API 사용법

### 제품 리서치 요청

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
           "product_name": "레노버 아이디어패드 1 15IJL7", 
           "category": "가전디지털",
           "price_exact": 339000,
           "currency": "KRW"
         }
       ],
       "priority": 5,
       "callback_url": "https://your-domain.com/webhook/research-complete"
     }'
```

### Celery 백그라운드 작업으로 요청

```bash
curl -X POST "http://localhost:8000/api/v1/research/products?use_celery=true" \
     -H "Content-Type: application/json" \
     -d '{
       "items": [
         {
           "product_name": "베이직스 2024 베이직북 14 N-시리즈",
           "category": "가전디지털", 
           "price_exact": 388000
         }
       ]
     }'
```

### 리서치 결과 조회

```bash
curl "http://localhost:8000/api/v1/research/products/{job_id}"
```

### 작업 상태 확인

```bash
# 일반 작업 상태 확인
curl "http://localhost:8000/api/v1/research/products/{job_id}/status"

# Celery 작업 상태 확인  
curl "http://localhost:8000/api/v1/research/products/{task_id}/status?is_celery=true"
```

### 작업 취소

```bash
curl -X DELETE "http://localhost:8000/api/v1/research/products/{job_id}"
```

## 📊 응답 예시

### 리서치 결과 조회 응답

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "results": [
    {
      "product_name": "베이직스 2024 베이직북 14 N-시리즈",
      "brand": "베이직스",
      "category": "가전디지털",
      "model_or_variant": "N-시리즈",
      "price_exact": 388000,
      "currency": "KRW",
      "seller_or_store": "베이직스",
      "deeplink_or_product_url": "https://basic-s.com/products/basicbook-14",
      "coupang_price": 385000,
      "specs": {
        "main": [
          "Intel N95 CPU",
          "RAM 8GB",
          "SSD 256GB",
          "14.1형 IPS FHD 디스플레이"
        ],
        "attributes": [
          {"name": "CPU", "value": "Intel N95"},
          {"name": "RAM", "value": "8GB"}
        ],
        "size_or_weight": "1.35kg",
        "options": ["8GB/256GB", "16GB/512GB"],
        "included_items": ["노트북", "어댑터", "사용설명서"]
      },
      "reviews": {
        "rating_avg": 4.3,
        "review_count": 41,
        "summary_positive": ["가성비가 뛰어나다", "휴대성이 좋다"],
        "summary_negative": ["터치패드 감도가 아쉽다"],
        "notable_reviews": [
          {
            "source": "네이버 쇼핑",
            "quote": "가벼워서 들고 다니기 좋아요",
            "url": "https://shopping.naver.com/reviews/12345"
          }
        ]
      },
      "sources": [
        "https://basic-s.com",
        "https://www.enuri.com", 
        "https://prod.danawa.com"
      ],
      "captured_at": "2024-01-20",
      "status": "success"
    }
  ],
  "metadata": {
    "total_items": 1,
    "successful_items": 1,
    "failed_items": 0,
    "success_rate": 1.0,
    "processing_time_ms": 3500,
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T10:01:30Z",
    "started_at": "2024-01-20T10:00:05Z",
    "completed_at": "2024-01-20T10:01:30Z"
  }
}
```

### 작업 상태 확인 응답

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": 0.5,
  "message": "2개 중 1개 처리 완료",
  "metadata": {
    "total": 2,
    "successful": 1,
    "failed": 0
  }
}
```

## 🧪 테스트

```bash
# Poetry 통합 명령어로 테스트
poetry run test

# 또는 직접 pytest 사용
pytest                                    # 모든 테스트
pytest --cov=app --cov-report=html      # 커버리지 테스트  
pytest app/tests/test_product_research.py # 특정 테스트
pytest -v                               # 상세 출력
```

## 🔧 개발 명령어

### Windows 배치 스크립트 (Windows 추천)
```cmd
# 환경 관리
dev.bat setup       # 프로젝트 초기 설정 (최초 1회)
dev.bat start       # 개발환경 시작
dev.bat stop        # 모든 서비스 정지
dev.bat logs        # 실시간 로그 확인
dev.bat shell       # 앱 컨테이너 쉘 접근
dev.bat test        # 테스트 실행
dev.bat clean       # 환경 정리 (주의!)
dev.bat help        # 도움말 표시

# 사용 예시
dev.bat start && timeout 5 && curl http://localhost:8000/api/v1/health
```

### Makefile 명령어 (Linux/Mac 추천)
```bash
# 환경 관리
make setup           # 프로젝트 초기 설정 (최초 1회)
make start           # 개발환경 시작
make stop            # 모든 서비스 정지
make restart         # 서비스 재시작
make status          # 컨테이너 상태 확인

# 개발 도구
make test            # 테스트 실행
make test-cov        # 커버리지 테스트
make lint            # 코드 품질 검사 및 수정
make format          # 코드 포맷팅

# 컨테이너 접근
make shell           # 앱 컨테이너 쉘 접근
make shell-postgres  # PostgreSQL 접근
make shell-redis     # Redis CLI 접근

# 데이터베이스
make migrate         # 마이그레이션 실행
make migrate-create name="설명"  # 새 마이그레이션 생성
make migrate-rollback # 마이그레이션 롤백

# 로그 및 모니터링
make logs            # 모든 서비스 로그
make logs-app        # 앱 로그만
make health          # 서비스 헬스체크

# 정리
make clean           # 모든 Docker 리소스 제거 (주의!)
make clean-data      # 데이터 볼륨만 제거
```

### Poetry Scripts (Docker 래핑됨)
```bash
# 주요 명령어 (Makefile과 동일한 기능)
poetry run setup     # make setup과 동일
poetry run dev       # make start와 동일  
poetry run stop      # make stop과 동일
poetry run test      # make test와 동일
poetry run lint      # make lint와 동일
poetry run format    # make format과 동일

# 로컬 개발 (백업용)
poetry run setup-local   # 로컬 환경 설정
poetry run dev-local     # 로컬 서버 시작
```

### Docker Compose 직접 사용
```bash
# 컨테이너 관리
docker-compose up -d           # 모든 서비스 백그라운드 시작
docker-compose down           # 모든 서비스 정지
docker-compose build          # 이미지 빌드
docker-compose ps             # 컨테이너 상태
docker-compose logs -f        # 실시간 로그

# 개별 서비스 관리
docker-compose up -d postgres redis  # 인프라만 시작
docker-compose exec app bash         # 앱 컨테이너 접근
docker-compose run --rm app poetry run pytest  # 일회성 명령어

# 데이터 관리
docker-compose down -v        # 볼륨까지 삭제
```

## 📊 데이터베이스 스키마

시스템의 주요 엔티티:

- **ProductResearchJob**: 배치 리서치 작업 관리
- **ProductResearchItem**: 리서치할 개별 제품
- **ProductResearchResult**: 각 아이템의 리서치 결과

## 🎯 비즈니스 규칙

### 리서치 처리
- 작업당 최대 배치 크기: 10개 아이템 (환경변수로 조정 가능)
- 아이템 해시 기반 자동 중복 제거
- 실패한 API 요청에 대한 지수 백오프
- 작업 크기와 메타데이터 기반 우선순위 점수

### 필수 데이터 검증
- 리뷰 평점(rating_avg)과 리뷰 수(review_count) 필수
- 최소 3개 이상의 신뢰할 수 있는 정보 출처
- 제조사/공식 도메인 1개 이상 포함

### 태스크 관리
- 상태 추적이 포함된 비동기 처리
- 실패한 태스크에 대한 재시도 메커니즘
- 진행 상황 모니터링 및 완료 추적

## 🔄 처리 흐름

1. **작업 생성**: 아이템 검증 및 데이터베이스 레코드 생성
2. **태스크 디스패치**: 비동기 처리를 위한 작업 큐잉
3. **리서치 실행**: 각 아이템에 대해 Perplexity API 호출
4. **결과 저장**: 리서치 결과를 데이터베이스에 저장
5. **작업 완료**: 작업 상태 및 통계 업데이트

## 🚦 헬스체크

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
- SQLAlchemy를 통한 SQL 인젝션 방지
- API 속도 제한 지원
- 환경 기반 설정
- 코드 내 시크릿 없음

## 📚 추가 문서

- **API 레퍼런스**: `docs/API_REFERENCE_KR.md`
- **프론트엔드 통합**: `docs/FRONTEND_INTEGRATION_KR.md`
- **타입 정의**: TypeScript 인터페이스 포함

## 🔧 설정 관리

주요 환경변수 설정:

```bash
# 애플리케이션
APP_ENV=development
DEBUG=true
API_V1_PREFIX=/api/v1

# 데이터베이스
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/research_db

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/2

# Perplexity API
PERPLEXITY_API_KEY=your_api_key_here
PERPLEXITY_API_URL=https://api.perplexity.ai
PERPLEXITY_MODEL=sonar-pro

# 제품 리서치 설정
MAX_RESEARCH_BATCH_SIZE=10
DEFAULT_RESEARCH_BATCH_SIZE=5  
MIN_RESEARCH_BATCH_SIZE=1
MAX_CONCURRENT_REQUESTS=5
REQUEST_TIMEOUT=60
RETRY_MAX_ATTEMPTS=3
RETRY_BASE_DELAY=1
RETRY_BACKOFF_MULTIPLIER=2

# 통화 지원
SUPPORTED_CURRENCIES=KRW,USD,JPY,EUR
DEFAULT_CURRENCY=KRW
```

## 🐳 Docker 환경 정보

### 컨테이너 구성
- **app**: Python 애플리케이션 (FastAPI, Celery)
- **postgres**: PostgreSQL 16 데이터베이스
- **redis**: Redis 7 캐시 및 메시지 브로커  
- **pgadmin**: PostgreSQL 관리 도구

### 포트 매핑
- **8000**: FastAPI API 서버
- **5432**: PostgreSQL 데이터베이스
- **6379**: Redis
- **5050**: pgAdmin 웹 인터페이스
- **5555**: Celery Flower (향후 추가 예정)

### 볼륨 구성
- **소스코드**: `.:/app` (hot reload 지원)
- **가상환경**: `/app/.venv` (컨테이너 내부)
- **PostgreSQL 데이터**: `postgres_data` 볼륨
- **Redis 데이터**: `redis_data` 볼륨

### IDE 지원
- **Dev Containers**: `.devcontainer/` 설정으로 VS Code/Cursor 완벽 지원
- **포트 포워딩**: 자동 포트 전달로 localhost 접근
- **확장 프로그램**: Python 개발 도구 자동 설치
- **디버깅**: 컨테이너 내부 디버깅 지원

### 환경별 설정
- **개발환경**: `target: development` (hot reload, dev 의존성)
- **운영환경**: `target: production` (최적화, 헬스체크)

## 🛠️ 문제 해결

### 일반적인 문제들

1. **"docker: command not found"**
   ```bash
   # Docker Desktop 설치 및 시작 확인
   docker --version
   # Windows: dev.bat help
   # Linux/Mac: make info
   ```

2. **"poetry: command not found"**
   ```bash
   # Poetry 설치 후 PATH 설정
   curl -sSL https://install.python-poetry.org | python3 -
   
   # Windows에서 PATH 설정
   # 시스템 환경변수에 추가: C:\Users\{사용자명}\AppData\Roaming\Python\Scripts
   ```

3. **"make: command not found" (Windows)**
   ```cmd
   # Windows에서는 dev.bat 사용 (make 대신)
   dev.bat help
   
   # 또는 Poetry 스크립트 사용
   poetry run setup
   ```

4. **포트 충돌 오류**
   ```bash
   # 기존 서비스 확인 및 정지
   docker-compose down
   # Windows: netstat -ano | findstr :8000
   # Linux/Mac: lsof -i :8000
   ```

5. **asyncpg 컴파일 오류 (해결됨)**
   - Docker 환경에서 Linux 컨테이너 사용으로 해결
   - Windows 의존성 문제 없음

6. **데이터베이스 연결 오류**
   ```bash
   # Windows
   dev.bat logs       # 로그 확인
   dev.bat shell      # 컨테이너 접근
   
   # Linux/Mac  
   make health        # 서비스 상태 확인
   make logs-app      # 앱 로그 확인
   make shell-postgres # DB 직접 접근
   ```

### 성능 최적화
- **이미지 크기**: 멀티스테이지 빌드로 최적화
- **빌드 속도**: .dockerignore로 불필요한 파일 제외
- **개발 속도**: 볼륨 마운트로 hot reload 지원

## 🤝 기여하기

1. Clean Architecture 원칙 준수
2. 80% 이상의 테스트 커버리지 유지
3. 모든 곳에 타입 힌트 사용
4. 컨벤션 커밋 메시지 사용
5. 문서 업데이트
6. **Docker 환경에서 개발 및 테스트**: 
   - Windows: `dev.bat test`, `dev.bat start`
   - Linux/Mac: `make test`, `make lint`

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.