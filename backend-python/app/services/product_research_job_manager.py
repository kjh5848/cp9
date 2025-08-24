"""Product research job management service."""

from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from app.core.logging import get_logger
from app.domain.product_entities import (
    ProductResearchItem,
    ProductResearchJob,
    ResearchStatus,
)
from app.infra.db.repositories import ResearchJobRepository

logger = get_logger(__name__)


class ProductResearchJobManager:
    """Manages product research job lifecycle and storage.

    Responsibilities:
    - Job creation and configuration
    - Job storage and retrieval
    - Job status management
    - Job cancellation
    """

    def __init__(self, repository: Optional[ResearchJobRepository] = None):
        """Initialize job manager.

        Args:
            repository: Research repository instance
        """
        self.repository = repository
        self._jobs: Dict[UUID, ProductResearchJob] = {}

    def create_job(
        self,
        items: List[ProductResearchItem],
        priority: int = 5,
        callback_url: Optional[str] = None,
        enable_coupang_preview: bool = False,
    ) -> ProductResearchJob:
        """Create a new product research job.

        Args:
            items: List of products to research
            priority: Job priority (1-10)
            callback_url: URL to call when job completes
            enable_coupang_preview: Enable immediate Coupang preview

        Returns:
            Created research job
        """
        # Create job
        job = ProductResearchJob()
        job.add_items(items)
        job.metadata["priority"] = priority
        job.metadata["coupang_preview"] = enable_coupang_preview

        if callback_url:
            job.metadata["callback_url"] = callback_url

        # Store job in memory (or database if repository is available)
        self._jobs[job.id] = job

        logger.info(
            f"Created research job {job.id} with {len(items)} items "
            f"(preview: {enable_coupang_preview})"
        )
        return job

    def get_job(self, job_id: UUID) -> Optional[ProductResearchJob]:
        """Get research job by ID.

        Args:
            job_id: Job ID

        Returns:
            Research job if found
        """
        return self._jobs.get(job_id)

    def get_job_with_filtered_results(
        self, job_id: UUID, include_failed: bool = True
    ) -> Optional[ProductResearchJob]:
        """Get research job with optionally filtered results.

        Args:
            job_id: Job ID
            include_failed: Include failed items in results

        Returns:
            Research job with filtered results if found
        """
        job = self._jobs.get(job_id)
        if not job:
            return None

        if not include_failed:
            # Create a copy with filtered results
            filtered_job = ProductResearchJob()
            filtered_job.id = job.id
            filtered_job.status = job.status
            filtered_job.created_at = job.created_at
            filtered_job.started_at = job.started_at
            filtered_job.completed_at = job.completed_at
            filtered_job.updated_at = job.updated_at
            filtered_job.error_message = job.error_message
            filtered_job.metadata = job.metadata
            filtered_job.items = job.items
            filtered_job.results = [
                r for r in job.results if r.status == ResearchStatus.SUCCESS
            ]
            return filtered_job

        return job

    def update_job_status(
        self, job_id: UUID, status: ResearchStatus, error_message: Optional[str] = None
    ) -> bool:
        """Update job status.

        Args:
            job_id: Job ID
            status: New status
            error_message: Error message if status is ERROR

        Returns:
            True if job was updated
        """
        job = self._jobs.get(job_id)
        if not job:
            return False

        job.status = status
        job.updated_at = datetime.utcnow()

        if status == ResearchStatus.PROCESSING and not job.started_at:
            job.started_at = datetime.utcnow()
        elif status in [ResearchStatus.COMPLETED, ResearchStatus.ERROR]:
            job.completed_at = datetime.utcnow()

        if error_message:
            job.error_message = error_message

        logger.info(f"Updated job {job_id} status to {status}")
        return True

    def cancel_job(self, job_id: UUID) -> bool:
        """Cancel a research job.

        Args:
            job_id: Job ID

        Returns:
            True if job was cancelled
        """
        job = self._jobs.get(job_id)
        if not job or job.status != ResearchStatus.PROCESSING:
            logger.warning(f"Cannot cancel job {job_id}: not found or not processing")
            return False

        job.status = ResearchStatus.ERROR
        job.metadata["cancelled"] = True
        job.completed_at = datetime.utcnow()
        job.error_message = "Job was cancelled by user"

        logger.info(f"Cancelled research job {job_id}")
        return True

    def get_all_jobs(self) -> List[ProductResearchJob]:
        """Get all stored jobs.

        Returns:
            List of all jobs
        """
        return list(self._jobs.values())

    def cleanup_completed_jobs(self, max_age_hours: int = 24) -> int:
        """Remove old completed jobs to free memory.

        Args:
            max_age_hours: Maximum age in hours for completed jobs

        Returns:
            Number of jobs removed
        """
        if not max_age_hours:
            return 0

        cutoff_time = datetime.utcnow().timestamp() - (max_age_hours * 3600)
        jobs_to_remove = []

        for job_id, job in self._jobs.items():
            if (
                job.status in [ResearchStatus.COMPLETED, ResearchStatus.ERROR]
                and job.completed_at
                and job.completed_at.timestamp() < cutoff_time
            ):
                jobs_to_remove.append(job_id)

        for job_id in jobs_to_remove:
            del self._jobs[job_id]

        if jobs_to_remove:
            logger.info(f"Cleaned up {len(jobs_to_remove)} old completed jobs")

        return len(jobs_to_remove)

    def get_job_statistics(self) -> Dict:
        """Get job statistics.

        Returns:
            Dictionary with job statistics
        """
        total_jobs = len(self._jobs)

        status_counts = {}
        for status in ResearchStatus:
            status_counts[status.value] = 0

        for job in self._jobs.values():
            status_counts[job.status.value] += 1

        return {
            "total_jobs": total_jobs,
            "status_breakdown": status_counts,
        }
