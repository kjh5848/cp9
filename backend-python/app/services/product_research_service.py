"""Product research service layer."""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from app.core.logging import get_logger
from app.domain.product_entities import (
    ProductResearchItem,
    ProductResearchJob,
    ProductResearchResult,
    ResearchStatus,
)
from app.domain.entities import ResultStatus
from app.infra.db.repositories import ResearchJobRepository
from app.infra.llm.perplexity_research import get_research_client
from app.infra.tasks.celery_app import celery_app

logger = get_logger(__name__)


class ProductResearchService:
    """Service for managing product research operations."""
    
    def __init__(self, repository: Optional[ResearchJobRepository] = None):
        """Initialize product research service.
        
        Args:
            repository: Research repository instance
        """
        self.repository = repository
        self.research_client = get_research_client()
        self._jobs: Dict[UUID, ProductResearchJob] = {}
    
    async def create_research_job(
        self,
        items: List[ProductResearchItem],
        priority: int = 5,
        callback_url: Optional[str] = None
    ) -> ProductResearchJob:
        """Create a new product research job.
        
        Args:
            items: List of products to research
            priority: Job priority (1-10)
            callback_url: URL to call when job completes
            
        Returns:
            Created research job
        """
        # Create job
        job = ProductResearchJob()
        job.add_items(items)
        job.metadata["priority"] = priority
        if callback_url:
            job.metadata["callback_url"] = callback_url
        
        # Store job in memory (or database if repository is available)
        self._jobs[job.id] = job
        
        # Start async research task
        asyncio.create_task(self._process_research_job(job))
        
        logger.info(f"Created research job {job.id} with {len(items)} items")
        return job
    
    async def get_job_status(self, job_id: UUID) -> Optional[ProductResearchJob]:
        """Get research job status.
        
        Args:
            job_id: Job ID
            
        Returns:
            Research job if found
        """
        return self._jobs.get(job_id)
    
    async def get_job_results(
        self,
        job_id: UUID,
        include_failed: bool = True
    ) -> Optional[ProductResearchJob]:
        """Get research job results.
        
        Args:
            job_id: Job ID
            include_failed: Include failed items in results
            
        Returns:
            Research job with results if found
        """
        job = self._jobs.get(job_id)
        if not job:
            return None
        
        if not include_failed:
            # Filter out failed results
            job.results = [
                r for r in job.results
                if r.status == ResearchStatus.SUCCESS
            ]
        
        return job
    
    async def create_research_job_with_coupang_preview(
        self,
        items: List[ProductResearchItem],
        priority: int = 5,
        callback_url: Optional[str] = None
    ) -> ProductResearchJob:
        """Create research job with immediate Coupang preview.
        
        Args:
            items: List of products to research
            priority: Job priority (1-10)
            callback_url: URL to call when job completes
            
        Returns:
            Research job with immediate Coupang info in results
        """
        # Create job
        job = ProductResearchJob()
        job.add_items(items)
        job.metadata["priority"] = priority
        job.metadata["coupang_preview"] = True
        if callback_url:
            job.metadata["callback_url"] = callback_url
        
        # Create immediate Coupang preview results
        for item in items:
            coupang_result = self._extract_coupang_info(item)
            if coupang_result:
                job.add_result(coupang_result)
        
        # Store job in memory
        self._jobs[job.id] = job
        
        # Start full research in background
        asyncio.create_task(self._process_research_job_with_preview(job))
        
        logger.info(f"Created research job {job.id} with Coupang preview for {len(items)} items")
        return job
    
    def _extract_coupang_info(self, item: ProductResearchItem) -> Optional[ProductResearchResult]:
        """Extract Coupang information from item if available.
        
        Args:
            item: Product research item
            
        Returns:
            ProductResearchResult with Coupang preview or None
        """
        # Check if item has Coupang information
        if not any([item.product_id, item.product_url, item.product_image]):
            return None
        
        result = ProductResearchResult(
            product_name=item.product_name,
            category=item.category,
            price_exact=item.price_exact,
            currency=item.currency,
            seller_or_store=item.seller_or_store or "쿠팡",
            status=ResearchStatus.SUCCESS
        )
        
        # Set Coupang-specific data
        if item.product_url:
            result.deeplink_or_product_url = item.product_url
        if item.price_exact:
            result.coupang_price = item.price_exact
        
        # Add Coupang metadata
        coupang_metadata = {}
        if item.product_id:
            coupang_metadata["product_id"] = item.product_id
        if item.product_image:
            coupang_metadata["product_image"] = item.product_image
        if item.product_url:
            coupang_metadata["product_url"] = item.product_url
        if item.is_rocket is not None:
            coupang_metadata["is_rocket"] = item.is_rocket
        if item.is_free_shipping is not None:
            coupang_metadata["is_free_shipping"] = item.is_free_shipping
        if item.category_name:
            coupang_metadata["category_name"] = item.category_name
        
        # Store in result metadata for easy access
        result.metadata = {"coupang_info": coupang_metadata, "preview": True}
        
        # Mark as captured immediately
        result.captured_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        result.sources = ["쿠팡 파트너스 API"]
        
        return result
    
    async def _process_research_job_with_preview(self, job: ProductResearchJob) -> None:
        """Process research job with existing preview results.
        
        Args:
            job: Research job with preview results
        """
        try:
            # Mark job as started (but keep existing preview results)
            job.status = ResearchStatus.PROCESSING
            job.started_at = datetime.utcnow()
            job.updated_at = datetime.utcnow()
            
            # Convert items to research format
            items = [
                ProductResearchItem(
                    product_name=item.product_name,
                    category=item.category,
                    price_exact=item.price_exact,
                    currency=item.currency,
                    seller_or_store=item.seller_or_store,
                    product_id=item.product_id,
                    product_image=item.product_image,
                    product_url=item.product_url,
                    is_rocket=item.is_rocket,
                    is_free_shipping=item.is_free_shipping,
                    category_name=item.category_name,
                    keyword=item.keyword,
                    rank=item.rank,
                    metadata=item.metadata
                )
                for item in job.items
            ]
            
            # Call Perplexity API for full research
            research_results = await self.research_client.research_products(
                items=items,
                max_concurrent=5
            )
            
            # Update existing preview results with full research data
            for i, research_result in enumerate(research_results):
                if i < len(job.results):
                    # Merge research data into existing preview result
                    preview_result = job.results[i]
                    self._merge_research_into_preview(preview_result, research_result)
                else:
                    # Add new result if no preview existed
                    job.add_result(research_result)
            
            # Mark job as completed
            job.complete()
            
            # Execute callback if provided
            if "callback_url" in job.metadata:
                await self._execute_callback(job)
            
            logger.info(
                f"Completed full research for job {job.id}: "
                f"{job.successful_items}/{job.total_items} successful"
            )
            
        except Exception as e:
            logger.error(f"Failed to process research job {job.id}: {str(e)}")
            job.fail(str(e))
    
    def _merge_research_into_preview(
        self,
        preview_result: ProductResearchResult,
        research_result: ProductResearchResult
    ) -> None:
        """Merge full research data into existing preview result.
        
        Args:
            preview_result: Existing preview result
            research_result: Full research result from Perplexity
        """
        # Update with research data while preserving Coupang info
        preview_result.brand = research_result.brand
        preview_result.model_or_variant = research_result.model_or_variant
        preview_result.specs = research_result.specs
        preview_result.reviews = research_result.reviews
        preview_result.sources.extend(research_result.sources)
        preview_result.status = research_result.status
        preview_result.captured_at = research_result.captured_at
        
        # Preserve Coupang metadata while adding research data
        if "coupang_info" in preview_result.metadata:
            preview_result.metadata["research_completed"] = True
        else:
            preview_result.metadata = research_result.metadata
        
        # Handle errors
        if research_result.error_message:
            preview_result.error_message = research_result.error_message
        if research_result.missing_fields:
            preview_result.missing_fields = research_result.missing_fields
        if research_result.suggested_queries:
            preview_result.suggested_queries = research_result.suggested_queries
    
    async def cancel_job(self, job_id: UUID) -> bool:
        """Cancel a research job.
        
        Args:
            job_id: Job ID
            
        Returns:
            True if job was cancelled
        """
        job = self._jobs.get(job_id)
        if not job or job.status != ResearchStatus.PROCESSING:
            return False
        
        job.status = ResearchStatus.ERROR
        job.metadata["cancelled"] = True
        job.completed_at = datetime.utcnow()
        
        logger.info(f"Cancelled research job {job_id}")
        return True
    
    async def _process_research_job(self, job: ProductResearchJob) -> None:
        """Process research job asynchronously.
        
        Args:
            job: Research job to process
        """
        try:
            # Mark job as started
            job.start()
            
            # Convert items to research format
            items = [
                ProductResearchItem(
                    product_name=item.product_name,
                    category=item.category,
                    price_exact=item.price_exact,
                    currency=item.currency,
                    seller_or_store=item.seller_or_store,
                    metadata=item.metadata
                )
                for item in job.items
            ]
            
            # Call Perplexity API
            results = await self.research_client.research_products(
                items=items,
                max_concurrent=5
            )
            
            # Add results to job
            for result in results:
                job.add_result(result)
            
            # Mark job as completed
            job.complete()
            
            # Execute callback if provided
            if "callback_url" in job.metadata:
                await self._execute_callback(job)
            
            logger.info(
                f"Completed research job {job.id}: "
                f"{job.successful_items}/{job.total_items} successful"
            )
            
        except Exception as e:
            logger.error(f"Failed to process research job {job.id}: {str(e)}")
            job.fail(str(e))
    
    async def _execute_callback(self, job: ProductResearchJob) -> None:
        """Execute job completion callback.
        
        Args:
            job: Completed research job
        """
        callback_url = job.metadata.get("callback_url")
        if not callback_url:
            return
        
        try:
            import httpx
            
            async with httpx.AsyncClient() as client:
                await client.post(
                    callback_url,
                    json=job.to_dict(),
                    timeout=10
                )
            
            logger.info(f"Executed callback for job {job.id}")
            
        except Exception as e:
            logger.error(f"Failed to execute callback for job {job.id}: {str(e)}")
    
    def create_celery_task(
        self,
        items: List[Dict],
        priority: int = 5
    ) -> str:
        """Create a Celery background task for research.
        
        Args:
            items: List of product dictionaries
            priority: Task priority
            
        Returns:
            Celery task ID
        """
        from app.infra.tasks.product_research_tasks import research_products_task
        
        task = research_products_task.apply_async(
            args=[items],
            priority=priority
        )
        
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
            "error": None
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