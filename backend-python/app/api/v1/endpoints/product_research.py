"""제품 리서치 API 엔드포인트 - 향상된 에러 처리 및 요청 추적 시스템."""

from datetime import datetime
from uuid import UUID, uuid4

from fastapi import APIRouter, BackgroundTasks, Query, status
from pydantic import ValidationError as PydanticValidationError

from app.core.exceptions import (
    BaseAPIException,
    ValidationException,
)
from app.core.exceptions.exception_handler import get_exception_handler
from app.core.logging import get_logger
from app.domain.product_entities import ProductResearchItem
from app.schemas.error_responses import ErrorCode, StandardError
from app.schemas.product_research_in import (
    ProductResearchRequest,
)
from app.schemas.product_research_out import (
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
) -> dict:
    """제품 리서치 작업을 생성합니다.

    Args:
        request: 제품 리서치 요청 데이터
        background_tasks: FastAPI 백그라운드 작업 관리자
        use_celery: Celery 백그라운드 작업 사용 여부
        return_coupang_preview: 쿠팡 정보 즉시 리턴 여부

    Returns:
        리서치 작업 응답 (API 가이드 형식)

    Raises:
        BaseAPIException: 구조화된 API 에러 발생시
    """
    # 고유 요청 ID 생성
    request_id = str(uuid4())
    
    # Step 1: API 요청 수신 로그
    logger.info(
        f"[Step 1] 📥 API 요청 수신 | request_id={request_id} | endpoint=/research/products | "
        f"items_count={len(request.items)} | celery={use_celery} | coupang_preview={return_coupang_preview} | priority={request.priority}",
        extra={
            "step": 1,
            "request_id": request_id,
            "endpoint": "/research/products",
            "items_count": len(request.items),
            "use_celery": use_celery,
            "return_coupang_preview": return_coupang_preview,
            "priority": request.priority,
            "file_location": "app/api/v1/endpoints/product_research.py:create_product_research"
        }
    )

    # 요청된 제품 상세 정보 로깅 (디버그 레벨)
    for i, item in enumerate(request.items):
        logger.debug(
            f"제품 {i+1}: {item.product_name} (카테고리: {item.category})",
            extra={
                "request_id": request_id,
                "item_index": i, 
                "product_name": item.product_name, 
                "category": item.category
            }
        )

    try:
        # Step 2: 요청 검증 시작
        logger.info(
            f"[Step 2] 🔍 요청 검증 시작 | request_id={request_id} | validating_items_count={len(request.items)}",
            extra={
                "step": 2,
                "request_id": request_id,
                "validating_items_count": len(request.items),
                "file_location": "app/api/v1/endpoints/product_research.py:validation"
            }
        )
        
        # 배치 크기 검증
        if len(request.items) == 0:
            logger.error(f"[Step 2] ❌ 검증 실패 | request_id={request_id} | error=empty_items_list")
            raise ValidationException(
                validation_errors=[],
                message="최소 1개 이상의 제품을 입력해야 합니다.",
                details="Empty items list provided",
            )

        if len(request.items) > 10:
            logger.error(f"[Step 2] ❌ 검증 실패 | request_id={request_id} | error=batch_size_exceeded | received={len(request.items)} | max_allowed=10")
            raise BaseAPIException(
                error_code=ErrorCode.BATCH_SIZE_EXCEEDED,
                details=f"Received {len(request.items)} items, maximum allowed is 10",
                metadata={"received_count": len(request.items), "max_allowed": 10},
            )
            
        logger.info(
            f"[Step 2] ✅ 요청 검증 완료 | request_id={request_id} | items_count={len(request.items)} | validation=passed",
            extra={
                "step": 2,
                "request_id": request_id,
                "items_count": len(request.items),
                "validation_result": "passed"
            }
        )
        
        # Step 3: 서비스 인스턴스 생성
        logger.info(
            f"[Step 3] 🔧 서비스 인스턴스 생성 | request_id={request_id}",
            extra={
                "step": 3,
                "request_id": request_id,
                "service": "ProductResearchService",
                "file_location": "app/services/product_research_service.py"
            }
        )
        service = get_product_research_service()

        # Step 4: 도메인 엔티티 변환
        logger.info(
            f"[Step 4] 🔄 도메인 엔티티 변환 | request_id={request_id} | converting_items={len(request.items)}",
            extra={
                "step": 4,
                "request_id": request_id,
                "converting_items": len(request.items),
                "entity_type": "ProductResearchItem",
                "file_location": "app/domain/product_entities.py:ProductResearchItem"
            }
        )
        
        # 요청 아이템을 도메인 엔티티로 변환
        items = [
            ProductResearchItem(
                product_name=item.product_name,
                category=item.category,
                price_exact=item.price_exact,
                currency=item.currency,
                seller_or_store=item.seller_or_store,
                # 쿠팡 API 필드들 추가
                product_id=getattr(item, 'product_id', None),
                product_image=getattr(item, 'product_image', None),
                product_url=getattr(item, 'product_url', None),
                is_rocket=getattr(item, 'is_rocket', None),
                is_free_shipping=getattr(item, 'is_free_shipping', None),
                category_name=getattr(item, 'category_name', None),
                keyword=getattr(item, 'keyword', None),
                rank=getattr(item, 'rank', None),
                metadata=item.metadata or {},
            )
            for item in request.items
        ]
        
        logger.info(
            f"[Step 4] ✅ 도메인 엔티티 변환 완료 | request_id={request_id} | converted_items={len(items)}",
            extra={
                "step": 4,
                "request_id": request_id,
                "converted_items": len(items)
            }
        )

        if use_celery:
            # Step 5A: Celery 백그라운드 작업 생성
            logger.info(
                f"[Step 5A] ⚡ Celery 백그라운드 작업 생성 | request_id={request_id} | priority={request.priority}",
                extra={
                    "step": "5A",
                    "request_id": request_id,
                    "task_type": "celery",
                    "priority": request.priority,
                    "items_count": len(items),
                    "file_location": "app/services/product_research_service.py:create_celery_task"
                }
            )
            
            # Celery 작업 생성
            task_id = service.create_celery_task(
                items=[item.to_dict() for item in items], priority=request.priority
            )
            
            logger.info(
                f"[Step 5A] ✅ Celery 작업 생성 완료 | request_id={request_id} | task_id={task_id}",
                extra={
                    "step": "5A",
                    "request_id": request_id,
                    "task_id": task_id,
                    "task_type": "celery",
                    "status": "created"
                }
            )

            # Return task ID as job_id in API guide format
            response_data = ProductResearchResponse(
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

            # API guide format으로 반환 (FastAPI 기본 JSON 직렬화 사용)
            return {
                "success": True,
                "data": response_data,
                "message": "백그라운드 리서치 작업이 시작되었습니다."
            }
        else:
            # Step 5B: 쿠팡 미리보기 요청 확인
            if return_coupang_preview:
                logger.info(
                    f"[Step 5B] 🛒 쿠팡 미리보기 작업 생성 | request_id={request_id} | preview=enabled",
                    extra={
                        "step": "5B",
                        "request_id": request_id,
                        "task_type": "coupang_preview",
                        "priority": request.priority,
                        "callback_url": request.callback_url,
                        "file_location": "app/services/product_research_service.py:create_research_job_with_coupang_preview"
                    }
                )
                try:
                    # 쿠팡 미리보기 포함 작업 생성
                    job = await service.create_research_job_with_coupang_preview(
                        items=items,
                        priority=request.priority,
                        callback_url=request.callback_url,
                    )
                    
                    logger.info(
                        f"[Step 5B] ✅ 쿠팡 미리보기 작업 생성 완료 | request_id={request_id} | job_id={job.id} | coupang_results={len(job.results)}",
                        extra={
                            "step": "5B",
                            "request_id": request_id,
                            "job_id": str(job.id),
                            "task_type": "coupang_preview",
                            "coupang_results_count": len(job.results),
                            "status": "created"
                        }
                    )
                except Exception as coupang_error:
                    logger.warning(
                        f"[Step 5B] ⚠️ 쿠팡 미리보기 실패, 일반 작업으로 전환 | request_id={request_id} | error={str(coupang_error)}",
                        extra={
                            "step": "5B",
                            "request_id": request_id,
                            "error": str(coupang_error),
                            "fallback": "regular_job"
                        }
                    )
                    # 쿠팡 미리보기 실패시 일반 작업으로 대체
                    job = await service.create_research_job(
                        items=items,
                        priority=request.priority,
                        callback_url=request.callback_url,
                    )
            else:
                # Step 5C: 일반 비동기 작업 생성
                logger.info(
                    f"[Step 5C] 🔄 일반 비동기 작업 생성 | request_id={request_id} | preview=disabled",
                    extra={
                        "step": "5C",
                        "request_id": request_id,
                        "task_type": "regular",
                        "priority": request.priority,
                        "callback_url": request.callback_url,
                        "file_location": "app/services/product_research_service.py:create_research_job"
                    }
                )
                
                # 일반 비동기 작업 생성
                job = await service.create_research_job(
                    items=items,
                    priority=request.priority,
                    callback_url=request.callback_url,
                )
                
                logger.info(
                    f"[Step 5C] ✅ 일반 비동기 작업 생성 완료 | request_id={request_id} | job_id={job.id}",
                    extra={
                        "step": "5C",
                        "request_id": request_id,
                        "job_id": str(job.id),
                        "task_type": "regular",
                        "status": "created"
                    }
                )

            # Step 6: 응답 데이터 변환 시작
            logger.info(
                f"[Step 6] 📦 응답 데이터 변환 시작 | request_id={request_id} | job_results={len(job.results)}",
                extra={
                    "step": 6,
                    "request_id": request_id,
                    "job_id": str(job.id),
                    "job_results_count": len(job.results),
                    "file_location": "app/api/v1/endpoints/product_research.py:response_conversion"
                }
            )
            
            # 결과를 응답 형식으로 변환
            results = []
            coupang_errors = []

            if return_coupang_preview and job.results:
                for result in job.results:
                    # Extract Coupang info from metadata for response
                    coupang_info = None
                    if "coupang_info" in result.metadata:
                        try:
                            coupang_metadata = result.metadata["coupang_info"]
                            from app.schemas.product_research_out import (
                                CoupangInfoResponse,
                            )

                            coupang_info = CoupangInfoResponse(
                                product_id=coupang_metadata.get("product_id"),
                                product_url=coupang_metadata.get("product_url"),
                                product_image=coupang_metadata.get("product_image"),
                                is_rocket=coupang_metadata.get("is_rocket"),
                                is_free_shipping=coupang_metadata.get(
                                    "is_free_shipping"
                                ),
                                category_name=coupang_metadata.get("category_name"),
                                product_price=result.price_exact,
                            )
                        except Exception as e:
                            logger.warning(
                                f"Failed to extract Coupang info for {result.product_name}: {e}"
                            )
                            coupang_errors.append(result.product_name)

                    results.append(
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
                            coupang_info=coupang_info,
                            specs=result.specs.to_dict(),
                            reviews=result.reviews.to_dict(),
                            sources=result.sources,
                            captured_at=result.captured_at,
                            status=result.status.value,
                            error_message=result.error_message,
                            missing_fields=result.missing_fields,
                            suggested_queries=result.suggested_queries,
                        )
                    )

            # Log Coupang extraction errors if any
            if coupang_errors:
                logger.warning(
                    f"Coupang data extraction failed for products: {coupang_errors}"
                )

            # Convert to API guide format (success/data/message structure)
            response_data = ProductResearchResponse(
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
                    completed_at=job.completed_at,
                ),
            )

            # Step 7: 최종 응답 생성
            final_message = f"제품 리서치 작업이 성공적으로 {'완료' if job.status.value == 'completed' else '생성'}되었습니다."
            logger.info(
                f"[Step 7] ✅ 요청 처리 완료 | request_id={request_id} | job_id={job.id} | status={job.status.value} | results_count={len(results)}",
                extra={
                    "step": 7,
                    "request_id": request_id,
                    "job_id": str(job.id),
                    "final_status": job.status.value,
                    "results_count": len(results),
                    "processing_completed": True,
                    "message": final_message
                }
            )

            # API 가이드 형식으로 최종 응답 반환 (FastAPI 기본 JSON 직렬화 사용)
            return {
                "success": True,
                "data": response_data,
                "message": final_message
            }

    except BaseAPIException:
        # Re-raise our custom exceptions
        raise
    except PydanticValidationError as e:
        # Handle Pydantic validation errors
        validation_exc = get_exception_handler().from_pydantic_validation_error(e)
        get_exception_handler().log_error(
            validation_exc, context={"endpoint": "create_product_research"}
        )
        raise validation_exc.to_http_exception()
    except ValueError as e:
        # Handle value errors as validation errors
        logger.error(f"Invalid request: {str(e)}")
        exc = BaseAPIException(
            error_code=ErrorCode.INVALID_REQUEST,
            details=str(e),
            metadata={"endpoint": "create_product_research"},
        )
        get_exception_handler().log_error(exc)
        raise exc.to_http_exception()
    except Exception as e:
        # Handle any other unexpected errors
        exc = get_exception_handler().from_generic_exception(e, ErrorCode.INTERNAL_SERVER_ERROR)
        exc.metadata = {"endpoint": "create_product_research"}
        get_exception_handler().log_error(exc)
        raise exc.to_http_exception()


@router.get(
    "/{job_id}",
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
    job_id: UUID, include_failed: bool = Query(True, description="실패한 아이템 포함 여부")
) -> dict:
    """리서치 작업 결과를 조회합니다.

    Args:
        job_id: 작업 ID
        include_failed: 실패한 아이템 포함 여부

    Returns:
        리서치 결과

    Raises:
        BaseAPIException: 구조화된 API 에러
    """
    try:
        service = get_product_research_service()

        job = await service.get_job_results(job_id, include_failed=include_failed)
        if not job:
            raise BaseAPIException(
                error_code=ErrorCode.JOB_NOT_FOUND,
                details=f"Job ID {job_id} not found in database",
                metadata={"job_id": str(job_id), "endpoint": "get_research_results"},
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
                suggested_queries=result.suggested_queries,
            )
            for result in job.results
        ]

        # Convert to API guide format
        response_data = ProductResearchResponse(
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
                completed_at=job.completed_at,
            ),
        )

        # API guide format으로 반환 (FastAPI 기본 JSON 직렬화 사용)
        return {
            "success": True,
            "data": response_data,
            "message": "리서치 결과를 성공적으로 조회했습니다."
        }

    except BaseAPIException:
        # Re-raise our custom exceptions
        raise
    except Exception as e:
        # Handle any other unexpected errors
        exc = get_exception_handler().from_generic_exception(e, ErrorCode.INTERNAL_SERVER_ERROR)
        exc.metadata = {"endpoint": "get_research_results", "job_id": str(job_id)}
        get_exception_handler().log_error(exc)
        raise exc.to_http_exception()


@router.get(
    "/{job_id}/status",
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
    job_id: str, is_celery: bool = Query(False, description="Celery 작업 여부")
) -> dict:
    """리서치 작업 상태를 조회합니다.

    Args:
        job_id: 작업 ID
        is_celery: Celery 작업 여부

    Returns:
        작업 상태

    Raises:
        BaseAPIException: 구조화된 API 에러
    """
    try:
        service = get_product_research_service()

        if is_celery:
            # Get Celery task status
            try:
                status_dict = service.get_celery_task_status(job_id)

                status_response = {
                    "job_id": job_id,
                    "status": status_dict["status"],
                    "progress": status_dict["progress"],
                    "message": status_dict.get("message"),
                    "metadata": status_dict.get("result"),
                }

                return {
                    "success": True,
                    "data": status_response,
                    "message": "Celery 작업 상태를 성공적으로 조회했습니다."
                }
            except Exception as e:
                raise BaseAPIException(
                    error_code=ErrorCode.TASK_NOT_FOUND,
                    details=f"Celery task {job_id} not found or error: {str(e)}",
                    metadata={"task_id": job_id, "endpoint": "get_job_status"},
                )
        else:
            # Get async job status
            try:
                job_uuid = UUID(job_id)
            except ValueError:
                raise BaseAPIException(
                    error_code=ErrorCode.INVALID_UUID_FORMAT,
                    details=f"Invalid UUID format: {job_id}",
                    metadata={"provided_id": job_id, "endpoint": "get_job_status"},
                )

            job = await service.get_job_status(job_uuid)
            if not job:
                raise BaseAPIException(
                    error_code=ErrorCode.JOB_NOT_FOUND,
                    details=f"Job ID {job_id} not found in database",
                    metadata={"job_id": job_id, "endpoint": "get_job_status"},
                )

            # Calculate progress
            progress = 0.0
            if job.total_items > 0:
                progress = (job.successful_items + job.failed_items) / job.total_items

            status_response = {
                "job_id": str(job_uuid),
                "status": job.status.value,
                "progress": progress,
                "message": f"{job.total_items}개 중 {job.successful_items + job.failed_items}개 처리 완료",
                "metadata": {
                    "total": job.total_items,
                    "successful": job.successful_items,
                    "failed": job.failed_items,
                },
            }

            return {
                "success": True,
                "data": status_response,
                "message": "작업 상태를 성공적으로 조회했습니다."
            }

    except BaseAPIException:
        # Re-raise our custom exceptions
        raise
    except Exception as e:
        # Handle any other unexpected errors
        exc = get_exception_handler().from_generic_exception(e, ErrorCode.INTERNAL_SERVER_ERROR)
        exc.metadata = {"endpoint": "get_job_status", "job_id": job_id}
        get_exception_handler().log_error(exc)
        raise exc.to_http_exception()


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
        BaseAPIException: 구조화된 API 에러
    """
    try:
        service = get_product_research_service()

        cancelled = await service.cancel_job(job_id)
        if not cancelled:
            job = await service.get_job_status(job_id)
            if not job:
                raise BaseAPIException(
                    error_code=ErrorCode.JOB_NOT_FOUND,
                    details=f"Job ID {job_id} not found in database",
                    metadata={"job_id": str(job_id), "endpoint": "cancel_research_job"},
                )
            else:
                raise BaseAPIException(
                    error_code=ErrorCode.JOB_CANNOT_BE_CANCELLED,
                    details=f"Job {job_id} is in status {job.status} and cannot be cancelled",
                    metadata={
                        "job_id": str(job_id),
                        "current_status": job.status.value,
                        "endpoint": "cancel_research_job",
                    },
                )

    except BaseAPIException:
        # Re-raise our custom exceptions
        raise
    except Exception as e:
        # Handle any other unexpected errors
        exc = get_exception_handler().from_generic_exception(e, ErrorCode.INTERNAL_SERVER_ERROR)
        exc.metadata = {"endpoint": "cancel_research_job", "job_id": str(job_id)}
        get_exception_handler().log_error(exc)
        raise exc.to_http_exception()
