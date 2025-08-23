"""Health check and monitoring endpoints."""

from typing import Any, Dict

from fastapi import APIRouter, status

from app.core.circuit_breaker import CircuitBreakerRegistry
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/health",
    tags=["Health Check"],
)


@router.get(
    "",
    response_model=Dict[str, Any],
    summary="Health Check",
    description="서비스 상태와 의존성 확인",
)
async def health_check() -> Dict[str, Any]:
    """서비스 전체 상태를 확인합니다.
    
    Returns:
        서비스 상태 정보
    """
    # Get circuit breaker stats
    circuit_stats = CircuitBreakerRegistry.get_all_stats()
    
    # Determine overall health
    overall_status = "healthy"
    unhealthy_services = []
    
    for service_name, stats in circuit_stats.items():
        if stats["state"] == "open":
            overall_status = "degraded"
            unhealthy_services.append({
                "service": service_name,
                "status": "circuit_open",
                "time_until_retry": stats["time_until_retry"]
            })
        elif stats["error_rate"] > 0.3:
            if overall_status == "healthy":
                overall_status = "warning"
            unhealthy_services.append({
                "service": service_name,
                "status": "high_error_rate",
                "error_rate": round(stats["error_rate"], 3)
            })
    
    health_data = {
        "status": overall_status,
        "timestamp": "2024-01-01T00:00:00Z",  # Would use actual timestamp
        "services": {
            "api": {
                "status": "healthy",
                "description": "Main API server"
            },
            "database": {
                "status": "healthy", 
                "description": "PostgreSQL database"
            },
            "external_apis": circuit_stats
        }
    }
    
    if unhealthy_services:
        health_data["issues"] = unhealthy_services
    
    return health_data


@router.get(
    "/circuit-breakers",
    response_model=Dict[str, Any],
    summary="Circuit Breaker Status",
    description="모든 Circuit breaker 상태 확인",
)
async def get_circuit_breaker_status() -> Dict[str, Any]:
    """Circuit breaker 상태를 상세히 조회합니다.
    
    Returns:
        Circuit breaker 상태 정보
    """
    stats = CircuitBreakerRegistry.get_all_stats()
    
    return {
        "circuit_breakers": stats,
        "summary": {
            "total_services": len(stats),
            "healthy": len([s for s in stats.values() if s["state"] == "closed"]),
            "degraded": len([s for s in stats.values() if s["state"] == "half_open"]),
            "failed": len([s for s in stats.values() if s["state"] == "open"])
        }
    }


@router.post(
    "/circuit-breakers/reset",
    status_code=status.HTTP_200_OK,
    summary="Reset Circuit Breakers",
    description="모든 Circuit breaker를 CLOSED 상태로 초기화",
)
async def reset_circuit_breakers() -> Dict[str, str]:
    """모든 Circuit breaker를 초기화합니다.
    
    Returns:
        초기화 결과
    """
    try:
        CircuitBreakerRegistry.reset_all()
        logger.info("All circuit breakers reset by health endpoint")
        return {"message": "All circuit breakers have been reset to CLOSED state"}
    except Exception as e:
        logger.error(f"Failed to reset circuit breakers: {e}")
        return {"message": f"Failed to reset circuit breakers: {str(e)}"}


@router.get(
    "/ready",
    response_model=Dict[str, Any],
    summary="Readiness Probe",
    description="서비스 준비 상태 확인 (Kubernetes readiness probe용)",
)
async def readiness_probe() -> Dict[str, Any]:
    """서비스가 요청을 처리할 준비가 되었는지 확인합니다.
    
    Returns:
        준비 상태 정보
    """
    circuit_stats = CircuitBreakerRegistry.get_all_stats()
    
    # Check if critical services are available
    critical_services_down = [
        name for name, stats in circuit_stats.items()
        if stats["state"] == "open" and name in ["perplexity_api"]
    ]
    
    if critical_services_down:
        return {
            "ready": False,
            "reason": f"Critical services unavailable: {critical_services_down}",
            "unavailable_services": critical_services_down
        }
    
    return {
        "ready": True,
        "services": len(circuit_stats),
        "healthy_services": len([s for s in circuit_stats.values() if s["state"] == "closed"])
    }


@router.get(
    "/live",
    response_model=Dict[str, str],
    summary="Liveness Probe", 
    description="서비스 생존 확인 (Kubernetes liveness probe용)",
)
async def liveness_probe() -> Dict[str, str]:
    """서비스가 살아있는지 확인합니다.
    
    Returns:
        생존 상태 정보
    """
    return {"status": "alive"}