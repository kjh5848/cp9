"""Tests for the exception system components."""

from unittest.mock import patch

import pytest
from fastapi import HTTPException
from pydantic import ValidationError as PydanticValidationError

from app.core.exceptions.domain_exceptions import (
    DomainException,
    ExternalServiceDomainException,
    RateLimitDomainException,
    ValidationDomainException,
)
from app.core.exceptions.exception_handler import ExceptionHandler
from app.core.exceptions.http_exception_mapper import HttpExceptionMapper
from app.schemas.error_responses import ErrorCode, ValidationErrorDetail


class TestDomainExceptions:
    """Test domain exception classes."""

    def test_domain_exception_creation(self):
        """Test basic domain exception creation."""
        exception = DomainException(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Test error",
            details="Detailed error information"
        )

        assert exception.error_code == ErrorCode.VALIDATION_ERROR
        assert exception.message == "Test error"
        assert exception.details == "Detailed error information"
        assert exception.metadata == {}
        assert exception.correlation_id is not None

    def test_domain_exception_with_metadata(self):
        """Test domain exception with metadata."""
        metadata = {"user_id": "123", "request_id": "req-456"}
        exception = DomainException(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Test error",
            metadata=metadata
        )

        assert exception.metadata == metadata

    def test_domain_exception_add_context(self):
        """Test adding context to domain exception."""
        exception = DomainException(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Test error"
        )

        result = exception.add_context("user_id", "123")
        assert result is exception  # Should return self for chaining
        assert exception.metadata["user_id"] == "123"

    def test_domain_exception_str_representation(self):
        """Test string representation of domain exception."""
        exception = DomainException(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Test error",
            details="Detailed information"
        )

        str_repr = str(exception)
        assert "VALIDATION_ERROR" in str_repr
        assert "Test error" in str_repr

    def test_validation_domain_exception(self):
        """Test validation domain exception."""
        validation_details = [
            ValidationErrorDetail(
                field="name",
                message="Field is required",
                invalid_value=None
            )
        ]

        exception = ValidationDomainException(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Validation failed",
            validation_errors=validation_details
        )

        assert len(exception.validation_errors) == 1
        assert exception.validation_errors[0].field == "name"
        assert exception.validation_errors[0].message == "Field is required"

    def test_external_service_domain_exception(self):
        """Test external service domain exception."""
        exception = ExternalServiceDomainException(
            error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
            message="API call failed",
            service_name="perplexity",
            status_code=500,
            response_data={"error": "Internal server error"}
        )

        assert exception.service_name == "perplexity"
        assert exception.status_code == 500
        assert exception.response_data == {"error": "Internal server error"}

    def test_rate_limit_domain_exception(self):
        """Test rate limit domain exception."""
        exception = RateLimitDomainException(
            error_code=ErrorCode.RATE_LIMIT_ERROR,
            message="Rate limit exceeded",
            retry_after=60,
            limit_type="api_calls",
            current_usage=1000,
            limit_value=500
        )

        assert exception.retry_after == 60
        assert exception.limit_type == "api_calls"
        assert exception.current_usage == 1000
        assert exception.limit_value == 500


class TestExceptionHandler:
    """Test exception handler functionality."""

    @pytest.fixture
    def exception_handler(self):
        """Create exception handler instance."""
        return ExceptionHandler()

    def test_from_pydantic_validation_error(self, exception_handler):
        """Test conversion from Pydantic validation error."""
        # Create a mock Pydantic validation error
        pydantic_error = PydanticValidationError([
            {
                'loc': ('name',),
                'msg': 'field required',
                'type': 'value_error.missing',
                'input': None
            },
            {
                'loc': ('price',),
                'msg': 'ensure this value is greater than 0',
                'type': 'value_error.number.not_gt',
                'input': -10
            }
        ], ValidationDomainException)

        domain_exception = exception_handler.from_pydantic_validation_error(pydantic_error)

        assert isinstance(domain_exception, ValidationDomainException)
        assert domain_exception.error_code == ErrorCode.VALIDATION_ERROR
        assert len(domain_exception.validation_errors) == 2
        assert domain_exception.validation_errors[0].field == "name"
        assert domain_exception.validation_errors[1].field == "price"

    def test_from_generic_exception(self, exception_handler):
        """Test conversion from generic exception."""
        generic_error = ValueError("Invalid input value")

        domain_exception = exception_handler.from_generic_exception(
            generic_error,
            ErrorCode.VALIDATION_ERROR
        )

        assert isinstance(domain_exception, DomainException)
        assert domain_exception.error_code == ErrorCode.VALIDATION_ERROR
        assert "Invalid input value" in domain_exception.message
        assert domain_exception.metadata["original_exception_type"] == "ValueError"

    def test_from_generic_exception_default_error_code(self, exception_handler):
        """Test conversion from generic exception with default error code."""
        generic_error = RuntimeError("Something went wrong")

        domain_exception = exception_handler.from_generic_exception(generic_error)

        assert domain_exception.error_code == ErrorCode.INTERNAL_ERROR

    def test_log_domain_exception(self, exception_handler):
        """Test domain exception logging."""
        exception = DomainException(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Test error",
            details="Test details"
        )
        context = {"user_id": "123", "endpoint": "/api/test"}

        with patch('app.core.exceptions.exception_handler.logger') as mock_logger:
            exception_handler.log_domain_exception(exception, context)

            # Verify error was logged
            mock_logger.error.assert_called_once()
            log_call = mock_logger.error.call_args

            # Check that relevant information is in the log
            log_message = str(log_call[0][0])  # First positional argument (message)
            assert "VALIDATION_ERROR" in log_message
            assert "Test error" in log_message

    def test_log_domain_exception_with_sensitive_data_filtering(self, exception_handler):
        """Test that sensitive data is filtered from logs."""
        exception = DomainException(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Test error",
            metadata={"password": "secret123", "user_id": "123"}
        )

        with patch('app.core.exceptions.exception_handler.logger') as mock_logger:
            exception_handler.log_domain_exception(exception)

            # Get the logged data
            log_call = mock_logger.error.call_args
            logged_data = log_call[1]  # Keyword arguments

            # Sensitive data should be filtered
            assert "password" not in str(logged_data)
            assert "secret123" not in str(logged_data)
            assert "user_id" in str(logged_data)  # Non-sensitive data should remain

    def test_create_validation_error_detail(self, exception_handler):
        """Test validation error detail creation."""
        pydantic_error_dict = {
            'loc': ('name',),
            'msg': 'field required',
            'type': 'value_error.missing',
            'input': None
        }

        detail = exception_handler._create_validation_error_detail(pydantic_error_dict)

        assert detail.field == "name"
        assert detail.message == "field required"
        assert detail.error_type == "value_error.missing"
        assert detail.invalid_value is None

    def test_create_validation_error_detail_nested_field(self, exception_handler):
        """Test validation error detail creation for nested fields."""
        pydantic_error_dict = {
            'loc': ('user', 'profile', 'email'),
            'msg': 'invalid email format',
            'type': 'value_error.email',
            'input': 'invalid-email'
        }

        detail = exception_handler._create_validation_error_detail(pydantic_error_dict)

        assert detail.field == "user.profile.email"
        assert detail.message == "invalid email format"
        assert detail.invalid_value == "invalid-email"

    def test_filter_sensitive_data(self, exception_handler):
        """Test sensitive data filtering."""
        sensitive_data = {
            "user_id": "123",
            "password": "secret123",
            "api_key": "sk-1234567890",
            "token": "bearer-token",
            "secret": "my-secret",
            "authorization": "Bearer token123",
            "normal_field": "safe_value"
        }

        filtered_data = exception_handler._filter_sensitive_data(sensitive_data)

        assert filtered_data["user_id"] == "123"  # Safe field remains
        assert filtered_data["normal_field"] == "safe_value"  # Safe field remains
        assert filtered_data["password"] == "[FILTERED]"
        assert filtered_data["api_key"] == "[FILTERED]"
        assert filtered_data["token"] == "[FILTERED]"
        assert filtered_data["secret"] == "[FILTERED]"
        assert filtered_data["authorization"] == "[FILTERED]"


class TestHttpExceptionMapper:
    """Test HTTP exception mapper functionality."""

    @pytest.fixture
    def mapper(self):
        """Create HTTP exception mapper instance."""
        return HttpExceptionMapper()

    def test_to_http_exception_validation_error(self, mapper):
        """Test mapping validation domain exception to HTTP exception."""
        validation_details = [
            ValidationErrorDetail(
                field="name",
                message="Field is required",
                invalid_value=None
            )
        ]

        domain_exception = ValidationDomainException(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Validation failed",
            validation_errors=validation_details
        )

        http_exception = mapper.to_http_exception(domain_exception)

        assert isinstance(http_exception, HTTPException)
        assert http_exception.status_code == 422  # Unprocessable Entity for validation
        assert "validation" in http_exception.detail["error_type"].lower()

    def test_to_http_exception_external_service_error(self, mapper):
        """Test mapping external service exception to HTTP exception."""
        domain_exception = ExternalServiceDomainException(
            error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
            message="External API failed",
            service_name="perplexity",
            status_code=500
        )

        http_exception = mapper.to_http_exception(domain_exception)

        assert http_exception.status_code == 502  # Bad Gateway for external service errors
        assert "external service" in http_exception.detail["error_type"].lower()

    def test_to_http_exception_rate_limit_error(self, mapper):
        """Test mapping rate limit exception to HTTP exception."""
        domain_exception = RateLimitDomainException(
            error_code=ErrorCode.RATE_LIMIT_ERROR,
            message="Rate limit exceeded",
            retry_after=60
        )

        http_exception = mapper.to_http_exception(domain_exception)

        assert http_exception.status_code == 429  # Too Many Requests
        assert "rate_limit" in http_exception.detail["error_type"].lower()

    def test_to_http_exception_generic_error(self, mapper):
        """Test mapping generic domain exception to HTTP exception."""
        domain_exception = DomainException(
            error_code=ErrorCode.INTERNAL_ERROR,
            message="Something went wrong"
        )

        http_exception = mapper.to_http_exception(domain_exception)

        assert http_exception.status_code == 500  # Internal Server Error
        assert "internal" in http_exception.detail["error_type"].lower()

    def test_to_coupang_error(self, mapper):
        """Test mapping to Coupang-specific error format."""
        domain_exception = ExternalServiceDomainException(
            error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
            message="Coupang API failed",
            service_name="coupang"
        )

        available_fields = ["name", "price"]
        missing_fields = ["description", "images"]
        fallback_available = True

        coupang_error = mapper.to_coupang_error(
            domain_exception,
            available_fields=available_fields,
            missing_fields=missing_fields,
            fallback_available=fallback_available
        )

        assert "available_fields" in coupang_error
        assert coupang_error["available_fields"] == available_fields
        assert coupang_error["missing_fields"] == missing_fields
        assert coupang_error["fallback_available"] == fallback_available

    def test_get_http_status_code_mapping(self, mapper):
        """Test HTTP status code mapping for different error codes."""
        assert mapper._get_http_status_code(ErrorCode.VALIDATION_ERROR) == 422
        assert mapper._get_http_status_code(ErrorCode.RATE_LIMIT_ERROR) == 429
        assert mapper._get_http_status_code(ErrorCode.EXTERNAL_SERVICE_ERROR) == 502
        assert mapper._get_http_status_code(ErrorCode.AUTHENTICATION_ERROR) == 401
        assert mapper._get_http_status_code(ErrorCode.AUTHORIZATION_ERROR) == 403
        assert mapper._get_http_status_code(ErrorCode.NOT_FOUND_ERROR) == 404
        assert mapper._get_http_status_code(ErrorCode.INTERNAL_ERROR) == 500

    def test_create_standard_error_response(self, mapper):
        """Test standard error response creation."""
        domain_exception = DomainException(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Test error",
            details="Test details"
        )

        error_response = mapper._create_standard_error(domain_exception)

        assert error_response["error_code"] == "VALIDATION_ERROR"
        assert error_response["message"] == "Test error"
        assert error_response["details"] == "Test details"
        assert error_response["correlation_id"] == str(domain_exception.correlation_id)
        assert "timestamp" in error_response

    def test_create_validation_error_response(self, mapper):
        """Test validation error response creation."""
        validation_details = [
            ValidationErrorDetail(
                field="name",
                message="Field is required",
                invalid_value=None
            )
        ]

        domain_exception = ValidationDomainException(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Validation failed",
            validation_errors=validation_details
        )

        error_response = mapper._create_validation_error(domain_exception)

        assert error_response["error_type"] == "validation_error"
        assert len(error_response["validation_errors"]) == 1
        assert error_response["validation_errors"][0]["field"] == "name"

    def test_create_rate_limit_error_response(self, mapper):
        """Test rate limit error response creation."""
        domain_exception = RateLimitDomainException(
            error_code=ErrorCode.RATE_LIMIT_ERROR,
            message="Rate limit exceeded",
            retry_after=60,
            limit_type="api_calls"
        )

        error_response = mapper._create_rate_limit_error(domain_exception)

        assert error_response["error_type"] == "rate_limit_error"
        assert error_response["retry_after"] == 60
        assert error_response["limit_type"] == "api_calls"

    def test_create_external_service_error_response(self, mapper):
        """Test external service error response creation."""
        domain_exception = ExternalServiceDomainException(
            error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
            message="External service failed",
            service_name="perplexity",
            status_code=500
        )

        error_response = mapper._create_external_service_error(domain_exception)

        assert error_response["error_type"] == "external_service_error"
        assert error_response["service_name"] == "perplexity"
        assert error_response["service_status_code"] == 500
