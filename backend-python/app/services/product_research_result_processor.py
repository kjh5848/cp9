"""Product research result processing service."""

from datetime import datetime
from typing import Dict, List, Optional

from app.core.logging import get_logger
from app.domain.product_entities import (
    ProductResearchItem,
    ProductResearchJob,
    ProductResearchResult,
    ResearchStatus,
)

logger = get_logger(__name__)


class ProductResearchResultProcessor:
    """Processes and transforms product research results.

    Responsibilities:
    - Extract and process Coupang preview data
    - Merge research results with preview data
    - Transform and validate result data
    - Handle result callbacks
    """

    def extract_coupang_preview_results(
        self, items: List[ProductResearchItem]
    ) -> List[ProductResearchResult]:
        """Extract Coupang preview results from items.

        Args:
            items: List of product research items

        Returns:
            List of Coupang preview results
        """
        results = []
        for item in items:
            preview_result = self._extract_coupang_info(item)
            if preview_result:
                results.append(preview_result)

        logger.info(
            f"Extracted {len(results)} Coupang preview results from {len(items)} items"
        )
        return results

    def _extract_coupang_info(
        self, item: ProductResearchItem
    ) -> Optional[ProductResearchResult]:
        """Extract Coupang information from item with enhanced error handling.

        Args:
            item: Product research item

        Returns:
            ProductResearchResult with Coupang preview or None
        """
        try:
            # Check if item has Coupang information
            available_fields = []
            missing_fields = []

            # Check key fields
            key_fields = ["product_id", "product_url", "product_image"]
            for field in key_fields:
                field_value = getattr(item, field, None)
                if field_value:
                    available_fields.append(field)
                else:
                    missing_fields.append(field)

            # If no Coupang data at all, return None (not an error)
            if not available_fields:
                return None

            # Create result with available data
            result = ProductResearchResult(
                product_name=item.product_name,
                category=item.category,
                price_exact=item.price_exact,
                currency=item.currency,
                seller_or_store=item.seller_or_store or "쿠팡",
                status=ResearchStatus.COUPANG_PREVIEW,
            )

            # Set Coupang-specific data
            if item.product_url:
                result.deeplink_or_product_url = item.product_url
            if item.price_exact:
                result.coupang_price = item.price_exact

            # Add Coupang metadata with error handling
            coupang_metadata = self._build_coupang_metadata(item)

            # Store in result metadata for easy access
            result.metadata = {
                "coupang_info": coupang_metadata,
                "preview": True,
                "available_fields": available_fields,
                "missing_fields": missing_fields,
            }

            # Mark as captured immediately
            result.captured_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            result.sources = ["쿠팡 파트너스 API"]

            # Log partial data warning if some fields are missing
            if missing_fields:
                logger.info(
                    f"Partial Coupang data for {item.product_name}: "
                    f"missing {missing_fields}, available {available_fields}"
                )

            return result

        except Exception as e:
            logger.warning(
                f"Coupang info extraction failed for {item.product_name}: {e}"
            )
            # Return None for extraction failures - don't break the entire flow
            return None

    def _build_coupang_metadata(self, item: ProductResearchItem) -> Dict:
        """Build Coupang metadata from item.

        Args:
            item: Product research item

        Returns:
            Dictionary with Coupang metadata
        """
        coupang_metadata = {}
        try:
            if item.product_id:
                coupang_metadata["product_id"] = item.product_id
            if item.product_image:
                coupang_metadata["product_image"] = item.product_image
            if item.product_url:
                coupang_metadata["product_url"] = item.product_url
            if item.is_rocket is not None:
                coupang_metadata["is_rocket"] = item.is_rocket
            if item.is_free_shipping is not None:
                coupang_metadata["is_free_shipping"] = item.is_free_shipping
            if item.category_name:
                coupang_metadata["category_name"] = item.category_name
        except Exception as meta_error:
            logger.warning(
                f"Failed to extract some Coupang metadata for {item.product_name}: {meta_error}"
            )

        return coupang_metadata

    def merge_research_results_into_previews(
        self, job: ProductResearchJob, research_results: List[ProductResearchResult]
    ) -> None:
        """Merge research results into existing preview results.

        Args:
            job: Research job with preview results
            research_results: Full research results from external API
        """
        logger.info(
            f"Merging {len(research_results)} research results into "
            f"{len(job.results)} preview results for job {job.id}"
        )

        # Update existing preview results with full research data
        for i, research_result in enumerate(research_results):
            if i < len(job.results):
                # Merge research data into existing preview result
                preview_result = job.results[i]
                self._merge_research_into_preview(preview_result, research_result)
            else:
                # Add new result if no preview existed
                job.add_result(research_result)

        logger.info(f"Completed merging results for job {job.id}")

    def _merge_research_into_preview(
        self,
        preview_result: ProductResearchResult,
        research_result: ProductResearchResult,
    ) -> None:
        """Merge full research data into existing preview result.

        Args:
            preview_result: Existing preview result
            research_result: Full research result from external API
        """
        # Update with research data while preserving Coupang info
        preview_result.brand = research_result.brand
        preview_result.model_or_variant = research_result.model_or_variant
        preview_result.specs = research_result.specs
        preview_result.reviews = research_result.reviews
        preview_result.sources.extend(research_result.sources)
        preview_result.status = research_result.status
        preview_result.captured_at = research_result.captured_at

        # Preserve Coupang metadata while adding research data
        if "coupang_info" in preview_result.metadata:
            preview_result.metadata["research_completed"] = True
        else:
            preview_result.metadata = research_result.metadata

        # Handle errors
        if research_result.error_message:
            preview_result.error_message = research_result.error_message
        if research_result.missing_fields:
            preview_result.missing_fields = research_result.missing_fields
        if research_result.suggested_queries:
            preview_result.suggested_queries = research_result.suggested_queries

    async def execute_callback(self, job: ProductResearchJob) -> None:
        """Execute job completion callback.

        Args:
            job: Completed research job
        """
        callback_url = job.metadata.get("callback_url")
        if not callback_url:
            return

        try:
            import httpx

            async with httpx.AsyncClient() as client:
                await client.post(callback_url, json=job.to_dict(), timeout=10)

            logger.info(f"Executed callback for job {job.id}")

        except Exception as e:
            logger.error(f"Failed to execute callback for job {job.id}: {str(e)}")

    def validate_research_results(
        self, results: List[ProductResearchResult]
    ) -> Dict[str, int]:
        """Validate research results and return statistics.

        Args:
            results: List of research results

        Returns:
            Dictionary with validation statistics
        """
        stats = {
            "total": len(results),
            "successful": 0,
            "failed": 0,
            "preview_only": 0,
            "with_errors": 0,
        }

        for result in results:
            if result.status == ResearchStatus.SUCCESS:
                stats["successful"] += 1
            elif result.status == ResearchStatus.ERROR:
                stats["failed"] += 1
            elif result.status == ResearchStatus.COUPANG_PREVIEW:
                stats["preview_only"] += 1

            if result.error_message:
                stats["with_errors"] += 1

        logger.info(f"Result validation: {stats}")
        return stats

    def filter_results_by_status(
        self, results: List[ProductResearchResult], status: ResearchStatus
    ) -> List[ProductResearchResult]:
        """Filter results by status.

        Args:
            results: List of research results
            status: Status to filter by

        Returns:
            Filtered list of results
        """
        filtered = [r for r in results if r.status == status]
        logger.debug(f"Filtered {len(filtered)} results with status {status}")
        return filtered

    def enhance_results_with_metadata(
        self, results: List[ProductResearchResult], metadata: Dict
    ) -> None:
        """Enhance results with additional metadata.

        Args:
            results: List of research results
            metadata: Additional metadata to add
        """
        for result in results:
            if result.metadata:
                result.metadata.update(metadata)
            else:
                result.metadata = metadata.copy()

        logger.debug(f"Enhanced {len(results)} results with metadata")

    def get_processing_statistics(self, job: ProductResearchJob) -> Dict:
        """Get processing statistics for a job.

        Args:
            job: Research job

        Returns:
            Dictionary with processing statistics
        """
        return {
            "job_id": str(job.id),
            "total_items": job.total_items,
            "successful_items": job.successful_items,
            "failed_items": job.failed_items,
            "success_rate": job.successful_items / job.total_items
            if job.total_items > 0
            else 0,
            "has_preview": job.metadata.get("coupang_preview", False),
            "processing_time": (
                job.completed_at - job.started_at
                if job.completed_at and job.started_at
                else None
            ),
        }
