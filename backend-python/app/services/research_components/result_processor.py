"""Research result processor component following SRP."""

import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from app.core.exceptions import ValidationException
from app.core.logging import get_logger
from app.domain.product_entities import ProductResearchJob
from app.infra.db.repositories import ResearchJobRepository
from app.schemas.error_responses import ErrorCode

logger = get_logger(__name__)


class ResearchResultProcessor:
    """Processes and stores research results.
    
    Responsibilities:
    - Process raw research results
    - Store results in database
    - Update job status and progress
    - Calculate result statistics
    - Enrich results with metadata
    """

    def __init__(self, repository: ResearchJobRepository):
        """Initialize result processor.
        
        Args:
            repository: Research job repository for data persistence
        """
        self.repository = repository

    async def process_results(
        self,
        job_id: UUID,
        research_results: List[Dict[str, Any]]
    ) -> Optional[ProductResearchJob]:
        """Process and store research results.
        
        Args:
            job_id: Job ID
            research_results: Raw research results
            
        Returns:
            Updated job with results, or None if job not found
            
        Raises:
            ValidationException: If result format is invalid
        """
        start_time = time.time()
        
        # Get the job
        job = await self.repository.get_by_id(job_id)
        if not job:
            logger.warning(
                "Job not found for result processing",
                extra={"job_id": str(job_id)}
            )
            return None

        try:
            # Validate result format
            for result in research_results:
                self._validate_result_format(result)

            # Determine overall job status
            overall_status = self._determine_overall_status(research_results)
            
            # Update job with results
            job.results = research_results
            job.status = overall_status
            job.completed_at = datetime.now(timezone.utc)
            
            # Update in database
            updated_job = await self.repository.update(job)
            
            processing_time = time.time() - start_time
            
            logger.info(
                "Research results processed successfully",
                extra={
                    "job_id": str(job_id),
                    "processing_time": processing_time,
                    "results_count": len(research_results),
                    "final_status": overall_status,
                    "success_rate": self._calculate_success_rate(research_results)
                }
            )
            
            return updated_job
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(
                "Failed to process research results",
                extra={
                    "job_id": str(job_id),
                    "processing_time": processing_time,
                    "error": str(e),
                    "error_type": type(e).__name__
                }
            )
            raise

    async def update_job_progress(
        self,
        job_id: UUID,
        processed_items: int,
        total_items: int,
        current_status: str
    ) -> Optional[ProductResearchJob]:
        """Update job progress information.
        
        Args:
            job_id: Job ID
            processed_items: Number of processed items
            total_items: Total number of items
            current_status: Current job status
            
        Returns:
            Updated job, or None if job not found
        """
        job = await self.repository.get_by_id(job_id)
        if not job:
            return None
        
        # Calculate progress percentage
        progress_percentage = (processed_items / total_items) * 100.0 if total_items > 0 else 0.0
        
        # Update progress information
        job.progress_percentage = progress_percentage
        job.processed_items = processed_items
        job.total_items = total_items
        job.status = current_status
        
        return await self.repository.update(job)

    async def enrich_results_with_metadata(
        self,
        results: List[Dict[str, Any]],
        job_priority: int,
        processing_context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Enrich research results with additional metadata.
        
        Args:
            results: Original research results
            job_priority: Job priority
            processing_context: Additional processing context
            
        Returns:
            Enriched results with metadata
        """
        enriched_results = []
        
        for result in results:
            enriched_result = result.copy()
            
            # Add metadata
            enriched_result["metadata"] = {
                "job_priority": job_priority,
                "processed_at": datetime.now(timezone.utc).isoformat(),
                **processing_context
            }
            
            enriched_results.append(enriched_result)
        
        return enriched_results

    async def filter_results_by_status(
        self,
        results: List[Dict[str, Any]],
        status_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Filter results by status.
        
        Args:
            results: Research results to filter
            status_filter: Status to filter by (None for all results)
            
        Returns:
            Filtered results
        """
        if status_filter is None:
            return results
        
        return [
            result for result in results
            if result.get("status") == status_filter
        ]

    async def calculate_result_statistics(
        self,
        results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate statistics for research results.
        
        Args:
            results: Research results
            
        Returns:
            Dictionary with statistics
        """
        if not results:
            return {
                "total_items": 0,
                "successful_items": 0,
                "failed_items": 0,
                "success_rate": 0.0,
                "processing_time": 0.0,
                "average_analysis_length": 0.0
            }
        
        successful_items = sum(1 for r in results if r.get("status") == "success")
        failed_items = len(results) - successful_items
        success_rate = round((successful_items / len(results)) * 100, 2)
        
        # Calculate average analysis length for successful items
        analysis_lengths = [
            len(r.get("analysis", ""))
            for r in results
            if r.get("status") == "success" and r.get("analysis")
        ]
        average_analysis_length = (
            sum(analysis_lengths) / len(analysis_lengths)
            if analysis_lengths else 0.0
        )
        
        return {
            "total_items": len(results),
            "successful_items": successful_items,
            "failed_items": failed_items,
            "success_rate": success_rate,
            "processing_time": time.time(),  # This would typically be passed in
            "average_analysis_length": round(average_analysis_length, 2)
        }

    def _validate_result_format(self, result: Dict[str, Any]) -> None:
        """Validate individual result format.
        
        Args:
            result: Result to validate
            
        Raises:
            ValidationException: If result format is invalid
        """
        # Check required fields
        if "name" not in result:
            raise ValidationException(
                error_code=ErrorCode.VALIDATION_ERROR,
                message="Result must contain 'name' field"
            )
        
        if "status" not in result:
            raise ValidationException(
                error_code=ErrorCode.VALIDATION_ERROR,
                message="Result must contain 'status' field"
            )
        
        # Validate status value
        valid_statuses = ["success", "failed", "partial"]
        if result["status"] not in valid_statuses:
            raise ValidationException(
                error_code=ErrorCode.VALIDATION_ERROR,
                message=f"Invalid status '{result['status']}'. Must be one of: {valid_statuses}"
            )

    def _determine_overall_status(self, results: List[Dict[str, Any]]) -> str:
        """Determine overall job status based on results.
        
        Args:
            results: Research results
            
        Returns:
            Overall job status
        """
        if not results:
            return "completed"
        
        success_count = sum(1 for r in results if r.get("status") == "success")
        failed_count = sum(1 for r in results if r.get("status") == "failed")
        
        if success_count == len(results):
            return "completed"
        elif failed_count == len(results):
            return "failed"
        else:
            return "completed_with_errors"

    def _calculate_success_rate(self, results: List[Dict[str, Any]]) -> float:
        """Calculate success rate for research results.
        
        Args:
            results: Research results
            
        Returns:
            Success rate as percentage (0-100)
        """
        if not results:
            return 0.0
        
        success_count = sum(1 for r in results if r.get("status") == "success")
        return (success_count / len(results)) * 100.0