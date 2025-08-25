"""Domain-specific exceptions."""

from typing import Any, Dict, List, Optional

from app.core.logging import get_logger
from app.schemas.error_responses import ErrorCode, ValidationErrorDetail

logger = get_logger(__name__)


class DomainException(Exception):
    """Base exception for domain-specific errors.

    Responsibilities:
    - Provide base structure for all domain exceptions
    - Store error code and metadata
    - Enable hierarchical exception handling
    """

    def __init__(
        self,
        error_code: ErrorCode,
        message: Optional[str] = None,
        details: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.error_code = error_code
        self.message = message or f"Domain error: {error_code.value}"
        self.details = details
        self.metadata = metadata or {}

        super().__init__(self.message)

    def __str__(self) -> str:
        return f"{self.__class__.__name__}: {self.message}"

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}({self.error_code.value!r}, {self.message!r})"

    def add_context(self, key: str, value: Any) -> "DomainException":
        """Add context information to the exception.

        Args:
            key: Context key
            value: Context value

        Returns:
            Self for method chaining
        """
        self.metadata[key] = value
        return self


class ValidationDomainException(DomainException):
    """Exception for domain validation errors.

    Responsibilities:
    - Handle validation-specific error details
    - Store field-level validation errors
    - Provide structured validation error information
    """

    def __init__(
        self,
        validation_errors: List[ValidationErrorDetail],
        message: Optional[str] = None,
        details: Optional[str] = None,
    ):
        super().__init__(
            error_code=ErrorCode.VALIDATION_ERROR,
            message=message or "Validation failed",
            details=details
            or f"Validation failed for {len(validation_errors)} field(s)",
        )
        self.validation_errors = validation_errors

    def add_field_error(
        self, field: str, message: str, invalid_value: Any = None
    ) -> None:
        """Add a field validation error.

        Args:
            field: Field name
            message: Error message
            invalid_value: Invalid value
        """
        self.validation_errors.append(
            ValidationErrorDetail(
                field=field,
                message=message,
                invalid_value=invalid_value,
            )
        )

    def get_field_errors(self) -> Dict[str, List[str]]:
        """Get validation errors grouped by field.

        Returns:
            Dictionary mapping field names to error messages
        """
        field_errors = {}
        for error in self.validation_errors:
            if error.field not in field_errors:
                field_errors[error.field] = []
            field_errors[error.field].append(error.message)
        return field_errors

    def to_validation_error(self):
        """Convert to validation error response."""
        from app.core.exceptions.http_exception_mapper import get_http_exception_mapper
        mapper = get_http_exception_mapper()
        return mapper._create_validation_error(self)


class ResearchDomainException(DomainException):
    """Exception for product research domain errors.

    Responsibilities:
    - Handle research-specific error scenarios
    - Store research context and metadata
    - Provide research operation error details
    """

    def __init__(
        self,
        error_code: ErrorCode,
        message: Optional[str] = None,
        details: Optional[str] = None,
        research_context: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            error_code=error_code,
            message=message,
            details=details,
            metadata=research_context or {},
        )
        self.research_context = research_context or {}

    def add_item_context(self, item_name: str, item_id: Optional[str] = None) -> None:
        """Add research item context.

        Args:
            item_name: Product name
            item_id: Product ID if available
        """
        self.metadata["product_name"] = item_name
        if item_id:
            self.metadata["product_id"] = item_id

    def add_batch_context(self, batch_size: int, max_size: int) -> None:
        """Add batch processing context.

        Args:
            batch_size: Actual batch size
            max_size: Maximum allowed batch size
        """
        self.metadata["batch_size"] = batch_size
        self.metadata["max_batch_size"] = max_size


class ExternalServiceDomainException(DomainException):
    """Exception for external service integration errors.

    Responsibilities:
    - Handle external service communication errors
    - Store service-specific error information
    - Provide service status and recovery details
    """

    def __init__(
        self,
        error_code: ErrorCode,
        service_name: str,
        message: Optional[str] = None,
        details: Optional[str] = None,
        service_status: str = "unavailable",
        estimated_recovery: Optional[int] = None,
    ):
        super().__init__(
            error_code=error_code,
            message=message or f"External service error: {service_name}",
            details=details,
            metadata={
                "service_name": service_name,
                "service_status": service_status,
                "estimated_recovery": estimated_recovery,
            },
        )
        self.service_name = service_name
        self.service_status = service_status
        self.estimated_recovery = estimated_recovery

    def set_recovery_time(self, seconds: int) -> None:
        """Set estimated recovery time.

        Args:
            seconds: Estimated recovery time in seconds
        """
        self.estimated_recovery = seconds
        self.metadata["estimated_recovery"] = seconds

    def update_service_status(self, status: str) -> None:
        """Update service status.

        Args:
            status: New service status
        """
        self.service_status = status
        self.metadata["service_status"] = status


class RateLimitDomainException(DomainException):
    """Exception for rate limiting errors.

    Responsibilities:
    - Handle rate limiting scenarios
    - Store rate limit information
    - Provide retry timing details
    """

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
            message=message or "Rate limit exceeded",
            details=details or f"Rate limit of {limit} requests exceeded",
            metadata={
                "limit": limit,
                "remaining": remaining,
                "reset_time": reset_time,
            },
        )
        self.limit = limit
        self.remaining = remaining
        self.reset_time = reset_time

    def get_retry_after(self) -> int:
        """Get retry after seconds.

        Returns:
            Seconds to wait before retry
        """
        import time

        return max(0, self.reset_time - int(time.time()))


class BusinessLogicDomainException(DomainException):
    """Exception for business logic violations.

    Responsibilities:
    - Handle business rule violations
    - Store business context information
    - Provide rule-specific error details
    """

    def __init__(
        self,
        error_code: ErrorCode,
        rule_name: str,
        message: Optional[str] = None,
        details: Optional[str] = None,
        business_context: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            error_code=error_code,
            message=message or f"Business rule violation: {rule_name}",
            details=details,
            metadata={
                "rule_name": rule_name,
                **(business_context or {}),
            },
        )
        self.rule_name = rule_name
        self.business_context = business_context or {}

    def add_business_context(self, key: str, value: Any) -> None:
        """Add business context information.

        Args:
            key: Context key
            value: Context value
        """
        self.business_context[key] = value
        self.metadata[key] = value


class ResourceDomainException(DomainException):
    """Exception for resource-related errors.

    Responsibilities:
    - Handle resource not found errors
    - Handle resource access errors
    - Provide resource context information
    """

    def __init__(
        self,
        error_code: ErrorCode,
        resource_type: str,
        resource_id: Optional[str] = None,
        message: Optional[str] = None,
        details: Optional[str] = None,
    ):
        super().__init__(
            error_code=error_code,
            message=message or f"Resource error: {resource_type}",
            details=details,
            metadata={
                "resource_type": resource_type,
                "resource_id": resource_id,
            },
        )
        self.resource_type = resource_type
        self.resource_id = resource_id

    def set_resource_id(self, resource_id: str) -> None:
        """Set resource ID.

        Args:
            resource_id: Resource identifier
        """
        self.resource_id = resource_id
        self.metadata["resource_id"] = resource_id

    def to_standard_error(self):
        """Convert to standardized error response."""
        from app.core.exceptions.http_exception_mapper import get_http_exception_mapper
        mapper = get_http_exception_mapper()
        return mapper._create_standard_error(self)

    def to_http_exception(self):
        """Convert to FastAPI HTTPException."""
        from app.core.exceptions.http_exception_mapper import get_http_exception_mapper
        mapper = get_http_exception_mapper()
        return mapper.to_http_exception(self)
