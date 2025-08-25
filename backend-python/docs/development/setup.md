# 🛠️ 개발 환경 설정 가이드

Poetry Scripts를 활용한 통합 개발 환경 설정 및 관리 가이드입니다.

## 📋 사전 요구사항

### 필수 소프트웨어
- **Python 3.11+**: 메인 런타임
- **Poetry 1.4+**: 의존성 관리 및 스크립트 실행
- **Docker**: 인프라 서비스 (PostgreSQL, Redis)
- **Git**: 버전 관리

### 권장 개발 도구
- **VS Code**: Python 확장 포함
- **Docker Desktop**: GUI 관리
- **Postman** 또는 **HTTPie**: API 테스트
- **pgAdmin**: 데이터베이스 관리 (선택사항)

## 🚀 빠른 시작 (3단계)

### 1. 초기 설정
```bash
# 저장소 클론 및 의존성 설치
git clone <repository-url>
cd backend-python
poetry install
poetry shell

# 인프라 및 데이터베이스 설정 (한번만 실행)
poetry run setup
```

### 2. 개발 서버 시작
```bash
# 모든 서비스 시작 (Docker + 애플리케이션)
poetry run dev

# 접속 확인
# - API: http://localhost:8000
# - Swagger: http://localhost:8000/docs
# - pgAdmin: http://localhost:5050 (admin@admin.com / admin)
```

### 3. 개발 완료 후 정리
```bash
# 모든 서비스 정리
poetry run stop
```

## 📦 Poetry Scripts 상세

### `poetry run setup`
초기 환경 설정 및 데이터베이스 준비

**수행 작업:**
- Docker 서비스 시작 (PostgreSQL, Redis, pgAdmin)
- 서비스 헬스체크 대기
- 데이터베이스 마이그레이션 실행
- 환경 검증

**실행 조건:**
- 프로젝트 최초 설정 시
- 데이터베이스 초기화 필요 시
- 마이그레이션 상태 불일치 시

### `poetry run dev`
통합 개발 환경 시작

**수행 작업:**
- 인프라 서비스 상태 확인 (없으면 자동 시작)
- Celery 워커 백그라운드 시작
- FastAPI 개발 서버 시작 (hot reload)

**특징:**
- 컬러풀한 로그 출력
- 실시간 진행상황 표시
- 자동 의존성 검사
- 우아한 종료 처리

### `poetry run stop`
모든 서비스 정리

**수행 작업:**
- 백그라운드 프로세스 종료
- Docker 컨테이너 정지
- 리소스 정리

## 🔧 개별 명령어

### 개발 도구
```bash
# 코드 포맷팅
poetry run format

# 린트 검사
poetry run lint

# 타입 체킹
poetry run typecheck

# 테스트 실행
poetry run test
```

### 데이터베이스 관리
```bash
# 마이그레이션 생성
alembic revision --autogenerate -m "설명"

# 마이그레이션 실행
alembic upgrade head

# 마이그레이션 롤백
alembic downgrade -1

# 현재 버전 확인
alembic current

# 마이그레이션 히스토리
alembic history
```

### 서비스 개별 실행
```bash
# FastAPI 서버만
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Celery 워커만
celery -A app.infra.tasks.celery_app worker --loglevel=info

# Celery 모니터링
celery -A app.infra.tasks.celery_app flower
```

## 🐳 Docker 서비스

### 포함된 서비스
- **PostgreSQL 16**: 메인 데이터베이스 (포트 5432)
- **Redis 7**: 캐시 및 Celery 브로커 (포트 6379)
- **pgAdmin**: 웹 기반 DB 관리 (포트 5050)

### Docker 명령어
```bash
# 서비스 시작
docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f [service-name]

# 서비스 재시작
docker-compose restart [service-name]

# 전체 정리
docker-compose down -v
```

## 🔍 문제 해결

### 일반적인 문제

#### 1. Poetry 설치 안됨
```bash
# Poetry 설치
curl -sSL https://install.python-poetry.org | python3 -

# PATH 설정 확인
export PATH="$HOME/.local/bin:$PATH"
```

#### 2. Docker 서비스 시작 실패
```bash
# Docker Desktop 실행 상태 확인
docker --version

# 포트 충돌 확인
netstat -tulpn | grep :5432
netstat -tulpn | grep :6379

# 기존 컨테이너 정리
docker-compose down -v
docker system prune -f
```

#### 3. 데이터베이스 연결 실패
```bash
# 연결 테스트
poetry run python -c "
from app.infra.db.session import get_engine
import asyncio

async def test():
    engine = get_engine()
    async with engine.connect() as conn:
        result = await conn.execute('SELECT 1')
        print('DB 연결 성공!')

asyncio.run(test())
"
```

#### 4. Celery 워커 연결 실패
```bash
# Redis 연결 테스트
redis-cli ping

# Celery 상태 확인
celery -A app.infra.tasks.celery_app inspect active
```

### 로그 확인

#### 애플리케이션 로그
```bash
# 개발 서버 로그는 터미널에 실시간 출력
poetry run dev

# 특정 로그 레벨만 확인
export LOG_LEVEL=DEBUG
poetry run dev
```

#### Docker 서비스 로그
```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f postgres
docker-compose logs -f redis
```

### 성능 문제

#### 느린 시작 시간
```bash
# Docker 리소스 설정 확인
# Docker Desktop > Settings > Resources

# 불필요한 이미지 정리
docker system prune -a

# Poetry 캐시 정리
poetry cache clear pypi --all
```

#### 메모리 사용량 높음
```bash
# 현재 프로세스 확인
ps aux | grep -E "(python|celery)"

# Docker 메모리 사용량
docker stats

# Python 메모리 프로파일링
poetry run python -m memory_profiler app/main.py
```

## 🧪 테스트 환경

### 테스트 실행
```bash
# 모든 테스트
poetry run test

# 커버리지 리포트
poetry run test --cov=app --cov-report=html

# 특정 테스트 파일
pytest app/tests/test_research.py

# 특정 테스트 케이스
pytest app/tests/test_research.py::test_create_research_job
```

### 테스트 데이터베이스
```bash
# 테스트 전용 DB 설정 (pytest.ini 참고)
export DATABASE_URL=postgresql+asyncpg://test:test@localhost:5432/test_db

# 테스트 DB 초기화
alembic -x database_url=$DATABASE_URL upgrade head
```

## 📊 모니터링

### 헬스체크
```bash
# API 상태 확인
curl http://localhost:8000/api/v1/health

# 개별 서비스 상태
curl http://localhost:8000/api/v1/health/database
curl http://localhost:8000/api/v1/health/redis
```

### 성능 메트릭
```bash
# Celery 모니터링 (Flower)
# http://localhost:5555

# 데이터베이스 연결 풀
poetry run python -c "
from app.infra.db.session import get_engine
engine = get_engine()
print(f'Pool size: {engine.pool.size()}')
print(f'Checked in: {engine.pool.checkedin()}')
"
```

## 📝 개발 워크플로우

### 일반적인 개발 사이클

1. **환경 시작**
   ```bash
   poetry shell
   poetry run dev
   ```

2. **코드 수정**
   - 파일 변경 시 자동 리로드
   - 브라우저에서 http://localhost:8000/docs 확인

3. **테스트 실행**
   ```bash
   poetry run test
   ```

4. **코드 품질 확인**
   ```bash
   poetry run format  # 자동 포맷팅
   poetry run lint    # 린트 검사
   ```

5. **커밋 전 체크**
   ```bash
   poetry run typecheck  # 타입 검사
   poetry run test       # 전체 테스트
   ```

6. **환경 정리**
   ```bash
   poetry run stop
   ```

### 새로운 기능 개발

1. **브랜치 생성**
   ```bash
   git checkout -b feature/새기능명
   ```

2. **데이터베이스 스키마 변경** (필요시)
   ```bash
   alembic revision --autogenerate -m "새기능 스키마 추가"
   alembic upgrade head
   ```

3. **개발 및 테스트**
   ```bash
   # 개발 진행...
   poetry run test
   ```

4. **문서 업데이트** (필요시)
   ```bash
   # API 문서는 Swagger에서 자동 생성
   # 추가 문서는 docs/ 폴더에 업데이트
   ```

5. **커밋 및 푸시**
   ```bash
   git add .
   git commit -m "feat: 새기능 추가"
   git push origin feature/새기능명
   ```

## 🎯 추가 개발 도구

### IDE 설정

#### VS Code 권장 설정 (.vscode/settings.json)
```json
{
  "python.defaultInterpreterPath": ".venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "python.sortImports.args": ["--profile", "black"],
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

#### VS Code 권장 확장
- Python
- Pylance
- Black Formatter
- Docker
- REST Client

### 디버깅

#### VS Code 디버그 설정 (.vscode/launch.json)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI Debug",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/app/main.py",
      "console": "integratedTerminal",
      "justMyCode": true,
      "env": {
        "PYTHONPATH": "${workspaceFolder}"
      }
    }
  ]
}
```

### API 개발 도구

#### HTTPie 사용 예시
```bash
# 헬스체크
http GET localhost:8000/api/v1/health

# 제품 리서치 요청
http POST localhost:8000/api/v1/research/products \
  items:='[{"product_name": "테스트 제품", "category": "테스트", "price_exact": 10000}]'

# 작업 상태 확인
http GET localhost:8000/api/v1/research/products/JOB_ID/status
```

이 설정 가이드를 따라하면 일관되고 효율적인 개발 환경을 구축할 수 있습니다.