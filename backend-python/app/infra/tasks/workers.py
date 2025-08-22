"""Celery worker tasks."""

import asyncio
from typing import Any, Dict, List
from uuid import UUID

from celery import current_task
from celery.exceptions import Retry

from app.core.logging import get_logger
from app.domain.entities import Item, JobStatus, Result, ResultStatus
from app.infra.db.session import get_db_context
from app.infra.db.repositories import ResearchJobRepository, ResultRepository
from app.infra.llm.perplexity import PerplexityAPIError, get_perplexity_client
from app.infra.tasks.celery_app import celery_app
from app.utils.hashing import calculate_item_hash

logger = get_logger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def run_research(self, job_id: str) -> Dict[str, Any]:
    """Execute research job with all items.

    Args:
        job_id: Research job UUID as string

    Returns:
        Job execution results
    """
    job_uuid = UUID(job_id)
    logger.info(f"Starting research job: {job_uuid}")

    # Update task state
    current_task.update_state(
        state="PROGRESS",
        meta={"job_id": job_id, "status": "initializing"}
    )

    try:
        # Run async function in event loop
        result = asyncio.run(_run_research_async(job_uuid))
        return result
    except Exception as exc:
        logger.error(f"Research job {job_uuid} failed: {exc}")
        
        # Update job status to failed
        asyncio.run(_update_job_status(job_uuid, JobStatus.FAILED))
        
        # Retry if possible
        if self.request.retries < self.max_retries:
            logger.info(f"Retrying research job {job_uuid} (attempt {self.request.retries + 1})")
            raise self.retry(countdown=60, exc=exc)
        
        raise exc


async def _run_research_async(job_id: UUID) -> Dict[str, Any]:
    """Async implementation of research job execution.

    Args:
        job_id: Research job UUID

    Returns:
        Job execution results
    """
    async with get_db_context() as session:
        job_repo = ResearchJobRepository(session)
        result_repo = ResultRepository(session)
        
        # Get job details
        job = await job_repo.get_by_id(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")
        
        # Start job
        await job_repo.update_status(
            job_id,
            JobStatus.PROCESSING,
            started_at=job.created_at
        )
        
        logger.info(f"Processing {len(job.items)} items for job {job_id}")
        
        # Get Perplexity client
        client = get_perplexity_client()
        
        # Process items
        total_items = len(job.items)
        processed_count = 0
        failed_count = 0
        
        for item in job.items:
            try:
                # Update task progress
                current_task.update_state(
                    state="PROGRESS",
                    meta={
                        "job_id": str(job_id),
                        "processed": processed_count,
                        "total": total_items,
                        "current_item": item.name
                    }
                )
                
                # Generate item hash if not present
                if not item.hash:
                    item.hash = calculate_item_hash(item)
                
                # Check if result already exists
                existing_result = await result_repo.get_by_job_and_hash(
                    job_id, item.hash
                )
                if existing_result:
                    logger.info(f"Skipping existing item: {item.name}")
                    if existing_result.status == ResultStatus.SUCCESS:
                        processed_count += 1
                    else:
                        failed_count += 1
                    continue
                
                # Create pending result
                result = Result(
                    item_hash=item.hash,
                    item_name=item.name,
                    status=ResultStatus.PENDING,
                )
                await result_repo.create(job_id, result)
                
                # Research the item
                try:
                    research_data = await client.research_item(
                        item_name=item.name,
                        item_price=item.price,
                        category=item.category,
                    )
                    
                    # Update result with success
                    await result_repo.update(
                        result.id,
                        ResultStatus.SUCCESS,
                        data=research_data
                    )
                    processed_count += 1
                    logger.info(f"Successfully researched: {item.name}")
                    
                except PerplexityAPIError as e:
                    # Update result with error
                    await result_repo.update(
                        result.id,
                        ResultStatus.ERROR,
                        error=str(e)
                    )
                    failed_count += 1
                    logger.error(f"Failed to research {item.name}: {e}")
                
            except Exception as e:
                failed_count += 1
                logger.error(f"Unexpected error processing {item.name}: {e}")
        
        # Update job status
        final_status = JobStatus.COMPLETED if failed_count == 0 else JobStatus.FAILED
        await job_repo.update_status(
            job_id,
            final_status,
            processed_items=processed_count,
            failed_items=failed_count,
            completed_at=job.created_at
        )
        
        result_summary = {
            "job_id": str(job_id),
            "status": final_status.value,
            "total_items": total_items,
            "processed_items": processed_count,
            "failed_items": failed_count,
            "success_rate": processed_count / total_items if total_items > 0 else 0,
        }
        
        logger.info(f"Completed research job {job_id}: {result_summary}")
        return result_summary


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def process_single_item(
    self,
    job_id: str,
    item_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Process a single research item.

    Args:
        job_id: Research job UUID as string
        item_data: Item data dictionary

    Returns:
        Processing result
    """
    job_uuid = UUID(job_id)
    item = Item(**item_data)
    
    logger.info(f"Processing single item: {item.name} for job {job_uuid}")
    
    try:
        result = asyncio.run(_process_single_item_async(job_uuid, item))
        return result
    except Exception as exc:
        logger.error(f"Failed to process item {item.name}: {exc}")
        
        # Retry if possible
        if self.request.retries < self.max_retries:
            logger.info(f"Retrying item {item.name} (attempt {self.request.retries + 1})")
            raise self.retry(countdown=30, exc=exc)
        
        raise exc


async def _process_single_item_async(
    job_id: UUID,
    item: Item
) -> Dict[str, Any]:
    """Async implementation of single item processing.

    Args:
        job_id: Research job UUID
        item: Item to process

    Returns:
        Processing result
    """
    async with get_db_context() as session:
        result_repo = ResultRepository(session)
        
        # Generate item hash
        if not item.hash:
            item.hash = calculate_item_hash(item)
        
        # Create pending result
        result = Result(
            item_hash=item.hash,
            item_name=item.name,
            status=ResultStatus.PENDING,
        )
        await result_repo.create(job_id, result)
        
        try:
            # Research the item
            client = get_perplexity_client()
            research_data = await client.research_item(
                item_name=item.name,
                item_price=item.price,
                category=item.category,
            )
            
            # Update result with success
            await result_repo.update(
                result.id,
                ResultStatus.SUCCESS,
                data=research_data
            )
            
            return {
                "item_name": item.name,
                "status": "success",
                "result_id": str(result.id),
            }
            
        except PerplexityAPIError as e:
            # Update result with error
            await result_repo.update(
                result.id,
                ResultStatus.ERROR,
                error=str(e)
            )
            
            return {
                "item_name": item.name,
                "status": "error",
                "error": str(e),
                "result_id": str(result.id),
            }


async def _update_job_status(job_id: UUID, status: JobStatus) -> None:
    """Update job status in database.

    Args:
        job_id: Job UUID
        status: New status
    """
    async with get_db_context() as session:
        job_repo = ResearchJobRepository(session)
        await job_repo.update_status(job_id, status)