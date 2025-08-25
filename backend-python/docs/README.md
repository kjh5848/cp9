# 📚 제품 리서치 API 문서

Perplexity AI를 활용한 제품 정보 리서치 시스템의 완전한 문서입니다.

## 🚀 빠른 시작

```bash
# 개발 환경 시작 (3단계)
poetry run setup    # 초기 설정
poetry run dev      # 모든 서비스 시작
poetry run stop     # 종료
```

**접속 주소:**
- API 서버: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- pgAdmin: http://localhost:5050

## 📖 문서 구조

### 🎯 프론트엔드 개발자
**시작 여기부터:** [`frontend/API_INTEGRATION_GUIDE.md`](frontend/API_INTEGRATION_GUIDE.md)
- TypeScript 타입 정의
- API 사용 예시
- React/Next.js 통합
- 에러 처리 가이드

### 🏗️ 백엔드 개발자

#### API 문서
- [`api/product-research/`](api/product-research/) - **제품 리서치 API** (주력)
- [`api/health/`](api/health/) - 헬스체크 API

#### 개발 가이드  
- [`development/setup.md`](development/setup.md) - Poetry Scripts 설정
- [`development/testing.md`](development/testing.md) - 테스트 가이드
- [`development/architecture.md`](development/architecture.md) - Clean Architecture
- [`development/deployment.md`](development/deployment.md) - 배포 가이드

#### 문제 해결
- [`troubleshooting/common-issues.md`](troubleshooting/common-issues.md) - 일반적인 문제
- [`troubleshooting/performance.md`](troubleshooting/performance.md) - 성능 최적화

## 🎯 주요 기능

### 제품 리서치 API
- **최대 10개 제품 동시 리서치** (환경변수로 조정 가능)
- **필수 리뷰 데이터 수집** (평점, 리뷰 수 검증)
- **상세 제품 스펙 및 가격 비교**
- **신뢰도 높은 출처 우선순위** (제조사/공식 도메인)
- **실시간 진행 상황 추적**
- **비동기 처리 및 Celery 백그라운드 작업**

### 개발 환경
- **Poetry Scripts 통합 실행 시스템**
- **Clean Architecture 원칙**
- **SQLAlchemy 2.0 + PostgreSQL**
- **Celery + Redis**
- **pytest 테스트 스위트**
- **컬러 로깅 및 진행상황 표시**

## 🔧 기술 스택

### 백엔드
- **프레임워크**: FastAPI 0.109+
- **데이터베이스**: PostgreSQL 16 with asyncpg  
- **ORM**: SQLAlchemy 2.0 (async)
- **작업 큐**: Celery with Redis
- **AI 통합**: Perplexity AI API
- **검증**: Pydantic 2.0
- **테스팅**: pytest with async support

### 개발 도구
- **의존성 관리**: Poetry
- **코드 품질**: Black, Ruff, MyPy
- **컨테이너**: Docker & Docker Compose
- **문서화**: OpenAPI/Swagger 자동 생성

## 📋 API 엔드포인트 개요

### 제품 리서치 API (`/api/v1/research/products`)

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| POST | `/` | 제품 리서치 생성 |
| GET | `/{job_id}` | 리서치 결과 조회 |
| GET | `/{job_id}/status` | 작업 상태 확인 |
| DELETE | `/{job_id}` | 작업 취소 |

### 헬스체크 API (`/api/v1/health`)

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| GET | `/` | 시스템 상태 확인 |

## 🎨 아키텍처

### Clean Architecture 레이어
```
├── Domain Layer      # 비즈니스 로직 (프레임워크 독립)
├── Service Layer     # 도메인과 인프라 간 오케스트레이션  
├── Infrastructure    # 데이터베이스, 외부 API, 작업 큐
└── API Layer         # HTTP 엔드포인트 및 요청/응답 처리
```

### 주요 패턴
- **Repository Pattern**: 데이터 액세스 추상화
- **Dependency Injection**: 느슨한 결합
- **Service Layer**: 비즈니스 로직 조율
- **Domain Entities**: 프레임워크 독립적 비즈니스 객체

## 🚦 상태 및 에러 코드

### 작업 상태
| 상태 | 설명 |
|------|------|
| `pending` | 대기 중 |
| `processing` | 처리 중 |
| `success` | 성공 |
| `error` | 오류 |

### HTTP 상태 코드
| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 204 | 삭제 완료 |
| 400 | 잘못된 요청 |
| 404 | 찾을 수 없음 |
| 429 | 요청 제한 초과 |
| 500 | 서버 내부 오류 |

## 🔐 보안

### 현재 구현
- Pydantic을 통한 입력 검증
- SQLAlchemy를 통한 SQL 인젝션 방지
- 환경 기반 설정 관리
- 코드 내 시크릿 없음

### 프로덕션 권장사항
- API 키 인증 구현
- Rate Limiting 강화  
- HTTPS 강제 사용
- 로그 민감정보 필터링

## 📊 제한 사항

- **최대 동시 리서치 제품 수**: 10개 (MAX_RESEARCH_BATCH_SIZE)
- **API 타임아웃**: 60초 (REQUEST_TIMEOUT)
- **최소 정보 소스**: 3개 (신뢰도 보장)
- **필수 리뷰 데이터**: 평점, 리뷰 수 (품질 보장)
- **최대 동시 요청**: 5개 (MAX_CONCURRENT_REQUESTS)

## 🤝 기여 가이드

1. **Clean Architecture 원칙 준수**
2. **80% 이상 테스트 커버리지 유지**
3. **모든 곳에 타입 힌트 사용**
4. **컨벤션 커밋 메시지 사용**
5. **문서 업데이트 필수**

## 📞 지원

### 개발 중 문제 해결
1. [`troubleshooting/common-issues.md`](troubleshooting/common-issues.md) 확인
2. `poetry run dev` 로그 확인  
3. `http://localhost:8000/docs` Swagger UI 활용
4. Issue 등록 전 기존 이슈 검색

### 유용한 명령어
```bash
# 로그 실시간 확인
docker-compose logs -f

# 데이터베이스 연결 테스트  
poetry run python -c "from app.infra.db.session import test_connection; import asyncio; asyncio.run(test_connection())"

# API 헬스체크
curl http://localhost:8000/api/v1/health
```

---

**최종 업데이트**: 2024년 1월  
**API 버전**: v1.0.0  
**문서 버전**: 1.0.0