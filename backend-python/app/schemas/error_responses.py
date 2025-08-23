"""Standardized error response schemas for API endpoints."""

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ErrorCode(str, Enum):
    """Standardized error codes for API responses."""
    
    # Validation errors (4xx)
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_REQUEST = "INVALID_REQUEST"
    INVALID_UUID_FORMAT = "INVALID_UUID_FORMAT"
    BATCH_SIZE_EXCEEDED = "BATCH_SIZE_EXCEEDED"
    MISSING_REQUIRED_FIELDS = "MISSING_REQUIRED_FIELDS"
    
    # Resource errors (4xx)
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    JOB_NOT_FOUND = "JOB_NOT_FOUND"
    TASK_NOT_FOUND = "TASK_NOT_FOUND"
    JOB_CANNOT_BE_CANCELLED = "JOB_CANNOT_BE_CANCELLED"
    
    # Rate limiting (4xx)
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    TOO_MANY_CONCURRENT_REQUESTS = "TOO_MANY_CONCURRENT_REQUESTS"
    
    # Coupang specific errors (4xx)
    COUPANG_DATA_UNAVAILABLE = "COUPANG_DATA_UNAVAILABLE"
    COUPANG_PARTIAL_DATA = "COUPANG_PARTIAL_DATA"
    COUPANG_EXTRACTION_FAILED = "COUPANG_EXTRACTION_FAILED"
    
    # SEO generation errors (4xx)
    SEO_GENERATION_FAILED = "SEO_GENERATION_FAILED"
    CONTENT_LENGTH_EXCEEDED = "CONTENT_LENGTH_EXCEEDED"
    KEYWORD_VALIDATION_FAILED = "KEYWORD_VALIDATION_FAILED"
    SEO_TEMPLATE_NOT_FOUND = "SEO_TEMPLATE_NOT_FOUND"
    
    # GPT-4o API errors (5xx)
    GPT_API_ERROR = "GPT_API_ERROR"
    GPT_API_TIMEOUT = "GPT_API_TIMEOUT"
    GPT_API_QUOTA_EXCEEDED = "GPT_API_QUOTA_EXCEEDED"
    GPT_CONTENT_POLICY_VIOLATION = "GPT_CONTENT_POLICY_VIOLATION"
    GPT_TOKEN_LIMIT_EXCEEDED = "GPT_TOKEN_LIMIT_EXCEEDED"
    
    # External service errors (5xx)
    EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR"
    PERPLEXITY_API_ERROR = "PERPLEXITY_API_ERROR"
    PERPLEXITY_API_TIMEOUT = "PERPLEXITY_API_TIMEOUT"
    PERPLEXITY_API_UNAVAILABLE = "PERPLEXITY_API_UNAVAILABLE"
    
    # Internal server errors (5xx)
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    BACKGROUND_TASK_ERROR = "BACKGROUND_TASK_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"


class ErrorSeverity(str, Enum):
    """Error severity levels for logging and monitoring."""
    
    LOW = "low"          # Minor issues, user can continue
    MEDIUM = "medium"    # Significant issues, some functionality affected
    HIGH = "high"        # Major issues, core functionality affected
    CRITICAL = "critical"  # System-wide issues, service disruption


class ErrorAction(str, Enum):
    """Recommended actions for error recovery."""
    
    RETRY = "retry"                    # User can retry the request
    RETRY_LATER = "retry_later"        # User should retry after some time
    CHECK_INPUT = "check_input"        # User should validate and fix input
    CONTACT_SUPPORT = "contact_support"  # User should contact support
    WAIT = "wait"                      # User should wait (system will retry)
    NO_ACTION = "no_action"            # No action needed, informational


class StandardError(BaseModel):
    """Standardized error response model."""
    
    error_code: ErrorCode = Field(..., description="표준화된 에러 코드")
    message: str = Field(..., description="사용자 친화적 에러 메시지")
    details: Optional[str] = Field(None, description="기술적 상세 정보 (개발자용)")
    severity: ErrorSeverity = Field(ErrorSeverity.MEDIUM, description="에러 심각도")
    recommended_action: ErrorAction = Field(ErrorAction.NO_ACTION, description="권장 해결 방법")
    retry_after: Optional[int] = Field(None, description="재시도 권장 시간 (초)")
    metadata: Optional[Dict[str, Any]] = Field(None, description="추가 컨텍스트 데이터")
    
    class Config:
        schema_extra = {
            "example": {
                "error_code": "JOB_NOT_FOUND",
                "message": "요청한 작업을 찾을 수 없습니다.",
                "details": "Job ID abc123 not found in database",
                "severity": "medium",
                "recommended_action": "check_input",
                "retry_after": None,
                "metadata": {"job_id": "abc123", "timestamp": "2024-01-01T00:00:00Z"}
            }
        }


class ValidationErrorDetail(BaseModel):
    """Detailed validation error information."""
    
    field: str = Field(..., description="검증 실패한 필드명")
    message: str = Field(..., description="필드별 에러 메시지")
    invalid_value: Optional[Any] = Field(None, description="잘못된 입력값")


class ValidationError(StandardError):
    """Extended error model for validation failures."""
    
    validation_errors: List[ValidationErrorDetail] = Field(..., description="필드별 검증 에러")
    
    class Config:
        schema_extra = {
            "example": {
                "error_code": "VALIDATION_ERROR",
                "message": "입력 데이터 검증에 실패했습니다.",
                "details": "Multiple field validation errors",
                "severity": "low",
                "recommended_action": "check_input",
                "validation_errors": [
                    {
                        "field": "price_exact",
                        "message": "가격은 0보다 큰 숫자여야 합니다.",
                        "invalid_value": -100
                    }
                ]
            }
        }


class CoupangError(StandardError):
    """Coupang-specific error response model."""
    
    available_fields: Optional[List[str]] = Field(None, description="사용 가능한 쿠팡 필드 목록")
    missing_fields: Optional[List[str]] = Field(None, description="누락된 쿠팡 필드 목록")
    fallback_available: bool = Field(True, description="대체 데이터 사용 가능 여부")
    
    class Config:
        schema_extra = {
            "example": {
                "error_code": "COUPANG_PARTIAL_DATA",
                "message": "쿠팡 정보 중 일부만 사용 가능합니다.",
                "details": "Missing product_image and category_name from Coupang data",
                "severity": "low",
                "recommended_action": "no_action",
                "available_fields": ["product_url", "price", "is_rocket"],
                "missing_fields": ["product_image", "category_name"],
                "fallback_available": True
            }
        }


class RateLimitError(StandardError):
    """Rate limiting error response model."""
    
    limit: int = Field(..., description="허용된 요청 한도")
    remaining: int = Field(..., description="남은 요청 수")
    reset_time: int = Field(..., description="한도 초기화 시간 (Unix timestamp)")
    
    class Config:
        schema_extra = {
            "example": {
                "error_code": "RATE_LIMIT_EXCEEDED",
                "message": "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
                "details": "Rate limit of 100 requests per hour exceeded",
                "severity": "medium",
                "recommended_action": "retry_later",
                "retry_after": 3600,
                "limit": 100,
                "remaining": 0,
                "reset_time": 1704067200
            }
        }


class ExternalServiceError(StandardError):
    """External service error response model."""
    
    service_name: str = Field(..., description="장애 발생 외부 서비스명")
    service_status: str = Field(..., description="서비스 상태")
    estimated_recovery: Optional[int] = Field(None, description="예상 복구 시간 (초)")
    
    class Config:
        schema_extra = {
            "example": {
                "error_code": "PERPLEXITY_API_UNAVAILABLE",
                "message": "외부 AI 서비스가 일시적으로 사용할 수 없습니다.",
                "details": "Perplexity API returned 503 Service Unavailable",
                "severity": "high",
                "recommended_action": "retry_later",
                "retry_after": 300,
                "service_name": "Perplexity AI",
                "service_status": "degraded",
                "estimated_recovery": 1800
            }
        }