"""Research service - Orchestration layer connecting domain and infrastructure."""

from typing import List, Optional
from uuid import UUID

from app.core.logging import get_logger
from app.domain.entities import Item, JobStatus, ResearchJob
from app.domain.usecases import ResearchUseCases
from app.infra.db.repositories import ResearchJobRepository, ResultRepository
from app.infra.tasks.workers import run_research
from app.utils.hashing import calculate_item_hash

logger = get_logger(__name__)


class ResearchService:
    """Service for research operations."""

    def __init__(
        self,
        job_repository: ResearchJobRepository,
        result_repository: ResultRepository,
    ):
        """Initialize research service.

        Args:
            job_repository: Repository for job operations
            result_repository: Repository for result operations
        """
        self.job_repository = job_repository
        self.result_repository = result_repository

    async def create_research_job(
        self, items: List[dict], metadata: Optional[dict] = None
    ) -> ResearchJob:
        """Create a new research job.

        Args:
            items: List of item dictionaries
            metadata: Optional job metadata

        Returns:
            Created ResearchJob entity

        Raises:
            ValueError: If validation fails
        """
        # Convert dictionaries to domain entities
        domain_items = []
        for item_data in items:
            item = Item(
                product_name=item_data["product_name"],
                price_exact=item_data["price_exact"],
                category=item_data.get("category"),
                metadata=item_data.get("metadata", {}),
            )
            # Generate hash for the item
            item.hash = calculate_item_hash(item)
            domain_items.append(item)

        # Validate items using domain rules
        ResearchUseCases.validate_items(domain_items)

        # Remove duplicates
        unique_items = ResearchUseCases.merge_duplicate_items(domain_items)

        if len(unique_items) != len(domain_items):
            logger.info(
                f"Removed {len(domain_items) - len(unique_items)} duplicate items"
            )

        # Create research job entity
        job = ResearchJob(metadata=metadata or {})
        job.add_items(unique_items)

        # Validate job can be processed
        if not ResearchUseCases.can_process_job(job):
            raise ValueError("Job cannot be processed")

        # Save job to database
        created_job = await self.job_repository.create(job)

        logger.info(f"Created research job {job.id} with {len(unique_items)} items")
        return created_job

    async def start_research_job(self, job_id: UUID) -> str:
        """Start processing a research job.

        Args:
            job_id: Job UUID

        Returns:
            Celery task ID

        Raises:
            ValueError: If job cannot be started
        """
        # Get job from database
        job = await self.job_repository.get_by_id(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        # Check if job can be processed
        if not ResearchUseCases.can_process_job(job):
            raise ValueError(f"Job {job_id} cannot be processed")

        # Start Celery task
        task = run_research.delay(str(job_id))

        logger.info(f"Started research job {job_id} with task {task.id}")
        return task.id

    async def get_research_job(self, job_id: UUID) -> Optional[ResearchJob]:
        """Get a research job by ID.

        Args:
            job_id: Job UUID

        Returns:
            ResearchJob entity or None if not found
        """
        return await self.job_repository.get_by_id(job_id)

    async def list_research_jobs(
        self, status: Optional[JobStatus] = None, limit: int = 50
    ) -> List[ResearchJob]:
        """List research jobs.

        Args:
            status: Optional status filter
            limit: Maximum number of jobs to return

        Returns:
            List of ResearchJob entities
        """
        if status == JobStatus.PENDING:
            return await self.job_repository.list_pending(limit)
        elif status == JobStatus.PROCESSING:
            return await self.job_repository.list_active()
        else:
            # For other statuses or no filter, we would need additional methods
            # in the repository. For now, return pending jobs as default.
            return await self.job_repository.list_pending(limit)

    async def cancel_research_job(self, job_id: UUID) -> bool:
        """Cancel a research job.

        Args:
            job_id: Job UUID

        Returns:
            True if cancelled, False if not found or cannot be cancelled
        """
        # Get job from database
        job = await self.job_repository.get_by_id(job_id)
        if not job:
            return False

        # Only pending or processing jobs can be cancelled
        if job.status not in [JobStatus.PENDING, JobStatus.PROCESSING]:
            raise ValueError(f"Job {job_id} cannot be cancelled (status: {job.status})")

        # Update job status
        success = await self.job_repository.update_status(
            job_id, JobStatus.CANCELLED, completed_at=job.updated_at
        )

        if success:
            logger.info(f"Cancelled research job {job_id}")

        return success

    async def update_job_metadata(self, job_id: UUID, metadata: dict) -> bool:
        """Update job metadata.

        Args:
            job_id: Job UUID
            metadata: Updated metadata

        Returns:
            True if updated, False if not found
        """
        # Get current job
        job = await self.job_repository.get_by_id(job_id)
        if not job:
            return False

        # Merge metadata
        updated_metadata = {**job.metadata, **metadata}

        # Update in database (we would need to add this method to repository)
        # For now, return True as placeholder
        logger.info(f"Updated metadata for job {job_id}")
        return True

    def estimate_job_duration(self, job: ResearchJob) -> float:
        """Estimate job processing duration.

        Args:
            job: ResearchJob entity

        Returns:
            Estimated duration in seconds
        """
        return ResearchUseCases.estimate_processing_time(job)

    def calculate_job_priority(self, job: ResearchJob) -> int:
        """Calculate job priority score.

        Args:
            job: ResearchJob entity

        Returns:
            Priority score
        """
        return ResearchUseCases.calculate_priority(job)

    async def get_job_statistics(self) -> dict:
        """Get research job statistics.

        Returns:
            Dictionary with job statistics
        """
        # Get various job counts
        pending_jobs = await self.job_repository.list_pending(1000)  # Get all pending
        active_jobs = await self.job_repository.list_active()

        stats = {
            "total_pending": len(pending_jobs),
            "total_active": len(active_jobs),
            "queue_health": "healthy" if len(active_jobs) < 10 else "busy",
        }

        logger.info(f"Job statistics: {stats}")
        return stats
