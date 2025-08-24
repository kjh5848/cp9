# Dev Container Configuration

This directory contains configuration for VS Code/Cursor Dev Containers.

## What is Dev Container?

Dev Containers는 전체 개발환경을 컨테이너화하여 일관된 개발 경험을 제공합니다.

## 사용법

### VS Code / Cursor 사용자

1. **Dev Containers 확장 설치**:
   - VS Code: "Dev Containers" 확장 설치
   - Cursor: VS Code 확장과 호환

2. **프로젝트 열기**:
   ```bash
   git clone <repository>
   cd backend-python
   code .  # 또는 cursor .
   ```

3. **Dev Container에서 열기**:
   - Command Palette (Ctrl+Shift+P) 열기
   - "Dev Containers: Reopen in Container" 선택
   - 또는 우측 하단 팝업에서 "Reopen in Container" 클릭

4. **자동 설정**:
   - Docker 이미지 빌드
   - Poetry 의존성 설치
   - 데이터베이스 마이그레이션
   - Python 확장 및 설정 자동 구성

## 포함된 기능

### 개발 도구
- Python 3.11
- Poetry 패키지 매니저
- 모든 프로젝트 의존성
- PostgreSQL, Redis 서비스

### VS Code 확장
- Python 언어 지원
- Black 포맷터
- Ruff 린터
- MyPy 타입 체커
- Pytest 테스트 실행기
- Docker 지원
- JSON/YAML 지원

### 포트 포워딩
- **8000**: FastAPI 서버 (자동 브라우저 열기)
- **5432**: PostgreSQL 데이터베이스
- **6379**: Redis
- **5050**: pgAdmin 웹 인터페이스
- **5555**: Celery Flower 모니터링

## 장점

### 개발자
- ✅ 일관된 개발환경
- ✅ 빠른 온보딩 (컨테이너에서 바로 개발)
- ✅ IDE 통합 (디버깅, 테스트, 린트)
- ✅ 호스트 시스템 오염 없음

### 팀
- ✅ 환경 설정 차이로 인한 문제 제거
- ✅ "내 컴퓨터에서는 잘 돼요" 문제 해결
- ✅ 신규 개발자 즉시 생산성

## 대안

Dev Container를 사용하지 않는 경우:

```bash
# 1. Makefile 사용 (추천)
make setup
make start

# 2. Docker Compose 직접 사용
docker-compose up -d

# 3. Poetry 스크립트 사용
poetry run setup
poetry run dev
```

모든 방법으로 동일한 개발환경에 접근할 수 있습니다.