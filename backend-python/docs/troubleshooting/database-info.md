# 📊 데이터베이스 정보 확인 완전 가이드

프로젝트의 PostgreSQL 및 Redis 데이터베이스 정보를 확인하는 모든 방법을 정리한 종합 가이드입니다.

## 🎯 현재 프로젝트 데이터베이스 설정

### PostgreSQL 정보
- **버전**: PostgreSQL 16 Alpine
- **컨테이너명**: cp9_postgres
- **데이터베이스명**: research_db
- **사용자**: postgres
- **비밀번호**: postgres
- **포트**: 5432 (호스트), 5432 (컨테이너)
- **연결 URL**: postgresql+asyncpg://postgres:postgres@localhost:5432/research_db

### Redis 정보
- **버전**: Redis 7 Alpine
- **컨테이너명**: cp9_redis
- **포트**: 6379 (호스트), 6379 (컨테이너)
- **데이터베이스 구분**:
  - DB 0: 일반용 (redis://localhost:6379/0)
  - DB 1: 캐시용 (redis://localhost:6379/1)
  - DB 2: Celery 브로커 (redis://localhost:6379/2)
  - DB 3: Celery 결과 저장 (redis://localhost:6379/3)

## 🖥️ 1. GUI 도구로 확인

### pgAdmin (권장)
**접속 정보**
- URL: http://localhost:5050
- 이메일: admin@example.com
- 비밀번호: admin

**서버 연결 추가**
1. pgAdmin 웹 인터페이스 접속
2. "Add New Server" 클릭
3. 연결 정보 입력:
   ```
   Name: Research Database
   Host: postgres (Docker 네트워크 내에서)
   또는 host.docker.internal (Docker Desktop 사용 시)
   Port: 5432
   Database: research_db
   Username: postgres
   Password: postgres
   ```

**확인 가능한 정보**
- 테이블 목록 및 스키마
- 데이터 조회 및 편집
- 쿼리 실행 결과
- 인덱스 및 제약조건
- 성능 통계

### Redis Commander (선택사항)
```bash
# Redis GUI 도구 설치 및 실행
npm install -g redis-commander
redis-commander --redis-host localhost --redis-port 6379
# http://localhost:8081 접속
```

## 💻 2. 명령줄 도구로 확인

### PostgreSQL 명령줄 접근

#### Docker 컨테이너를 통한 접근
```bash
# 컨테이너에 직접 접속
docker exec -it cp9_postgres bash

# PostgreSQL 접속
docker exec -it cp9_postgres psql -U postgres -d research_db

# 한 줄로 실행
docker exec -it cp9_postgres psql -U postgres -d research_db -c "SELECT version();"
```

#### 로컬 psql 클라이언트 사용
```bash
# PostgreSQL 클라이언트 설치 필요
psql -h localhost -p 5432 -U postgres -d research_db

# 특정 쿼리 실행
psql -h localhost -p 5432 -U postgres -d research_db -c "\\dt"
```

### 기본 PostgreSQL 명령어

#### 데이터베이스 정보 조회
```sql
-- 버전 확인
SELECT version();

-- 현재 데이터베이스 정보
SELECT current_database(), current_user, current_schema();

-- 데이터베이스 크기
SELECT pg_database_size(current_database());
SELECT pg_size_pretty(pg_database_size(current_database()));

-- 연결 정보
SELECT * FROM pg_stat_activity WHERE datname = current_database();
```

#### 테이블 및 스키마 정보
```sql
-- 모든 테이블 목록
\\dt

-- 테이블 상세 정보
\\d+ table_name

-- 스키마 목록
\\dn

-- 테이블 크기
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### 현재 프로젝트 테이블 조회
```sql
-- 리서치 관련 테이블
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- 테이블별 레코드 수
SELECT 
    schemaname,
    tablename,
    n_tup_ins as "inserts",
    n_tup_upd as "updates", 
    n_tup_del as "deletes",
    n_live_tup as "live_tuples",
    n_dead_tup as "dead_tuples"
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### Redis 명령줄 접근

#### Redis CLI 사용
```bash
# Redis 컨테이너에 접속
docker exec -it cp9_redis redis-cli

# 또는 로컬 redis-cli 사용
redis-cli -h localhost -p 6379

# 특정 DB 선택
redis-cli -h localhost -p 6379 -n 0
```

#### Redis 기본 명령어
```redis
# 서버 정보
INFO

# 메모리 사용량
INFO memory

# 키 개수 (현재 DB)
DBSIZE

# 모든 키 목록 (주의: 프로덕션에서는 위험)
KEYS *

# 특정 패턴의 키
KEYS research:*

# DB별 키 개수 확인
INFO keyspace

# 데이터베이스 변경
SELECT 0  # 일반용
SELECT 1  # 캐시용
SELECT 2  # Celery 브로커
SELECT 3  # Celery 결과
```

## 🐍 3. Python 코드로 확인

### 데이터베이스 연결 테스트
```python
# db_check.py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def check_database():
    """데이터베이스 연결 및 기본 정보 확인"""
    engine = create_async_engine(str(settings.database_url))
    
    try:
        async with engine.connect() as conn:
            # 기본 연결 테스트
            result = await conn.execute(text("SELECT 1"))
            print("✅ 데이터베이스 연결 성공")
            
            # 버전 확인
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"📋 PostgreSQL 버전: {version}")
            
            # 현재 데이터베이스 정보
            result = await conn.execute(text("""
                SELECT current_database() as db_name, 
                       current_user as user_name,
                       current_schema() as schema_name
            """))
            info = result.fetchone()
            print(f"🗄️  데이터베이스: {info.db_name}")
            print(f"👤 사용자: {info.user_name}")
            print(f"📂 스키마: {info.schema_name}")
            
            # 데이터베이스 크기
            result = await conn.execute(text("""
                SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
            """))
            size = result.scalar()
            print(f"💾 데이터베이스 크기: {size}")
            
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
    
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_database())
```

### 테이블 정보 조회
```python
# table_info.py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def check_tables():
    """테이블 정보 조회"""
    engine = create_async_engine(str(settings.database_url))
    
    try:
        async with engine.connect() as conn:
            # 테이블 목록
            result = await conn.execute(text("""
                SELECT table_name, table_schema, table_type
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            
            tables = result.fetchall()
            print("📊 테이블 목록:")
            for table in tables:
                print(f"  - {table.table_name} ({table.table_type})")
            
            # 테이블별 레코드 수
            print("\n📈 테이블별 레코드 수:")
            for table in tables:
                if table.table_type == 'BASE TABLE':
                    result = await conn.execute(
                        text(f"SELECT COUNT(*) FROM {table.table_name}")
                    )
                    count = result.scalar()
                    print(f"  - {table.table_name}: {count:,} 레코드")
                    
    except Exception as e:
        print(f"❌ 테이블 정보 조회 실패: {e}")
    
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_tables())
```

### Redis 연결 테스트
```python
# redis_check.py
import asyncio
import redis.asyncio as redis
from app.core.config import settings

async def check_redis():
    """Redis 연결 및 정보 확인"""
    try:
        # 각 Redis DB 확인
        dbs = {
            "일반용": (settings.redis_url, 0),
            "캐시용": (settings.redis_cache_url, 1), 
            "Celery 브로커": (settings.celery_broker_url, 2),
            "Celery 결과": (settings.celery_result_backend, 3)
        }
        
        for db_name, (url, db_num) in dbs.items():
            client = redis.from_url(str(url))
            
            # 연결 테스트
            await client.ping()
            print(f"✅ {db_name} (DB {db_num}) 연결 성공")
            
            # 키 개수
            key_count = await client.dbsize()
            print(f"  📊 키 개수: {key_count}")
            
            # 메모리 사용량 (DB 0에서만)
            if db_num == 0:
                info = await client.info("memory")
                used_memory = info.get("used_memory_human", "N/A")
                print(f"  💾 메모리 사용량: {used_memory}")
            
            await client.close()
            
    except Exception as e:
        print(f"❌ Redis 연결 실패: {e}")

if __name__ == "__main__":
    asyncio.run(check_redis())
```

### 실제 데이터 샘플 조회
```python
# data_sample.py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def show_sample_data():
    """실제 데이터 샘플 조회"""
    engine = create_async_engine(str(settings.database_url))
    
    try:
        async with engine.connect() as conn:
            # 리서치 작업 샘플
            result = await conn.execute(text("""
                SELECT id, status, created_at, updated_at
                FROM research_jobs 
                ORDER BY created_at DESC 
                LIMIT 5
            """))
            
            jobs = result.fetchall()
            print("🔍 최근 리서치 작업:")
            for job in jobs:
                print(f"  - ID: {job.id}, 상태: {job.status}, 생성: {job.created_at}")
            
            # 리서치 아이템 샘플
            result = await conn.execute(text("""
                SELECT product_name, category, price_exact, currency
                FROM research_items 
                ORDER BY created_at DESC 
                LIMIT 5
            """))
            
            items = result.fetchall()
            print("\n🛍️ 최근 리서치 아이템:")
            for item in items:
                print(f"  - {item.product_name} ({item.category}) - {item.price_exact:,}{item.currency}")
                
    except Exception as e:
        print(f"❌ 데이터 조회 실패: {e}")
    
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(show_sample_data())
```

## 🔧 4. Alembic으로 스키마 정보 확인

### 마이그레이션 상태 확인
```bash
# 현재 마이그레이션 버전
alembic current

# 마이그레이션 히스토리
alembic history

# 마이그레이션 히스토리 (자세히)
alembic history -v

# 다음 마이그레이션 예상
alembic show head

# 특정 리비전 정보
alembic show <revision_id>
```

### 스키마 상태 확인
```bash
# 스키마 비교 (현재 DB vs 최신 모델)
alembic check

# SQL 생성 미리보기
alembic upgrade head --sql

# 마이그레이션 자동 생성 미리보기
alembic revision --autogenerate --message "test" --head-only
```

## 🚀 5. Poetry Scripts 활용

### 커스텀 DB 체크 스크립트
```bash
# pyproject.toml에 추가할 스크립트
[tool.poetry.scripts]
db-info = "scripts.db_info:main"
db-check = "scripts.db_check:main"
db-sample = "scripts.db_sample:main"
```

### 통합 DB 정보 스크립트
```python
# scripts/db_info.py
#!/usr/bin/env python3
"""데이터베이스 정보 확인 스크립트"""

import asyncio
import sys
from typing import Dict, Any
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import redis.asyncio as redis
from app.core.config import settings

class DatabaseInfo:
    def __init__(self):
        self.pg_engine = create_async_engine(str(settings.database_url))
    
    async def check_postgresql(self) -> Dict[str, Any]:
        """PostgreSQL 정보 수집"""
        try:
            async with self.pg_engine.connect() as conn:
                # 기본 정보
                result = await conn.execute(text("SELECT version()"))
                version = result.scalar()
                
                result = await conn.execute(text("""
                    SELECT 
                        current_database() as db_name,
                        current_user as user_name,
                        pg_size_pretty(pg_database_size(current_database())) as size
                """))
                info = result.fetchone()
                
                # 테이블 정보
                result = await conn.execute(text("""
                    SELECT COUNT(*) as table_count
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """))
                table_count = result.scalar()
                
                # 활성 연결 수
                result = await conn.execute(text("""
                    SELECT COUNT(*) as active_connections
                    FROM pg_stat_activity 
                    WHERE datname = current_database()
                """))
                connections = result.scalar()
                
                return {
                    "status": "✅ 연결됨",
                    "version": version.split()[0:2],
                    "database": info.db_name,
                    "user": info.user_name,
                    "size": info.size,
                    "tables": table_count,
                    "connections": connections
                }
                
        except Exception as e:
            return {
                "status": "❌ 연결 실패",
                "error": str(e)
            }
    
    async def check_redis(self) -> Dict[str, Any]:
        """Redis 정보 수집"""
        try:
            client = redis.from_url(str(settings.redis_url))
            
            await client.ping()
            info = await client.info()
            keyspace = await client.info("keyspace")
            
            await client.close()
            
            return {
                "status": "✅ 연결됨",
                "version": info.get("redis_version"),
                "memory": info.get("used_memory_human"),
                "databases": len(keyspace),
                "uptime": f"{info.get('uptime_in_seconds', 0) // 3600}시간"
            }
            
        except Exception as e:
            return {
                "status": "❌ 연결 실패", 
                "error": str(e)
            }
    
    async def generate_report(self):
        """전체 데이터베이스 상태 보고서"""
        print("=" * 60)
        print("🗄️  데이터베이스 상태 보고서")
        print("=" * 60)
        
        # PostgreSQL 정보
        print("\n📊 PostgreSQL:")
        pg_info = await self.check_postgresql()
        for key, value in pg_info.items():
            if key != "version":
                print(f"  {key}: {value}")
            else:
                print(f"  version: {' '.join(value)}")
        
        # Redis 정보  
        print("\n🔴 Redis:")
        redis_info = await self.check_redis()
        for key, value in redis_info.items():
            print(f"  {key}: {value}")
        
        # 환경 정보
        print(f"\n🔧 설정:")
        print(f"  환경: {settings.app_env}")
        print(f"  디버그: {settings.debug}")
        print(f"  API 프리픽스: {settings.api_v1_prefix}")
        
        await self.pg_engine.dispose()

async def main():
    """메인 실행 함수"""
    db_info = DatabaseInfo()
    await db_info.generate_report()

if __name__ == "__main__":
    asyncio.run(main())
```

## 📊 6. 헬스체크 엔드포인트 활용

### API 헬스체크로 DB 상태 확인
```bash
# 기본 헬스체크
curl -s http://localhost:8000/api/v1/health | jq

# 데이터베이스 상태만
curl -s http://localhost:8000/api/v1/health | jq '.services.database'

# Redis 상태만  
curl -s http://localhost:8000/api/v1/health | jq '.services.redis'
```

### jq를 이용한 JSON 파싱
```bash
# 전체 상태 요약
curl -s http://localhost:8000/api/v1/health | jq '.status'

# 서비스별 응답시간
curl -s http://localhost:8000/api/v1/health | jq '.services | to_entries[] | {name: .key, response_time: .value.response_time_ms}'

# 에러가 있는 서비스만
curl -s http://localhost:8000/api/v1/health | jq '.services | to_entries[] | select(.value.status != "healthy")'
```

## 🔍 7. 개발 중 실시간 모니터링

### Docker Compose 로그 모니터링
```bash
# 모든 서비스 로그
docker-compose logs -f

# PostgreSQL 로그만
docker-compose logs -f postgres

# Redis 로그만
docker-compose logs -f redis

# 최근 로그 (마지막 100줄)
docker-compose logs --tail=100 postgres
```

### 컨테이너 상태 확인
```bash
# 모든 컨테이너 상태
docker-compose ps

# 상세 상태 정보
docker-compose ps --services --filter "status=running"

# 리소스 사용량
docker stats cp9_postgres cp9_redis

# 컨테이너 내부 프로세스
docker exec cp9_postgres ps aux
```

## 🎯 8. 문제 해결용 진단 명령어

### 연결 문제 진단
```bash
# 네트워크 연결 확인
telnet localhost 5432
nc -zv localhost 5432

# Docker 네트워크 확인  
docker network ls
docker network inspect backend-python_default

# 포트 사용 확인
netstat -tulpn | grep :5432
lsof -i :5432  # Mac/Linux
```

### 성능 진단
```bash
# PostgreSQL 활성 쿼리
docker exec -it cp9_postgres psql -U postgres -d research_db -c "
SELECT pid, usename, application_name, client_addr, state, query 
FROM pg_stat_activity 
WHERE state = 'active';
"

# 테이블 잠금 확인
docker exec -it cp9_postgres psql -U postgres -d research_db -c "
SELECT * FROM pg_locks WHERE NOT granted;
"

# Redis 느린 로그
docker exec -it cp9_redis redis-cli SLOWLOG GET 10
```

## 📋 9. 정기 점검 체크리스트

### 일일 점검
```bash
#!/bin/bash
# daily_db_check.sh

echo "=== $(date) 데이터베이스 일일 점검 ==="

# 서비스 상태
echo "1. 서비스 상태:"
docker-compose ps | grep -E "(postgres|redis)"

# 헬스체크
echo "2. API 헬스체크:"
curl -s http://localhost:8000/api/v1/health | jq '.services.database.status, .services.redis.status'

# 디스크 사용량
echo "3. 볼륨 사용량:"
docker system df -v | grep -E "(postgres|redis)"

# 연결 수
echo "4. 활성 연결:"
docker exec cp9_postgres psql -U postgres -d research_db -t -c "
SELECT count(*) FROM pg_stat_activity WHERE datname = 'research_db';
"

echo "점검 완료"
```

### 주간 점검
```bash
#!/bin/bash
# weekly_db_check.sh

echo "=== $(date) 데이터베이스 주간 점검 ==="

# 데이터베이스 크기 추이
echo "1. 데이터베이스 크기:"
poetry run python scripts/db_info.py

# 테이블별 데이터 증가율
echo "2. 테이블별 레코드 수:"
docker exec cp9_postgres psql -U postgres -d research_db -c "
SELECT schemaname, tablename, n_live_tup as live_tuples
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;
"

# 인덱스 사용률
echo "3. 인덱스 효율성:"
docker exec cp9_postgres psql -U postgres -d research_db -c "
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_scan > 0
ORDER BY idx_scan DESC;
"

# 백업 상태 (설정된 경우)
echo "4. 백업 상태 확인 필요"

echo "주간 점검 완료"
```

이 가이드를 통해 데이터베이스의 모든 정보를 체계적으로 확인하고 관리할 수 있습니다. 각 방법은 상황에 따라 선택적으로 사용하시면 됩니다.