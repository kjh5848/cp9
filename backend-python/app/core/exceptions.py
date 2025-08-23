"""Custom exceptions and error handling utilities."""

from typing import Any, Dict, List, Optional

from fastapi import HTTPException, status
from pydantic import ValidationError as PydanticValidationError

from app.core.error_messages import ErrorConfig, ErrorMessages
from app.core.logging import get_logger
from app.schemas.error_responses import (
    CoupangError,
    ErrorAction,
    ErrorCode,
    ErrorSeverity,
    ExternalServiceError,
    RateLimitError,
    StandardError,
    ValidationError,
    ValidationErrorDetail,
)

logger = get_logger(__name__)


class BaseAPIException(Exception):
    """Base exception for API errors."""
    
    def __init__(
        self,
        error_code: ErrorCode,
        message: Optional[str] = None,
        details: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        http_status: Optional[int] = None,
    ):
        self.error_code = error_code
        self.message = message or ErrorMessages.KR_MESSAGES.get(error_code, "알 수 없는 오류")
        self.details = details
        self.metadata = metadata or {}
        self.http_status = http_status or self._get_default_http_status()
        
        super().__init__(self.message)
    
    def _get_default_http_status(self) -> int:
        """Get default HTTP status code based on error code."""
        if self.error_code in [
            ErrorCode.VALIDATION_ERROR,
            ErrorCode.INVALID_REQUEST,
            ErrorCode.INVALID_UUID_FORMAT,
            ErrorCode.BATCH_SIZE_EXCEEDED,
            ErrorCode.MISSING_REQUIRED_FIELDS,
            ErrorCode.JOB_CANNOT_BE_CANCELLED,
        ]:
            return status.HTTP_400_BAD_REQUEST
        
        elif self.error_code in [
            ErrorCode.RESOURCE_NOT_FOUND,
            ErrorCode.JOB_NOT_FOUND,
            ErrorCode.TASK_NOT_FOUND,
        ]:
            return status.HTTP_404_NOT_FOUND
        
        elif self.error_code in [
            ErrorCode.RATE_LIMIT_EXCEEDED,
            ErrorCode.TOO_MANY_CONCURRENT_REQUESTS,
        ]:
            return status.HTTP_429_TOO_MANY_REQUESTS
        
        elif self.error_code in [
            ErrorCode.EXTERNAL_API_ERROR,
            ErrorCode.PERPLEXITY_API_ERROR,
            ErrorCode.PERPLEXITY_API_TIMEOUT,
            ErrorCode.PERPLEXITY_API_UNAVAILABLE,
            ErrorCode.SERVICE_UNAVAILABLE,
        ]:
            return status.HTTP_503_SERVICE_UNAVAILABLE
        
        else:
            return status.HTTP_500_INTERNAL_SERVER_ERROR
    
    def to_standard_error(self) -> StandardError:
        """Convert to standardized error response."""
        return StandardError(
            error_code=self.error_code,
            message=self.message,
            details=self.details,
            severity=ErrorConfig.SEVERITY_MAP.get(self.error_code, ErrorSeverity.MEDIUM),
            recommended_action=ErrorConfig.ACTION_MAP.get(self.error_code, ErrorAction.NO_ACTION),
            retry_after=ErrorConfig.RETRY_DELAY_MAP.get(self.error_code),
            metadata=self.metadata,
        )
    
    def to_http_exception(self) -> HTTPException:
        """Convert to FastAPI HTTPException."""
        return HTTPException(
            status_code=self.http_status,
            detail=self.to_standard_error().dict(),
        )


class ValidationException(BaseAPIException):
    """Exception for validation errors."""
    
    def __init__(
        self,
        validation_errors: List[ValidationErrorDetail],
        message: Optional[str] = None,
        details: Optional[str] = None,
    ):
        super().__init__(
            error_code=ErrorCode.VALIDATION_ERROR,
            message=message,
            details=details,
            http_status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )
        self.validation_errors = validation_errors
    
    def to_validation_error(self) -> ValidationError:
        """Convert to validation error response."""
        base_error = self.to_standard_error()
        return ValidationError(
            **base_error.dict(),
            validation_errors=self.validation_errors,
        )


class CoupangException(BaseAPIException):
    """Exception for Coupang-specific errors."""
    
    def __init__(
        self,
        error_code: ErrorCode,
        available_fields: Optional[List[str]] = None,
        missing_fields: Optional[List[str]] = None,
        fallback_available: bool = True,
        message: Optional[str] = None,
        details: Optional[str] = None,
    ):
        super().__init__(
            error_code=error_code,
            message=message,
            details=details,
            http_status=status.HTTP_200_OK if error_code == ErrorCode.COUPANG_PARTIAL_DATA else None,
        )
        self.available_fields = available_fields or []
        self.missing_fields = missing_fields or []
        self.fallback_available = fallback_available
    
    def to_coupang_error(self) -> CoupangError:
        """Convert to Coupang error response."""
        base_error = self.to_standard_error()
        return CoupangError(
            **base_error.dict(),
            available_fields=self.available_fields,
            missing_fields=self.missing_fields,
            fallback_available=self.fallback_available,
        )


class RateLimitException(BaseAPIException):
    """Exception for rate limiting errors."""
    
    def __init__(
        self,
        limit: int,
        remaining: int,
        reset_time: int,
        message: Optional[str] = None,
        details: Optional[str] = None,
    ):
        super().__init__(
            error_code=ErrorCode.RATE_LIMIT_EXCEEDED,
            message=message,
            details=details,
            http_status=status.HTTP_429_TOO_MANY_REQUESTS,
        )
        self.limit = limit
        self.remaining = remaining
        self.reset_time = reset_time
    
    def to_rate_limit_error(self) -> RateLimitError:
        """Convert to rate limit error response."""
        base_error = self.to_standard_error()
        return RateLimitError(
            **base_error.dict(),
            limit=self.limit,
            remaining=self.remaining,
            reset_time=self.reset_time,
        )


class ExternalServiceException(BaseAPIException):
    """Exception for external service errors."""
    
    def __init__(
        self,
        error_code: ErrorCode,
        service_name: str,
        service_status: str = "unavailable",
        estimated_recovery: Optional[int] = None,
        message: Optional[str] = None,
        details: Optional[str] = None,
    ):
        super().__init__(
            error_code=error_code,
            message=message,
            details=details,
            http_status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
        self.service_name = service_name
        self.service_status = service_status
        self.estimated_recovery = estimated_recovery
    
    def to_external_service_error(self) -> ExternalServiceError:
        """Convert to external service error response."""
        base_error = self.to_standard_error()
        return ExternalServiceError(
            **base_error.dict(),
            service_name=self.service_name,
            service_status=self.service_status,
            estimated_recovery=self.estimated_recovery,
        )


class ErrorHandler:
    """Utility class for handling various types of errors."""
    
    @staticmethod
    def from_pydantic_validation_error(
        exc: PydanticValidationError,
    ) -> ValidationException:
        """Convert Pydantic validation error to custom exception."""
        validation_errors = []
        
        for error in exc.errors():
            field_name = ".".join(str(loc) for loc in error["loc"])
            validation_errors.append(
                ValidationErrorDetail(
                    field=field_name,
                    message=error["msg"],
                    invalid_value=error.get("input"),
                )
            )
        
        return ValidationException(
            validation_errors=validation_errors,
            details=f"Validation failed for {len(validation_errors)} field(s)",
        )
    
    @staticmethod
    def from_generic_exception(
        exc: Exception,
        error_code: Optional[ErrorCode] = None,
    ) -> BaseAPIException:
        """Convert generic exception to custom API exception."""
        error_code = error_code or ErrorCode.INTERNAL_SERVER_ERROR
        
        # Log the original exception for debugging
        logger.error(f"Unhandled exception: {type(exc).__name__}: {str(exc)}", exc_info=True)
        
        return BaseAPIException(
            error_code=error_code,
            details=f"{type(exc).__name__}: {str(exc)}",
        )
    
    @staticmethod
    def log_error(
        exc: BaseAPIException,
        context: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Log error with structured information."""
        log_data = {
            "error_code": exc.error_code.value,
            "message": exc.message,
            "details": exc.details,
            "http_status": exc.http_status,
            "metadata": exc.metadata,
        }
        
        if context:
            log_data.update(context)
        
        severity = ErrorConfig.SEVERITY_MAP.get(exc.error_code, ErrorSeverity.MEDIUM)
        
        if severity == ErrorSeverity.CRITICAL:
            logger.critical("Critical error occurred", extra=log_data)
        elif severity == ErrorSeverity.HIGH:
            logger.error("High severity error occurred", extra=log_data)
        elif severity == ErrorSeverity.MEDIUM:
            logger.warning("Medium severity error occurred", extra=log_data)
        else:
            logger.info("Low severity error occurred", extra=log_data)