"""Tests for research executor component."""

from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.core.exceptions import ExternalServiceException
from app.domain.product_entities import ProductResearchItem, ProductResearchJob
from app.infra.llm.perplexity_research_coordinator import PerplexityResearchCoordinator
from app.schemas.error_responses import ErrorCode
from app.services.research_components.executor import ResearchExecutor


class TestResearchExecutor:
    """Test research executor functionality."""

    @pytest.fixture
    def mock_perplexity_coordinator(self):
        """Create mock Perplexity research coordinator."""
        mock_coordinator = AsyncMock(spec=PerplexityResearchCoordinator)
        return mock_coordinator

    @pytest.fixture
    def executor(self, mock_perplexity_coordinator):
        """Create research executor with mock coordinator."""
        return ResearchExecutor(mock_perplexity_coordinator)

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
        return ProductResearchJob(
            id=uuid4(),
            items=items,
            priority=5
        )

    @pytest.mark.asyncio
    async def test_execute_research_success(self, executor, mock_perplexity_coordinator, sample_job):
        """Test successful research execution."""
        # Mock successful research results
        expected_results = [
            {
                "name": "iPhone 15 Pro",
                "analysis": "Premium smartphone with advanced camera",
                "market_info": {"price_range": "$999-$1199", "availability": "Available"},
                "competitors": ["Samsung Galaxy S24", "Google Pixel 8 Pro"]
            },
            {
                "name": "MacBook Air M2",
                "analysis": "Excellent performance-to-weight ratio",
                "market_info": {"price_range": "$1099-$1499", "availability": "Available"},
                "competitors": ["Dell XPS 13", "HP Spectre x360"]
            }
        ]
        mock_perplexity_coordinator.research_products.return_value = expected_results

        # Execute research
        results = await executor.execute_research(sample_job)

        # Assertions
        assert results is not None
        assert len(results) == 2
        assert results[0]["name"] == "iPhone 15 Pro"
        assert results[1]["name"] == "MacBook Air M2"
        assert "analysis" in results[0]
        assert "market_info" in results[0]
        assert "competitors" in results[0]

        # Verify coordinator was called correctly
        mock_perplexity_coordinator.research_products.assert_called_once_with(sample_job.items)

    @pytest.mark.asyncio
    async def test_execute_research_partial_failure(self, executor, mock_perplexity_coordinator, sample_job):
        """Test research execution with partial failures."""
        # Mock partial failure results (one item fails)
        partial_results = [
            {
                "name": "iPhone 15 Pro",
                "analysis": "Premium smartphone with advanced camera",
                "market_info": {"price_range": "$999-$1199", "availability": "Available"},
                "competitors": ["Samsung Galaxy S24", "Google Pixel 8 Pro"]
            },
            {
                "name": "MacBook Air M2",
                "error": "Unable to retrieve information",
                "status": "failed"
            }
        ]
        mock_perplexity_coordinator.research_products.return_value = partial_results

        results = await executor.execute_research(sample_job)

        assert len(results) == 2
        assert "analysis" in results[0]  # First item succeeded
        assert "error" in results[1]     # Second item failed
        assert results[1]["status"] == "failed"

    @pytest.mark.asyncio
    async def test_execute_research_coordinator_failure(self, executor, mock_perplexity_coordinator, sample_job):
        """Test research execution when coordinator fails completely."""
        # Mock coordinator failure
        mock_perplexity_coordinator.research_products.side_effect = ExternalServiceException(
            error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
            message="Perplexity API unavailable"
        )

        # Should propagate the exception
        with pytest.raises(ExternalServiceException) as exc_info:
            await executor.execute_research(sample_job)

        assert exc_info.value.error_code == ErrorCode.EXTERNAL_SERVICE_ERROR
        assert "Perplexity API unavailable" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_execute_research_empty_items(self, executor, mock_perplexity_coordinator):
        """Test research execution with empty items list."""
        empty_job = ProductResearchJob(id=uuid4(), items=[], priority=5)
        mock_perplexity_coordinator.research_products.return_value = []

        results = await executor.execute_research(empty_job)

        assert results == []
        mock_perplexity_coordinator.research_products.assert_called_once_with([])

    @pytest.mark.asyncio
    async def test_execute_research_with_retries(self, executor, mock_perplexity_coordinator, sample_job):
        """Test research execution with retry logic."""
        # Mock first call fails, second succeeds
        expected_results = [{"name": "iPhone 15 Pro", "analysis": "Great phone"}]
        mock_perplexity_coordinator.research_products.side_effect = [
            ExternalServiceException(error_code=ErrorCode.RATE_LIMIT_ERROR, message="Rate limited"),
            expected_results
        ]

        with patch.object(executor, '_should_retry_research', return_value=True):
            with patch('asyncio.sleep'):  # Mock sleep to speed up test
                results = await executor.execute_research_with_retries(sample_job, max_retries=2)

        assert results == expected_results
        assert mock_perplexity_coordinator.research_products.call_count == 2

    @pytest.mark.asyncio
    async def test_execute_research_with_retries_exhausted(self, executor, mock_perplexity_coordinator, sample_job):
        """Test research execution when all retries are exhausted."""
        # Mock all calls fail
        mock_perplexity_coordinator.research_products.side_effect = ExternalServiceException(
            error_code=ErrorCode.RATE_LIMIT_ERROR,
            message="Rate limited"
        )

        with patch.object(executor, '_should_retry_research', return_value=True):
            with patch('asyncio.sleep'):  # Mock sleep to speed up test
                with pytest.raises(ExternalServiceException):
                    await executor.execute_research_with_retries(sample_job, max_retries=2)

        assert mock_perplexity_coordinator.research_products.call_count == 3  # Initial + 2 retries

    @pytest.mark.asyncio
    async def test_execute_batch_research_success(self, executor, mock_perplexity_coordinator):
        """Test successful batch research execution."""
        # Create multiple jobs
        jobs = [
            ProductResearchJob(
                id=uuid4(),
                items=[ProductResearchItem(name="Product 1", category="Electronics")],
                priority=5
            ),
            ProductResearchJob(
                id=uuid4(),
                items=[ProductResearchItem(name="Product 2", category="Electronics")],
                priority=3
            ),
        ]

        # Mock results for each job
        mock_perplexity_coordinator.research_products.side_effect = [
            [{"name": "Product 1", "analysis": "Good product"}],
            [{"name": "Product 2", "analysis": "Another good product"}]
        ]

        results = await executor.execute_batch_research(jobs)

        assert len(results) == 2
        assert results[0][0]["name"] == "Product 1"
        assert results[1][0]["name"] == "Product 2"
        assert mock_perplexity_coordinator.research_products.call_count == 2

    @pytest.mark.asyncio
    async def test_execute_batch_research_partial_failure(self, executor, mock_perplexity_coordinator):
        """Test batch research execution with some job failures."""
        jobs = [
            ProductResearchJob(
                id=uuid4(),
                items=[ProductResearchItem(name="Product 1", category="Electronics")],
                priority=5
            ),
            ProductResearchJob(
                id=uuid4(),
                items=[ProductResearchItem(name="Product 2", category="Electronics")],
                priority=3
            ),
        ]

        # Mock first job succeeds, second fails
        mock_perplexity_coordinator.research_products.side_effect = [
            [{"name": "Product 1", "analysis": "Good product"}],
            ExternalServiceException(error_code=ErrorCode.EXTERNAL_SERVICE_ERROR, message="API failed")
        ]

        results = await executor.execute_batch_research(jobs, fail_fast=False)

        assert len(results) == 2
        assert results[0][0]["name"] == "Product 1"  # First job succeeded
        assert isinstance(results[1], Exception)      # Second job failed

    @pytest.mark.asyncio
    async def test_execute_batch_research_fail_fast(self, executor, mock_perplexity_coordinator):
        """Test batch research execution with fail_fast=True."""
        jobs = [
            ProductResearchJob(
                id=uuid4(),
                items=[ProductResearchItem(name="Product 1", category="Electronics")],
                priority=5
            ),
            ProductResearchJob(
                id=uuid4(),
                items=[ProductResearchItem(name="Product 2", category="Electronics")],
                priority=3
            ),
        ]

        # Mock first job fails
        mock_perplexity_coordinator.research_products.side_effect = ExternalServiceException(
            error_code=ErrorCode.EXTERNAL_SERVICE_ERROR,
            message="API failed"
        )

        with pytest.raises(ExternalServiceException):
            await executor.execute_batch_research(jobs, fail_fast=True)

        # Should only call once due to fail_fast
        assert mock_perplexity_coordinator.research_products.call_count == 1

    def test_should_retry_research_rate_limit(self, executor):
        """Test retry logic for rate limit errors."""
        rate_limit_error = ExternalServiceException(
            error_code=ErrorCode.RATE_LIMIT_ERROR,
            message="Rate limited"
        )

        assert executor._should_retry_research(rate_limit_error) is True

    def test_should_retry_research_timeout(self, executor):
        """Test retry logic for timeout errors."""
        timeout_error = ExternalServiceException(
            error_code=ErrorCode.TIMEOUT_ERROR,
            message="Request timeout"
        )

        assert executor._should_retry_research(timeout_error) is True

    def test_should_not_retry_research_validation(self, executor):
        """Test that validation errors are not retried."""
        validation_error = ExternalServiceException(
            error_code=ErrorCode.VALIDATION_ERROR,
            message="Invalid request"
        )

        assert executor._should_retry_research(validation_error) is False

    def test_should_not_retry_research_non_retryable(self, executor):
        """Test that non-retryable errors are not retried."""
        auth_error = ExternalServiceException(
            error_code=ErrorCode.AUTHENTICATION_ERROR,
            message="Invalid API key"
        )

        assert executor._should_retry_research(auth_error) is False

    def test_calculate_retry_delay_exponential_backoff(self, executor):
        """Test exponential backoff calculation for retry delays."""
        # Test exponential backoff: 1s, 2s, 4s, 8s, etc.
        delay1 = executor._calculate_retry_delay(1)
        delay2 = executor._calculate_retry_delay(2)
        delay3 = executor._calculate_retry_delay(3)

        assert delay1 == 1.0
        assert delay2 == 2.0
        assert delay3 == 4.0

    def test_calculate_retry_delay_max_cap(self, executor):
        """Test that retry delay has a maximum cap."""
        # Test that delay doesn't exceed maximum (e.g., 60 seconds)
        long_delay = executor._calculate_retry_delay(10)  # 2^10 = 1024 seconds

        assert long_delay <= 60.0  # Should be capped at max delay

    @pytest.mark.asyncio
    async def test_execute_research_logs_performance(self, executor, mock_perplexity_coordinator, sample_job):
        """Test that research execution logs performance metrics."""
        mock_perplexity_coordinator.research_products.return_value = [
            {"name": "iPhone 15 Pro", "analysis": "Great phone"}
        ]

        with patch('app.services.research_components.executor.logger') as mock_logger:
            await executor.execute_research(sample_job)

            # Verify that performance metrics are logged
            mock_logger.info.assert_called()

            # Check if execution time is logged
            log_calls = mock_logger.info.call_args_list
            performance_logged = any(
                "execution_time" in str(call) or "performance" in str(call)
                for call in log_calls
            )
            assert performance_logged

    @pytest.mark.asyncio
    async def test_execute_research_handles_large_batch(self, executor, mock_perplexity_coordinator):
        """Test research execution with large batch of items."""
        # Create job with maximum allowed items (10)
        large_items = [
            ProductResearchItem(
                name=f"Product {i}",
                description=f"Description {i}",
                category="Electronics",
                keywords=[f"keyword{i}"]
            )
            for i in range(10)
        ]
        large_job = ProductResearchJob(id=uuid4(), items=large_items, priority=5)

        # Mock results for all items
        expected_results = [
            {"name": f"Product {i}", "analysis": f"Analysis for product {i}"}
            for i in range(10)
        ]
        mock_perplexity_coordinator.research_products.return_value = expected_results

        results = await executor.execute_research(large_job)

        assert len(results) == 10
        assert all("analysis" in result for result in results)
        mock_perplexity_coordinator.research_products.assert_called_once_with(large_items)
