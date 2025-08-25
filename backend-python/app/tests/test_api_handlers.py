"""Tests for API handler components."""

from uuid import uuid4

import pytest

from app.api.v1.handlers.request_validator import RequestValidator
from app.api.v1.handlers.response_formatter import ResponseFormatter
from app.core.exceptions import ValidationException
from app.domain.product_entities import ProductResearchItem, ProductResearchJob
from app.schemas.error_responses import ErrorCode
from app.schemas.product_research_in import (
    ProductItemRequest as ProductResearchItemRequest,
    ProductResearchRequest,
)
from app.schemas.product_research_out import (
    ProductResultResponse as ProductResearchItemResponse, 
    ProductResearchResponse,
)


class TestRequestValidator:
    """Test request validator functionality."""

    @pytest.fixture
    def validator(self):
        """Create request validator instance."""
        return RequestValidator()

    @pytest.fixture
    def valid_request_data(self):
        """Create valid request data."""
        return ProductResearchRequest(
            items=[
                ProductResearchItemRequest(
                    name="iPhone 15 Pro",
                    description="Latest iPhone with advanced features",
                    category="Electronics",
                    keywords=["smartphone", "apple", "mobile"]
                ),
                ProductResearchItemRequest(
                    name="MacBook Air M2",
                    description="Lightweight laptop with M2 chip",
                    category="Electronics",
                    keywords=["laptop", "apple", "macbook"]
                ),
            ],
            priority=7,
            callback_url="https://example.com/webhook"
        )

    @pytest.mark.asyncio
    async def test_validate_research_request_success(self, validator, valid_request_data):
        """Test successful request validation."""
        items, priority, callback_url = await validator.validate_research_request(valid_request_data)

        assert len(items) == 2
        assert isinstance(items[0], ProductResearchItem)
        assert isinstance(items[1], ProductResearchItem)
        assert items[0].name == "iPhone 15 Pro"
        assert items[1].name == "MacBook Air M2"
        assert priority == 7
        assert callback_url == "https://example.com/webhook"

    @pytest.mark.asyncio
    async def test_validate_research_request_with_defaults(self, validator):
        """Test request validation with default values."""
        minimal_request = ProductResearchRequest(
            items=[
                ProductResearchItemRequest(
                    name="Test Product",
                    category="Electronics"
                )
            ]
        )

        items, priority, callback_url = await validator.validate_research_request(minimal_request)

        assert len(items) == 1
        assert priority == 5  # Default priority
        assert callback_url is None
        assert items[0].description is None  # Optional field
        assert items[0].keywords == []  # Default empty list

    @pytest.mark.asyncio
    async def test_validate_research_request_empty_items(self, validator):
        """Test validation with empty items list."""
        invalid_request = ProductResearchRequest(
            items=[],
            priority=5
        )

        with pytest.raises(ValidationException) as exc_info:
            await validator.validate_research_request(invalid_request)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "at least one item" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_validate_research_request_too_many_items(self, validator):
        """Test validation with too many items."""
        too_many_items = [
            ProductResearchItemRequest(
                name=f"Product {i}",
                category="Test"
            )
            for i in range(11)  # Exceeds maximum of 10
        ]

        invalid_request = ProductResearchRequest(
            items=too_many_items,
            priority=5
        )

        with pytest.raises(ValidationException) as exc_info:
            await validator.validate_research_request(invalid_request)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "maximum batch size" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_validate_research_request_invalid_priority(self, validator, valid_request_data):
        """Test validation with invalid priority."""
        valid_request_data.priority = 15  # Exceeds maximum of 10

        with pytest.raises(ValidationException) as exc_info:
            await validator.validate_research_request(valid_request_data)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "priority" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_validate_research_request_invalid_callback_url(self, validator, valid_request_data):
        """Test validation with invalid callback URL."""
        valid_request_data.callback_url = "not-a-valid-url"

        with pytest.raises(ValidationException) as exc_info:
            await validator.validate_research_request(valid_request_data)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "callback_url" in str(exc_info.value)

    def test_validate_items_success(self, validator):
        """Test successful item validation."""
        valid_items = [
            ProductResearchItemRequest(
                name="Test Product",
                category="Electronics"
            )
        ]

        # Should not raise any exception
        validator._validate_items(valid_items)

    def test_validate_items_empty_list(self, validator):
        """Test item validation with empty list."""
        with pytest.raises(ValidationException) as exc_info:
            validator._validate_items([])

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR

    def test_validate_items_empty_name(self, validator):
        """Test item validation with empty product name."""
        invalid_items = [
            ProductResearchItemRequest(
                name="",  # Empty name
                category="Electronics"
            )
        ]

        with pytest.raises(ValidationException) as exc_info:
            validator._validate_items(invalid_items)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "name" in str(exc_info.value)

    def test_validate_items_empty_category(self, validator):
        """Test item validation with empty category."""
        invalid_items = [
            ProductResearchItemRequest(
                name="Test Product",
                category=""  # Empty category
            )
        ]

        with pytest.raises(ValidationException) as exc_info:
            validator._validate_items(invalid_items)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "category" in str(exc_info.value)

    def test_validate_priority_success(self, validator):
        """Test successful priority validation."""
        # Should not raise any exception for valid priorities
        validator._validate_priority(1)
        validator._validate_priority(5)
        validator._validate_priority(10)

    def test_validate_priority_too_low(self, validator):
        """Test priority validation with too low value."""
        with pytest.raises(ValidationException) as exc_info:
            validator._validate_priority(0)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR

    def test_validate_priority_too_high(self, validator):
        """Test priority validation with too high value."""
        with pytest.raises(ValidationException) as exc_info:
            validator._validate_priority(11)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR

    def test_validate_callback_url_valid_https(self, validator):
        """Test callback URL validation with valid HTTPS URL."""
        # Should not raise any exception
        validator._validate_callback_url("https://example.com/webhook")
        validator._validate_callback_url("https://api.example.com/callbacks/research")

    def test_validate_callback_url_valid_http(self, validator):
        """Test callback URL validation with valid HTTP URL."""
        # Should not raise any exception for HTTP URLs
        validator._validate_callback_url("http://localhost:8080/webhook")

    def test_validate_callback_url_invalid_scheme(self, validator):
        """Test callback URL validation with invalid scheme."""
        with pytest.raises(ValidationException) as exc_info:
            validator._validate_callback_url("ftp://example.com/webhook")

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "callback_url" in str(exc_info.value)

    def test_validate_callback_url_malformed(self, validator):
        """Test callback URL validation with malformed URL."""
        with pytest.raises(ValidationException) as exc_info:
            validator._validate_callback_url("not-a-url")

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR

    def test_transform_to_domain_items(self, validator):
        """Test transformation from request items to domain items."""
        request_items = [
            ProductResearchItemRequest(
                name="iPhone 15 Pro",
                description="Latest iPhone",
                category="Electronics",
                keywords=["smartphone", "apple"]
            )
        ]

        domain_items = validator._transform_to_domain_items(request_items)

        assert len(domain_items) == 1
        assert isinstance(domain_items[0], ProductResearchItem)
        assert domain_items[0].name == "iPhone 15 Pro"
        assert domain_items[0].description == "Latest iPhone"
        assert domain_items[0].category == "Electronics"
        assert domain_items[0].keywords == ["smartphone", "apple"]


class TestResponseFormatter:
    """Test response formatter functionality."""

    @pytest.fixture
    def formatter(self):
        """Create response formatter instance."""
        return ResponseFormatter()

    @pytest.fixture
    def sample_job(self):
        """Create sample research job."""
        items = [
            ProductResearchItem(
                name="iPhone 15 Pro",
                description="Latest iPhone with advanced features",
                category="Electronics",
                keywords=["smartphone", "apple", "mobile"]
            ),
            ProductResearchItem(
                name="MacBook Air M2",
                description="Lightweight laptop with M2 chip",
                category="Electronics",
                keywords=["laptop", "apple", "macbook"]
            ),
        ]
        job = ProductResearchJob(
            id=uuid4(),
            items=items,
            priority=7,
            status="completed",
            callback_url="https://example.com/webhook"
        )
        job.results = [
            {
                "name": "iPhone 15 Pro",
                "analysis": "Premium smartphone with advanced features",
                "market_info": {"price_range": "$999-$1199", "availability": "Available"},
                "status": "success"
            },
            {
                "name": "MacBook Air M2",
                "analysis": "Excellent performance laptop",
                "market_info": {"price_range": "$1099-$1499", "availability": "Available"},
                "status": "success"
            }
        ]
        return job

    @pytest.mark.asyncio
    async def test_format_job_response_success(self, formatter, sample_job):
        """Test successful job response formatting."""
        response = await formatter.format_job_response(sample_job)

        assert isinstance(response, ProductResearchResponse)
        assert response.id == str(sample_job.id)
        assert response.status == "completed"
        assert response.priority == 7
        assert response.callback_url == "https://example.com/webhook"
        assert len(response.items) == 2
        assert len(response.results) == 2

    @pytest.mark.asyncio
    async def test_format_job_response_without_results(self, formatter, sample_job):
        """Test job response formatting without results."""
        sample_job.results = None

        response = await formatter.format_job_response(sample_job)

        assert response.results is None
        assert len(response.items) == 2

    @pytest.mark.asyncio
    async def test_format_job_response_pending_status(self, formatter, sample_job):
        """Test job response formatting for pending job."""
        sample_job.status = "pending"
        sample_job.results = None

        response = await formatter.format_job_response(sample_job)

        assert response.status == "pending"
        assert response.results is None

    @pytest.mark.asyncio
    async def test_format_job_response_with_progress(self, formatter, sample_job):
        """Test job response formatting with progress information."""
        sample_job.progress_percentage = 75.0
        sample_job.processed_items = 6
        sample_job.total_items = 8

        response = await formatter.format_job_response(sample_job)

        assert response.progress_percentage == 75.0
        assert response.processed_items == 6
        assert response.total_items == 8

    def test_format_research_items(self, formatter):
        """Test research items formatting."""
        domain_items = [
            ProductResearchItem(
                name="Test Product",
                description="Test description",
                category="Electronics",
                keywords=["test", "product"]
            )
        ]

        formatted_items = formatter._format_research_items(domain_items)

        assert len(formatted_items) == 1
        assert isinstance(formatted_items[0], ProductResearchItemResponse)
        assert formatted_items[0].name == "Test Product"
        assert formatted_items[0].description == "Test description"
        assert formatted_items[0].category == "Electronics"
        assert formatted_items[0].keywords == ["test", "product"]

    def test_format_research_items_with_optional_fields(self, formatter):
        """Test research items formatting with optional fields."""
        domain_items = [
            ProductResearchItem(
                name="Test Product",
                category="Electronics"
                # description and keywords are optional
            )
        ]

        formatted_items = formatter._format_research_items(domain_items)

        assert formatted_items[0].name == "Test Product"
        assert formatted_items[0].description is None
        assert formatted_items[0].keywords == []

    def test_format_results_success(self, formatter):
        """Test results formatting."""
        raw_results = [
            {
                "name": "iPhone 15 Pro",
                "analysis": "Premium smartphone",
                "market_info": {"price": "$999"},
                "status": "success"
            }
        ]

        formatted_results = formatter._format_results(raw_results)

        assert len(formatted_results) == 1
        assert formatted_results[0]["name"] == "iPhone 15 Pro"
        assert formatted_results[0]["analysis"] == "Premium smartphone"
        assert "market_info" in formatted_results[0]

    def test_format_results_with_failures(self, formatter):
        """Test results formatting with failed items."""
        raw_results = [
            {
                "name": "Product 1",
                "analysis": "Good product",
                "status": "success"
            },
            {
                "name": "Product 2",
                "error": "Analysis failed",
                "status": "failed"
            }
        ]

        formatted_results = formatter._format_results(raw_results)

        assert len(formatted_results) == 2
        assert formatted_results[0]["status"] == "success"
        assert formatted_results[1]["status"] == "failed"
        assert "error" in formatted_results[1]

    def test_format_results_empty(self, formatter):
        """Test results formatting with empty results."""
        formatted_results = formatter._format_results([])

        assert formatted_results == []

    def test_format_results_none(self, formatter):
        """Test results formatting with None results."""
        formatted_results = formatter._format_results(None)

        assert formatted_results is None

    def test_safe_format_timestamp(self, formatter):
        """Test safe timestamp formatting."""
        from datetime import datetime, timezone

        # Test with valid datetime
        dt = datetime.now(timezone.utc)
        formatted = formatter._safe_format_timestamp(dt)
        assert isinstance(formatted, str)
        assert "T" in formatted  # ISO format includes 'T'

        # Test with None
        formatted = formatter._safe_format_timestamp(None)
        assert formatted is None

    def test_safe_format_optional_string(self, formatter):
        """Test safe optional string formatting."""
        # Test with valid string
        result = formatter._safe_format_optional_string("test")
        assert result == "test"

        # Test with None
        result = formatter._safe_format_optional_string(None)
        assert result is None

        # Test with empty string
        result = formatter._safe_format_optional_string("")
        assert result == ""

    @pytest.mark.asyncio
    async def test_format_job_response_handles_missing_fields(self, formatter):
        """Test job response formatting handles missing optional fields gracefully."""
        # Create minimal job with only required fields
        minimal_job = ProductResearchJob(
            id=uuid4(),
            items=[],
            priority=5,
            status="pending"
        )

        response = await formatter.format_job_response(minimal_job)

        assert isinstance(response, ProductResearchResponse)
        assert response.id is not None
        assert response.status == "pending"
        assert response.priority == 5
        assert response.items == []
        assert response.callback_url is None
        assert response.created_at is not None
