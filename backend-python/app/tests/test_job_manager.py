"""Tests for research job manager component."""

from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.core.exceptions import ValidationException
from app.domain.product_entities import ProductResearchItem, ProductResearchJob
from app.infra.db.repositories import ResearchJobRepository
from app.schemas.error_responses import ErrorCode
from app.services.research_components.job_manager import ResearchJobManager


class TestResearchJobManager:
    """Test research job manager functionality."""

    @pytest.fixture
    def mock_repository(self):
        """Create mock research job repository."""
        mock_repo = AsyncMock(spec=ResearchJobRepository)
        return mock_repo

    @pytest.fixture
    def job_manager(self, mock_repository):
        """Create job manager with mock repository."""
        return ResearchJobManager(mock_repository)

    @pytest.fixture
    def sample_items(self):
        """Create sample product research items."""
        return [
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

    @pytest.mark.asyncio
    async def test_create_job_success(self, job_manager, mock_repository, sample_items):
        """Test successful job creation."""
        # Mock repository response
        created_job = ProductResearchJob(
            id=uuid4(),
            items=sample_items,
            priority=5
        )
        mock_repository.create.return_value = created_job

        # Test job creation
        result = await job_manager.create_job(
            items=sample_items,
            priority=5,
            callback_url="https://example.com/callback"
        )

        # Assertions
        assert result is not None
        assert result.id == created_job.id
        assert len(result.items) == 2
        assert result.priority == 5
        assert result.callback_url == "https://example.com/callback"
        mock_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_job_with_default_priority(self, job_manager, mock_repository, sample_items):
        """Test job creation with default priority."""
        created_job = ProductResearchJob(
            id=uuid4(),
            items=sample_items,
            priority=5  # Default priority
        )
        mock_repository.create.return_value = created_job

        result = await job_manager.create_job(items=sample_items)

        assert result.priority == 5
        mock_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_job_empty_items_raises_validation_error(self, job_manager):
        """Test that creating job with empty items raises validation error."""
        with pytest.raises(ValidationException) as exc_info:
            await job_manager.create_job(items=[])

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "at least one item" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_create_job_too_many_items_raises_validation_error(self, job_manager):
        """Test that creating job with too many items raises validation error."""
        # Create 11 items (exceeds maximum of 10)
        too_many_items = [
            ProductResearchItem(
                name=f"Product {i}",
                description=f"Description {i}",
                category="Test"
            )
            for i in range(11)
        ]

        with pytest.raises(ValidationException) as exc_info:
            await job_manager.create_job(items=too_many_items)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "maximum batch size" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_create_job_invalid_priority_raises_validation_error(self, job_manager, sample_items):
        """Test that creating job with invalid priority raises validation error."""
        with pytest.raises(ValidationException) as exc_info:
            await job_manager.create_job(items=sample_items, priority=15)  # Max is 10

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "priority must be" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_get_job_by_id_success(self, job_manager, mock_repository):
        """Test successful job retrieval by ID."""
        job_id = uuid4()
        expected_job = ProductResearchJob(id=job_id)
        mock_repository.get_by_id.return_value = expected_job

        result = await job_manager.get_job_by_id(job_id)

        assert result == expected_job
        mock_repository.get_by_id.assert_called_once_with(job_id)

    @pytest.mark.asyncio
    async def test_get_job_by_id_not_found(self, job_manager, mock_repository):
        """Test job retrieval when job doesn't exist."""
        job_id = uuid4()
        mock_repository.get_by_id.return_value = None

        result = await job_manager.get_job_by_id(job_id)

        assert result is None
        mock_repository.get_by_id.assert_called_once_with(job_id)

    @pytest.mark.asyncio
    async def test_update_job_status_success(self, job_manager, mock_repository):
        """Test successful job status update."""
        job_id = uuid4()
        existing_job = ProductResearchJob(id=job_id)
        mock_repository.get_by_id.return_value = existing_job
        mock_repository.update.return_value = existing_job

        result = await job_manager.update_job_status(job_id, "processing")

        assert result is not None
        assert result.status == "processing"
        mock_repository.get_by_id.assert_called_once_with(job_id)
        mock_repository.update.assert_called_once_with(existing_job)

    @pytest.mark.asyncio
    async def test_update_job_status_job_not_found(self, job_manager, mock_repository):
        """Test job status update when job doesn't exist."""
        job_id = uuid4()
        mock_repository.get_by_id.return_value = None

        result = await job_manager.update_job_status(job_id, "processing")

        assert result is None
        mock_repository.get_by_id.assert_called_once_with(job_id)
        mock_repository.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_cancel_job_success(self, job_manager, mock_repository):
        """Test successful job cancellation."""
        job_id = uuid4()
        existing_job = ProductResearchJob(id=job_id, status="pending")
        mock_repository.get_by_id.return_value = existing_job
        mock_repository.update.return_value = existing_job

        result = await job_manager.cancel_job(job_id)

        assert result is True
        assert existing_job.status == "cancelled"
        mock_repository.update.assert_called_once_with(existing_job)

    @pytest.mark.asyncio
    async def test_cancel_job_not_found(self, job_manager, mock_repository):
        """Test job cancellation when job doesn't exist."""
        job_id = uuid4()
        mock_repository.get_by_id.return_value = None

        result = await job_manager.cancel_job(job_id)

        assert result is False
        mock_repository.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_cancel_job_already_completed(self, job_manager, mock_repository):
        """Test that completed jobs cannot be cancelled."""
        job_id = uuid4()
        completed_job = ProductResearchJob(id=job_id, status="completed")
        mock_repository.get_by_id.return_value = completed_job

        with pytest.raises(ValidationException) as exc_info:
            await job_manager.cancel_job(job_id)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "cannot be cancelled" in str(exc_info.value)
        mock_repository.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_cancel_job_already_cancelled(self, job_manager, mock_repository):
        """Test that already cancelled jobs cannot be cancelled again."""
        job_id = uuid4()
        cancelled_job = ProductResearchJob(id=job_id, status="cancelled")
        mock_repository.get_by_id.return_value = cancelled_job

        with pytest.raises(ValidationException) as exc_info:
            await job_manager.cancel_job(job_id)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR
        assert "already cancelled" in str(exc_info.value)
        mock_repository.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_job_with_results_success(self, job_manager, mock_repository):
        """Test successful job retrieval with results."""
        job_id = uuid4()
        job_with_results = ProductResearchJob(id=job_id)
        job_with_results.results = [{"product": "iPhone", "analysis": "Great phone"}]
        mock_repository.get_by_id_with_results.return_value = job_with_results

        result = await job_manager.get_job_with_results(job_id)

        assert result == job_with_results
        assert len(result.results) == 1
        mock_repository.get_by_id_with_results.assert_called_once_with(job_id, True)

    @pytest.mark.asyncio
    async def test_get_job_with_results_exclude_failed(self, job_manager, mock_repository):
        """Test job retrieval with results excluding failed items."""
        job_id = uuid4()
        job_with_results = ProductResearchJob(id=job_id)
        mock_repository.get_by_id_with_results.return_value = job_with_results

        result = await job_manager.get_job_with_results(job_id, include_failed=False)

        assert result == job_with_results
        mock_repository.get_by_id_with_results.assert_called_once_with(job_id, False)

    @pytest.mark.asyncio
    async def test_get_jobs_by_status_success(self, job_manager, mock_repository):
        """Test successful job retrieval by status."""
        pending_jobs = [
            ProductResearchJob(id=uuid4(), status="pending"),
            ProductResearchJob(id=uuid4(), status="pending"),
        ]
        mock_repository.get_by_status.return_value = pending_jobs

        result = await job_manager.get_jobs_by_status("pending")

        assert len(result) == 2
        assert all(job.status == "pending" for job in result)
        mock_repository.get_by_status.assert_called_once_with("pending")

    def test_validate_items_success(self, job_manager, sample_items):
        """Test successful items validation."""
        # Should not raise any exception
        job_manager._validate_items(sample_items)

    def test_validate_items_empty_list_raises_error(self, job_manager):
        """Test that empty items list raises validation error."""
        with pytest.raises(ValidationException) as exc_info:
            job_manager._validate_items([])

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR

    def test_validate_items_too_many_raises_error(self, job_manager):
        """Test that too many items raises validation error."""
        too_many_items = [
            ProductResearchItem(name=f"Product {i}", category="Test")
            for i in range(11)
        ]

        with pytest.raises(ValidationException) as exc_info:
            job_manager._validate_items(too_many_items)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR

    def test_validate_priority_success(self, job_manager):
        """Test successful priority validation."""
        # Should not raise any exception for valid priorities
        job_manager._validate_priority(1)
        job_manager._validate_priority(5)
        job_manager._validate_priority(10)

    def test_validate_priority_too_low_raises_error(self, job_manager):
        """Test that priority too low raises validation error."""
        with pytest.raises(ValidationException) as exc_info:
            job_manager._validate_priority(0)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR

    def test_validate_priority_too_high_raises_error(self, job_manager):
        """Test that priority too high raises validation error."""
        with pytest.raises(ValidationException) as exc_info:
            job_manager._validate_priority(11)

        assert exc_info.value.error_code == ErrorCode.VALIDATION_ERROR

    @pytest.mark.asyncio
    async def test_repository_error_handling(self, job_manager, mock_repository, sample_items):
        """Test error handling when repository operations fail."""
        # Mock repository to raise an exception
        mock_repository.create.side_effect = Exception("Database connection failed")

        # Should propagate the exception
        with pytest.raises(Exception, match="Database connection failed"):
            await job_manager.create_job(items=sample_items)

    @pytest.mark.asyncio
    async def test_concurrent_job_creation(self, job_manager, mock_repository, sample_items):
        """Test handling of concurrent job creation requests."""
        # Mock repository to return different jobs for concurrent calls
        job1 = ProductResearchJob(id=uuid4(), items=sample_items[:1])
        job2 = ProductResearchJob(id=uuid4(), items=sample_items[1:])
        mock_repository.create.side_effect = [job1, job2]

        # Create jobs concurrently
        import asyncio
        results = await asyncio.gather(
            job_manager.create_job(items=sample_items[:1]),
            job_manager.create_job(items=sample_items[1:])
        )

        assert len(results) == 2
        assert results[0].id != results[1].id
        assert mock_repository.create.call_count == 2
