"""Research job manager component following SRP."""

from typing import List, Optional
from uuid import UUID

from app.core.exceptions import ValidationException
from app.core.logging import get_logger
from app.domain.product_entities import ProductResearchItem, ProductResearchJob
from app.infra.db.repositories import ResearchJobRepository
from app.schemas.error_responses import ErrorCode

logger = get_logger(__name__)


class ResearchJobManager:
    """Manages research job lifecycle operations.
    
    Responsibilities:
    - Create and validate research jobs
    - Retrieve job information
    - Update job status and progress
    - Cancel jobs
    """

    def __init__(self, repository: ResearchJobRepository):
        """Initialize job manager.
        
        Args:
            repository: Research job repository for data persistence
        """
        self.repository = repository

    async def create_job(
        self,
        items: List[ProductResearchItem],
        priority: int = 5,
        callback_url: Optional[str] = None,
    ) -> ProductResearchJob:
        """Create a new research job.
        
        Args:
            items: List of products to research
            priority: Job priority (1-10)
            callback_url: Optional callback URL for completion notification
            
        Returns:
            Created research job
            
        Raises:
            ValidationException: If input validation fails
        """
        # Validate inputs
        self._validate_items(items)
        self._validate_priority(priority)
        
        # Create job
        job = ProductResearchJob(
            items=items,
            priority=priority,
            callback_url=callback_url
        )
        
        # Persist to database
        created_job = await self.repository.create(job)
        
        logger.info(
            "Created research job",
            extra={
                "job_id": str(created_job.id),
                "item_count": len(items),
                "priority": priority,
                "has_callback": callback_url is not None
            }
        )
        
        return created_job

    async def get_job_by_id(self, job_id: UUID) -> Optional[ProductResearchJob]:
        """Get research job by ID.
        
        Args:
            job_id: Job ID
            
        Returns:
            Research job if found, None otherwise
        """
        return await self.repository.get_by_id(job_id)

    async def get_job_with_results(
        self,
        job_id: UUID,
        include_failed: bool = True
    ) -> Optional[ProductResearchJob]:
        """Get research job with results.
        
        Args:
            job_id: Job ID
            include_failed: Include failed items in results
            
        Returns:
            Research job with results if found
        """
        return await self.repository.get_by_id_with_results(job_id, include_failed)

    async def update_job_status(
        self,
        job_id: UUID,
        status: str
    ) -> Optional[ProductResearchJob]:
        """Update job status.
        
        Args:
            job_id: Job ID
            status: New status
            
        Returns:
            Updated job if found, None otherwise
        """
        job = await self.repository.get_by_id(job_id)
        if not job:
            return None
            
        job.status = status
        return await self.repository.update(job)

    async def cancel_job(self, job_id: UUID) -> bool:
        """Cancel a research job.
        
        Args:
            job_id: Job ID
            
        Returns:
            True if job was cancelled successfully
            
        Raises:
            ValidationException: If job cannot be cancelled
        """
        job = await self.repository.get_by_id(job_id)
        if not job:
            return False
            
        # Check if job can be cancelled
        if job.status in ["completed", "failed"]:
            raise ValidationException(
                error_code=ErrorCode.VALIDATION_ERROR,
                message=f"Job with status '{job.status}' cannot be cancelled"
            )
            
        if job.status == "cancelled":
            raise ValidationException(
                error_code=ErrorCode.VALIDATION_ERROR,
                message="Job is already cancelled"
            )
        
        # Cancel the job
        job.status = "cancelled"
        await self.repository.update(job)
        
        logger.info(
            "Cancelled research job",
            extra={"job_id": str(job_id)}
        )
        
        return True

    async def get_jobs_by_status(self, status: str) -> List[ProductResearchJob]:
        """Get jobs by status.
        
        Args:
            status: Job status to filter by
            
        Returns:
            List of jobs with the specified status
        """
        return await self.repository.get_by_status(status)

    def _validate_items(self, items: List[ProductResearchItem]) -> None:
        """Validate research items.
        
        Args:
            items: Items to validate
            
        Raises:
            ValidationException: If validation fails
        """
        if not items:
            raise ValidationException(
                error_code=ErrorCode.VALIDATION_ERROR,
                message="Research job must contain at least one item"
            )
            
        if len(items) > 10:  # Maximum batch size
            raise ValidationException(
                error_code=ErrorCode.VALIDATION_ERROR,
                message=f"Research job exceeds maximum batch size of 10 items (got {len(items)})"
            )
            
        # Validate individual items
        for item in items:
            if not item.product_name or not item.product_name.strip():
                raise ValidationException(
                    error_code=ErrorCode.VALIDATION_ERROR,
                    message="Product name cannot be empty"
                )

    def _validate_priority(self, priority: int) -> None:
        """Validate job priority.
        
        Args:
            priority: Priority to validate
            
        Raises:
            ValidationException: If priority is invalid
        """
        if not isinstance(priority, int) or priority < 1 or priority > 10:
            raise ValidationException(
                error_code=ErrorCode.VALIDATION_ERROR,
                message="Job priority must be an integer between 1 and 10"
            )