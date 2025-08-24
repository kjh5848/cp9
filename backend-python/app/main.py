"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as api_v1_router
from app.core.config import settings
from app.core.constants import API_TAGS
from app.core.error_handlers import setup_error_handlers
from app.core.logging import setup_logging
from app.infra.db.session import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager."""
    # Startup
    setup_logging()
    await init_db()

    # Initialize Redis PubSub for WebSocket messaging
    from app.core.redis_pubsub import get_pubsub_manager

    pubsub_manager = get_pubsub_manager()
    pubsub_connected = await pubsub_manager.connect()
    if pubsub_connected:
        await pubsub_manager.start_listening()

    yield

    # Shutdown
    if pubsub_connected:
        await pubsub_manager.disconnect()
    await close_db()


# Create FastAPI application with enhanced Swagger documentation
app = FastAPI(
    title="제품 리서치 API",
    description="""
## 🚀 Perplexity AI 기반 제품 정보 리서치 시스템

### 주요 기능
- **최대 10개 제품 동시 리서치** (환경변수로 조정 가능)
- **필수 리뷰 데이터 수집** (평점, 리뷰 수)
- **상세 제품 스펙 및 가격 비교**
- **신뢰도 높은 출처 우선순위**
- **실시간 진행 상황 추적**
- **비동기 처리 및 Celery 백그라운드 작업 지원**

### API 사용법
1. `POST /api/v1/research/products` - 제품 리서치 요청
2. `GET /api/v1/research/products/{job_id}` - 결과 조회
3. `GET /api/v1/research/products/{job_id}/status` - 상태 확인

### 인증
현재 API는 인증이 필요하지 않습니다. 프로덕션 환경에서는 API 키 인증을 추가하세요.
    """,
    version="1.0.0",
    debug=settings.debug,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=API_TAGS,
    servers=[
        {"url": "http://localhost:8000", "description": "개발 서버"},
        {"url": "https://api.example.com", "description": "프로덕션 서버"},
    ],
    contact={
        "name": "API Support",
        "email": "support@example.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.app_env == "development" else [],
    allow_credentials=False,  # Must be False when using wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup global error handlers
setup_error_handlers(app)

# Include API routers
app.include_router(api_v1_router, prefix=settings.api_v1_prefix)


# Root endpoint
@app.get("/")
async def root() -> dict:
    """Root endpoint."""
    return {
        "message": "Research Backend API",
        "version": "0.1.0",
        "environment": settings.app_env,
        "docs_url": "/docs",
        "health_url": f"{settings.api_v1_prefix}/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_config=None,  # Use our custom logging
    )
