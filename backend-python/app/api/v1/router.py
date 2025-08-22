"""API v1 router configuration."""

from fastapi import APIRouter

from app.api.v1.endpoints import research

router = APIRouter()

# Include research endpoints
router.include_router(
    research.router,
    prefix="/research",
    tags=["research"],
)

# Health check endpoint
@router.get("/health", tags=["health"])
async def health_check() -> dict:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "research-backend",
        "version": "0.1.0",
    }