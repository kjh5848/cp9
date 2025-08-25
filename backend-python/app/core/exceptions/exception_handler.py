"""Exception handling and conversion utilities."""

from typing import Any, Dict, List, Optional

from pydantic import ValidationError as PydanticValidationError

from app.core.exceptions.domain_exceptions import (
    DomainException,
    ExternalServiceDomainException,
    ValidationDomainException,
)
from app.core.logging import get_logger
from app.schemas.error_responses import ErrorCode, ErrorSeverity, ValidationErrorDetail

logger = get_logger(__name__)


class ExceptionHandler:
    """Handles exception processing, conversion, and logging.

    Responsibilities:
    - Convert framework exceptions to domain exceptions
    - Handle exception logging with appropriate severity
    - Provide structured exception processing
    - Manage exception context and metadata
    """

    def from_pydantic_validation_error(
        self, exc: PydanticValidationError
    ) -> ValidationDomainException:
        """Convert Pydantic validation error to domain exception.

        Args:
            exc: Pydantic validation error

        Returns:
            ValidationDomainException with structured errors
        """
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

        return ValidationDomainException(
            validation_errors=validation_errors,
            details=f"Validation failed for {len(validation_errors)} field(s)",
        )

    def from_generic_exception(
        self,
        exc: Exception,
        error_code: Optional[ErrorCode] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> DomainException:
        """Convert generic exception to domain exception.

        Args:
            exc: Generic exception to convert
            error_code: Error code to use (defaults to INTERNAL_SERVER_ERROR)
            context: Additional context information

        Returns:
            DomainException with error details
        """
        error_code = error_code or ErrorCode.INTERNAL_SERVER_ERROR

        # Log the original exception for debugging
        self.log_exception(exc, context)

        domain_exc = DomainException(
            error_code=error_code,
            message=f"Internal error: {type(exc).__name__}",
            details=str(exc),
            metadata=context or {},
        )

        # Add exception type information
        domain_exc.add_context("original_exception_type", type(exc).__name__)
        domain_exc.add_context("original_exception_message", str(exc))

        return domain_exc

    def from_external_service_error(
        self,
        exc: Exception,
        service_name: str,
        error_code: Optional[ErrorCode] = None,
        service_status: str = "error",
    ) -> ExternalServiceDomainException:
        """Convert exception to external service domain exception.

        Args:
            exc: Original exception
            service_name: Name of the external service
            error_code: Specific error code (defaults to EXTERNAL_API_ERROR)
            service_status: Service status description

        Returns:
            ExternalServiceDomainException
        """
        error_code = error_code or ErrorCode.EXTERNAL_API_ERROR

        # Log the service error
        logger.error(f"External service error [{service_name}]: {exc}", exc_info=True)

        return ExternalServiceDomainException(
            error_code=error_code,
            service_name=service_name,
            message=f"External service error: {service_name}",
            details=str(exc),
            service_status=service_status,
        )

    def log_exception(
        self, exc: Exception, context: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log exception with structured information.

        Args:
            exc: Exception to log
            context: Additional context information
        """
        log_data = {
            "exception_type": type(exc).__name__,
            "exception_message": str(exc),
        }

        if context:
            log_data.update(context)

        # Determine log level based on exception type
        if isinstance(exc, (ConnectionError, TimeoutError)):
            logger.error("Network error occurred", extra=log_data, exc_info=True)
        elif isinstance(exc, ValueError):
            logger.warning("Value error occurred", extra=log_data)
        elif isinstance(exc, KeyError):
            logger.warning("Key error occurred", extra=log_data)
        else:
            logger.error("Unhandled exception occurred", extra=log_data, exc_info=True)

    def log_error(
        self, exc: Exception, context: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log error - alias for log_exception for backward compatibility.

        Args:
            exc: Exception to log
            context: Additional context information
        """
        if isinstance(exc, DomainException):
            self.log_domain_exception(exc, context)
        else:
            self.log_exception(exc, context)

    def log_domain_exception(
        self, exc: DomainException, context: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log domain exception with appropriate severity.

        Args:
            exc: Domain exception to log
            context: Additional context information
        """
        from app.core.error_messages import ErrorConfig

        log_data = {
            "error_code": exc.error_code.value,
            "error_message": exc.message,
            "details": exc.details,
            "metadata": exc.metadata,
        }

        if context:
            log_data.update(context)

        # Get severity from error configuration
        severity = ErrorConfig.SEVERITY_MAP.get(exc.error_code, ErrorSeverity.MEDIUM)

        # Log with appropriate level based on severity
        if severity == ErrorSeverity.CRITICAL:
            logger.critical("Critical domain error occurred", extra=log_data)
        elif severity == ErrorSeverity.HIGH:
            logger.error("High severity domain error occurred", extra=log_data)
        elif severity == ErrorSeverity.MEDIUM:
            logger.warning("Medium severity domain error occurred", extra=log_data)
        else:  # LOW
            logger.info("Low severity domain error occurred", extra=log_data)

    def handle_validation_errors(
        self, field_errors: Dict[str, List[str]]
    ) -> ValidationDomainException:
        """Create validation exception from field errors.

        Args:
            field_errors: Dictionary mapping field names to error messages

        Returns:
            ValidationDomainException with structured errors
        """
        validation_errors = []

        for field, messages in field_errors.items():
            for message in messages:
                validation_errors.append(
                    ValidationErrorDetail(
                        field=field,
                        message=message,
                        invalid_value=None,
                    )
                )

        return ValidationDomainException(
            validation_errors=validation_errors,
            details=f"Validation failed for {len(field_errors)} field(s)",
        )

    def create_business_rule_violation(
        self,
        rule_name: str,
        message: str,
        error_code: ErrorCode = ErrorCode.INVALID_REQUEST,
        context: Optional[Dict[str, Any]] = None,
    ) -> DomainException:
        """Create exception for business rule violation.

        Args:
            rule_name: Name of the violated business rule
            message: Error message
            error_code: Specific error code
            context: Business context information

        Returns:
            DomainException for business rule violation
        """
        from app.core.exceptions.domain_exceptions import BusinessLogicDomainException

        return BusinessLogicDomainException(
            error_code=error_code,
            rule_name=rule_name,
            message=message,
            business_context=context or {},
        )

    def create_resource_not_found(
        self,
        resource_type: str,
        resource_id: Optional[str] = None,
        message: Optional[str] = None,
    ) -> DomainException:
        """Create exception for resource not found.

        Args:
            resource_type: Type of resource
            resource_id: Resource identifier
            message: Custom error message

        Returns:
            ResourceDomainException for not found error
        """
        from app.core.exceptions.domain_exceptions import ResourceDomainException

        return ResourceDomainException(
            error_code=ErrorCode.RESOURCE_NOT_FOUND,
            resource_type=resource_type,
            resource_id=resource_id,
            message=message or f"{resource_type} not found",
        )

    def enrich_exception_context(
        self,
        exc: DomainException,
        request_id: Optional[str] = None,
        user_id: Optional[str] = None,
        operation: Optional[str] = None,
    ) -> DomainException:
        """Enrich exception with request context.

        Args:
            exc: Domain exception to enrich
            request_id: Request ID for tracing
            user_id: User ID if available
            operation: Operation being performed

        Returns:
            Enriched domain exception
        """
        if request_id:
            exc.add_context("request_id", request_id)
        if user_id:
            exc.add_context("user_id", user_id)
        if operation:
            exc.add_context("operation", operation)

        return exc

    def should_retry(self, exc: Exception) -> bool:
        """Determine if operation should be retried based on exception.

        Args:
            exc: Exception to analyze

        Returns:
            True if operation should be retried
        """
        # Retry on network errors
        if isinstance(exc, (ConnectionError, TimeoutError)):
            return True

        # Check if it's a domain exception with retryable error code
        if isinstance(exc, DomainException):
            retryable_codes = {
                ErrorCode.EXTERNAL_API_ERROR,
                ErrorCode.PERPLEXITY_API_TIMEOUT,
                ErrorCode.SERVICE_UNAVAILABLE,
                ErrorCode.TOO_MANY_CONCURRENT_REQUESTS,
            }
            return exc.error_code in retryable_codes

        return False

    def get_retry_delay(self, exc: Exception, attempt: int = 1) -> int:
        """Get retry delay in seconds for exception.

        Args:
            exc: Exception to analyze
            attempt: Current attempt number

        Returns:
            Delay in seconds before retry
        """
        # Exponential backoff with jitter
        base_delay = min(2**attempt, 60)  # Max 60 seconds

        # Adjust based on exception type
        if isinstance(exc, DomainException):
            from app.core.error_messages import ErrorConfig

            configured_delay = ErrorConfig.RETRY_DELAY_MAP.get(exc.error_code)
            if configured_delay:
                return configured_delay

        return base_delay


# Singleton instance for global use
_handler: ExceptionHandler = None


def get_exception_handler() -> ExceptionHandler:
    """Get the global exception handler instance.

    Returns:
        ExceptionHandler instance
    """
    global _handler
    if _handler is None:
        _handler = ExceptionHandler()
    return _handler
