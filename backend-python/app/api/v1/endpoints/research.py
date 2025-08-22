"""Research endpoints."""

from typing import List, Optional
from uuid import UUID

from celery import current_app as celery_app
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.domain.entities import JobStatus
from app.infra.db.session import get_db
from app.infra.db.repositories import ResearchJobRepository, ResultRepository
from app.schemas.research_in import ResearchJobCreateIn, ResearchJobUpdateIn
from app.schemas.research_out import (
    ErrorOut,
    ResearchJobOut,
    ResearchJobSummaryOut,
    TaskStatusOut,
)
from app.services.research_service import ResearchService

logger = get_logger(__name__)

router = APIRouter()


def get_research_service(
    session: AsyncSession = Depends(get_db),
) -> ResearchService:
    """Get research service instance.

    Args:
        session: Database session

    Returns:
        ResearchService instance
    """
    job_repository = ResearchJobRepository(session)
    result_repository = ResultRepository(session)
    return ResearchService(job_repository, result_repository)


@router.post(
    "/jobs",
    response_model=ResearchJobOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create research job",
    description="Create a new research job with items to be researched",
    responses={
        201: {"description": "Research job created successfully"},
        400: {"model": ErrorOut, "description": "Invalid input data"},
        422: {"model": ErrorOut, "description": "Validation error"},
    },
)
async def create_research_job(
    job_data: ResearchJobCreateIn,
    service: ResearchService = Depends(get_research_service),
) -> ResearchJobOut:
    """Create a new research job."""
    try:
        # Convert Pydantic models to dictionaries
        items_data = [item.model_dump() for item in job_data.items]
        
        # Create research job
        job = await service.create_research_job(
            items=items_data,
            metadata=job_data.metadata,
        )
        
        # Convert domain entity to response model
        return ResearchJobOut(**job.to_dict())
        
    except ValueError as e:
        logger.error(f"Failed to create research job: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Unexpected error creating research job: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.post(
    "/jobs/{job_id}/start",
    response_model=TaskStatusOut,
    summary="Start research job",
    description="Start processing a research job",
    responses={
        200: {"description": "Research job started successfully"},
        404: {"model": ErrorOut, "description": "Job not found"},
        400: {"model": ErrorOut, "description": "Job cannot be started"},
    },
)
async def start_research_job(
    job_id: UUID,
    service: ResearchService = Depends(get_research_service),
) -> TaskStatusOut:
    """Start processing a research job."""
    try:
        task_id = await service.start_research_job(job_id)
        
        return TaskStatusOut(
            task_id=task_id,
            status="PENDING",
            result=None,
            progress={"job_id": str(job_id), "status": "started"},
        )
        
    except ValueError as e:
        logger.error(f"Failed to start research job {job_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Unexpected error starting research job {job_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get(
    "/jobs/{job_id}",
    response_model=ResearchJobOut,
    summary="Get research job",
    description="Get details of a specific research job",
    responses={
        200: {"description": "Research job details"},
        404: {"model": ErrorOut, "description": "Job not found"},
    },
)
async def get_research_job(
    job_id: UUID,
    service: ResearchService = Depends(get_research_service),
) -> ResearchJobOut:
    """Get a research job by ID."""
    job = await service.get_research_job(job_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    
    return ResearchJobOut(**job.to_dict())


@router.get(
    "/jobs",
    response_model=List[ResearchJobSummaryOut],
    summary="List research jobs",
    description="List research jobs with optional filtering",
    responses={
        200: {"description": "List of research jobs"},
    },
)
async def list_research_jobs(
    status_filter: Optional[str] = Query(
        None,
        description="Filter by job status",
        regex="^(pending|processing|completed|failed|cancelled)$",
    ),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of jobs to return"),
    service: ResearchService = Depends(get_research_service),
) -> List[ResearchJobSummaryOut]:
    """List research jobs."""
    try:
        # Convert string status to enum if provided
        status_enum = None
        if status_filter:
            status_enum = JobStatus(status_filter)
        
        jobs = await service.list_research_jobs(status=status_enum, limit=limit)
        
        # Convert to summary format
        return [
            ResearchJobSummaryOut(
                id=job.id,
                status=job.status.value,
                total_items=job.total_items,
                processed_items=job.processed_items,
                failed_items=job.failed_items,
                success_rate=job.success_rate,
                created_at=job.created_at,
                updated_at=job.updated_at,
                started_at=job.started_at,
                completed_at=job.completed_at,
            )
            for job in jobs
        ]
        
    except ValueError as e:
        logger.error(f"Failed to list research jobs: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put(
    "/jobs/{job_id}",
    response_model=ResearchJobOut,
    summary="Update research job",
    description="Update research job status or metadata",
    responses={
        200: {"description": "Research job updated successfully"},
        404: {"model": ErrorOut, "description": "Job not found"},
        400: {"model": ErrorOut, "description": "Invalid update data"},
    },
)
async def update_research_job(
    job_id: UUID,
    job_update: ResearchJobUpdateIn,
    service: ResearchService = Depends(get_research_service),
) -> ResearchJobOut:
    """Update a research job."""
    try:
        # Handle status update (cancellation)
        if job_update.status == "cancelled":
            success = await service.cancel_research_job(job_id)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Job not found or cannot be cancelled",
                )
        
        # Handle metadata update
        if job_update.metadata is not None:
            success = await service.update_job_metadata(job_id, job_update.metadata)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Job not found",
                )
        
        # Get updated job
        job = await service.get_research_job(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found",
            )
        
        return ResearchJobOut(**job.to_dict())
        
    except ValueError as e:
        logger.error(f"Failed to update research job {job_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/tasks/{task_id}/status",
    response_model=TaskStatusOut,
    summary="Get task status",
    description="Get the status of a Celery task",
    responses={
        200: {"description": "Task status"},
        404: {"model": ErrorOut, "description": "Task not found"},
    },
)
async def get_task_status(task_id: str) -> TaskStatusOut:
    """Get Celery task status."""
    try:
        # Get task result from Celery
        task_result = celery_app.AsyncResult(task_id)
        
        # Format response
        response = TaskStatusOut(
            task_id=task_id,
            status=task_result.status,
            result=task_result.result if task_result.ready() else None,
            progress=task_result.info if task_result.status == "PROGRESS" else None,
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Failed to get task status for {task_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )


@router.get(
    "/stats",
    summary="Get research statistics",
    description="Get statistics about research jobs and queue health",
    responses={
        200: {"description": "Research statistics"},
    },
)
async def get_research_statistics(
    service: ResearchService = Depends(get_research_service),
) -> dict:
    """Get research job statistics."""
    try:
        stats = await service.get_job_statistics()
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get research statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get statistics",
        )