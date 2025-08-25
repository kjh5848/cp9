"""Product research service layer.

This service provides backward compatibility while delegating to the new
orchestrator-based architecture for improved separation of concerns.
"""

from typing import Dict, List, Optional
from uuid import UUID

from app.core.logging import get_logger
from app.domain.product_entities import (
    ProductResearchItem,
    ProductResearchJob,
)
from app.infra.db.repositories import ResearchJobRepository
from app.services.product_research_orchestrator import get_product_research_orchestrator

logger = get_logger(__name__)


class ProductResearchService:
    """Service for managing product research operations.

    This class now acts as a facade over the new orchestrator-based architecture,
    providing backward compatibility for existing code while benefiting from
    improved separation of concerns.
    """

    def __init__(self, repository: Optional[ResearchJobRepository] = None):
        """Initialize product research service.

        Args:
            repository: Research repository instance
        """
        self.orchestrator = get_product_research_orchestrator()

    async def create_research_job(
        self,
        items: List[ProductResearchItem],
        priority: int = 5,
        callback_url: Optional[str] = None,
    ) -> ProductResearchJob:
        """Create a new product research job.

        Args:
            items: List of products to research
            priority: Job priority (1-10)
            callback_url: URL to call when job completes

        Returns:
            Created research job
        """
        return await self.orchestrator.create_research_job(
            items=items,
            priority=priority,
            callback_url=callback_url,
        )

    async def get_job_status(self, job_id: UUID) -> Optional[ProductResearchJob]:
        """Get research job status.

        Args:
            job_id: Job ID

        Returns:
            Research job if found
        """
        return await self.orchestrator.get_job_status(job_id)

    async def get_job_results(
        self, job_id: UUID, include_failed: bool = True
    ) -> Optional[ProductResearchJob]:
        """Get research job results.

        Args:
            job_id: Job ID
            include_failed: Include failed items in results

        Returns:
            Research job with results if found
        """
        return await self.orchestrator.get_job_results(job_id, include_failed)

    async def create_research_job_with_coupang_preview(
        self,
        items: List[ProductResearchItem],
        priority: int = 5,
        callback_url: Optional[str] = None,
    ) -> ProductResearchJob:
        """Create research job with immediate Coupang preview.

        Args:
            items: List of products to research
            priority: Job priority (1-10)
            callback_url: URL to call when job completes

        Returns:
            Research job with immediate Coupang info in results
        """
        return await self.orchestrator.create_research_job_with_coupang_preview(
            items=items,
            priority=priority,
            callback_url=callback_url,
        )

    async def cancel_job(self, job_id: UUID) -> bool:
        """Cancel a research job.

        Args:
            job_id: Job ID

        Returns:
            True if job was cancelled
        """
        return await self.orchestrator.cancel_job(job_id)

    def create_celery_task(self, items: List[Dict], priority: int = 5) -> str:
        """Create a Celery background task for research.

        Args:
            items: List of product dictionaries
            priority: Task priority

        Returns:
            Celery task ID
        """
        return self.orchestrator.create_celery_task(items, priority)

    def get_celery_task_status(self, task_id: str) -> Dict:
        """Get Celery task status.

        Args:
            task_id: Celery task ID

        Returns:
            Task status dictionary
        """
        return self.orchestrator.get_celery_task_status(task_id)


# Singleton instance
_service: Optional[ProductResearchService] = None


def get_product_research_service() -> ProductResearchService:
    """Get or create product research service instance.

    Returns:
        ProductResearchService instance
    """
    global _service
    if _service is None:
        _service = ProductResearchService()
    return _service
