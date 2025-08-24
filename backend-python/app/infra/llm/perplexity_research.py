"""Enhanced Perplexity API client for product research.

This module provides backward compatibility while delegating to the new
coordinator-based architecture for improved separation of concerns.
"""

from typing import List, Optional

from app.core.circuit_breaker import CircuitBreakerConfig
from app.core.logging import get_logger
from app.domain.product_entities import ProductResearchItem, ProductResearchResult
from app.infra.llm.perplexity_research_coordinator import PerplexityResearchCoordinator

logger = get_logger(__name__)


class PerplexityResearchError(Exception):
    """Perplexity research API error."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class PerplexityResearchClient:
    """Enhanced client for Perplexity API product research.

    This class now acts as a facade over the new coordinator-based architecture,
    providing backward compatibility for existing code while benefiting from
    improved separation of concerns.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        timeout: Optional[int] = None,
        model: Optional[str] = None,
        circuit_breaker_config: Optional[CircuitBreakerConfig] = None,
    ):
        """Initialize enhanced Perplexity research client.

        Args:
            api_key: API key for authentication
            api_url: Base URL for API
            timeout: Request timeout in seconds
            model: Model to use for research
            circuit_breaker_config: Circuit breaker configuration
        """
        self.coordinator = PerplexityResearchCoordinator(
            api_key=api_key,
            api_url=api_url,
            timeout=timeout,
            model=model,
            circuit_breaker_config=circuit_breaker_config,
        )

    async def research_products(
        self, items: List[ProductResearchItem], max_concurrent: int = 5
    ) -> List[ProductResearchResult]:
        """Research multiple products using Perplexity API.

        Args:
            items: List of products to research
            max_concurrent: Maximum concurrent requests

        Returns:
            List of research results

        Raises:
            PerplexityResearchError: If API request fails
        """
        try:
            return await self.coordinator.research_products(items, max_concurrent)
        except Exception as e:
            logger.error(f"Research failed in client facade: {e}")
            raise PerplexityResearchError(f"Research operation failed: {str(e)}")

    def get_status(self) -> dict:
        """Get client status and statistics.

        Returns:
            Dictionary with client status information
        """
        return self.coordinator.get_system_status()


# Singleton instance
_client: Optional[PerplexityResearchClient] = None


def get_research_client() -> PerplexityResearchClient:
    """Get or create Perplexity research client instance.

    Returns:
        PerplexityResearchClient instance
    """
    global _client
    if _client is None:
        _client = PerplexityResearchClient()
    return _client
