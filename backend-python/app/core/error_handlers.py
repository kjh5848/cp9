"""Global error handlers for FastAPI application."""

import traceback
from typing import Any, Dict, Optional, Union

from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import BaseAPIException, ErrorHandler
from app.core.logging import get_logger
from app.schemas.error_responses import ErrorCode, StandardError

logger = get_logger(__name__)


class GlobalExceptionHandler:
    """Global exception handler for FastAPI application."""
    
    @staticmethod
    async def base_api_exception_handler(
        request: Request,
        exc: BaseAPIException
    ) -> JSONResponse:
        """Handle custom BaseAPIException.
        
        Args:
            request: FastAPI request
            exc: Base API exception
            
        Returns:
            JSON response with error details
        """
        # Log the error with context
        ErrorHandler.log_error(exc, context={
            "method": request.method,
            "url": str(request.url),
            "client": getattr(request.client, "host", "unknown") if request.client else "unknown"
        })
        
        # Convert to appropriate error response
        if hasattr(exc, 'to_coupang_error'):
            error_response = exc.to_coupang_error()
        elif hasattr(exc, 'to_rate_limit_error'):
            error_response = exc.to_rate_limit_error()
        elif hasattr(exc, 'to_external_service_error'):
            error_response = exc.to_external_service_error()
        elif hasattr(exc, 'to_validation_error'):
            error_response = exc.to_validation_error()
        else:
            error_response = exc.to_standard_error()
        
        # Add request context
        response_data = error_response.dict()
        response_data["request_id"] = getattr(request.state, "request_id", None)
        response_data["timestamp"] = "2024-01-01T00:00:00Z"  # Would use actual timestamp
        
        return JSONResponse(
            status_code=exc.http_status,
            content=response_data,
            headers=GlobalExceptionHandler._get_error_headers(exc)
        )
    
    @staticmethod
    async def http_exception_handler(
        request: Request,
        exc: HTTPException
    ) -> JSONResponse:
        """Handle FastAPI HTTPException.
        
        Args:
            request: FastAPI request
            exc: HTTP exception
            
        Returns:
            JSON response with error details
        """
        # Check if detail is already a standardized error dict
        if isinstance(exc.detail, dict) and "error_code" in exc.detail:
            return JSONResponse(
                status_code=exc.status_code,
                content=exc.detail
            )
        
        # Convert to standard error format
        error_code = GlobalExceptionHandler._map_status_to_error_code(exc.status_code)
        
        api_exc = BaseAPIException(
            error_code=error_code,
            details=str(exc.detail),
            http_status=exc.status_code,
            metadata={
                "method": request.method,
                "url": str(request.url),
                "original_detail": exc.detail
            }
        )
        
        # Log the error
        ErrorHandler.log_error(api_exc)
        
        # Create response
        error_response = api_exc.to_standard_error()
        response_data = error_response.dict()
        response_data["request_id"] = getattr(request.state, "request_id", None)
        response_data["timestamp"] = "2024-01-01T00:00:00Z"
        
        return JSONResponse(
            status_code=exc.status_code,
            content=response_data,
            headers=GlobalExceptionHandler._get_error_headers(api_exc)
        )
    
    @staticmethod
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError
    ) -> JSONResponse:
        """Handle FastAPI validation errors.
        
        Args:
            request: FastAPI request
            exc: Request validation error
            
        Returns:
            JSON response with validation error details
        """
        validation_exc = ErrorHandler.from_pydantic_validation_error(exc)
        validation_exc.metadata = {
            "method": request.method,
            "url": str(request.url),
            "body": await GlobalExceptionHandler._safe_get_body(request)
        }
        
        # Log the error
        ErrorHandler.log_error(validation_exc)
        
        # Create response
        error_response = validation_exc.to_validation_error()
        response_data = error_response.dict()
        response_data["request_id"] = getattr(request.state, "request_id", None)
        response_data["timestamp"] = "2024-01-01T00:00:00Z"
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=response_data
        )
    
    @staticmethod
    async def generic_exception_handler(
        request: Request,
        exc: Exception
    ) -> JSONResponse:
        """Handle unexpected exceptions.
        
        Args:
            request: FastAPI request
            exc: Generic exception
            
        Returns:
            JSON response with error details
        """
        # Create API exception from generic exception
        api_exc = ErrorHandler.from_generic_exception(exc)
        api_exc.metadata = {
            "method": request.method,
            "url": str(request.url),
            "exception_type": type(exc).__name__,
            "traceback": traceback.format_exc() if logger.level <= 10 else None  # DEBUG level
        }
        
        # Log the error
        ErrorHandler.log_error(api_exc)
        
        # Create response (hide internal details in production)
        error_response = api_exc.to_standard_error()
        response_data = error_response.dict()
        
        # Don't expose internal details in production
        if not GlobalExceptionHandler._is_debug_mode():
            response_data["details"] = "Internal server error occurred"
            if "traceback" in response_data.get("metadata", {}):
                del response_data["metadata"]["traceback"]
        
        response_data["request_id"] = getattr(request.state, "request_id", None)
        response_data["timestamp"] = "2024-01-01T00:00:00Z"
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=response_data,
            headers={"X-Error-Type": "UnexpectedException"}
        )
    
    @staticmethod
    def _map_status_to_error_code(status_code: int) -> ErrorCode:
        """Map HTTP status code to error code.
        
        Args:
            status_code: HTTP status code
            
        Returns:
            Corresponding error code
        """
        mapping = {
            400: ErrorCode.INVALID_REQUEST,
            401: ErrorCode.INVALID_REQUEST,
            403: ErrorCode.INVALID_REQUEST,
            404: ErrorCode.RESOURCE_NOT_FOUND,
            422: ErrorCode.VALIDATION_ERROR,
            429: ErrorCode.RATE_LIMIT_EXCEEDED,
            500: ErrorCode.INTERNAL_SERVER_ERROR,
            502: ErrorCode.EXTERNAL_API_ERROR,
            503: ErrorCode.SERVICE_UNAVAILABLE,
            504: ErrorCode.PERPLEXITY_API_TIMEOUT,
        }
        return mapping.get(status_code, ErrorCode.INTERNAL_SERVER_ERROR)
    
    @staticmethod
    def _get_error_headers(exc: BaseAPIException) -> Dict[str, str]:
        """Get error-specific headers.
        
        Args:
            exc: Base API exception
            
        Returns:
            Dictionary of headers
        """
        headers = {"X-Error-Code": exc.error_code.value}
        
        # Add rate limiting headers if applicable
        if hasattr(exc, 'reset_time') and exc.reset_time:
            headers["X-RateLimit-Reset"] = str(exc.reset_time)
            headers["Retry-After"] = str(getattr(exc, 'retry_after', 60))
        
        # Add service status headers for external service errors
        if hasattr(exc, 'service_name') and exc.service_name:
            headers["X-Service-Name"] = exc.service_name
            headers["X-Service-Status"] = getattr(exc, 'service_status', 'unknown')
        
        return headers
    
    @staticmethod
    async def _safe_get_body(request: Request) -> Optional[str]:
        """Safely get request body for logging.
        
        Args:
            request: FastAPI request
            
        Returns:
            Request body string or None
        """
        try:
            body = await request.body()
            return body.decode('utf-8')[:500]  # Limit to 500 chars
        except Exception:
            return None
    
    @staticmethod
    def _is_debug_mode() -> bool:
        """Check if application is in debug mode.
        
        Returns:
            True if in debug mode
        """
        # Would check actual debug setting
        return False


def setup_error_handlers(app) -> None:
    """Set up global error handlers for FastAPI app.
    
    Args:
        app: FastAPI application instance
    """
    # Custom API exceptions
    app.add_exception_handler(
        BaseAPIException,
        GlobalExceptionHandler.base_api_exception_handler
    )
    
    # FastAPI HTTP exceptions
    app.add_exception_handler(
        HTTPException,
        GlobalExceptionHandler.http_exception_handler
    )
    
    app.add_exception_handler(
        StarletteHTTPException,
        GlobalExceptionHandler.http_exception_handler
    )
    
    # Validation exceptions
    app.add_exception_handler(
        RequestValidationError,
        GlobalExceptionHandler.validation_exception_handler
    )
    
    # Generic exceptions (catch-all)
    app.add_exception_handler(
        Exception,
        GlobalExceptionHandler.generic_exception_handler
    )
    
    logger.info("Global error handlers configured")


class ErrorResponseHelper:
    """Helper utilities for creating error responses."""
    
    @staticmethod
    def create_frontend_friendly_error(
        error_code: ErrorCode,
        user_message: str,
        action_required: bool = False,
        retry_after: Optional[int] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create frontend-friendly error response.
        
        Args:
            error_code: Error code
            user_message: User-friendly message
            action_required: Whether user action is required
            retry_after: Retry after seconds
            context: Additional context
            
        Returns:
            Frontend-friendly error dictionary
        """
        from app.core.error_messages import ErrorConfig
        
        response = {
            "error": {
                "code": error_code.value,
                "message": user_message,
                "severity": ErrorConfig.SEVERITY_MAP.get(error_code, "medium").value,
                "action_required": action_required,
                "recommended_action": ErrorConfig.ACTION_MAP.get(error_code, "no_action").value,
            },
            "success": False,
            "timestamp": "2024-01-01T00:00:00Z",
        }
        
        if retry_after:
            response["retry_after"] = retry_after
            response["error"]["retry_after"] = retry_after
        
        if context:
            response["context"] = context
        
        return response
    
    @staticmethod
    def create_success_response(
        data: Any,
        message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create standardized success response.
        
        Args:
            data: Response data
            message: Success message
            metadata: Additional metadata
            
        Returns:
            Standardized success response
        """
        response = {
            "success": True,
            "data": data,
            "timestamp": "2024-01-01T00:00:00Z",
        }
        
        if message:
            response["message"] = message
            
        if metadata:
            response["metadata"] = metadata
            
        return response