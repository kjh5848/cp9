"""Tests for research functionality."""

import pytest
from unittest.mock import AsyncMock, Mock

from app.domain.entities import Item, JobStatus, ResearchJob
from app.domain.usecases import ResearchUseCases
from app.services.research_service import ResearchService
from app.utils.hashing import calculate_item_hash


class TestResearchUseCases:
    """Test research use cases."""

    def test_validate_item_success(self):
        """Test successful item validation."""
        item = Item(name="Test Product", price=99.99, category="Electronics")
        # Should not raise any exception
        ResearchUseCases.validate_item(item)

    def test_validate_item_empty_name(self):
        """Test item validation with empty name."""
        item = Item(name="", price=99.99)
        with pytest.raises(ValueError, match="Item name cannot be empty"):
            ResearchUseCases.validate_item(item)

    def test_validate_item_negative_price(self):
        """Test item validation with negative price."""
        item = Item(name="Test Product", price=-10.0)
        with pytest.raises(ValueError, match="Item price cannot be less than"):
            ResearchUseCases.validate_item(item)

    def test_validate_item_price_too_high(self):
        """Test item validation with price too high."""
        item = Item(name="Test Product", price=2000000.0)
        with pytest.raises(ValueError, match="Item price cannot exceed"):
            ResearchUseCases.validate_item(item)

    def test_validate_batch_size_success(self):
        """Test successful batch size validation."""
        items = [
            Item(name="Product 1", price=10.0),
            Item(name="Product 2", price=20.0),
        ]
        # Should not raise any exception
        ResearchUseCases.validate_batch_size(items)

    def test_validate_batch_size_too_large(self):
        """Test batch size validation with too many items."""
        items = [Item(name=f"Product {i}", price=10.0) for i in range(15)]
        with pytest.raises(ValueError, match="Batch size cannot exceed"):
            ResearchUseCases.validate_batch_size(items)

    def test_validate_batch_size_empty(self):
        """Test batch size validation with empty list."""
        items = []
        with pytest.raises(ValueError, match="Batch size must be at least"):
            ResearchUseCases.validate_batch_size(items)

    def test_can_process_job(self):
        """Test job processing validation."""
        job = ResearchJob()
        job.add_item(Item(name="Test Product", price=99.99))
        
        assert ResearchUseCases.can_process_job(job) is True

    def test_cannot_process_completed_job(self):
        """Test that completed jobs cannot be processed."""
        job = ResearchJob()
        job.add_item(Item(name="Test Product", price=99.99))
        job.complete()
        
        assert ResearchUseCases.can_process_job(job) is False

    def test_cannot_process_job_without_items(self):
        """Test that jobs without items cannot be processed."""
        job = ResearchJob()
        
        assert ResearchUseCases.can_process_job(job) is False

    def test_should_retry_item(self):
        """Test retry logic for items."""
        item = Item(name="Test Product", price=99.99)
        
        # Should retry on first few attempts
        assert ResearchUseCases.should_retry_item(item, 1) is True
        assert ResearchUseCases.should_retry_item(item, 2) is True
        
        # Should not retry after max attempts
        assert ResearchUseCases.should_retry_item(item, 3) is False

    def test_should_not_retry_item_with_no_retry_flag(self):
        """Test that items with no_retry flag are not retried."""
        item = Item(
            name="Test Product",
            price=99.99,
            metadata={"no_retry": True}
        )
        
        assert ResearchUseCases.should_retry_item(item, 1) is False

    def test_calculate_priority(self):
        """Test priority calculation."""
        job = ResearchJob()
        job.add_items([Item(name=f"Product {i}", price=10.0) for i in range(2)])
        
        priority = ResearchUseCases.calculate_priority(job)
        assert priority > 0

    def test_split_batch(self):
        """Test batch splitting."""
        items = [Item(name=f"Product {i}", price=10.0) for i in range(7)]
        
        batches = ResearchUseCases.split_batch(items, chunk_size=3)
        
        assert len(batches) == 3
        assert len(batches[0]) == 3
        assert len(batches[1]) == 3
        assert len(batches[2]) == 1

    def test_merge_duplicate_items(self):
        """Test duplicate item merging."""
        item1 = Item(name="Product A", price=10.0)
        item1.hash = "hash1"
        
        item2 = Item(name="Product B", price=20.0)
        item2.hash = "hash2"
        
        item3 = Item(name="Product A Duplicate", price=15.0)
        item3.hash = "hash1"  # Same hash as item1
        
        items = [item1, item2, item3]
        unique_items = ResearchUseCases.merge_duplicate_items(items)
        
        assert len(unique_items) == 2
        assert unique_items[0] == item1
        assert unique_items[1] == item2

    def test_estimate_processing_time(self):
        """Test processing time estimation."""
        job = ResearchJob()
        job.add_items([Item(name=f"Product {i}", price=10.0) for i in range(3)])
        
        estimated_time = ResearchUseCases.estimate_processing_time(job)
        
        assert estimated_time > 0
        assert estimated_time > 3 * 2.0  # Should be more than base time per item


class TestResearchService:
    """Test research service."""

    @pytest.fixture
    def mock_repositories(self):
        """Create mock repositories."""
        job_repo = AsyncMock()
        result_repo = AsyncMock()
        return job_repo, result_repo

    @pytest.fixture
    def research_service(self, mock_repositories):
        """Create research service with mock repositories."""
        job_repo, result_repo = mock_repositories
        return ResearchService(job_repo, result_repo)

    @pytest.mark.asyncio
    async def test_create_research_job_success(self, research_service, mock_repositories):
        """Test successful research job creation."""
        job_repo, result_repo = mock_repositories
        
        # Mock repository response
        job_repo.create.return_value = ResearchJob()
        
        items_data = [
            {"name": "Product 1", "price": 10.0, "category": "Electronics"},
            {"name": "Product 2", "price": 20.0, "category": "Books"},
        ]
        
        job = await research_service.create_research_job(items_data)
        
        assert job is not None
        job_repo.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_research_job_invalid_items(self, research_service):
        """Test research job creation with invalid items."""
        items_data = [
            {"name": "", "price": 10.0},  # Invalid: empty name
        ]
        
        with pytest.raises(ValueError):
            await research_service.create_research_job(items_data)

    @pytest.mark.asyncio
    async def test_get_research_job(self, research_service, mock_repositories):
        """Test getting research job by ID."""
        job_repo, result_repo = mock_repositories
        
        expected_job = ResearchJob()
        job_repo.get_by_id.return_value = expected_job
        
        job = await research_service.get_research_job(expected_job.id)
        
        assert job == expected_job
        job_repo.get_by_id.assert_called_once_with(expected_job.id)

    @pytest.mark.asyncio
    async def test_get_research_job_not_found(self, research_service, mock_repositories):
        """Test getting non-existent research job."""
        job_repo, result_repo = mock_repositories
        
        job_repo.get_by_id.return_value = None
        
        job = await research_service.get_research_job("non-existent-id")
        
        assert job is None

    @pytest.mark.asyncio
    async def test_cancel_research_job(self, research_service, mock_repositories):
        """Test research job cancellation."""
        job_repo, result_repo = mock_repositories
        
        job = ResearchJob()
        job.status = JobStatus.PENDING
        job_repo.get_by_id.return_value = job
        job_repo.update_status.return_value = True
        
        result = await research_service.cancel_research_job(job.id)
        
        assert result is True
        job_repo.update_status.assert_called_once()

    @pytest.mark.asyncio
    async def test_cancel_completed_job_fails(self, research_service, mock_repositories):
        """Test that completed jobs cannot be cancelled."""
        job_repo, result_repo = mock_repositories
        
        job = ResearchJob()
        job.complete()  # Set status to completed
        job_repo.get_by_id.return_value = job
        
        with pytest.raises(ValueError, match="cannot be cancelled"):
            await research_service.cancel_research_job(job.id)


class TestItemHashing:
    """Test item hashing functionality."""

    def test_calculate_item_hash_consistent(self):
        """Test that hash calculation is consistent."""
        item1 = Item(name="Product A", price=10.99, category="Electronics")
        item2 = Item(name="Product A", price=10.99, category="Electronics")
        
        hash1 = calculate_item_hash(item1)
        hash2 = calculate_item_hash(item2)
        
        assert hash1 == hash2

    def test_calculate_item_hash_different_items(self):
        """Test that different items have different hashes."""
        item1 = Item(name="Product A", price=10.99)
        item2 = Item(name="Product B", price=10.99)
        
        hash1 = calculate_item_hash(item1)
        hash2 = calculate_item_hash(item2)
        
        assert hash1 != hash2

    def test_calculate_item_hash_case_insensitive(self):
        """Test that hash is case insensitive for names."""
        item1 = Item(name="Product A", price=10.99)
        item2 = Item(name="product a", price=10.99)
        
        hash1 = calculate_item_hash(item1)
        hash2 = calculate_item_hash(item2)
        
        assert hash1 == hash2

    def test_calculate_item_hash_price_precision(self):
        """Test that price precision is handled correctly."""
        item1 = Item(name="Product A", price=10.99)
        item2 = Item(name="Product A", price=10.990)  # Same value, different precision
        
        hash1 = calculate_item_hash(item1)
        hash2 = calculate_item_hash(item2)
        
        assert hash1 == hash2