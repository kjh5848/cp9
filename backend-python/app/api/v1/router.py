"""API v1 router configuration."""

from fastapi import APIRouter

from app.api.v1.endpoints import health, product_research, research, websocket

router = APIRouter()

# Include research endpoints (legacy)
router.include_router(
    research.router,
    prefix="/research",
    tags=["research"],
)

# Include product research endpoints
router.include_router(
    product_research.router,
    tags=["제품 리서치"],
)

# Include WebSocket endpoints
router.include_router(
    websocket.router,
    tags=["WebSocket"],
)

# Include health check endpoints
router.include_router(
    health.router,
    tags=["Health Check"],
)
