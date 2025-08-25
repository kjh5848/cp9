"""Custom exceptions and error handling utilities.

This module provides backward compatibility while delegating to the new
exception system architecture for improved separation of concerns.
"""

from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from pydantic import ValidationError as PydanticValidationError

from app.core.exceptions.domain_exceptions import (
    DomainException,
    ExternalServiceDomainException,
    RateLimitDomainException,
    ValidationDomainException,
)
from app.core.exceptions.exception_handler import get_exception_handler
from app.core.exceptions.http_exception_mapper import get_http_exception_mapper
from app.core.logging import get_logger
from app.schemas.error_responses import (
    ErrorCode,
    ValidationErrorDetail,
)

logger = get_logger(__name__)

# Backward compatibility aliases
BaseAPIException = DomainException
ValidationException = ValidationDomainException
ExternalServiceException = ExternalServiceDomainException
RateLimitException = RateLimitDomainException


class CoupangException(DomainException):
    """Exception for Coupang-specific errors.

    This maintains backward compatibility while using the new domain exception structure.
    """

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
            metadata={
                "available_fields": available_fields or [],
                "missing_fields": missing_fields or [],
                "fallback_available": fallback_available,
            },
        )
        self.available_fields = available_fields or []
        self.missing_fields = missing_fields or []
        self.fallback_available = fallback_available

    def to_coupang_error(self):
        """Convert to Coupang error response."""
        mapper = get_http_exception_mapper()
        return mapper.to_coupang_error(
            self,
            available_fields=self.available_fields,
            missing_fields=self.missing_fields,
            fallback_available=self.fallback_available,
        )


class ErrorHandler:
    """Utility class for handling various types of errors.

    This maintains backward compatibility while delegating to the new exception handler.
    """

    @staticmethod
    def from_pydantic_validation_error(
        exc: PydanticValidationError,
    ) -> ValidationException:
        """Convert Pydantic validation error to custom exception."""
        handler = get_exception_handler()
        return handler.from_pydantic_validation_error(exc)

    @staticmethod
    def from_generic_exception(
        exc: Exception, error_code: Optional[ErrorCode] = None
    ) -> BaseAPIException:
        """Convert generic exception to custom API exception."""
        handler = get_exception_handler()
        return handler.from_generic_exception(exc, error_code)

    @staticmethod
    def log_error(
        exc: BaseAPIException, context: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log error with structured information."""
        handler = get_exception_handler()
        handler.log_domain_exception(exc, context)


# Extension methods for backward compatibility
def _add_legacy_methods():
    """Add legacy methods to domain exceptions for backward compatibility."""

    def to_standard_error(self):
        """Convert to standardized error response."""
        mapper = get_http_exception_mapper()
        return mapper._create_standard_error(self)

    def to_http_exception(self) -> HTTPException:
        """Convert to FastAPI HTTPException."""
        mapper = get_http_exception_mapper()
        return mapper.to_http_exception(self)

    def to_validation_error(self):
        """Convert to validation error response."""
        if isinstance(self, ValidationDomainException):
            mapper = get_http_exception_mapper()
            return mapper._create_validation_error(self)
        raise AttributeError(
            "to_validation_error only available on ValidationException"
        )

    def to_rate_limit_error(self):
        """Convert to rate limit error response."""
        if isinstance(self, RateLimitDomainException):
            mapper = get_http_exception_mapper()
            return mapper._create_rate_limit_error(self)
        raise AttributeError("to_rate_limit_error only available on RateLimitException")

    def to_external_service_error(self):
        """Convert to external service error response."""
        if isinstance(self, ExternalServiceDomainException):
            mapper = get_http_exception_mapper()
            return mapper._create_external_service_error(self)
        raise AttributeError(
            "to_external_service_error only available on ExternalServiceException"
        )

    # Add methods to domain exception classes
    DomainException.to_standard_error = to_standard_error
    DomainException.to_http_exception = to_http_exception
    ValidationDomainException.to_validation_error = to_validation_error
    RateLimitDomainException.to_rate_limit_error = to_rate_limit_error
    ExternalServiceDomainException.to_external_service_error = to_external_service_error


# Apply backward compatibility methods
_add_legacy_methods()

# Re-export for backward compatibility
__all__ = [
    "BaseAPIException",
    "ValidationException",
    "CoupangException",
    "RateLimitException",
    "ExternalServiceException",
    "ErrorHandler",
]
