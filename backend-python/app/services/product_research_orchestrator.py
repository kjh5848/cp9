"""Product research orchestrator service."""

import asyncio
from typing import Dict, List, Optional
from uuid import UUID

from app.core.logging import get_logger
from app.domain.product_entities import (
    ProductResearchItem,
    ProductResearchJob,
)
from app.infra.db.repositories import ResearchJobRepository
from app.infra.tasks.celery_app import celery_app
from app.services.product_research_executor import ProductResearchExecutor
from app.services.product_research_job_manager import ProductResearchJobManager
from app.services.product_research_result_processor import (
    ProductResearchResultProcessor,
)

logger = get_logger(__name__)


class ProductResearchOrchestrator:
    """Orchestrates product research operations by coordinating specialized services.

    This class implements the Facade pattern, providing a unified interface
    for complex product research operations while maintaining separation of concerns.

    Responsibilities:
    - Coordinate between JobManager, Executor, and ResultProcessor
    - Manage workflow orchestration
    - Handle both sync and async research flows
    - Provide unified API for external callers
    - Manage Celery task integration
    """

    def __init__(self, repository: Optional[ResearchJobRepository] = None):
        """Initialize research orchestrator.

        Args:
            repository: Research repository instance
        """
        self.job_manager = ProductResearchJobManager(repository)
        self.executor = ProductResearchExecutor()
        self.result_processor = ProductResearchResultProcessor()

    async def create_research_job(
        self,
        items: List[ProductResearchItem],
        priority: int = 5,
        callback_url: Optional[str] = None,
    ) -> ProductResearchJob:
        """Create a new product research job and start processing.

        Args:
            items: List of products to research
            priority: Job priority (1-10)
            callback_url: URL to call when job completes

        Returns:
            Created research job
        """
        # Create job through job manager
        job = self.job_manager.create_job(
            items=items,
            priority=priority,
            callback_url=callback_url,
            enable_coupang_preview=False,
        )

        # Start async research task
        asyncio.create_task(self._orchestrate_standard_research(job))

        logger.info(
            f"Orchestrated creation of research job {job.id} with {len(items)} items"
        )
        return job

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
        # Create job through job manager
        job = self.job_manager.create_job(
            items=items,
            priority=priority,
            callback_url=callback_url,
            enable_coupang_preview=True,
        )

        # Extract and add Coupang preview results
        preview_results = self.result_processor.extract_coupang_preview_results(items)
        for result in preview_results:
            job.add_result(result)

        # Start full research in background
        asyncio.create_task(self._orchestrate_preview_enhanced_research(job))

        logger.info(
            f"Orchestrated creation of research job {job.id} with Coupang preview for {len(items)} items"
        )
        return job

    async def get_job_status(self, job_id: UUID) -> Optional[ProductResearchJob]:
        """Get research job status.

        Args:
            job_id: Job ID

        Returns:
            Research job if found
        """
        return self.job_manager.get_job(job_id)

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
        return self.job_manager.get_job_with_filtered_results(job_id, include_failed)

    async def cancel_job(self, job_id: UUID) -> bool:
        """Cancel a research job.

        Args:
            job_id: Job ID

        Returns:
            True if job was cancelled
        """
        return self.job_manager.cancel_job(job_id)

    async def _orchestrate_standard_research(self, job: ProductResearchJob) -> None:
        """Orchestrate standard research workflow.

        Args:
            job: Research job to process
        """
        try:
            # Execute research through executor
            await self.executor.execute_research_job(job)

            # Execute callback if provided
            if "callback_url" in job.metadata:
                await self.result_processor.execute_callback(job)

            # Get processing statistics
            stats = self.result_processor.get_processing_statistics(job)
            logger.info(f"Standard research completed for job {job.id}: {stats}")

        except Exception as e:
            logger.error(
                f"Failed to orchestrate standard research for job {job.id}: {str(e)}"
            )
            self.job_manager.update_job_status(job.id, job.status, str(e))

    async def _orchestrate_preview_enhanced_research(
        self, job: ProductResearchJob
    ) -> None:
        """Orchestrate preview-enhanced research workflow.

        Args:
            job: Research job with preview results
        """
        try:
            # Execute enhanced research through executor
            research_results = await self.executor.execute_preview_enhanced_research(
                job
            )

            # Merge research results into preview results
            self.result_processor.merge_research_results_into_previews(
                job, research_results
            )

            # Mark job as completed
            job.complete()

            # Execute callback if provided
            if "callback_url" in job.metadata:
                await self.result_processor.execute_callback(job)

            # Get processing statistics
            stats = self.result_processor.get_processing_statistics(job)
            logger.info(
                f"Preview-enhanced research completed for job {job.id}: {stats}"
            )

        except Exception as e:
            logger.error(
                f"Failed to orchestrate preview-enhanced research for job {job.id}: {str(e)}"
            )
            job.fail(str(e))

    def create_celery_task(self, items: List[Dict], priority: int = 5) -> str:
        """Create a Celery background task for research.

        Args:
            items: List of product dictionaries
            priority: Task priority

        Returns:
            Celery task ID
        """
        from app.infra.tasks.product_research_tasks import research_products_task

        task = research_products_task.apply_async(args=[items], priority=priority)

        logger.info(f"Created Celery task {task.id} for {len(items)} items")
        return task.id

    def get_celery_task_status(self, task_id: str) -> Dict:
        """Get Celery task status.

        Args:
            task_id: Celery task ID

        Returns:
            Task status dictionary
        """
        from celery.result import AsyncResult

        result = AsyncResult(task_id, app=celery_app)

        status = {
            "task_id": task_id,
            "status": result.state,
            "progress": 0.0,
            "result": None,
            "error": None,
        }

        if result.state == "PENDING":
            status["message"] = "작업이 대기 중입니다."
        elif result.state == "STARTED":
            status["message"] = "작업이 시작되었습니다."
            status["progress"] = 0.1
        elif result.state == "PROGRESS":
            info = result.info or {}
            status["progress"] = info.get("current", 0) / info.get("total", 1)
            status["message"] = info.get("message", "처리 중...")
        elif result.state == "SUCCESS":
            status["progress"] = 1.0
            status["result"] = result.result
            status["message"] = "작업이 완료되었습니다."
        elif result.state == "FAILURE":
            status["error"] = str(result.info)
            status["message"] = "작업이 실패했습니다."

        return status

    def get_system_status(self) -> Dict:
        """Get overall system status and statistics.

        Returns:
            Dictionary with system status information
        """
        job_stats = self.job_manager.get_job_statistics()
        client_status = self.executor.get_client_status()

        return {
            "job_statistics": job_stats,
            "executor_status": client_status,
            "services": {
                "job_manager": "active",
                "executor": "active",
                "result_processor": "active",
            },
        }

    def cleanup_old_jobs(self, max_age_hours: int = 24) -> int:
        """Clean up old completed jobs.

        Args:
            max_age_hours: Maximum age in hours for completed jobs

        Returns:
            Number of jobs removed
        """
        return self.job_manager.cleanup_completed_jobs(max_age_hours)

    async def validate_system_health(self) -> Dict:
        """Validate system health by checking all components.

        Returns:
            Dictionary with health check results
        """
        health = {
            "overall_status": "healthy",
            "components": {},
            "issues": [],
        }

        try:
            # Check job manager
            job_stats = self.job_manager.get_job_statistics()
            health["components"]["job_manager"] = {
                "status": "healthy",
                "total_jobs": job_stats["total_jobs"],
            }
        except Exception as e:
            health["components"]["job_manager"] = {"status": "error", "error": str(e)}
            health["issues"].append(f"JobManager: {e}")

        try:
            # Check executor
            client_status = self.executor.get_client_status()
            health["components"]["executor"] = {
                "status": "healthy",
                "client_info": client_status,
            }
        except Exception as e:
            health["components"]["executor"] = {"status": "error", "error": str(e)}
            health["issues"].append(f"Executor: {e}")

        try:
            # Check result processor
            health["components"]["result_processor"] = {"status": "healthy"}
        except Exception as e:
            health["components"]["result_processor"] = {
                "status": "error",
                "error": str(e),
            }
            health["issues"].append(f"ResultProcessor: {e}")

        # Update overall status if there are issues
        if health["issues"]:
            health["overall_status"] = (
                "degraded" if len(health["issues"]) == 1 else "unhealthy"
            )

        return health


# Singleton instance
_orchestrator: Optional[ProductResearchOrchestrator] = None


def get_product_research_orchestrator() -> ProductResearchOrchestrator:
    """Get or create product research orchestrator instance.

    Returns:
        ProductResearchOrchestrator instance
    """
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = ProductResearchOrchestrator()
    return _orchestrator
