# 🚀 QuickStart - 3분 내 실행 가이드

> **목표**: Git clone 후 3분 내에 개발 환경을 구축하고 백엔드 서버를 실행

## 📋 전제조건 체크

실행 전 다음 소프트웨어가 설치되어 있는지 확인:
- [Git](https://git-scm.com/) - 프로젝트 클론용
- [Docker Desktop](https://www.docker.com/products/docker-desktop) - 개발 환경 구축용

> ✅ **Poetry 설치 불필요**: Docker 컨테이너에 Poetry가 자동으로 설치됩니다.
> 
> 📌 **Poetry 수동 설치 필요한 경우**: Docker 없이 로컬에서 직접 개발하고 싶을 때만

## ⚡ 원스톱 실행 (추천)

### 1️⃣ 프로젝트 클론
```bash
git clone <repository-url>
cd cp9/backend-python
```

### 2️⃣ 환경설정 (최초 1회만)

#### 🪟 Windows 사용자
```bash
# Docker Desktop 실행 확인 필요
dev.bat setup
```

#### 🐧 Linux/Mac 사용자
```bash
# Docker 실행 확인 필요
make setup
```

### 3️⃣ 개발 환경 시작

#### 🪟 Windows 사용자
```bash
dev.bat start
```

#### 🐧 Linux/Mac 사용자
```bash
make start
```

## ✅ 실행 성공 확인

약 30초 후 다음 주소들이 정상 작동하는지 확인:

| 서비스 | URL | 설명 |
|--------|-----|------|
| 🌐 **API 서버** | http://localhost:8000 | 메인 백엔드 API |
| 📚 **API 문서** | http://localhost:8000/docs | Swagger UI 문서 |
| 🏥 **헬스체크** | http://localhost:8000/api/v1/health | 서비스 상태 확인 |
| 🗄️ **pgAdmin** | http://localhost:5050 | DB 관리 도구 |

### API 테스트
```bash
# 헬스체크 API 호출
curl http://localhost:8000/api/v1/health

# 예상 응답: {"status": "healthy", "timestamp": "..."}
```

## 🛠️ 대안 실행 방법

### Option A: Poetry Scripts (로컬 개발 - Docker 없이)
```bash
# Poetry 수동 설치 (최초 1회)
pip install poetry

# 의존성 설치
poetry install
poetry shell

# 프로젝트 실행
poetry run setup    # 초기 설정
poetry run dev      # 개발 서버 시작
```

### Option B: Docker Compose 직접 사용
```bash
docker-compose build
docker-compose up -d postgres redis
docker-compose run --rm app poetry run alembic upgrade head
docker-compose up -d
```

## 🚨 문제 해결

### Docker Desktop이 실행되지 않는 경우
```bash
# Windows에서 Docker Desktop 시작
start "Docker Desktop" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### 포트 충돌 (8000번 포트가 이미 사용 중)
```bash
# Windows에서 포트 사용 프로세스 확인
netstat -an | findstr :8000
tasklist /FI "PID eq [PID번호]"

# Linux/Mac에서 포트 사용 프로세스 확인
lsof -i :8000
kill -9 [PID]
```

### 설정 초기화가 필요한 경우
```bash
# 모든 컨테이너와 볼륨 삭제 (주의: 데이터 손실)
docker-compose down -v --rmi all
docker system prune -a -f --volumes

# 다시 설정 실행
dev.bat setup    # Windows
make setup       # Linux/Mac
```

### 권한 문제 (Linux/Mac)
```bash
# Docker 권한 추가
sudo usermod -aG docker $USER
newgrp docker

# 파일 권한 수정
chmod +x dev.bat  # 또는 적절한 스크립트 파일
```

## 📊 개발 도구

### 로그 확인
```bash
# 실시간 로그 보기 (Ctrl+C로 종료)
dev.bat logs     # Windows  
make logs        # Linux/Mac

# 특정 서비스 로그만
docker-compose logs -f app
docker-compose logs -f postgres
```

### 컨테이너 접근
```bash
# 앱 컨테이너 Shell 접근
dev.bat shell    # Windows
make shell       # Linux/Mac

# 데이터베이스 접근
docker-compose exec postgres psql -U postgres -d research_db

# Redis CLI 접근
docker-compose exec redis redis-cli
```

### 개발 서버 중단
```bash
dev.bat stop     # Windows
make stop        # Linux/Mac
```

## 🎯 다음 단계

개발 환경이 성공적으로 실행되었다면:

1. **API 문서 탐색**: http://localhost:8000/docs
2. **첫 API 호출**: 제품 리서치 API 테스트
3. **데이터베이스 확인**: pgAdmin에서 테이블 구조 확인
4. **코드 수정**: `app/` 폴더의 소스코드 편집 (자동 재시작)

## 💡 추가 정보

- **자세한 개발 가이드**: [CLAUDE.md](CLAUDE.md) 참고
- **API 사용법**: [README.md](README.md)의 API 섹션 참고
- **아키텍처 이해**: `app/` 폴더의 Clean Architecture 구조 탐색

---

**🎉 축하합니다!** 백엔드 개발 환경이 성공적으로 실행되었습니다.