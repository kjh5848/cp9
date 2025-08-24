"""Domain use cases - Business rules and policies."""

from typing import List

from app.domain.entities import Item, ResearchJob


class ResearchUseCases:
    """Business rules for research operations."""

    MAX_BATCH_SIZE = 10
    MIN_BATCH_SIZE = 1
    MAX_ITEM_NAME_LENGTH = 500
    MAX_PRICE = 1000000.0
    MIN_PRICE = 0.0

    @staticmethod
    def validate_batch_size(items: List[Item]) -> None:
        """Validate batch size against business rules.

        Args:
            items: List of items to validate

        Raises:
            ValueError: If batch size is invalid
        """
        batch_size = len(items)
        if batch_size < ResearchUseCases.MIN_BATCH_SIZE:
            raise ValueError(
                f"Batch size must be at least {ResearchUseCases.MIN_BATCH_SIZE}"
            )
        if batch_size > ResearchUseCases.MAX_BATCH_SIZE:
            raise ValueError(
                f"Batch size cannot exceed {ResearchUseCases.MAX_BATCH_SIZE}"
            )

    @staticmethod
    def validate_item(item: Item) -> None:
        """Validate a single item against business rules.

        Args:
            item: Item to validate

        Raises:
            ValueError: If item is invalid
        """
        # Validate name
        if not item.name or not item.name.strip():
            raise ValueError("Item name cannot be empty")
        if len(item.name) > ResearchUseCases.MAX_ITEM_NAME_LENGTH:
            raise ValueError(
                f"Item name cannot exceed {ResearchUseCases.MAX_ITEM_NAME_LENGTH} characters"
            )

        # Validate price
        if item.price < ResearchUseCases.MIN_PRICE:
            raise ValueError(
                f"Item price cannot be less than {ResearchUseCases.MIN_PRICE}"
            )
        if item.price > ResearchUseCases.MAX_PRICE:
            raise ValueError(f"Item price cannot exceed {ResearchUseCases.MAX_PRICE}")

    @staticmethod
    def validate_items(items: List[Item]) -> None:
        """Validate a list of items.

        Args:
            items: List of items to validate

        Raises:
            ValueError: If any item is invalid
        """
        if not items:
            raise ValueError("Items list cannot be empty")

        # Validate batch size
        ResearchUseCases.validate_batch_size(items)

        # Validate each item
        for idx, item in enumerate(items):
            try:
                ResearchUseCases.validate_item(item)
            except ValueError as e:
                raise ValueError(f"Item at index {idx}: {str(e)}")

    @staticmethod
    def can_process_job(job: ResearchJob) -> bool:
        """Check if a job can be processed.

        Args:
            job: Research job to check

        Returns:
            True if job can be processed, False otherwise
        """
        # Job must not be complete
        if job.is_complete:
            return False

        # Job must have items
        if not job.items:
            return False

        # Job must not exceed batch size
        if len(job.items) > ResearchUseCases.MAX_BATCH_SIZE:
            return False

        return True

    @staticmethod
    def should_retry_item(item: Item, error_count: int, max_retries: int = 3) -> bool:
        """Determine if an item should be retried.

        Args:
            item: Item that failed
            error_count: Number of times this item has failed
            max_retries: Maximum number of retries allowed

        Returns:
            True if item should be retried, False otherwise
        """
        # Don't retry if max retries exceeded
        if error_count >= max_retries:
            return False

        # Don't retry if item has specific metadata flags
        if item.metadata.get("no_retry", False):
            return False

        # Retry for temporary failures
        return True

    @staticmethod
    def calculate_priority(job: ResearchJob) -> int:
        """Calculate priority score for a job.

        Args:
            job: Research job

        Returns:
            Priority score (higher is more important)
        """
        priority = 100  # Base priority

        # Boost priority for smaller batches (faster to complete)
        if len(job.items) <= 3:
            priority += 20

        # Reduce priority for large batches
        if len(job.items) >= 8:
            priority -= 10

        # Boost priority if job has metadata priority flag
        if job.metadata.get("priority") == "high":
            priority += 50
        elif job.metadata.get("priority") == "low":
            priority -= 30

        # Reduce priority for jobs with many failures
        if job.failed_items > job.processed_items:
            priority -= 20

        return max(0, priority)  # Ensure non-negative priority

    @staticmethod
    def split_batch(items: List[Item], chunk_size: int = 5) -> List[List[Item]]:
        """Split items into smaller batches.

        Args:
            items: List of items to split
            chunk_size: Size of each chunk

        Returns:
            List of item batches
        """
        if chunk_size <= 0:
            raise ValueError("Chunk size must be positive")
        if chunk_size > ResearchUseCases.MAX_BATCH_SIZE:
            chunk_size = ResearchUseCases.MAX_BATCH_SIZE

        batches = []
        for i in range(0, len(items), chunk_size):
            batch = items[i : i + chunk_size]
            batches.append(batch)

        return batches

    @staticmethod
    def merge_duplicate_items(items: List[Item]) -> List[Item]:
        """Merge duplicate items based on hash.

        Args:
            items: List of items potentially containing duplicates

        Returns:
            List of unique items
        """
        seen_hashes = set()
        unique_items = []

        for item in items:
            if item.hash and item.hash in seen_hashes:
                continue
            if item.hash:
                seen_hashes.add(item.hash)
            unique_items.append(item)

        return unique_items

    @staticmethod
    def estimate_processing_time(job: ResearchJob) -> float:
        """Estimate processing time for a job in seconds.

        Args:
            job: Research job

        Returns:
            Estimated processing time in seconds
        """
        # Base time per item (seconds)
        time_per_item = 2.0

        # Adjust based on job size
        total_time = len(job.items) * time_per_item

        # Add overhead for job setup/teardown
        total_time += 5.0

        # Add buffer for retries
        if job.metadata.get("retry_enabled", True):
            total_time *= 1.2

        return total_time
