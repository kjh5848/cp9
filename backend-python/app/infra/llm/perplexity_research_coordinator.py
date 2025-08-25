"""Perplexity research coordinator that orchestrates the research workflow."""

from typing import Any, Dict, List, Optional

from app.core.circuit_breaker import CircuitBreakerConfig
from app.core.constants import MAX_RESEARCH_BATCH_SIZE, ERROR_TOO_MANY_ITEMS
from app.core.logging import get_logger
from app.domain.product_entities import (
    ProductResearchItem,
    ProductResearchResult,
    ResearchStatus,
)
from app.infra.llm.perplexity_api_client import PerplexityApiClient
from app.infra.llm.perplexity_query_builder import PerplexityQueryBuilder
from app.infra.llm.perplexity_response_parser import PerplexityResponseParser

logger = get_logger(__name__)


class PerplexityResearchCoordinator:
    """Coordinates product research operations using Perplexity API.

    This class orchestrates the research workflow by coordinating between
    the API client, query builder, and response parser components.

    Responsibilities:
    - Orchestrate the complete research workflow
    - Validate input parameters and batch sizes
    - Coordinate between specialized components
    - Handle high-level error scenarios
    - Provide unified API interface
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        timeout: Optional[int] = None,
        model: Optional[str] = None,
        circuit_breaker_config: Optional[CircuitBreakerConfig] = None,
    ):
        """Initialize Perplexity research coordinator.

        Args:
            api_key: API key for authentication
            api_url: Base URL for API
            timeout: Request timeout in seconds
            model: Model to use for research
            circuit_breaker_config: Circuit breaker configuration
        """
        self.api_client = PerplexityApiClient(
            api_key=api_key,
            api_url=api_url,
            timeout=timeout,
            model=model,
            circuit_breaker_config=circuit_breaker_config,
        )
        self.query_builder = PerplexityQueryBuilder()
        self.response_parser = PerplexityResponseParser()

        logger.info("Perplexity research coordinator initialized")

    async def research_products(
        self, items: List[ProductResearchItem], max_concurrent: int = 5
    ) -> List[ProductResearchResult]:
        """Research multiple products using Perplexity API.

        Args:
            items: List of products to research
            max_concurrent: Maximum concurrent requests (currently unused, reserved for future batching)

        Returns:
            List of research results

        Raises:
            ValueError: If items list is empty
        """
        if not items:
            raise ValueError("Items list cannot be empty")

        # Validate batch size
        if len(items) > MAX_RESEARCH_BATCH_SIZE:
            logger.warning(
                f"Batch size {len(items)} exceeds maximum {MAX_RESEARCH_BATCH_SIZE}"
            )
            error_result = ProductResearchResult(
                status=ResearchStatus.TOO_MANY_ITEMS, error_message=ERROR_TOO_MANY_ITEMS
            )
            error_result.metadata = {
                "status": "too_many_items",
                "max_allowed": MAX_RESEARCH_BATCH_SIZE,
                "received": len(items),
            }
            return [error_result]

        logger.info(f"Starting research for {len(items)} products")

        try:
            # Build the research query
            query = self.query_builder.build_batch_query(items)
            query_metrics = self.query_builder.get_query_metrics(query)
            logger.debug(f"Built query with metrics: {query_metrics}")

            # Call Perplexity API
            response_data = await self.api_client.call_api(query)
            logger.debug("Successfully received API response")

            # Parse the response
            results = self.response_parser.parse_batch_response(response_data, items)

            # Log parsing statistics
            parsing_stats = self.response_parser.get_parsing_statistics(results)
            logger.info(f"Research completed with statistics: {parsing_stats}")

            return results

        except Exception as e:
            logger.error(f"Research failed: {str(e)}")
            # Return error results for all items
            return [
                self.response_parser._create_error_result(
                    item, f"Research failed: {str(e)}"
                )
                for item in items
            ]

    async def research_single_product(
        self, item: ProductResearchItem
    ) -> ProductResearchResult:
        """Research a single product.

        Args:
            item: Product to research

        Returns:
            Research result for the single product
        """
        results = await self.research_products([item])
        return (
            results[0]
            if results
            else self.response_parser._create_error_result(
                item, "No result returned from API"
            )
        )

    def validate_batch_size(self, items: List[ProductResearchItem]) -> bool:
        """Validate that batch size is within limits.

        Args:
            items: List of items to validate

        Returns:
            True if batch size is valid
        """
        return len(items) <= MAX_RESEARCH_BATCH_SIZE

    def get_max_batch_size(self) -> int:
        """Get the maximum allowed batch size.

        Returns:
            Maximum batch size
        """
        return MAX_RESEARCH_BATCH_SIZE

    def get_system_status(self) -> Dict[str, Any]:
        """Get system status and health information.

        Returns:
            Dictionary with system status
        """
        try:
            circuit_breaker_stats = self.api_client.get_circuit_breaker_stats()
            client_info = self.api_client.get_client_info()
            prompt_variables = self.query_builder.extract_prompt_variables()

            return {
                "status": "healthy",
                "components": {
                    "api_client": {
                        "status": "active",
                        "info": client_info,
                        "circuit_breaker": circuit_breaker_stats,
                    },
                    "query_builder": {
                        "status": "active",
                        "prompt_variables": prompt_variables,
                    },
                    "response_parser": {
                        "status": "active",
                    },
                },
                "configuration": {
                    "max_batch_size": MAX_RESEARCH_BATCH_SIZE,
                    "api_model": self.api_client.model,
                    "api_timeout": self.api_client.timeout,
                },
            }
        except Exception as e:
            logger.error(f"Failed to get system status: {e}")
            return {
                "status": "error",
                "error": str(e),
            }

    def reset_circuit_breaker(self) -> None:
        """Reset the circuit breaker to closed state."""
        self.api_client.reset_circuit_breaker()
        logger.info("Circuit breaker has been reset")

    async def health_check(self) -> Dict[str, Any]:
        """Perform a health check of the research system.

        Returns:
            Dictionary with health check results
        """
        health = {
            "status": "healthy",
            "checks": {},
        }

        # Check API client
        try:
            client_status = self.api_client.get_circuit_breaker_stats()
            health["checks"]["api_client"] = {
                "status": "healthy",
                "circuit_breaker_state": client_status["state"],
            }
        except Exception as e:
            health["checks"]["api_client"] = {
                "status": "error",
                "error": str(e),
            }
            health["status"] = "degraded"

        # Check query builder
        try:
            test_item = ProductResearchItem(
                product_name="Test Product",
                category="Test Category",
                price_exact=100,
                currency="KRW",
            )
            query = self.query_builder.build_batch_query([test_item])
            health["checks"]["query_builder"] = {
                "status": "healthy",
                "query_length": len(query),
            }
        except Exception as e:
            health["checks"]["query_builder"] = {
                "status": "error",
                "error": str(e),
            }
            health["status"] = "degraded"

        # Check response parser
        try:
            test_response = {
                "choices": [{"message": {"content": "[]"}}],
                "citations": [],
            }
            results = self.response_parser.parse_batch_response(test_response, [])
            health["checks"]["response_parser"] = {
                "status": "healthy",
                "test_parsing": "success",
            }
        except Exception as e:
            health["checks"]["response_parser"] = {
                "status": "error",
                "error": str(e),
            }
            health["status"] = "degraded"

        return health

    def get_configuration(self) -> Dict[str, Any]:
        """Get current configuration.

        Returns:
            Dictionary with current configuration
        """
        return {
            "max_batch_size": MAX_RESEARCH_BATCH_SIZE,
            "api_client": self.api_client.get_client_info(),
            "query_builder": {
                "prompt_variables": self.query_builder.extract_prompt_variables(),
            },
        }
