"""Product research API endpoints."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, status

from app.core.logging import get_logger
from app.domain.product_entities import ProductResearchItem
from app.schemas.product_research_in import (
    JobStatusRequest,
    ProductResearchRequest,
)
from app.schemas.product_research_out import (
    ErrorResponse,
    JobStatusResponse,
    ProductResearchResponse,
    ProductResultResponse,
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
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        429: {"model": ErrorResponse, "description": "요청 제한 초과"},
    }
)
async def create_product_research(
    request: ProductResearchRequest,
    background_tasks: BackgroundTasks,
    use_celery: bool = Query(False, description="Celery 백그라운드 작업 사용 여부"),
    return_coupang_preview: bool = Query(False, description="쿠팡 정보 즉시 리턴 여부")
) -> ProductResearchResponse:
    """제품 리서치 작업을 생성합니다.
    
    Args:
        request: 제품 리서치 요청
        background_tasks: FastAPI 백그라운드 작업
        use_celery: Celery 사용 여부
        
    Returns:
        리서치 작업 응답
        
    Raises:
        HTTPException: 요청 처리 실패 시
    """
    try:
        service = get_product_research_service()
        
        # Convert request items to domain entities
        items = [
            ProductResearchItem(
                product_name=item.product_name,
                category=item.category,
                price_exact=item.price_exact,
                currency=item.currency,
                seller_or_store=item.seller_or_store,
                metadata=item.metadata or {}
            )
            for item in request.items
        ]
        
        if use_celery:
            # Create Celery task
            task_id = service.create_celery_task(
                items=[item.to_dict() for item in items],
                priority=request.priority
            )
            
            # Return task ID as job_id
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
                    updated_at=datetime.utcnow()
                )
            )
        else:
            # Check if Coupang preview is requested
            if return_coupang_preview:
                # Create job with immediate Coupang preview
                job = await service.create_research_job_with_coupang_preview(
                    items=items,
                    priority=request.priority,
                    callback_url=request.callback_url
                )
            else:
                # Create regular async job
                job = await service.create_research_job(
                    items=items,
                    priority=request.priority,
                    callback_url=request.callback_url
                )
            
            # Convert results to response format
            results = []
            if return_coupang_preview and job.results:
                for result in job.results:
                    # Extract Coupang info from metadata for response
                    coupang_info = None
                    if "coupang_info" in result.metadata:
                        coupang_metadata = result.metadata["coupang_info"]
                        from app.schemas.product_research_out import CoupangInfoResponse
                        coupang_info = CoupangInfoResponse(
                            product_id=coupang_metadata.get("product_id"),
                            product_url=coupang_metadata.get("product_url"),
                            product_image=coupang_metadata.get("product_image"),
                            is_rocket=coupang_metadata.get("is_rocket"),
                            is_free_shipping=coupang_metadata.get("is_free_shipping"),
                            category_name=coupang_metadata.get("category_name"),
                            product_price=result.price_exact
                        )
                    
                    results.append(ProductResultResponse(
                        product_name=result.product_name,
                        brand=result.brand,
                        category=result.category,
                        model_or_variant=result.model_or_variant,
                        price_exact=result.price_exact,
                        currency=result.currency,
                        seller_or_store=result.seller_or_store,
                        deeplink_or_product_url=result.deeplink_or_product_url,
                        coupang_price=result.coupang_price,
                        coupang_info=coupang_info,
                        specs=result.specs,
                        reviews=result.reviews,
                        sources=result.sources,
                        captured_at=result.captured_at,
                        status=result.status.value,
                        error_message=result.error_message,
                        missing_fields=result.missing_fields,
                        suggested_queries=result.suggested_queries
                    ))
            
            # Convert to response
            return ProductResearchResponse(
                job_id=job.id,
                status=job.status.value,
                results=results,
                metadata=ResearchMetadataResponse(
                    total_items=job.total_items,
                    successful_items=job.successful_items,
                    failed_items=job.failed_items,
                    success_rate=job.success_rate,
                    processing_time_ms=job.processing_time_ms,
                    created_at=job.created_at,
                    updated_at=job.updated_at,
                    started_at=job.started_at,
                    completed_at=job.completed_at
                )
            )
            
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to create research job: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="리서치 작업 생성에 실패했습니다."
        )


@router.get(
    "/{job_id}",
    response_model=ProductResearchResponse,
    summary="리서치 결과 조회",
    description="완료된 리서치 작업의 결과를 조회합니다.",
    responses={
        200: {"description": "리서치 결과"},
        404: {"model": ErrorResponse, "description": "작업을 찾을 수 없음"},
    }
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
        HTTPException: 작업을 찾을 수 없을 때
    """
    service = get_product_research_service()
    
    job = await service.get_job_results(job_id, include_failed=include_failed)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"작업 ID {job_id}를 찾을 수 없습니다."
        )
    
    # Convert results to response format
    results = [
        ProductResultResponse(
            product_name=result.product_name,
            brand=result.brand,
            category=result.category,
            model_or_variant=result.model_or_variant,
            price_exact=result.price_exact,
            currency=result.currency,
            seller_or_store=result.seller_or_store,
            deeplink_or_product_url=result.deeplink_or_product_url,
            coupang_price=result.coupang_price,
            specs=result.specs.to_dict(),
            reviews=result.reviews.to_dict(),
            sources=result.sources,
            captured_at=result.captured_at,
            status=result.status.value,
            error_message=result.error_message,
            missing_fields=result.missing_fields,
            suggested_queries=result.suggested_queries
        )
        for result in job.results
    ]
    
    return ProductResearchResponse(
        job_id=job.id,
        status=job.status.value,
        results=results,
        metadata=ResearchMetadataResponse(
            total_items=job.total_items,
            successful_items=job.successful_items,
            failed_items=job.failed_items,
            success_rate=job.success_rate,
            processing_time_ms=job.processing_time_ms,
            created_at=job.created_at,
            updated_at=job.updated_at,
            started_at=job.started_at,
            completed_at=job.completed_at
        )
    )


@router.get(
    "/{job_id}/status",
    response_model=JobStatusResponse,
    summary="작업 상태 조회",
    description="리서치 작업의 현재 상태를 조회합니다.",
    responses={
        200: {"description": "작업 상태"},
        404: {"model": ErrorResponse, "description": "작업을 찾을 수 없음"},
    }
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
        HTTPException: 작업을 찾을 수 없을 때
    """
    service = get_product_research_service()
    
    if is_celery:
        # Get Celery task status
        status_dict = service.get_celery_task_status(job_id)
        
        return JobStatusResponse(
            job_id=job_id,
            status=status_dict["status"],
            progress=status_dict["progress"],
            message=status_dict.get("message"),
            metadata=status_dict.get("result")
        )
    else:
        # Get async job status
        try:
            job_uuid = UUID(job_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="잘못된 작업 ID 형식입니다."
            )
        
        job = await service.get_job_status(job_uuid)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"작업 ID {job_id}를 찾을 수 없습니다."
            )
        
        # Calculate progress
        progress = 0.0
        if job.total_items > 0:
            progress = (job.successful_items + job.failed_items) / job.total_items
        
        return JobStatusResponse(
            job_id=job_uuid,
            status=job.status.value,
            progress=progress,
            message=f"{job.total_items}개 중 {job.successful_items + job.failed_items}개 처리 완료",
            metadata={
                "total": job.total_items,
                "successful": job.successful_items,
                "failed": job.failed_items
            }
        )


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="작업 취소",
    description="진행 중인 리서치 작업을 취소합니다.",
    responses={
        204: {"description": "작업이 취소됨"},
        404: {"model": ErrorResponse, "description": "작업을 찾을 수 없음"},
        400: {"model": ErrorResponse, "description": "작업을 취소할 수 없음"},
    }
)
async def cancel_research_job(job_id: UUID) -> None:
    """리서치 작업을 취소합니다.
    
    Args:
        job_id: 작업 ID
        
    Raises:
        HTTPException: 작업을 찾을 수 없거나 취소할 수 없을 때
    """
    service = get_product_research_service()
    
    cancelled = await service.cancel_job(job_id)
    if not cancelled:
        job = await service.get_job_status(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"작업 ID {job_id}를 찾을 수 없습니다."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"작업이 이미 완료되었거나 취소할 수 없는 상태입니다."
            )


# Import datetime at the top of the file
from datetime import datetime