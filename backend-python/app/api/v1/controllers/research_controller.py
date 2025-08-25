"""Research API controller with separated responsibilities.

This controller orchestrates general research job operations by coordinating between
specialized handlers and the service layer, following Clean Architecture principles.
"""

from typing import List, Optional
from uuid import UUID

from celery import current_app as celery_app
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.handlers import (
    get_api_error_handler,
    get_request_validator,
    get_response_formatter,
)
from app.core.logging import get_logger
from app.domain.entities import JobStatus
from app.infra.db.repositories import ResearchJobRepository, ResultRepository
from app.infra.db.session import get_db
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


def get_research_service(session: AsyncSession = Depends(get_db)) -> ResearchService:
    """Get research service instance with dependency injection.

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
    """Create a new research job.

    Args:
        job_data: Research job creation data
        service: Research service instance

    Returns:
        Created research job details

    Raises:
        HTTPException: API error response
    """
    error_handler = get_api_error_handler()
    formatter = get_response_formatter()

    try:
        # Convert Pydantic models to dictionaries for service layer
        items_data = [item.model_dump() for item in job_data.items]

        # Create research job through service
        job = await service.create_research_job(
            items=items_data,
            metadata=job_data.metadata,
        )

        # Format response using formatter
        return formatter.format_research_job_detail(job)

    except Exception as e:
        raise error_handler.handle_endpoint_exception(
            e, "create_research_job", {"items_count": len(job_data.items)}
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
    """Start processing a research job.

    Args:
        job_id: Research job ID
        service: Research service instance

    Returns:
        Task status information

    Raises:
        HTTPException: API error response
    """
    error_handler = get_api_error_handler()
    formatter = get_response_formatter()

    try:
        task_id = await service.start_research_job(job_id)

        # Format task status response
        return formatter.format_task_status(
            task_id=task_id,
            status="PENDING",
            result=None,
            progress={"job_id": str(job_id), "status": "started"},
        )

    except Exception as e:
        raise error_handler.handle_endpoint_exception(
            e, "start_research_job", {"job_id": str(job_id)}
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
    """Get a research job by ID.

    Args:
        job_id: Research job ID
        service: Research service instance

    Returns:
        Research job details

    Raises:
        HTTPException: API error response
    """
    error_handler = get_api_error_handler()
    formatter = get_response_formatter()

    try:
        job = await service.get_research_job(job_id)

        if not job:
            raise error_handler.handle_resource_not_found(
                resource_type="Job",
                resource_id=str(job_id),
                endpoint_name="get_research_job",
            )

        return formatter.format_research_job_detail(job)

    except Exception as e:
        raise error_handler.handle_endpoint_exception(
            e, "get_research_job", {"job_id": str(job_id)}
        )


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
    """List research jobs with optional filtering.

    Args:
        status_filter: Filter by job status
        limit: Maximum number of jobs to return
        service: Research service instance

    Returns:
        List of research job summaries

    Raises:
        HTTPException: API error response
    """
    validator = get_request_validator()
    error_handler = get_api_error_handler()
    formatter = get_response_formatter()

    try:
        # Validate query parameters
        query_params = {"status_filter": status_filter, "limit": limit}
        validated_params = validator.validate_query_parameters(
            query_params, {"status_filter": str, "limit": int}
        )

        # Convert string status to enum if provided
        status_enum = None
        if validated_params.get("status_filter"):
            status_enum = JobStatus(validated_params["status_filter"])

        # Get jobs from service
        jobs = await service.list_research_jobs(
            status=status_enum, limit=validated_params["limit"]
        )

        # Format response using formatter
        return [formatter.format_research_job_summary(job) for job in jobs]

    except Exception as e:
        raise error_handler.handle_endpoint_exception(
            e, "list_research_jobs", {"status_filter": status_filter, "limit": limit}
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
    """Update a research job.

    Args:
        job_id: Research job ID
        job_update: Update data
        service: Research service instance

    Returns:
        Updated research job details

    Raises:
        HTTPException: API error response
    """
    error_handler = get_api_error_handler()
    formatter = get_response_formatter()

    try:
        # Handle status update (cancellation)
        if job_update.status == "cancelled":
            success = await service.cancel_research_job(job_id)
            if not success:
                raise error_handler.handle_resource_not_found(
                    resource_type="Job",
                    resource_id=str(job_id),
                    endpoint_name="update_research_job",
                    context={"operation": "cancel"},
                )

        # Handle metadata update
        if job_update.metadata is not None:
            success = await service.update_job_metadata(job_id, job_update.metadata)
            if not success:
                raise error_handler.handle_resource_not_found(
                    resource_type="Job",
                    resource_id=str(job_id),
                    endpoint_name="update_research_job",
                    context={"operation": "update_metadata"},
                )

        # Get updated job
        job = await service.get_research_job(job_id)
        if not job:
            raise error_handler.handle_resource_not_found(
                resource_type="Job",
                resource_id=str(job_id),
                endpoint_name="update_research_job",
            )

        return formatter.format_research_job_detail(job)

    except Exception as e:
        raise error_handler.handle_endpoint_exception(
            e, "update_research_job", {"job_id": str(job_id), "update_type": job_update}
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
    """Get Celery task status.

    Args:
        task_id: Celery task ID

    Returns:
        Task status information

    Raises:
        HTTPException: API error response
    """
    error_handler = get_api_error_handler()
    formatter = get_response_formatter()

    try:
        # Get task result from Celery
        task_result = celery_app.AsyncResult(task_id)

        # Format response using formatter
        return formatter.format_task_status(
            task_id=task_id,
            status=task_result.status,
            result=task_result.result if task_result.ready() else None,
            progress=task_result.info if task_result.status == "PROGRESS" else None,
        )

    except Exception as e:
        raise error_handler.handle_endpoint_exception(
            e, "get_task_status", {"task_id": task_id}
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
    """Get research job statistics.

    Args:
        service: Research service instance

    Returns:
        Research statistics dictionary

    Raises:
        HTTPException: API error response
    """
    error_handler = get_api_error_handler()

    try:
        stats = await service.get_job_statistics()
        return stats

    except Exception as e:
        raise error_handler.handle_endpoint_exception(e, "get_research_statistics")