"""Perplexity API response parser and data transformer."""

import json
from typing import Any, Dict, List

from app.core.constants import (
    ERROR_TOO_MANY_ITEMS,
    MIN_SOURCES_REQUIRED,
    REQUIRED_REVIEW_FIELDS,
    STATUS_INSUFFICIENT_SOURCES,
    STATUS_TOO_MANY_ITEMS,
)
from app.core.logging import get_logger
from app.domain.product_entities import (
    NotableReview,
    ProductAttribute,
    ProductResearchItem,
    ProductResearchResult,
    ProductReviews,
    ProductSpecs,
    ResearchStatus,
)

logger = get_logger(__name__)


class PerplexityResponseParser:
    """Parses and transforms Perplexity API responses into domain objects.

    Responsibilities:
    - Parse raw API responses into structured data
    - Transform API data into domain entities
    - Handle various response formats and error cases
    - Validate parsed data against business rules
    """

    def parse_batch_response(
        self, response_data: Dict[str, Any], items: List[ProductResearchItem]
    ) -> List[ProductResearchResult]:
        """Parse Perplexity API batch response.

        Args:
            response_data: Raw API response
            items: Original research items

        Returns:
            List of parsed research results
        """
        try:
            # Extract content from response
            content = response_data["choices"][0]["message"]["content"]
            logger.debug(f"Parsing response content with {len(content)} characters")

            # Parse JSON from content
            parsed_data = self._extract_json_from_content(content)
            if parsed_data is None:
                logger.error("Failed to extract JSON from API response")
                return [
                    self._create_error_result(item, "Failed to parse API response")
                    for item in items
                ]

            # Handle single error object (too many items)
            if self._is_error_response(parsed_data):
                return self._handle_error_response(parsed_data)

            # Parse each product result
            results = []
            for i, result_data in enumerate(parsed_data):
                if i >= len(items):
                    logger.warning(
                        f"Response has more items than requested: {len(parsed_data)} > {len(items)}"
                    )
                    break

                result = self._parse_single_result(result_data, items[i])
                results.append(result)

            # Add citations if available
            self._add_citations_to_results(results, response_data.get("citations", []))

            logger.info(f"Successfully parsed {len(results)} research results")
            return results

        except Exception as e:
            logger.error(f"Failed to parse batch response: {e}")
            return [self._create_error_result(item, str(e)) for item in items]

    def _extract_json_from_content(self, content: str) -> Any:
        """Extract JSON data from API response content.

        Args:
            content: Raw response content

        Returns:
            Parsed JSON data or None if parsing fails
        """
        try:
            # Remove markdown code blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            # Clean up the content
            content = content.strip()

            return json.loads(content)

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {e}")
            logger.debug(f"Raw content that failed to parse: {content[:500]}...")
            return None

    def _is_error_response(self, parsed_data: Any) -> bool:
        """Check if the parsed data represents an error response.

        Args:
            parsed_data: Parsed JSON data

        Returns:
            True if it's an error response
        """
        return (
            isinstance(parsed_data, dict)
            and "status" in parsed_data
            and parsed_data["status"]
            in [STATUS_TOO_MANY_ITEMS, STATUS_INSUFFICIENT_SOURCES]
        )

    def _handle_error_response(
        self, error_data: Dict[str, Any]
    ) -> List[ProductResearchResult]:
        """Handle API error responses.

        Args:
            error_data: Error response data

        Returns:
            List with single error result
        """
        if error_data["status"] == STATUS_TOO_MANY_ITEMS:
            error_result = ProductResearchResult(
                status=ResearchStatus.TOO_MANY_ITEMS,
                error_message=ERROR_TOO_MANY_ITEMS,
            )
            error_result.metadata = error_data
            return [error_result]

        # Handle other error types as needed
        error_result = ProductResearchResult(
            status=ResearchStatus.ERROR,
            error_message=f"API returned error: {error_data.get('status', 'unknown')}",
        )
        error_result.metadata = error_data
        return [error_result]

    def _parse_single_result(
        self, data: Dict[str, Any], original_item: ProductResearchItem
    ) -> ProductResearchResult:
        """Parse single product result from API response.

        Args:
            data: Product data from API
            original_item: Original research item

        Returns:
            Parsed product research result
        """
        # Create base result with original item data
        result = ProductResearchResult(
            product_name=data.get("product_name", original_item.product_name),
            category=data.get("category", original_item.category),
            price_exact=data.get("price_exact", original_item.price_exact),
            currency=data.get("currency", original_item.currency),
        )

        # Check for insufficient sources error
        if data.get("status") == STATUS_INSUFFICIENT_SOURCES:
            result.mark_insufficient_sources(
                missing_fields=data.get("missing_fields", REQUIRED_REVIEW_FIELDS),
                suggested_queries=data.get("suggested_queries", []),
            )
            return result

        # Parse basic product information
        self._parse_basic_info(result, data)

        # Parse specifications
        self._parse_specifications(result, data.get("specs", {}))

        # Parse reviews
        self._parse_reviews(result, data.get("reviews", {}))

        # Parse sources
        result.sources = data.get("sources", [])

        # Validate and set final status
        self._validate_and_set_status(result)

        return result

    def _parse_basic_info(
        self, result: ProductResearchResult, data: Dict[str, Any]
    ) -> None:
        """Parse basic product information.

        Args:
            result: Result object to populate
            data: API response data
        """
        result.brand = data.get("brand", "")
        result.model_or_variant = data.get("model_or_variant", "")
        result.seller_or_store = data.get("seller_or_store")
        result.deeplink_or_product_url = data.get("deeplink_or_product_url")
        result.coupang_price = data.get("coupang_price")
        result.captured_at = data.get("captured_at", result.captured_at)

    def _parse_specifications(
        self, result: ProductResearchResult, specs_data: Dict[str, Any]
    ) -> None:
        """Parse product specifications.

        Args:
            result: Result object to populate
            specs_data: Specifications data from API
        """
        try:
            attributes = []
            for attr in specs_data.get("attributes", []):
                if isinstance(attr, dict) and "name" in attr and "value" in attr:
                    attributes.append(
                        ProductAttribute(
                            name=attr["name"],
                            value=attr["value"],
                            unit=attr.get("unit"),
                        )
                    )

            result.specs = ProductSpecs(
                main=specs_data.get("main", []),
                attributes=attributes,
                size_or_weight=specs_data.get("size_or_weight"),
                options=specs_data.get("options", []),
                included_items=specs_data.get("included_items", []),
            )
        except Exception as e:
            logger.warning(f"Failed to parse specifications: {e}")
            result.specs = ProductSpecs()

    def _parse_reviews(
        self, result: ProductResearchResult, reviews_data: Dict[str, Any]
    ) -> None:
        """Parse product reviews.

        Args:
            result: Result object to populate
            reviews_data: Reviews data from API
        """
        try:
            # Parse notable reviews
            notable_reviews = []
            for review in reviews_data.get("notable_reviews", []):
                if isinstance(review, dict):
                    notable_reviews.append(
                        NotableReview(
                            source=review.get("source", ""),
                            quote=review.get("text", review.get("quote", "")),
                            url=review.get("source_url", review.get("url")),
                            rating=review.get("rating"),
                        )
                    )

            result.reviews = ProductReviews(
                rating_avg=float(reviews_data.get("rating_avg", 0))
                if reviews_data.get("rating_avg")
                else 0,
                review_count=int(reviews_data.get("review_count", 0))
                if reviews_data.get("review_count")
                else 0,
                summary_positive=reviews_data.get("summary_positive", []),
                summary_negative=reviews_data.get("summary_negative", []),
                notable_reviews=notable_reviews,
            )
        except Exception as e:
            logger.warning(f"Failed to parse reviews: {e}")
            result.reviews = ProductReviews()

    def _validate_and_set_status(self, result: ProductResearchResult) -> None:
        """Validate parsed result and set appropriate status.

        Args:
            result: Result object to validate and update
        """
        # Check if we have sufficient review data
        if result.reviews.rating_avg > 0 and result.reviews.review_count > 0:
            result.mark_success()
        else:
            # Mark as insufficient sources if missing critical review data
            result.mark_insufficient_sources(
                missing_fields=REQUIRED_REVIEW_FIELDS,
                suggested_queries=[
                    f"{result.brand} {result.model_or_variant} 리뷰".strip(),
                    f"{result.product_name} 평점",
                ],
            )

    def _add_citations_to_results(
        self, results: List[ProductResearchResult], citations: List[str]
    ) -> None:
        """Add citations to results that don't have sufficient sources.

        Args:
            results: List of research results
            citations: List of citation URLs from API
        """
        if not citations:
            return

        for result in results:
            if not result.sources or len(result.sources) < MIN_SOURCES_REQUIRED:
                # Add citations up to minimum required
                needed_sources = MIN_SOURCES_REQUIRED - len(result.sources)
                additional_sources = citations[:needed_sources]
                result.sources.extend(additional_sources)

    def _create_error_result(
        self, item: ProductResearchItem, error: str
    ) -> ProductResearchResult:
        """Create error result for failed research.

        Args:
            item: Original research item
            error: Error message

        Returns:
            Error research result
        """
        result = ProductResearchResult(
            product_name=item.product_name,
            category=item.category,
            price_exact=item.price_exact,
            currency=item.currency,
        )
        result.mark_error(error)
        return result

    def get_parsing_statistics(
        self, results: List[ProductResearchResult]
    ) -> Dict[str, Any]:
        """Get statistics about parsing results.

        Args:
            results: List of parsed results

        Returns:
            Dictionary with parsing statistics
        """
        total = len(results)
        if total == 0:
            return {"total": 0}

        stats = {
            "total": total,
            "successful": sum(1 for r in results if r.status == ResearchStatus.SUCCESS),
            "insufficient_sources": sum(
                1 for r in results if r.status == ResearchStatus.INSUFFICIENT_SOURCES
            ),
            "errors": sum(1 for r in results if r.status == ResearchStatus.ERROR),
            "too_many_items": sum(
                1 for r in results if r.status == ResearchStatus.TOO_MANY_ITEMS
            ),
        }

        stats["success_rate"] = stats["successful"] / total if total > 0 else 0

        return stats
