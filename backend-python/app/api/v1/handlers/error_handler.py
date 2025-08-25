"""Error handling for API endpoints.

This module provides consistent error handling and logging across API endpoints,
following the Single Responsibility Principle by focusing solely on error management.
"""

from typing import Any, Dict, Optional

from fastapi import HTTPException
from pydantic import ValidationError as PydanticValidationError

from app.core.exceptions import (
    BaseAPIException,
    ErrorHandler as CoreErrorHandler,
    ValidationException,
    get_exception_handler,
)
from app.core.logging import get_logger
from app.schemas.error_responses import ErrorCode

logger = get_logger(__name__)


class ApiErrorHandler:
    """Handles API-specific error processing and HTTP exception conversion.

    Responsibilities:
    - Convert domain exceptions to HTTP exceptions
    - Provide consistent error logging across endpoints
    - Handle framework-specific exceptions (Pydantic, FastAPI)
    - Enrich exceptions with endpoint context
    """

    def __init__(self):
        self.core_handler = get_exception_handler()

    def handle_endpoint_exception(
        self,
        exception: Exception,
        endpoint_name: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> HTTPException:
        """Handle any exception that occurs in an endpoint.

        Args:
            exception: Exception that occurred
            endpoint_name: Name of the endpoint where exception occurred
            context: Additional context information

        Returns:
            HTTPException ready to be raised by FastAPI

        Raises:
            HTTPException: Converted from domain exception
        """
        # Prepare context with endpoint information
        error_context = {"endpoint": endpoint_name}
        if context:
            error_context.update(context)

        try:
            # Handle known domain exceptions
            if isinstance(exception, BaseAPIException):
                return self._handle_domain_exception(exception, error_context)

            # Handle Pydantic validation errors
            elif isinstance(exception, PydanticValidationError):
                return self._handle_pydantic_error(exception, error_context)

            # Handle value errors as validation issues
            elif isinstance(exception, ValueError):
                return self._handle_value_error(exception, error_context)

            # Handle any other unexpected errors
            else:
                return self._handle_generic_error(exception, error_context)

        except Exception as handling_error:
            # If error handling itself fails, provide a basic response
            logger.critical(
                f"Error handling failed in endpoint {endpoint_name}",
                extra={
                    "original_exception": str(exception),
                    "handling_exception": str(handling_error),
                    "endpoint": endpoint_name,
                },
                exc_info=True,
            )
            return HTTPException(
                status_code=500,
                detail="Internal server error during error processing",
            )

    def handle_business_rule_violation(
        self,
        rule_name: str,
        message: str,
        endpoint_name: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> HTTPException:
        """Handle business rule violations with structured error response.

        Args:
            rule_name: Name of the violated business rule
            message: Error message
            endpoint_name: Name of the endpoint
            context: Additional context information

        Returns:
            HTTPException with appropriate status and detail
        """
        error_context = {"endpoint": endpoint_name, "rule": rule_name}
        if context:
            error_context.update(context)

        domain_exc = self.core_handler.create_business_rule_violation(
            rule_name=rule_name,
            message=message,
            error_code=ErrorCode.INVALID_REQUEST,
            context=error_context,
        )

        self.core_handler.log_domain_exception(domain_exc, error_context)
        return domain_exc.to_http_exception()

    def handle_resource_not_found(
        self,
        resource_type: str,
        resource_id: str,
        endpoint_name: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> HTTPException:
        """Handle resource not found errors with consistent formatting.

        Args:
            resource_type: Type of resource (job, task, etc.)
            resource_id: Resource identifier
            endpoint_name: Name of the endpoint
            context: Additional context information

        Returns:
            HTTPException with 404 status and structured detail
        """
        error_context = {"endpoint": endpoint_name, "resource_type": resource_type, "resource_id": resource_id}
        if context:
            error_context.update(context)

        domain_exc = self.core_handler.create_resource_not_found(
            resource_type=resource_type,
            resource_id=resource_id,
            message=f"{resource_type} {resource_id} not found",
        )

        self.core_handler.log_domain_exception(domain_exc, error_context)
        return domain_exc.to_http_exception()

    def enrich_exception_with_context(
        self,
        exception: BaseAPIException,
        endpoint_name: str,
        request_id: Optional[str] = None,
        user_id: Optional[str] = None,
        additional_context: Optional[Dict[str, Any]] = None,
    ) -> BaseAPIException:
        """Enrich exception with request context information.

        Args:
            exception: Domain exception to enrich
            endpoint_name: Name of the endpoint
            request_id: Request ID for tracing
            user_id: User ID if available
            additional_context: Additional context information

        Returns:
            Enriched domain exception
        """
        # Add endpoint context
        exception.add_context("endpoint", endpoint_name)

        # Add request tracing information
        if request_id:
            exception.add_context("request_id", request_id)
        if user_id:
            exception.add_context("user_id", user_id)

        # Add any additional context
        if additional_context:
            for key, value in additional_context.items():
                exception.add_context(key, value)

        return exception

    def _handle_domain_exception(
        self, exception: BaseAPIException, context: Dict[str, Any]
    ) -> HTTPException:
        """Handle domain exceptions with proper logging and conversion.

        Args:
            exception: Domain exception
            context: Error context

        Returns:
            HTTPException with appropriate status and detail
        """
        # Enrich exception with context
        for key, value in context.items():
            exception.add_context(key, value)

        # Log the domain exception
        self.core_handler.log_domain_exception(exception, context)

        # Convert to HTTP exception
        return exception.to_http_exception()

    def _handle_pydantic_error(
        self, exception: PydanticValidationError, context: Dict[str, Any]
    ) -> HTTPException:
        """Handle Pydantic validation errors.

        Args:
            exception: Pydantic validation error
            context: Error context

        Returns:
            HTTPException with validation error details
        """
        # Convert to domain exception
        validation_exc = self.core_handler.from_pydantic_validation_error(exception)

        # Add context
        for key, value in context.items():
            validation_exc.add_context(key, value)

        # Log the error
        self.core_handler.log_domain_exception(validation_exc, context)

        # Convert to HTTP exception
        return validation_exc.to_http_exception()

    def _handle_value_error(self, exception: ValueError, context: Dict[str, Any]) -> HTTPException:
        """Handle value errors as validation issues.

        Args:
            exception: Value error
            context: Error context

        Returns:
            HTTPException with validation error details
        """
        logger.error(f"Value error in endpoint: {str(exception)}", extra=context)

        domain_exc = BaseAPIException(
            error_code=ErrorCode.INVALID_REQUEST,
            message="Invalid request data",
            details=str(exception),
            metadata=context,
        )

        self.core_handler.log_domain_exception(domain_exc, context)
        return domain_exc.to_http_exception()

    def _handle_generic_error(self, exception: Exception, context: Dict[str, Any]) -> HTTPException:
        """Handle unexpected generic errors.

        Args:
            exception: Generic exception
            context: Error context

        Returns:
            HTTPException with internal server error status
        """
        # Convert to domain exception
        domain_exc = self.core_handler.from_generic_exception(
            exception, ErrorCode.INTERNAL_SERVER_ERROR, context
        )

        # Log the error with full context
        self.core_handler.log_domain_exception(domain_exc, context)

        # Convert to HTTP exception
        return domain_exc.to_http_exception()

    def should_retry_operation(self, exception: Exception) -> bool:
        """Determine if operation should be retried based on exception type.

        Args:
            exception: Exception to analyze

        Returns:
            True if operation should be retried
        """
        return self.core_handler.should_retry(exception)

    def get_retry_delay(self, exception: Exception, attempt: int = 1) -> int:
        """Get retry delay for exception.

        Args:
            exception: Exception to analyze
            attempt: Current attempt number

        Returns:
            Delay in seconds before retry
        """
        return self.core_handler.get_retry_delay(exception, attempt)


# Singleton instance for global use
_api_error_handler: ApiErrorHandler = None


def get_api_error_handler() -> ApiErrorHandler:
    """Get the global API error handler instance.

    Returns:
        ApiErrorHandler instance
    """
    global _api_error_handler
    if _api_error_handler is None:
        _api_error_handler = ApiErrorHandler()
    return _api_error_handler