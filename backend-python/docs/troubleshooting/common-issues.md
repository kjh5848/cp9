# 🔧 일반적인 문제 해결 가이드

개발 중 자주 발생하는 문제들과 해결 방법을 정리한 종합 가이드입니다.

## 🚀 개발 환경 문제

### Poetry 관련 문제

#### 1. Poetry가 설치되지 않음
**증상**
```bash
poetry: command not found
```

**해결방법**
```bash
# Poetry 설치
curl -sSL https://install.python-poetry.org | python3 -

# PATH 설정
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 설치 확인
poetry --version
```

#### 2. 가상환경 활성화 문제
**증상**
```bash
poetry: The poetry.lock file does not exist
```

**해결방법**
```bash
# 의존성 다시 설치
poetry install

# 가상환경 재생성
poetry env remove python
poetry install
poetry shell
```

#### 3. 의존성 충돌
**증상**
```bash
SolverProblemError: The current project's Python requirement (>=3.11) is not compatible with some of the required packages.
```

**해결방법**
```bash
# Poetry 캐시 정리
poetry cache clear pypi --all

# lock 파일 재생성
rm poetry.lock
poetry lock

# 의존성 재설치
poetry install
```

### Docker 관련 문제

#### 1. Docker 서비스 시작 실패
**증상**
```bash
ERROR: Couldn't connect to Docker daemon
```

**해결방법**
```bash
# Docker Desktop 실행 상태 확인
docker --version

# Docker 데몬 재시작 (Linux)
sudo systemctl restart docker

# Docker Desktop 재시작 (Windows/Mac)
# Docker Desktop 앱 재시작
```

#### 2. 포트 충돌 문제
**증상**
```bash
Error starting userland proxy: listen tcp4 0.0.0.0:5432: bind: address already in use
```

**해결방법**
```bash
# 포트 사용 프로세스 확인
netstat -tulpn | grep :5432
lsof -i :5432  # Mac/Linux

# 프로세스 종료
kill -9 <PID>

# 또는 다른 포트 사용 (docker-compose.yml 수정)
ports:
  - "5433:5432"  # 호스트 포트를 5433으로 변경
```

#### 3. 볼륨 권한 문제
**증상**
```bash
Permission denied: '/var/lib/postgresql/data'
```

**해결방법**
```bash
# 볼륨 삭제 후 재생성
docker-compose down -v
docker-compose up -d

# 권한 설정 (Linux)
sudo chown -R $(id -u):$(id -g) ./data/postgres
```

## 🗄️ 데이터베이스 문제

### 연결 문제

#### 1. 데이터베이스 연결 실패
**증상**
```bash
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) connection to server at "localhost", port 5432 failed
```

**해결방법**
```bash
# PostgreSQL 컨테이너 상태 확인
docker-compose ps

# 컨테이너 로그 확인
docker-compose logs postgres

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

#### 2. 환경변수 인식 문제
**증상**
```bash
KeyError: 'DATABASE_URL'
```

**해결방법**
```bash
# .env 파일 확인
cat .env

# 환경변수 설정 확인
echo $DATABASE_URL

# Poetry shell에서 환경변수 로드
poetry shell
export DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname

# 또는 .env 파일 생성
echo "DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/research_db" > .env
```

### 마이그레이션 문제

#### 1. Alembic 마이그레이션 실패
**증상**
```bash
alembic.util.exc.CommandError: Target database is not up to date.
```

**해결방법**
```bash
# 현재 마이그레이션 상태 확인
alembic current

# 마이그레이션 히스토리 확인
alembic history

# 강제 마이그레이션 (주의: 데이터 손실 가능)
alembic stamp head
alembic upgrade head

# 데이터베이스 초기화 후 마이그레이션
docker-compose down -v
docker-compose up -d postgres
alembic upgrade head
```

#### 2. 마이그레이션 충돌
**증상**
```bash
alembic.util.exc.CommandError: Multiple heads are present
```

**해결방법**
```bash
# 충돌 확인
alembic heads

# 마이그레이션 병합
alembic merge heads -m "merge migrations"

# 병합된 마이그레이션 적용
alembic upgrade head
```

## 🔄 Redis 및 Celery 문제

### Redis 연결 문제

#### 1. Redis 연결 실패
**증상**
```bash
redis.exceptions.ConnectionError: Error 111 connecting to localhost:6379. Connection refused.
```

**해결방법**
```bash
# Redis 컨테이너 상태 확인
docker-compose ps redis

# Redis 연결 테스트
redis-cli ping
# 예상 출력: PONG

# 컨테이너 재시작
docker-compose restart redis

# Redis 컨테이너 로그 확인
docker-compose logs redis
```

### Celery 워커 문제

#### 1. Celery 워커 시작 실패
**증상**
```bash
[ERROR/MainProcess] consumer: Cannot connect to redis://localhost:6379/0: Error 111 connecting to localhost:6379.
```

**해결방법**
```bash
# Redis 연결 확인 (위 Redis 섹션 참조)
redis-cli ping

# Celery 설정 확인
poetry run python -c "
from app.infra.tasks.celery_app import app
print(app.conf.broker_url)
print(app.conf.result_backend)
"

# 워커 재시작
pkill -f celery
celery -A app.infra.tasks.celery_app worker --loglevel=info
```

#### 2. 태스크 실행 실패
**증상**
```bash
[ERROR/ForkPoolWorker-1] Task app.infra.tasks.research_task[...] raised unexpected: ModuleNotFoundError('No module named app')
```

**해결방법**
```bash
# PYTHONPATH 설정
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# 또는 Poetry shell에서 실행
poetry shell
celery -A app.infra.tasks.celery_app worker --loglevel=info

# 설정 파일 확인
cat app/infra/tasks/celery_app.py
```

## 🌐 API 및 외부 서비스 문제

### FastAPI 서버 문제

#### 1. 서버 시작 실패
**증상**
```bash
ModuleNotFoundError: No module named 'app'
```

**해결방법**
```bash
# 프로젝트 루트 디렉터리에서 실행 확인
pwd
ls -la  # app/ 디렉터리가 있는지 확인

# Poetry shell 활성화
poetry shell

# PYTHONPATH 설정
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# 서버 실행
poetry run dev
```

#### 2. 자동 리로드 동작 안함
**증상**
코드 변경 시 서버가 자동으로 재시작되지 않음

**해결방법**
```bash
# uvicorn 직접 실행으로 확인
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 파일 권한 확인 (Linux/Mac)
chmod -R 755 app/

# 파일 시스템 이벤트 확인
# watchdog 라이브러리가 설치되어 있는지 확인
poetry show | grep watchdog
```

### Perplexity API 문제

#### 1. API 키 인식 안됨
**증상**
```bash
KeyError: 'PERPLEXITY_API_KEY'
```

**해결방법**
```bash
# 환경변수 설정 확인
echo $PERPLEXITY_API_KEY

# .env 파일에 추가
echo "PERPLEXITY_API_KEY=your_api_key_here" >> .env

# Poetry shell에서 환경변수 로드
poetry shell
export PERPLEXITY_API_KEY=your_api_key_here
```

#### 2. API 호출 타임아웃
**증상**
```bash
httpx.TimeoutException: timed out
```

**해결방법**
```python
# 타임아웃 설정 증가 (app/core/config.py)
REQUEST_TIMEOUT = 120  # 기본 60에서 120으로 증가

# 재시도 로직 확인
RETRY_MAX_ATTEMPTS = 3
```

## 🧪 테스트 관련 문제

### 테스트 실행 실패

#### 1. 테스트 데이터베이스 연결 실패
**증상**
```bash
sqlalchemy.exc.OperationalError: (asyncpg.exceptions.InvalidCatalogNameError) database "test_db" does not exist
```

**해결방법**
```bash
# 테스트 데이터베이스 생성
docker exec -it backend-python_postgres_1 createdb -U postgres test_db

# 또는 PostgreSQL 컨테이너에서 직접 생성
docker exec -it backend-python_postgres_1 psql -U postgres -c "CREATE DATABASE test_db;"

# 테스트 환경변수 설정
export DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/test_db
```

#### 2. 비동기 테스트 실행 문제
**증상**
```bash
RuntimeError: There is no current event loop in thread
```

**해결방법**
```python
# pytest-asyncio 설치 확인
poetry add --dev pytest-asyncio

# pytest.ini 설정 확인
[tool:pytest]
asyncio_mode = auto

# 테스트 함수에 데코레이터 추가
@pytest.mark.asyncio
async def test_example():
    pass
```

## 📊 성능 문제

### 메모리 사용량 높음

#### 1. 메모리 누수 의심
**증상**
시간이 지날수록 메모리 사용량이 계속 증가

**진단방법**
```bash
# 프로세스 메모리 사용량 모니터링
ps aux | grep -E "(python|celery)"

# Python 메모리 프로파일링
poetry add --dev memory-profiler
poetry run python -m memory_profiler app/main.py

# 객체 참조 추적
import gc
print(len(gc.get_objects()))
```

**해결방법**
```python
# 데이터베이스 세션 적절한 종료
async with get_db() as session:
    # 작업 수행
    pass  # session이 자동으로 종료됨

# 대용량 데이터 처리 시 청크 단위 처리
def process_large_data():
    for chunk in chunks(data, chunk_size=1000):
        process_chunk(chunk)
        gc.collect()  # 명시적 가비지 컬렉션
```

### 응답 시간 느림

#### 1. API 응답 시간 분석
**진단방법**
```bash
# cURL로 응답 시간 측정
curl -w "Time: %{time_total}s\n" -o /dev/null -s http://localhost:8000/api/v1/health

# Apache Bench로 부하 테스트
ab -n 100 -c 10 http://localhost:8000/api/v1/health
```

**해결방법**
```python
# 데이터베이스 쿼리 최적화
# N+1 쿼리 문제 해결
from sqlalchemy.orm import joinedload

result = await session.execute(
    select(Model).options(joinedload(Model.related_field))
)

# 비동기 처리 활용
import asyncio

async def process_multiple_items(items):
    tasks = [process_item(item) for item in items]
    return await asyncio.gather(*tasks)
```

## 🔧 유지보수 도구

### 로그 분석

#### 로그 레벨 조정
```bash
# 디버그 로그 활성화
export LOG_LEVEL=DEBUG
poetry run dev

# 특정 모듈만 디버그
export LOG_LEVEL=INFO
# 코드에서 로거 설정 변경
import logging
logging.getLogger('app.infra.llm').setLevel(logging.DEBUG)
```

#### 구조화된 로깅 확인
```python
# 로그 포맷 확인
import json
import logging

# 로그를 JSON으로 파싱하여 분석
with open('app.log') as f:
    for line in f:
        try:
            log_entry = json.loads(line)
            print(f"Level: {log_entry['level']}, Message: {log_entry['message']}")
        except json.JSONDecodeError:
            continue
```

### 건강 상태 모니터링

#### 시스템 상태 스크립트
```bash
#!/bin/bash
# health_check.sh

echo "=== 시스템 상태 체크 ==="

echo "1. API 서버 상태:"
curl -s http://localhost:8000/api/v1/health | jq '.status'

echo "2. 데이터베이스 상태:"
docker exec backend-python_postgres_1 pg_isready -U postgres

echo "3. Redis 상태:"
redis-cli ping

echo "4. 프로세스 상태:"
ps aux | grep -E "(uvicorn|celery)" | grep -v grep

echo "5. 메모리 사용량:"
free -h

echo "6. 디스크 사용량:"
df -h
```

### 정기 유지보수

#### 주간 체크리스트
```bash
# 1. 로그 파일 정리
find . -name "*.log" -mtime +7 -delete

# 2. Docker 이미지 정리
docker system prune -f

# 3. Poetry 캐시 정리
poetry cache clear pypi --all

# 4. 테스트 실행
poetry run test

# 5. 보안 취약점 스캔
poetry audit

# 6. 의존성 업데이트 확인
poetry show --outdated
```

## 🆘 긴급 상황 대응

### 서비스 다운 시

#### 빠른 재시작 절차
```bash
# 1. 전체 서비스 종료
poetry run stop

# 2. Docker 정리
docker-compose down -v

# 3. 로그 백업
cp app.log app_$(date +%Y%m%d_%H%M%S).log

# 4. 서비스 재시작
poetry run setup
poetry run dev

# 5. 상태 확인
curl http://localhost:8000/api/v1/health
```

### 데이터베이스 손상 시

#### 복구 절차
```bash
# 1. 백업에서 복구 (백업이 있는 경우)
docker exec -i backend-python_postgres_1 psql -U postgres -d research_db < backup.sql

# 2. 마이그레이션으로 재구축
docker-compose down -v
docker-compose up -d postgres
sleep 10
alembic upgrade head

# 3. 데이터 일관성 검사
poetry run python -c "
from app.infra.db.session import get_engine
import asyncio

async def check():
    engine = get_engine()
    async with engine.connect() as conn:
        result = await conn.execute('SELECT COUNT(*) FROM research_jobs')
        print(f'Jobs count: {result.scalar()}')

asyncio.run(check())
"
```

이 가이드를 참조하여 대부분의 일반적인 문제를 해결할 수 있습니다. 문제가 지속되면 GitHub Issues에 상세한 로그와 함께 문의해 주세요.