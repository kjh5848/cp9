"""FastAPI application entry point."""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as api_v1_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.infra.db.session import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager."""
    # Startup
    setup_logging()
    await init_db()
    
    yield
    
    # Shutdown
    await close_db()


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="Research Backend with Clean Architecture",
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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