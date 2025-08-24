"""Tests for error handling system."""

from unittest.mock import Mock, patch

from fastapi.testclient import TestClient


class TestErrorHandling:
    """Test error handling functionality."""

    def test_validation_error_response(self, client: TestClient):
        """Test validation error response format."""
        # Send invalid request (empty body)
        response = client.post("/api/v1/research/products", json={})

        assert response.status_code == 422
        data = response.json()

        # Check standard error structure
        assert "error_code" in data
        assert "message" in data
        assert "severity" in data
        assert "recommended_action" in data
        assert "validation_errors" in data

        assert data["error_code"] == "VALIDATION_ERROR"
        assert data["severity"] == "low"
        assert data["recommended_action"] == "check_input"

    def test_batch_size_exceeded_error(self, client: TestClient):
        """Test batch size exceeded error."""
        # Create request with too many items
        items = [
            {
                "product_name": f"Product {i}",
                "category": "Electronics",
                "price_exact": 100.0,
                "currency": "KRW",
            }
            for i in range(15)  # Exceeds limit of 10
        ]

        request_data = {"items": items, "priority": 5}

        response = client.post("/api/v1/research/products", json=request_data)

        assert response.status_code == 400
        data = response.json()

        assert data["error_code"] == "BATCH_SIZE_EXCEEDED"
        assert data["severity"] == "medium"
        assert data["recommended_action"] == "check_input"
        assert "metadata" in data
        assert data["metadata"]["received_count"] == 15
        assert data["metadata"]["max_allowed"] == 10

    def test_job_not_found_error(self, client: TestClient):
        """Test job not found error."""
        fake_job_id = "00000000-0000-0000-0000-000000000000"

        response = client.get(f"/api/v1/research/products/{fake_job_id}")

        assert response.status_code == 404
        data = response.json()

        assert data["error_code"] == "JOB_NOT_FOUND"
        assert data["severity"] == "medium"
        assert data["recommended_action"] == "check_input"
        assert "metadata" in data
        assert data["metadata"]["job_id"] == fake_job_id

    def test_invalid_uuid_format_error(self, client: TestClient):
        """Test invalid UUID format error."""
        response = client.get("/api/v1/research/products/invalid-uuid/status")

        assert response.status_code == 400
        data = response.json()

        assert data["error_code"] == "INVALID_UUID_FORMAT"
        assert data["severity"] == "low"
        assert data["recommended_action"] == "check_input"
        assert "metadata" in data
        assert data["metadata"]["provided_id"] == "invalid-uuid"

    @patch("app.services.product_research_service.get_product_research_service")
    def test_coupang_extraction_error_handling(self, mock_service, client: TestClient):
        """Test Coupang extraction error handling."""
        # Mock service to raise Coupang exception
        mock_service_instance = Mock()
        mock_service.return_value = mock_service_instance

        # Mock the create_research_job_with_coupang_preview to raise exception
        mock_service_instance.create_research_job_with_coupang_preview.side_effect = (
            Exception("Coupang API error")
        )

        # Mock fallback to regular job
        mock_job = Mock()
        mock_job.id = "test-job-id"
        mock_job.status.value = "pending"
        mock_job.results = []
        mock_job.total_items = 1
        mock_job.successful_items = 0
        mock_job.failed_items = 0
        mock_job.success_rate = 0.0
        mock_job.processing_time_ms = None
        mock_job.created_at = "2024-01-01T00:00:00Z"
        mock_job.updated_at = "2024-01-01T00:00:00Z"
        mock_job.started_at = None
        mock_job.completed_at = None

        mock_service_instance.create_research_job.return_value = mock_job

        request_data = {
            "items": [
                {
                    "product_name": "Test Product",
                    "category": "Electronics",
                    "price_exact": 100.0,
                    "currency": "KRW",
                    "product_id": 123,
                    "product_url": "https://test.com",
                }
            ],
            "priority": 5,
        }

        response = client.post(
            "/api/v1/research/products?return_coupang_preview=true", json=request_data
        )

        # Should succeed but fall back to regular job
        assert response.status_code == 201
        data = response.json()
        assert data["job_id"] == "test-job-id"
        assert data["status"] == "pending"

    def test_health_check_endpoint(self, client: TestClient):
        """Test health check endpoint includes error handling status."""
        response = client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()

        assert "status" in data
        assert "services" in data
        assert "external_apis" in data["services"]

    def test_circuit_breaker_status_endpoint(self, client: TestClient):
        """Test circuit breaker status endpoint."""
        response = client.get("/api/v1/health/circuit-breakers")

        assert response.status_code == 200
        data = response.json()

        assert "circuit_breakers" in data
        assert "summary" in data
        assert "total_services" in data["summary"]
        assert "healthy" in data["summary"]

    def test_error_response_headers(self, client: TestClient):
        """Test that error responses include proper headers."""
        response = client.post("/api/v1/research/products", json={})

        assert response.status_code == 422

        # Check for error-specific headers
        assert "X-Error-Code" in response.headers
        assert response.headers["X-Error-Code"] == "VALIDATION_ERROR"

    def test_error_logging_context(self, client: TestClient, caplog):
        """Test that errors are logged with proper context."""
        with caplog.at_level("WARNING"):
            response = client.post("/api/v1/research/products", json={})

            assert response.status_code == 422

            # Check that error was logged
            assert any(
                "validation" in record.message.lower() for record in caplog.records
            )


class TestErrorResponseStructure:
    """Test error response structure consistency."""

    def test_standard_error_structure(self):
        """Test standard error response structure."""
        from app.schemas.error_responses import (
            ErrorAction,
            ErrorCode,
            ErrorSeverity,
            StandardError,
        )

        error = StandardError(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Test error message",
            details="Test details",
            severity=ErrorSeverity.LOW,
            recommended_action=ErrorAction.CHECK_INPUT,
            retry_after=None,
            metadata={"test": "value"},
        )

        error_dict = error.dict()

        # Check all required fields are present
        required_fields = [
            "error_code",
            "message",
            "details",
            "severity",
            "recommended_action",
            "retry_after",
            "metadata",
        ]

        for field in required_fields:
            assert field in error_dict

        assert error_dict["error_code"] == "VALIDATION_ERROR"
        assert error_dict["severity"] == "low"
        assert error_dict["recommended_action"] == "check_input"

    def test_coupang_error_structure(self):
        """Test Coupang-specific error structure."""
        from app.schemas.error_responses import CoupangError, ErrorCode

        error = CoupangError(
            error_code=ErrorCode.COUPANG_PARTIAL_DATA,
            message="Partial Coupang data available",
            available_fields=["product_url", "price"],
            missing_fields=["product_image", "category_name"],
            fallback_available=True,
        )

        error_dict = error.dict()

        # Check Coupang-specific fields
        assert "available_fields" in error_dict
        assert "missing_fields" in error_dict
        assert "fallback_available" in error_dict

        assert error_dict["available_fields"] == ["product_url", "price"]
        assert error_dict["missing_fields"] == ["product_image", "category_name"]
        assert error_dict["fallback_available"] is True

    def test_rate_limit_error_structure(self):
        """Test rate limit error structure."""
        from app.schemas.error_responses import ErrorCode, RateLimitError

        error = RateLimitError(
            error_code=ErrorCode.RATE_LIMIT_EXCEEDED,
            message="Rate limit exceeded",
            limit=100,
            remaining=0,
            reset_time=1704067200,
        )

        error_dict = error.dict()

        # Check rate limit specific fields
        assert "limit" in error_dict
        assert "remaining" in error_dict
        assert "reset_time" in error_dict

        assert error_dict["limit"] == 100
        assert error_dict["remaining"] == 0
        assert error_dict["reset_time"] == 1704067200
