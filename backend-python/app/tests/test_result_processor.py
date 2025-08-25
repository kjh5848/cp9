"""Tests for research result processor component."""

from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.core.exceptions import ValidationException
from app.domain.product_entities import ProductResearchItem, ProductResearchJob
from app.infra.db.repositories import ResearchJobRepository
from app.schemas.error_responses import ErrorCode
from app.services.research_components.result_processor import ResearchResultProcessor


class TestResearchResultProcessor:
    """Test research result processor functionality."""

    @pytest.fixture
    def mock_repository(self):
        """Create mock research job repository."""
        mock_repo = AsyncMock(spec=ResearchJobRepository)
        return mock_repo

    @pytest.fixture
    def result_processor(self, mock_repository):
        """Create result processor with mock repository."""
        return ResearchResultProcessor(mock_repository)

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
            priority=5,
            status="processing"
        )

    @pytest.fixture
    def sample_research_results(self):
        """Create sample research results."""
        return [
            {
                "name": "iPhone 15 Pro",
                "analysis": "Premium smartphone with advanced camera system and A17 Pro chip",
                "market_info": {
                    "price_range": "$999-$1199",
                    "availability": "Available",
                    "rating": 4.5,
                    "reviews_count": 15420
                },
                "competitors": ["Samsung Galaxy S24", "Google Pixel 8 Pro"],
                "features": ["Camera", "Performance", "Display"],
                "status": "success"
            },
            {
                "name": "MacBook Air M2",
                "analysis": "Excellent performance-to-weight ratio with M2 chip efficiency",
                "market_info": {
                    "price_range": "$1099-$1499",
                    "availability": "Available",
                    "rating": 4.7,
                    "reviews_count": 8930
                },
                "competitors": ["Dell XPS 13", "HP Spectre x360"],
                "features": ["Performance", "Battery Life", "Design"],
                "status": "success"
            }
        ]

    @pytest.mark.asyncio
    async def test_process_results_success(self, result_processor, mock_repository, sample_job, sample_research_results):
        """Test successful result processing."""
        mock_repository.get_by_id.return_value = sample_job
        mock_repository.update.return_value = sample_job

        processed_job = await result_processor.process_results(sample_job.id, sample_research_results)

        # Assertions
        assert processed_job is not None
        assert processed_job.status == "completed"
        assert processed_job.completed_at is not None
        assert len(processed_job.results) == 2
        assert all("analysis" in result for result in processed_job.results)
        assert all("market_info" in result for result in processed_job.results)

        # Verify repository calls
        mock_repository.get_by_id.assert_called_once_with(sample_job.id)
        mock_repository.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_results_job_not_found(self, result_processor, mock_repository, sample_research_results):
        """Test result processing when job doesn't exist."""
        job_id = uuid4()
        mock_repository.get_by_id.return_value = None

        result = await result_processor.process_results(job_id, sample_research_results)

        assert result is None
        mock_repository.get_by_id.assert_called_once_with(job_id)
        mock_repository.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_process_results_with_partial_failures(self, result_processor, mock_repository, sample_job):
        """Test result processing with some failed items."""
        mixed_results = [
            {
                "name": "iPhone 15 Pro",
                "analysis": "Premium smartphone with advanced features",
                "market_info": {"price_range": "$999-$1199", "availability": "Available"},
                "status": "success"
            },
            {
                "name": "MacBook Air M2",
                "error": "Unable to retrieve market information",
                "error_code": "EXTERNAL_SERVICE_ERROR",
                "status": "failed"
            }
        ]

        mock_repository.get_by_id.return_value = sample_job
        mock_repository.update.return_value = sample_job

        processed_job = await result_processor.process_results(sample_job.id, mixed_results)

        assert processed_job.status == "completed_with_errors"
        assert len(processed_job.results) == 2
        assert processed_job.results[0]["status"] == "success"
        assert processed_job.results[1]["status"] == "failed"
        assert "error" in processed_job.results[1]

    @pytest.mark.asyncio
    async def test_process_results_all_failed(self, result_processor, mock_repository, sample_job):
        """Test result processing when all items failed."""
        failed_results = [
            {
                "name": "iPhone 15 Pro",
                "error": "API rate limit exceeded",
                "error_code": "RATE_LIMIT_ERROR",
                "status": "failed"
            },
            {
                "name": "MacBook Air M2",
                "error": "Service temporarily unavailable",
                "error_code": "EXTERNAL_SERVICE_ERROR",
                "status": "failed"
            }
        ]

        mock_repository.get_by_id.return_value = sample_job
        mock_repository.update.return_value = sample_job

        processed_job = await result_processor.process_results(sample_job.id, failed_results)

        assert processed_job.status == "failed"
        assert len(processed_job.results) == 2
        assert all(result["status"] == "failed" for result in processed_job.results)

    @pytest.mark.asyncio
    async def test_process_results_empty_results(self, result_processor, mock_repository, sample_job):
        """Test result processing with empty results."""
        mock_repository.get_by_id.return_value = sample_job
        mock_repository.update.return_value = sample_job

        processed_job = await result_processor.process_results(sample_job.id, [])

        assert processed_job.status == "completed"
        assert processed_job.results == []

    @pytest.mark.asyncio
    async def test_process_results_validates_result_format(self, result_processor, mock_repository, sample_job):
        """Test that result processing validates result format."""
        invalid_results = [
            {
                # Missing required 'name' field
                "analysis": "Some analysis",
                "status": "success"
            }
        ]

        mock_repository.get_by_id.return_value = sample_job

        with pytest.raises(ValidationException) as exc_info:
            await result_processor.process_results(sample_job.id, invalid_results)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "name" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_update_job_progress_success(self, result_processor, mock_repository, sample_job):
        """Test successful job progress update."""
        mock_repository.get_by_id.return_value = sample_job
        mock_repository.update.return_value = sample_job

        updated_job = await result_processor.update_job_progress(
            sample_job.id,
            processed_items=1,
            total_items=2,
            current_status="processing"
        )

        assert updated_job is not None
        assert updated_job.progress_percentage == 50.0  # 1/2 * 100
        assert updated_job.status == "processing"

    @pytest.mark.asyncio
    async def test_update_job_progress_completion(self, result_processor, mock_repository, sample_job):
        """Test job progress update when completion is reached."""
        mock_repository.get_by_id.return_value = sample_job
        mock_repository.update.return_value = sample_job

        updated_job = await result_processor.update_job_progress(
            sample_job.id,
            processed_items=2,
            total_items=2,
            current_status="processing"
        )

        assert updated_job.progress_percentage == 100.0
        # Status should remain as provided, not auto-completed
        assert updated_job.status == "processing"

    @pytest.mark.asyncio
    async def test_enrich_results_with_metadata(self, result_processor, sample_research_results):
        """Test result enrichment with metadata."""
        enriched_results = await result_processor.enrich_results_with_metadata(
            sample_research_results,
            job_priority=8,
            processing_context={"batch_size": 2, "processing_time": 45.5}
        )

        assert len(enriched_results) == 2
        for result in enriched_results:
            assert "metadata" in result
            assert result["metadata"]["job_priority"] == 8
            assert result["metadata"]["batch_size"] == 2
            assert result["metadata"]["processing_time"] == 45.5
            assert "processed_at" in result["metadata"]

    @pytest.mark.asyncio
    async def test_filter_results_by_status(self, result_processor):
        """Test filtering results by status."""
        mixed_results = [
            {"name": "Product 1", "status": "success", "analysis": "Good"},
            {"name": "Product 2", "status": "failed", "error": "API error"},
            {"name": "Product 3", "status": "success", "analysis": "Excellent"},
            {"name": "Product 4", "status": "partial", "analysis": "Limited info"}
        ]

        # Filter successful results only
        success_results = await result_processor.filter_results_by_status(mixed_results, "success")
        assert len(success_results) == 2
        assert all(r["status"] == "success" for r in success_results)

        # Filter failed results only
        failed_results = await result_processor.filter_results_by_status(mixed_results, "failed")
        assert len(failed_results) == 1
        assert failed_results[0]["status"] == "failed"

        # Filter all results
        all_results = await result_processor.filter_results_by_status(mixed_results, None)
        assert len(all_results) == 4

    @pytest.mark.asyncio
    async def test_calculate_result_statistics(self, result_processor, sample_research_results):
        """Test calculation of result statistics."""
        stats = await result_processor.calculate_result_statistics(sample_research_results)

        assert stats["total_items"] == 2
        assert stats["successful_items"] == 2
        assert stats["failed_items"] == 0
        assert stats["success_rate"] == 100.0
        assert "processing_time" in stats
        assert "average_analysis_length" in stats

    @pytest.mark.asyncio
    async def test_calculate_result_statistics_with_failures(self, result_processor):
        """Test statistics calculation with mixed success/failure results."""
        mixed_results = [
            {
                "name": "Product 1",
                "analysis": "Good product with great features",
                "status": "success"
            },
            {
                "name": "Product 2",
                "error": "Unable to analyze",
                "status": "failed"
            },
            {
                "name": "Product 3",
                "analysis": "Excellent quality",
                "status": "success"
            }
        ]

        stats = await result_processor.calculate_result_statistics(mixed_results)

        assert stats["total_items"] == 3
        assert stats["successful_items"] == 2
        assert stats["failed_items"] == 1
        assert stats["success_rate"] == 66.67  # 2/3 * 100, rounded

    def test_validate_result_format_success(self, result_processor):
        """Test successful result format validation."""
        valid_result = {
            "name": "iPhone 15 Pro",
            "analysis": "Great smartphone",
            "status": "success"
        }

        # Should not raise any exception
        result_processor._validate_result_format(valid_result)

    def test_validate_result_format_missing_name(self, result_processor):
        """Test result format validation with missing name."""
        invalid_result = {
            "analysis": "Great smartphone",
            "status": "success"
        }

        with pytest.raises(ValidationException) as exc_info:
            result_processor._validate_result_format(invalid_result)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "name" in str(exc_info.value).lower()

    def test_validate_result_format_missing_status(self, result_processor):
        """Test result format validation with missing status."""
        invalid_result = {
            "name": "iPhone 15 Pro",
            "analysis": "Great smartphone"
        }

        with pytest.raises(ValidationException) as exc_info:
            result_processor._validate_result_format(invalid_result)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "status" in str(exc_info.value).lower()

    def test_validate_result_format_invalid_status(self, result_processor):
        """Test result format validation with invalid status value."""
        invalid_result = {
            "name": "iPhone 15 Pro",
            "analysis": "Great smartphone",
            "status": "invalid_status"
        }

        with pytest.raises(ValidationException) as exc_info:
            result_processor._validate_result_format(invalid_result)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "status" in str(exc_info.value).lower()

    def test_determine_overall_status_all_success(self, result_processor):
        """Test overall status determination when all items succeed."""
        success_results = [
            {"name": "Product 1", "status": "success"},
            {"name": "Product 2", "status": "success"}
        ]

        status = result_processor._determine_overall_status(success_results)
        assert status == "completed"

    def test_determine_overall_status_all_failed(self, result_processor):
        """Test overall status determination when all items fail."""
        failed_results = [
            {"name": "Product 1", "status": "failed"},
            {"name": "Product 2", "status": "failed"}
        ]

        status = result_processor._determine_overall_status(failed_results)
        assert status == "failed"

    def test_determine_overall_status_mixed(self, result_processor):
        """Test overall status determination with mixed results."""
        mixed_results = [
            {"name": "Product 1", "status": "success"},
            {"name": "Product 2", "status": "failed"}
        ]

        status = result_processor._determine_overall_status(mixed_results)
        assert status == "completed_with_errors"

    def test_determine_overall_status_empty(self, result_processor):
        """Test overall status determination with empty results."""
        status = result_processor._determine_overall_status([])
        assert status == "completed"

    @pytest.mark.asyncio
    async def test_process_results_logs_performance(self, result_processor, mock_repository, sample_job, sample_research_results):
        """Test that result processing logs performance metrics."""
        mock_repository.get_by_id.return_value = sample_job
        mock_repository.update.return_value = sample_job

        with patch('app.services.research_components.result_processor.logger') as mock_logger:
            await result_processor.process_results(sample_job.id, sample_research_results)

            # Verify that performance metrics are logged
            mock_logger.info.assert_called()

            # Check if processing metrics are logged
            log_calls = mock_logger.info.call_args_list
            metrics_logged = any(
                "processing_time" in str(call) or "results_processed" in str(call)
                for call in log_calls
            )
            assert metrics_logged

    @pytest.mark.asyncio
    async def test_repository_error_handling(self, result_processor, mock_repository, sample_job, sample_research_results):
        """Test error handling when repository operations fail."""
        mock_repository.get_by_id.return_value = sample_job
        mock_repository.update.side_effect = Exception("Database connection failed")

        # Should propagate the exception
        with pytest.raises(Exception, match="Database connection failed"):
            await result_processor.process_results(sample_job.id, sample_research_results)
