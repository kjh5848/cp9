"""Tests for product research functionality."""

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.domain.product_entities import (
    ProductResearchItem,
    ProductResearchResult,
    ProductReviews,
    ResearchStatus,
)
from app.infra.llm.perplexity_research import PerplexityResearchClient
from app.services.product_research_service import ProductResearchService


class TestProductResearchItem:
    """Tests for ProductResearchItem entity."""

    def test_create_valid_item(self):
        """Test creating a valid product research item."""
        item = ProductResearchItem(
            product_name="테스트 제품", category="가전디지털", price_exact=100000, currency="KRW"
        )

        assert item.product_name == "테스트 제품"
        assert item.category == "가전디지털"
        assert item.price_exact == 100000
        assert item.currency == "KRW"

    def test_invalid_empty_product_name(self):
        """Test validation for empty product name."""
        with pytest.raises(ValueError, match="Product name cannot be empty"):
            ProductResearchItem(product_name="", category="가전디지털", price_exact=100000)

    def test_invalid_empty_category(self):
        """Test validation for empty category."""
        with pytest.raises(ValueError, match="Category cannot be empty"):
            ProductResearchItem(product_name="테스트 제품", category="", price_exact=100000)

    def test_invalid_negative_price(self):
        """Test validation for negative price."""
        with pytest.raises(ValueError, match="Price cannot be negative"):
            ProductResearchItem(
                product_name="테스트 제품", category="가전디지털", price_exact=-1000
            )

    def test_to_dict(self):
        """Test converting item to dictionary."""
        item = ProductResearchItem(
            product_name="테스트 제품",
            category="가전디지털",
            price_exact=100000,
            currency="KRW",
            seller_or_store="테스트 스토어",
        )

        expected = {
            "product_name": "테스트 제품",
            "category": "가전디지털",
            "price_exact": 100000,
            "currency": "KRW",
            "seller_or_store": "테스트 스토어",
            "metadata": {},
        }

        assert item.to_dict() == expected


class TestProductReviews:
    """Tests for ProductReviews entity."""

    def test_create_valid_reviews(self):
        """Test creating valid product reviews."""
        reviews = ProductReviews(rating_avg=4.5, review_count=100)

        assert reviews.rating_avg == 4.5
        assert reviews.review_count == 100

    def test_invalid_rating_above_max(self):
        """Test validation for rating above maximum."""
        with pytest.raises(ValueError, match="Rating average must be between 0 and 5"):
            ProductReviews(rating_avg=5.5, review_count=10)

    def test_invalid_rating_below_min(self):
        """Test validation for rating below minimum."""
        with pytest.raises(ValueError, match="Rating average must be between 0 and 5"):
            ProductReviews(rating_avg=-1, review_count=10)

    def test_invalid_negative_review_count(self):
        """Test validation for negative review count."""
        with pytest.raises(ValueError, match="Review count cannot be negative"):
            ProductReviews(rating_avg=4.0, review_count=-5)


class TestProductResearchResult:
    """Tests for ProductResearchResult entity."""

    def test_mark_success(self):
        """Test marking result as successful."""
        result = ProductResearchResult(
            product_name="테스트 제품", category="가전디지털", price_exact=100000
        )

        result.mark_success()
        assert result.status == ResearchStatus.SUCCESS
        assert result.error_message is None

    def test_mark_error(self):
        """Test marking result as error."""
        result = ProductResearchResult()
        error_msg = "API 호출 실패"

        result.mark_error(error_msg)
        assert result.status == ResearchStatus.ERROR
        assert result.error_message == error_msg

    def test_mark_insufficient_sources(self):
        """Test marking result as having insufficient sources."""
        result = ProductResearchResult()
        missing_fields = ["reviews.rating_avg", "reviews.review_count"]
        suggested_queries = ["제품명 리뷰", "제품명 평점"]

        result.mark_insufficient_sources(missing_fields, suggested_queries)
        assert result.status == ResearchStatus.INSUFFICIENT_SOURCES
        assert result.missing_fields == missing_fields
        assert result.suggested_queries == suggested_queries

    def test_is_valid_success(self):
        """Test validation for successful result."""
        result = ProductResearchResult()
        result.status = ResearchStatus.SUCCESS
        result.reviews = ProductReviews(rating_avg=4.5, review_count=10)
        result.sources = ["source1", "source2", "source3"]

        assert result.is_valid() is True

    def test_is_valid_missing_reviews(self):
        """Test validation for result missing reviews."""
        result = ProductResearchResult()
        result.status = ResearchStatus.SUCCESS
        result.sources = ["source1", "source2", "source3"]

        assert result.is_valid() is False


@pytest.fixture
def sample_product_items():
    """Sample product items for testing."""
    return [
        ProductResearchItem(
            product_name="베이직스 노트북",
            category="가전디지털",
            price_exact=388000,
            currency="KRW",
        ),
        ProductResearchItem(
            product_name="레노버 아이디어패드",
            category="가전디지털",
            price_exact=339000,
            currency="KRW",
        ),
    ]


class TestPerplexityResearchClient:
    """Tests for Perplexity research client."""

    @pytest.fixture
    def client(self):
        """Create a test client."""
        return PerplexityResearchClient(
            api_key="test-key", api_url="https://api.test.com", timeout=30
        )

    def test_client_initialization(self, client):
        """Test client initialization."""
        assert client.api_key == "test-key"
        assert client.api_url == "https://api.test.com"
        assert client.timeout == 30
        assert "Authorization" in client.headers
        assert client.headers["Authorization"] == "Bearer test-key"

    def test_client_initialization_no_api_key(self):
        """Test client initialization without API key."""
        with patch("app.infra.llm.perplexity_research.settings") as mock_settings:
            mock_settings.perplexity_api_key = ""

            with pytest.raises(ValueError, match="Perplexity API key is required"):
                PerplexityResearchClient()

    @patch("httpx.AsyncClient")
    async def test_research_products_success(
        self, mock_client_class, client, sample_product_items
    ):
        """Test successful product research."""
        # Mock HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": """[
                        {
                            "product_name": "베이직스 노트북",
                            "brand": "베이직스",
                            "category": "가전디지털",
                            "price_exact": 388000,
                            "currency": "KRW",
                            "specs": {
                                "main": ["Intel CPU", "8GB RAM"],
                                "attributes": [],
                                "size_or_weight": "1.35kg",
                                "options": [],
                                "included_items": []
                            },
                            "reviews": {
                                "rating_avg": 4.3,
                                "review_count": 41,
                                "summary_positive": ["좋은 가성비"],
                                "summary_negative": ["터치패드 아쉬움"],
                                "notable_reviews": []
                            },
                            "sources": ["https://basic-s.com", "https://enuri.com", "https://danawa.com"],
                            "captured_at": "2024-01-20",
                            "status": "success"
                        }
                    ]"""
                    }
                }
            ],
            "citations": ["https://basic-s.com"],
        }
        mock_client.post.return_value = mock_response

        # Test
        results = await client.research_products(sample_product_items[:1])

        assert len(results) == 1
        assert results[0].product_name == "베이직스 노트북"
        assert results[0].brand == "베이직스"
        assert results[0].reviews.rating_avg == 4.3
        assert results[0].reviews.review_count == 41
        assert len(results[0].sources) == 3
        assert results[0].status == ResearchStatus.SUCCESS

    @patch("httpx.AsyncClient")
    async def test_research_products_too_many_items(self, mock_client_class, client):
        """Test research with too many items."""
        # Create 11 items (exceeds limit of 10)
        items = [
            ProductResearchItem(
                product_name=f"제품 {i}", category="가전디지털", price_exact=100000
            )
            for i in range(11)
        ]

        results = await client.research_products(items)

        assert len(results) == 1
        assert results[0].status == ResearchStatus.TOO_MANY_ITEMS

    @patch("httpx.AsyncClient")
    async def test_research_products_api_error(
        self, mock_client_class, client, sample_product_items
    ):
        """Test handling API errors."""
        # Mock HTTP client
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client

        # Mock API error response
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        mock_client.post.return_value = mock_response

        # Test
        results = await client.research_products(sample_product_items[:1])

        assert len(results) == 1
        assert results[0].status == ResearchStatus.ERROR
        assert "API request failed" in results[0].error_message


class TestProductResearchService:
    """Tests for ProductResearchService."""

    @pytest.fixture
    def service(self):
        """Create a test service."""
        return ProductResearchService()

    @patch("app.services.product_research_service.get_research_client")
    async def test_create_research_job(
        self, mock_get_client, service, sample_product_items
    ):
        """Test creating a research job."""
        # Mock research client
        mock_client = AsyncMock()
        mock_get_client.return_value = mock_client

        # Mock research results
        mock_results = [
            ProductResearchResult(
                product_name="베이직스 노트북",
                category="가전디지털",
                price_exact=388000,
                status=ResearchStatus.SUCCESS,
            )
        ]
        mock_client.research_products.return_value = mock_results

        # Test
        job = await service.create_research_job(sample_product_items[:1])

        assert job.total_items == 1
        assert job.status == ResearchStatus.PENDING
        assert len(job.items) == 1

    async def test_get_job_status(self, service, sample_product_items):
        """Test getting job status."""
        # Create a job
        job = await service.create_research_job(sample_product_items[:1])
        job_id = job.id

        # Get status
        status_job = await service.get_job_status(job_id)

        assert status_job is not None
        assert status_job.id == job_id

    async def test_get_job_status_not_found(self, service):
        """Test getting status for non-existent job."""
        fake_id = uuid4()

        status_job = await service.get_job_status(fake_id)

        assert status_job is None

    async def test_cancel_job(self, service, sample_product_items):
        """Test cancelling a job."""
        # Create and start a job
        job = await service.create_research_job(sample_product_items[:1])
        job.start()
        job_id = job.id

        # Cancel job
        cancelled = await service.cancel_job(job_id)

        assert cancelled is True

        # Check job status
        status_job = await service.get_job_status(job_id)
        assert status_job.status == ResearchStatus.ERROR
        assert status_job.metadata.get("cancelled") is True


@pytest.mark.asyncio
class TestAPIEndpoints:
    """Tests for API endpoints."""

    # Note: These would typically use FastAPI's TestClient
    # Here we're just testing the basic structure

    def test_product_research_request_validation(self):
        """Test request validation."""
        from app.schemas.product_research_in import (
            ProductItemRequest,
            ProductResearchRequest,
        )

        # Valid request
        valid_request = ProductResearchRequest(
            items=[
                ProductItemRequest(
                    product_name="테스트 제품",
                    category="가전디지털",
                    price_exact=100000,
                    currency="KRW",
                )
            ]
        )

        assert len(valid_request.items) == 1
        assert valid_request.items[0].product_name == "테스트 제품"

    def test_product_research_response_format(self):
        """Test response format."""
        from datetime import datetime

        from app.schemas.product_research_out import (
            ProductResearchResponse,
            ResearchMetadataResponse,
        )

        response = ProductResearchResponse(
            job_id=uuid4(),
            status="success",
            results=[],
            metadata=ResearchMetadataResponse(
                total_items=1,
                successful_items=1,
                failed_items=0,
                success_rate=1.0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
        )

        assert response.status == "success"
        assert response.metadata.success_rate == 1.0


if __name__ == "__main__":
    pytest.main([__file__])
