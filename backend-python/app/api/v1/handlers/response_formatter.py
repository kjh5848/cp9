"""Response formatting for API endpoints.

This module handles conversion from domain entities to API response schemas,
following the Single Responsibility Principle by focusing solely on response formatting.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from app.core.logging import get_logger
from app.domain.entities import ResearchJob
from app.domain.product_entities import ProductResearchResult
from app.schemas.product_research_out import (
    CoupangInfoResponse,
    JobStatusResponse,
    ProductResearchResponse,
    ProductResultResponse,
    ResearchMetadataResponse,
)
from app.schemas.research_out import ResearchJobOut, ResearchJobSummaryOut, TaskStatusOut

logger = get_logger(__name__)


class ResponseFormatter:
    """Formats domain entities into API response schemas.

    Responsibilities:
    - Convert domain entities to API response models
    - Handle optional data and null values gracefully
    - Ensure consistent response structure across endpoints
    - Manage complex nested object transformations
    """

    def format_product_research_response(
        self,
        job: ResearchJob,
        include_failed: bool = True,
        include_coupang_info: bool = False,
    ) -> ProductResearchResponse:
        """Format research job into product research response.

        Args:
            job: Research job domain entity
            include_failed: Whether to include failed results
            include_coupang_info: Whether to extract and include Coupang info

        Returns:
            ProductResearchResponse with formatted data
        """
        # Filter results based on include_failed flag
        results_to_include = job.results
        if not include_failed:
            results_to_include = [r for r in job.results if r.status.value == "success"]

        # Format individual results
        formatted_results = []
        coupang_errors = []

        for result in results_to_include:
            try:
                formatted_result = self._format_product_result(
                    result, include_coupang_info=include_coupang_info
                )
                formatted_results.append(formatted_result)
            except Exception as e:
                logger.warning(
                    f"Failed to format result for {result.product_name}: {e}",
                    extra={"result_id": getattr(result, "id", None), "product_name": result.product_name},
                )
                if include_coupang_info:
                    coupang_errors.append(result.product_name)

        # Log Coupang extraction errors if any
        if coupang_errors:
            logger.warning(
                f"Coupang data extraction failed for products: {coupang_errors}",
                extra={"failed_products": coupang_errors, "job_id": str(job.id)},
            )

        return ProductResearchResponse(
            job_id=job.id,
            status=job.status.value,
            results=formatted_results,
            metadata=self._format_research_metadata(job),
        )

    def format_job_status_response(
        self,
        job_id: UUID,
        status: str,
        progress: float = 0.0,
        message: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> JobStatusResponse:
        """Format job status into standardized response.

        Args:
            job_id: Job identifier
            status: Current job status
            progress: Progress percentage (0.0 to 1.0)
            message: Optional status message
            metadata: Optional metadata dictionary

        Returns:
            JobStatusResponse with formatted status information
        """
        return JobStatusResponse(
            job_id=job_id,
            status=status,
            progress=progress,
            message=message,
            metadata=metadata,
        )

    def format_celery_task_status(self, task_id: str, task_result) -> JobStatusResponse:
        """Format Celery task result into job status response.

        Args:
            task_id: Celery task ID
            task_result: Celery AsyncResult object

        Returns:
            JobStatusResponse with task status information
        """
        # Extract progress information
        progress = 0.0
        message = None
        metadata = None

        if hasattr(task_result, "info") and task_result.info:
            if isinstance(task_result.info, dict):
                progress = task_result.info.get("progress", 0.0)
                message = task_result.info.get("message")
                metadata = task_result.info.get("result")

        return JobStatusResponse(
            job_id=task_id,
            status=task_result.status,
            progress=progress,
            message=message,
            metadata=metadata,
        )

    def format_research_job_summary(self, job: ResearchJob) -> ResearchJobSummaryOut:
        """Format research job into summary response.

        Args:
            job: Research job domain entity

        Returns:
            ResearchJobSummaryOut with summary information
        """
        return ResearchJobSummaryOut(
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

    def format_research_job_detail(self, job: ResearchJob) -> ResearchJobOut:
        """Format research job into detailed response.

        Args:
            job: Research job domain entity

        Returns:
            ResearchJobOut with complete job information
        """
        return ResearchJobOut(**job.to_dict())

    def format_task_status(
        self,
        task_id: str,
        status: str,
        result: Optional[dict] = None,
        progress: Optional[dict] = None,
    ) -> TaskStatusOut:
        """Format task status into standardized response.

        Args:
            task_id: Task identifier
            status: Task status
            result: Task result data
            progress: Task progress information

        Returns:
            TaskStatusOut with task information
        """
        return TaskStatusOut(
            task_id=task_id,
            status=status,
            result=result,
            progress=progress,
        )

    def _format_product_result(
        self, result: ProductResearchResult, include_coupang_info: bool = False
    ) -> ProductResultResponse:
        """Format product research result into response schema.

        Args:
            result: Product research result domain entity
            include_coupang_info: Whether to extract Coupang information

        Returns:
            ProductResultResponse with formatted result data
        """
        # Extract Coupang info if requested
        coupang_info = None
        if include_coupang_info and "coupang_info" in result.metadata:
            try:
                coupang_metadata = result.metadata["coupang_info"]
                coupang_info = CoupangInfoResponse(
                    product_id=coupang_metadata.get("product_id"),
                    product_url=coupang_metadata.get("product_url"),
                    product_image=coupang_metadata.get("product_image"),
                    is_rocket=coupang_metadata.get("is_rocket"),
                    is_free_shipping=coupang_metadata.get("is_free_shipping"),
                    category_name=coupang_metadata.get("category_name"),
                    product_price=result.price_exact,
                )
            except Exception as e:
                logger.warning(
                    f"Failed to extract Coupang info for {result.product_name}: {e}",
                    extra={"product_name": result.product_name, "metadata": result.metadata},
                )

        # Format specs and reviews safely
        specs = result.specs.to_dict() if hasattr(result.specs, "to_dict") else result.specs
        reviews = result.reviews.to_dict() if hasattr(result.reviews, "to_dict") else result.reviews

        return ProductResultResponse(
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
            specs=specs,
            reviews=reviews,
            sources=result.sources,
            captured_at=result.captured_at,
            status=result.status.value,
            error_message=result.error_message,
            missing_fields=result.missing_fields,
            suggested_queries=result.suggested_queries,
        )

    def _format_research_metadata(self, job: ResearchJob) -> ResearchMetadataResponse:
        """Format research job metadata into response schema.

        Args:
            job: Research job domain entity

        Returns:
            ResearchMetadataResponse with formatted metadata
        """
        return ResearchMetadataResponse(
            total_items=job.total_items,
            successful_items=job.successful_items,
            failed_items=job.failed_items,
            success_rate=job.success_rate,
            processing_time_ms=job.processing_time_ms,
            created_at=job.created_at,
            updated_at=job.updated_at,
            started_at=job.started_at,
            completed_at=job.completed_at,
        )

    def calculate_job_progress(self, job: ResearchJob) -> float:
        """Calculate job progress as a percentage.

        Args:
            job: Research job domain entity

        Returns:
            Progress as float between 0.0 and 1.0
        """
        if job.total_items == 0:
            return 0.0
        
        processed_items = job.successful_items + job.failed_items
        return processed_items / job.total_items

    def format_job_progress_message(self, job: ResearchJob) -> str:
        """Format job progress into human-readable message.

        Args:
            job: Research job domain entity

        Returns:
            Progress message string
        """
        processed_items = job.successful_items + job.failed_items
        return f"{job.total_items}개 중 {processed_items}개 처리 완료"


# Singleton instance for global use
_formatter: ResponseFormatter = None


def get_response_formatter() -> ResponseFormatter:
    """Get the global response formatter instance.

    Returns:
        ResponseFormatter instance
    """
    global _formatter
    if _formatter is None:
        _formatter = ResponseFormatter()
    return _formatter