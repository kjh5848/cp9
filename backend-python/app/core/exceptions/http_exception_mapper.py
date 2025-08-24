"""HTTP exception mapper for converting domain exceptions to HTTP responses."""

from typing import Dict

from fastapi import HTTPException, status

from app.core.error_messages import ErrorMessages
from app.core.exceptions.domain_exceptions import (
    BusinessLogicDomainException,
    DomainException,
    ExternalServiceDomainException,
    RateLimitDomainException,
    ResearchDomainException,
    ResourceDomainException,
    ValidationDomainException,
)
from app.core.logging import get_logger
from app.schemas.error_responses import (
    CoupangError,
    ErrorCode,
    ExternalServiceError,
    RateLimitError,
    StandardError,
    ValidationError,
)

logger = get_logger(__name__)


class HttpExceptionMapper:
    """Maps domain exceptions to HTTP exceptions and error responses.

    Responsibilities:
    - Convert domain exceptions to HTTP status codes
    - Create structured error response objects
    - Map error codes to appropriate HTTP statuses
    - Handle exception-specific response formatting
    """

    # HTTP status code mapping for error codes
    HTTP_STATUS_MAP: Dict[ErrorCode, int] = {
        # 400 Bad Request
        ErrorCode.VALIDATION_ERROR: status.HTTP_400_BAD_REQUEST,
        ErrorCode.INVALID_REQUEST: status.HTTP_400_BAD_REQUEST,
        ErrorCode.INVALID_UUID_FORMAT: status.HTTP_400_BAD_REQUEST,
        ErrorCode.BATCH_SIZE_EXCEEDED: status.HTTP_400_BAD_REQUEST,
        ErrorCode.MISSING_REQUIRED_FIELDS: status.HTTP_400_BAD_REQUEST,
        ErrorCode.JOB_CANNOT_BE_CANCELLED: status.HTTP_400_BAD_REQUEST,
        # 404 Not Found
        ErrorCode.RESOURCE_NOT_FOUND: status.HTTP_404_NOT_FOUND,
        ErrorCode.JOB_NOT_FOUND: status.HTTP_404_NOT_FOUND,
        ErrorCode.TASK_NOT_FOUND: status.HTTP_404_NOT_FOUND,
        # 422 Unprocessable Entity
        ErrorCode.VALIDATION_ERROR: status.HTTP_422_UNPROCESSABLE_ENTITY,
        # 429 Too Many Requests
        ErrorCode.RATE_LIMIT_EXCEEDED: status.HTTP_429_TOO_MANY_REQUESTS,
        ErrorCode.TOO_MANY_CONCURRENT_REQUESTS: status.HTTP_429_TOO_MANY_REQUESTS,
        # 503 Service Unavailable
        ErrorCode.EXTERNAL_API_ERROR: status.HTTP_503_SERVICE_UNAVAILABLE,
        ErrorCode.PERPLEXITY_API_ERROR: status.HTTP_503_SERVICE_UNAVAILABLE,
        ErrorCode.PERPLEXITY_API_TIMEOUT: status.HTTP_503_SERVICE_UNAVAILABLE,
        ErrorCode.PERPLEXITY_API_UNAVAILABLE: status.HTTP_503_SERVICE_UNAVAILABLE,
        ErrorCode.SERVICE_UNAVAILABLE: status.HTTP_503_SERVICE_UNAVAILABLE,
        # 500 Internal Server Error (default)
        ErrorCode.INTERNAL_SERVER_ERROR: status.HTTP_500_INTERNAL_SERVER_ERROR,
    }

    def to_http_exception(self, exc: DomainException) -> HTTPException:
        """Convert domain exception to FastAPI HTTPException.

        Args:
            exc: Domain exception to convert

        Returns:
            HTTPException with appropriate status and detail
        """
        http_status = self._get_http_status(exc.error_code)
        error_response = self._create_error_response(exc)

        return HTTPException(
            status_code=http_status,
            detail=error_response.dict(),
        )

    def _get_http_status(self, error_code: ErrorCode) -> int:
        """Get HTTP status code for error code.

        Args:
            error_code: Error code to map

        Returns:
            HTTP status code
        """
        return self.HTTP_STATUS_MAP.get(
            error_code, status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    def _create_error_response(self, exc: DomainException):
        """Create appropriate error response object.

        Args:
            exc: Domain exception

        Returns:
            Structured error response object
        """
        if isinstance(exc, ValidationDomainException):
            return self._create_validation_error(exc)
        elif isinstance(exc, RateLimitDomainException):
            return self._create_rate_limit_error(exc)
        elif isinstance(exc, ExternalServiceDomainException):
            return self._create_external_service_error(exc)
        else:
            return self._create_standard_error(exc)

    def _create_standard_error(self, exc: DomainException) -> StandardError:
        """Create standard error response.

        Args:
            exc: Domain exception

        Returns:
            StandardError response object
        """
        from app.core.error_messages import ErrorConfig

        return StandardError(
            error_code=exc.error_code,
            message=exc.message
            or ErrorMessages.KR_MESSAGES.get(exc.error_code, "알 수 없는 오류"),
            details=exc.details,
            severity=ErrorConfig.SEVERITY_MAP.get(exc.error_code),
            recommended_action=ErrorConfig.ACTION_MAP.get(exc.error_code),
            retry_after=ErrorConfig.RETRY_DELAY_MAP.get(exc.error_code),
            metadata=exc.metadata,
        )

    def _create_validation_error(
        self, exc: ValidationDomainException
    ) -> ValidationError:
        """Create validation error response.

        Args:
            exc: Validation domain exception

        Returns:
            ValidationError response object
        """
        base_error = self._create_standard_error(exc)
        return ValidationError(
            **base_error.dict(),
            validation_errors=exc.validation_errors,
        )

    def _create_rate_limit_error(self, exc: RateLimitDomainException) -> RateLimitError:
        """Create rate limit error response.

        Args:
            exc: Rate limit domain exception

        Returns:
            RateLimitError response object
        """
        base_error = self._create_standard_error(exc)
        return RateLimitError(
            **base_error.dict(),
            limit=exc.limit,
            remaining=exc.remaining,
            reset_time=exc.reset_time,
        )

    def _create_external_service_error(
        self, exc: ExternalServiceDomainException
    ) -> ExternalServiceError:
        """Create external service error response.

        Args:
            exc: External service domain exception

        Returns:
            ExternalServiceError response object
        """
        base_error = self._create_standard_error(exc)
        return ExternalServiceError(
            **base_error.dict(),
            service_name=exc.service_name,
            service_status=exc.service_status,
            estimated_recovery=exc.estimated_recovery,
        )

    def to_coupang_error(
        self,
        exc: DomainException,
        available_fields: list = None,
        missing_fields: list = None,
        fallback_available: bool = True,
    ) -> CoupangError:
        """Create Coupang-specific error response.

        Args:
            exc: Domain exception
            available_fields: Available data fields
            missing_fields: Missing data fields
            fallback_available: Whether fallback is available

        Returns:
            CoupangError response object
        """
        base_error = self._create_standard_error(exc)
        return CoupangError(
            **base_error.dict(),
            available_fields=available_fields or [],
            missing_fields=missing_fields or [],
            fallback_available=fallback_available,
        )

    def get_http_status_for_code(self, error_code: ErrorCode) -> int:
        """Get HTTP status code for a specific error code.

        Args:
            error_code: Error code to look up

        Returns:
            HTTP status code
        """
        return self.HTTP_STATUS_MAP.get(
            error_code, status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    def is_client_error(self, error_code: ErrorCode) -> bool:
        """Check if error code represents a client error (4xx).

        Args:
            error_code: Error code to check

        Returns:
            True if client error
        """
        http_status = self._get_http_status(error_code)
        return 400 <= http_status < 500

    def is_server_error(self, error_code: ErrorCode) -> bool:
        """Check if error code represents a server error (5xx).

        Args:
            error_code: Error code to check

        Returns:
            True if server error
        """
        http_status = self._get_http_status(error_code)
        return 500 <= http_status < 600

    def get_error_category(self, error_code: ErrorCode) -> str:
        """Get error category based on HTTP status.

        Args:
            error_code: Error code to categorize

        Returns:
            Error category string
        """
        http_status = self._get_http_status(error_code)

        if 400 <= http_status < 500:
            return "client_error"
        elif 500 <= http_status < 600:
            return "server_error"
        elif http_status == 429:
            return "rate_limit"
        else:
            return "unknown"


# Singleton instance for global use
_mapper: HttpExceptionMapper = None


def get_http_exception_mapper() -> HttpExceptionMapper:
    """Get the global HTTP exception mapper instance.

    Returns:
        HttpExceptionMapper instance
    """
    global _mapper
    if _mapper is None:
        _mapper = HttpExceptionMapper()
    return _mapper
