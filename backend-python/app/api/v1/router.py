"""API v1 router configuration."""

from fastapi import APIRouter

from app.api.v1.endpoints import research
from app.api.v1.endpoints import product_research

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

# Health check endpoint
@router.get("/health", tags=["헬스체크"])
async def health_check() -> dict:
    """시스템 상태 확인 엔드포인트."""
    return {
        "status": "healthy",
        "service": "product-research-backend",
        "version": "1.0.0",
    }