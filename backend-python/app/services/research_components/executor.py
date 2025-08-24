"""Research executor component following SRP."""

import asyncio
from typing import Dict, List, Any
import time

from app.core.exceptions import ExternalServiceException
from app.core.logging import get_logger
from app.domain.product_entities import ProductResearchJob
from app.infra.llm.perplexity_research_coordinator import PerplexityResearchCoordinator
from app.schemas.error_responses import ErrorCode

logger = get_logger(__name__)


class ResearchExecutor:
    """Executes product research operations.
    
    Responsibilities:
    - Execute research for individual jobs
    - Handle research failures and retries
    - Coordinate with external research services
    - Execute batch research operations
    """

    def __init__(self, perplexity_coordinator: PerplexityResearchCoordinator):
        """Initialize research executor.
        
        Args:
            perplexity_coordinator: Perplexity research coordinator
        """
        self.perplexity_coordinator = perplexity_coordinator

    async def execute_research(self, job: ProductResearchJob) -> List[Dict[str, Any]]:
        """Execute research for a job.
        
        Args:
            job: Research job to execute
            
        Returns:
            List of research results
            
        Raises:
            ExternalServiceException: If research fails
        """
        start_time = time.time()
        
        try:
            logger.info(
                "Starting research execution",
                extra={
                    "job_id": str(job.id),
                    "item_count": len(job.items),
                    "priority": job.priority
                }
            )
            
            # Execute research using Perplexity coordinator
            results = await self.perplexity_coordinator.research_products(job.items)
            
            execution_time = time.time() - start_time
            
            logger.info(
                "Research execution completed",
                extra={
                    "job_id": str(job.id),
                    "execution_time": execution_time,
                    "results_count": len(results),
                    "success_rate": self._calculate_success_rate(results)
                }
            )
            
            return results
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(
                "Research execution failed",
                extra={
                    "job_id": str(job.id),
                    "execution_time": execution_time,
                    "error": str(e),
                    "error_type": type(e).__name__
                }
            )
            raise

    async def execute_research_with_retries(
        self,
        job: ProductResearchJob,
        max_retries: int = 3
    ) -> List[Dict[str, Any]]:
        """Execute research with retry logic.
        
        Args:
            job: Research job to execute
            max_retries: Maximum number of retries
            
        Returns:
            List of research results
            
        Raises:
            ExternalServiceException: If all retries are exhausted
        """
        last_exception = None
        
        for attempt in range(max_retries + 1):
            try:
                return await self.execute_research(job)
            except ExternalServiceException as e:
                last_exception = e
                
                if attempt == max_retries:
                    logger.error(
                        "Research execution failed after all retries",
                        extra={
                            "job_id": str(job.id),
                            "max_retries": max_retries,
                            "final_error": str(e)
                        }
                    )
                    break
                
                if not self._should_retry_research(e):
                    logger.info(
                        "Research error not retryable",
                        extra={
                            "job_id": str(job.id),
                            "attempt": attempt + 1,
                            "error_code": e.error_code.value,
                            "error": str(e)
                        }
                    )
                    break
                
                # Calculate retry delay with exponential backoff
                delay = self._calculate_retry_delay(attempt + 1)
                
                logger.info(
                    "Retrying research execution",
                    extra={
                        "job_id": str(job.id),
                        "attempt": attempt + 1,
                        "delay": delay,
                        "error": str(e)
                    }
                )
                
                await asyncio.sleep(delay)
        
        # Re-raise the last exception if all retries failed
        if last_exception:
            raise last_exception

    async def execute_batch_research(
        self,
        jobs: List[ProductResearchJob],
        fail_fast: bool = False
    ) -> List[Any]:
        """Execute research for multiple jobs.
        
        Args:
            jobs: List of research jobs to execute
            fail_fast: Whether to stop on first failure
            
        Returns:
            List of results (or exceptions for failed jobs)
        """
        logger.info(
            "Starting batch research execution",
            extra={"job_count": len(jobs)}
        )
        
        results = []
        
        for job in jobs:
            try:
                result = await self.execute_research(job)
                results.append(result)
            except Exception as e:
                if fail_fast:
                    raise
                results.append(e)
                
        logger.info(
            "Batch research execution completed",
            extra={
                "job_count": len(jobs),
                "success_count": sum(1 for r in results if not isinstance(r, Exception)),
                "failure_count": sum(1 for r in results if isinstance(r, Exception))
            }
        )
        
        return results

    def _should_retry_research(self, exception: ExternalServiceException) -> bool:
        """Determine if research should be retried based on error type.
        
        Args:
            exception: Exception that occurred
            
        Returns:
            True if retry should be attempted
        """
        retryable_errors = [
            ErrorCode.RATE_LIMIT_ERROR,
            ErrorCode.TIMEOUT_ERROR,
            ErrorCode.EXTERNAL_SERVICE_ERROR,
        ]
        
        return exception.error_code in retryable_errors

    def _calculate_retry_delay(self, attempt: int) -> float:
        """Calculate retry delay using exponential backoff.
        
        Args:
            attempt: Retry attempt number (1-based)
            
        Returns:
            Delay in seconds
        """
        # Exponential backoff: 2^attempt seconds, capped at 60 seconds
        delay = min(2 ** (attempt - 1), 60.0)
        return float(delay)

    def _calculate_success_rate(self, results: List[Dict[str, Any]]) -> float:
        """Calculate success rate for research results.
        
        Args:
            results: List of research results
            
        Returns:
            Success rate as percentage (0-100)
        """
        if not results:
            return 0.0
            
        successful_count = sum(
            1 for result in results 
            if result.get("status") == "success"
        )
        
        return (successful_count / len(results)) * 100.0