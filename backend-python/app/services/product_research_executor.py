"""Product research execution service."""

import asyncio
from typing import List

from app.core.logging import get_logger
from app.domain.product_entities import (
    ProductResearchItem,
    ProductResearchJob,
    ResearchStatus,
)
from app.infra.llm.perplexity_research import get_research_client

logger = get_logger(__name__)


class ProductResearchExecutor:
    """Executes product research operations.

    Responsibilities:
    - Execute research calls to external APIs
    - Handle concurrent research operations
    - Manage research timeouts and retries
    - Convert items to research format
    """

    def __init__(self):
        """Initialize research executor."""
        self.research_client = get_research_client()

    async def execute_research_job(self, job: ProductResearchJob) -> None:
        """Execute research for a complete job.

        Args:
            job: Research job to execute
        """
        try:
            # Mark job as started
            job.start()
            logger.info(f"Starting research execution for job {job.id}")

            # Convert job items to research format
            research_items = self._convert_job_items_to_research_items(job)

            # Execute research
            results = await self.research_client.research_products(
                items=research_items, max_concurrent=5
            )

            # Add results to job
            for result in results:
                job.add_result(result)

            # Mark job as completed
            job.complete()

            logger.info(
                f"Completed research execution for job {job.id}: "
                f"{job.successful_items}/{job.total_items} successful"
            )

        except Exception as e:
            error_msg = f"Research execution failed: {str(e)}"
            logger.error(f"Failed to execute research for job {job.id}: {error_msg}")
            job.fail(error_msg)
            raise

    async def execute_research_items(
        self, items: List[ProductResearchItem], max_concurrent: int = 5
    ) -> List:
        """Execute research for a list of items.

        Args:
            items: List of items to research
            max_concurrent: Maximum concurrent requests

        Returns:
            List of research results
        """
        try:
            logger.info(f"Executing research for {len(items)} items")

            results = await self.research_client.research_products(
                items=items, max_concurrent=max_concurrent
            )

            logger.info(f"Completed research for {len(results)} items")
            return results

        except Exception as e:
            logger.error(f"Failed to execute research for items: {str(e)}")
            raise

    def _convert_job_items_to_research_items(
        self, job: ProductResearchJob
    ) -> List[ProductResearchItem]:
        """Convert job items to research item format.

        Args:
            job: Research job

        Returns:
            List of research items
        """
        return [
            ProductResearchItem(
                product_name=item.product_name,
                category=item.category,
                price_exact=item.price_exact,
                currency=item.currency,
                seller_or_store=item.seller_or_store,
                metadata=item.metadata,
            )
            for item in job.items
        ]

    def _convert_job_items_to_full_research_items(
        self, job: ProductResearchJob
    ) -> List[ProductResearchItem]:
        """Convert job items to full research item format with all fields.

        Args:
            job: Research job

        Returns:
            List of research items with all available fields
        """
        return [
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
                metadata=item.metadata,
            )
            for item in job.items
        ]

    async def execute_background_research_task(self, job: ProductResearchJob) -> None:
        """Execute research as a background task.

        Args:
            job: Research job to execute
        """
        task = asyncio.create_task(self.execute_research_job(job))
        logger.info(f"Started background research task for job {job.id}")
        return task

    async def execute_preview_enhanced_research(self, job: ProductResearchJob) -> None:
        """Execute research for job that already has preview results.

        Args:
            job: Research job with existing preview results
        """
        try:
            # Mark job as started (but keep existing preview results)
            job.status = ResearchStatus.PROCESSING
            job.started_at = job.started_at or job.created_at
            job.updated_at = job.created_at

            logger.info(
                f"Starting enhanced research execution for job {job.id} "
                f"with {len(job.results)} existing preview results"
            )

            # Convert items to full research format
            research_items = self._convert_job_items_to_full_research_items(job)

            # Call Perplexity API for full research
            research_results = await self.research_client.research_products(
                items=research_items, max_concurrent=5
            )

            # Return results for merging (don't modify job directly here)
            logger.info(
                f"Completed enhanced research execution for job {job.id}: "
                f"got {len(research_results)} research results"
            )

            return research_results

        except Exception as e:
            error_msg = f"Enhanced research execution failed: {str(e)}"
            logger.error(
                f"Failed to execute enhanced research for job {job.id}: {error_msg}"
            )
            job.fail(error_msg)
            raise

    async def execute_single_item_research(self, item: ProductResearchItem) -> List:
        """Execute research for a single item.

        Args:
            item: Single item to research

        Returns:
            List with single research result
        """
        try:
            logger.debug(f"Executing research for single item: {item.product_name}")

            results = await self.research_client.research_products(
                items=[item], max_concurrent=1
            )

            logger.debug(f"Completed research for item: {item.product_name}")
            return results

        except Exception as e:
            logger.error(
                f"Failed to execute research for item {item.product_name}: {str(e)}"
            )
            raise

    def get_client_status(self) -> dict:
        """Get research client status and statistics.

        Returns:
            Dictionary with client status information
        """
        if hasattr(self.research_client, "get_status"):
            return self.research_client.get_status()
        return {"status": "unknown", "client": str(type(self.research_client))}
