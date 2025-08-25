"""Product research API controller with separated responsibilities.

This controller orchestrates product research operations by coordinating between
specialized handlers and the service layer, following Clean Architecture principles.
"""

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Query, status

from app.api.v1.handlers import (
    get_api_error_handler,
    get_request_validator,
    get_response_formatter,
)
from app.core.logging import get_logger
from app.schemas.error_responses import StandardError
from app.schemas.product_research_in import ProductResearchRequest
from app.schemas.product_research_out import (
    JobStatusResponse,
    ProductResearchResponse,
    ResearchMetadataResponse,
)
from app.services.product_research_service import get_product_research_service

logger = get_logger(__name__)

router = APIRouter(
    prefix="/research/products",
    tags=["제품 리서치"],
)


@router.post(
    "",
    response_model=ProductResearchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="제품 리서치 요청",
    description="최대 10개의 제품을 동시에 리서치합니다. Perplexity AI를 활용하여 제품 정보, 리뷰, 가격 비교 등을 수집합니다.",
    responses={
        201: {"description": "리서치 작업이 성공적으로 생성됨"},
        400: {"model": StandardError, "description": "잘못된 요청"},
        422: {"model": StandardError, "description": "입력 데이터 검증 실패"},
        429: {"model": StandardError, "description": "요청 제한 초과"},
        503: {"model": StandardError, "description": "외부 서비스 장애"},
        500: {"model": StandardError, "description": "서버 내부 오류"},
    },
)
async def create_product_research(
    request: ProductResearchRequest,
    background_tasks: BackgroundTasks,
    use_celery: bool = Query(False, description="Celery 백그라운드 작업 사용 여부"),
    return_coupang_preview: bool = Query(False, description="쿠팡 정보 즉시 리턴 여부"),
) -> ProductResearchResponse:
    """제품 리서치 작업을 생성합니다.

    Args:
        request: 제품 리서치 요청
        background_tasks: FastAPI 백그라운드 작업
        use_celery: Celery 사용 여부
        return_coupang_preview: 쿠팡 정보 즉시 리턴 여부

    Returns:
        리서치 작업 응답

    Raises:
        HTTPException: API 에러 응답
    """
    validator = get_request_validator()
    formatter = get_response_formatter()
    error_handler = get_api_error_handler()

    try:
        # Validate and transform request
        items = validator.validate_product_research_request(request)

        # Get service
        service = get_product_research_service()

        if use_celery:
            # Create Celery task
            task_id = service.create_celery_task(
                items=[item.to_dict() for item in items], 
                priority=request.priority
            )

            # Return immediate response with task ID
            return ProductResearchResponse(
                job_id=task_id,
                status="pending",
                results=[],
                metadata=ResearchMetadataResponse(
                    total_items=len(items),
                    successful_items=0,
                    failed_items=0,
                    success_rate=0.0,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                ),
            )
        else:
            # Handle async job creation
            if return_coupang_preview:
                job = await _create_job_with_coupang_preview(
                    service, items, request, error_handler
                )
            else:
                job = await service.create_research_job(
                    items=items,
                    priority=request.priority,
                    callback_url=request.callback_url,
                )

            # Format and return response
            return formatter.format_product_research_response(
                job, include_coupang_info=return_coupang_preview
            )

    except Exception as e:
        raise error_handler.handle_endpoint_exception(
            e, "create_product_research", {"use_celery": use_celery, "return_coupang_preview": return_coupang_preview}
        )


@router.get(
    "/{job_id}",
    response_model=ProductResearchResponse,
    summary="리서치 결과 조회",
    description="완료된 리서치 작업의 결과를 조회합니다.",
    responses={
        200: {"description": "리서치 결과"},
        400: {"model": StandardError, "description": "잘못된 요청"},
        404: {"model": StandardError, "description": "작업을 찾을 수 없음"},
        500: {"model": StandardError, "description": "서버 내부 오류"},
    },
)
async def get_research_results(
    job_id: UUID, 
    include_failed: bool = Query(True, description="실패한 아이템 포함 여부")
) -> ProductResearchResponse:
    """리서치 작업 결과를 조회합니다.

    Args:
        job_id: 작업 ID
        include_failed: 실패한 아이템 포함 여부

    Returns:
        리서치 결과

    Raises:
        HTTPException: API 에러 응답
    """
    formatter = get_response_formatter()
    error_handler = get_api_error_handler()

    try:
        service = get_product_research_service()

        job = await service.get_job_results(job_id, include_failed=include_failed)
        if not job:
            raise error_handler.handle_resource_not_found(
                resource_type="Job",
                resource_id=str(job_id),
                endpoint_name="get_research_results",
            )

        # Format and return response
        return formatter.format_product_research_response(job, include_failed=include_failed)

    except Exception as e:
        raise error_handler.handle_endpoint_exception(
            e, "get_research_results", {"job_id": str(job_id), "include_failed": include_failed}
        )


@router.get(
    "/{job_id}/status",
    response_model=JobStatusResponse,
    summary="작업 상태 조회",
    description="리서치 작업의 현재 상태를 조회합니다.",
    responses={
        200: {"description": "작업 상태"},
        400: {"model": StandardError, "description": "잘못된 요청"},
        404: {"model": StandardError, "description": "작업을 찾을 수 없음"},
        500: {"model": StandardError, "description": "서버 내부 오류"},
    },
)
async def get_job_status(
    job_id: str, 
    is_celery: bool = Query(False, description="Celery 작업 여부")
) -> JobStatusResponse:
    """리서치 작업 상태를 조회합니다.

    Args:
        job_id: 작업 ID
        is_celery: Celery 작업 여부

    Returns:
        작업 상태

    Raises:
        HTTPException: API 에러 응답
    """
    validator = get_request_validator()
    formatter = get_response_formatter()
    error_handler = get_api_error_handler()

    try:
        service = get_product_research_service()

        if is_celery:
            # Handle Celery task status
            status_dict = service.get_celery_task_status(job_id)
            return JobStatusResponse(
                job_id=job_id,
                status=status_dict["status"],
                progress=status_dict["progress"],
                message=status_dict.get("message"),
                metadata=status_dict.get("result"),
            )
        else:
            # Handle async job status
            job_uuid = validator.validate_uuid_parameter(job_id, "job_id")
            
            job = await service.get_job_status(job_uuid)
            if not job:
                raise error_handler.handle_resource_not_found(
                    resource_type="Job",
                    resource_id=job_id,
                    endpoint_name="get_job_status",
                )

            # Calculate progress and format response
            progress = formatter.calculate_job_progress(job)
            message = formatter.format_job_progress_message(job)

            return formatter.format_job_status_response(
                job_id=job_uuid,
                status=job.status.value,
                progress=progress,
                message=message,
                metadata={
                    "total": job.total_items,
                    "successful": job.successful_items,
                    "failed": job.failed_items,
                },
            )

    except Exception as e:
        raise error_handler.handle_endpoint_exception(
            e, "get_job_status", {"job_id": job_id, "is_celery": is_celery}
        )


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="작업 취소",
    description="진행 중인 리서치 작업을 취소합니다.",
    responses={
        204: {"description": "작업이 취소됨"},
        400: {"model": StandardError, "description": "작업을 취소할 수 없음"},
        404: {"model": StandardError, "description": "작업을 찾을 수 없음"},
        500: {"model": StandardError, "description": "서버 내부 오류"},
    },
)
async def cancel_research_job(job_id: UUID) -> None:
    """리서치 작업을 취소합니다.

    Args:
        job_id: 작업 ID

    Raises:
        HTTPException: API 에러 응답
    """
    error_handler = get_api_error_handler()

    try:
        service = get_product_research_service()

        cancelled = await service.cancel_job(job_id)
        if not cancelled:
            # Check if job exists and determine appropriate error
            job = await service.get_job_status(job_id)
            if not job:
                raise error_handler.handle_resource_not_found(
                    resource_type="Job",
                    resource_id=str(job_id),
                    endpoint_name="cancel_research_job",
                )
            else:
                raise error_handler.handle_business_rule_violation(
                    rule_name="job_cancellation",
                    message=f"Job {job_id} is in status {job.status.value} and cannot be cancelled",
                    endpoint_name="cancel_research_job",
                    context={
                        "job_id": str(job_id),
                        "current_status": job.status.value,
                    },
                )

    except Exception as e:
        raise error_handler.handle_endpoint_exception(
            e, "cancel_research_job", {"job_id": str(job_id)}
        )


async def _create_job_with_coupang_preview(service, items, request, error_handler):
    """Helper function to create job with Coupang preview fallback.

    Args:
        service: Research service instance
        items: List of product items
        request: Original request
        error_handler: Error handler instance

    Returns:
        Created research job
    """
    try:
        return await service.create_research_job_with_coupang_preview(
            items=items,
            priority=request.priority,
            callback_url=request.callback_url,
        )
    except Exception as coupang_error:
        logger.warning(
            f"Coupang preview failed, falling back to regular job: {coupang_error}",
            extra={"fallback_reason": str(coupang_error)},
        )
        # Fall back to regular job creation
        return await service.create_research_job(
            items=items,
            priority=request.priority,
            callback_url=request.callback_url,
        )