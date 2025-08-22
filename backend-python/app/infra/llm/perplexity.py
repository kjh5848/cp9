"""Perplexity API client wrapper."""

import asyncio
from typing import Any, Dict, Optional

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class PerplexityAPIError(Exception):
    """Perplexity API error."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class PerplexityClient:
    """Client for Perplexity API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        timeout: Optional[int] = None,
    ):
        """Initialize Perplexity client.

        Args:
            api_key: API key for authentication
            api_url: Base URL for API
            timeout: Request timeout in seconds
        """
        self.api_key = api_key or settings.perplexity_api_key
        self.api_url = api_url or settings.perplexity_api_url
        self.timeout = timeout or settings.perplexity_timeout

        if not self.api_key:
            raise ValueError("Perplexity API key is required")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError)),
    )
    async def research_item(
        self,
        item_name: str,
        item_price: float,
        category: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Research a single item using Perplexity API.

        Args:
            item_name: Name of the item to research
            item_price: Price of the item
            category: Optional category for the item
            **kwargs: Additional parameters for the API

        Returns:
            Research results from Perplexity

        Raises:
            PerplexityAPIError: If API request fails
        """
        # Construct the research query
        query = self._build_query(item_name, item_price, category)
        
        # Prepare request payload
        payload = {
            "model": "llama-3.1-sonar-small-128k-online",  # Fast model for research
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful research assistant. Provide comprehensive information about products, including specifications, reviews, comparisons, and market analysis."
                },
                {
                    "role": "user",
                    "content": query
                }
            ],
            "temperature": 0.2,  # Lower temperature for more factual responses
            "max_tokens": 1000,
            **kwargs
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    json=payload,
                    headers=self.headers,
                    timeout=self.timeout,
                )

                if response.status_code != 200:
                    error_msg = f"API request failed with status {response.status_code}: {response.text}"
                    logger.error(error_msg)
                    raise PerplexityAPIError(error_msg, response.status_code)

                result = response.json()
                
                # Extract the research content
                research_data = self._parse_response(result, item_name)
                
                logger.info(f"Successfully researched item: {item_name}")
                return research_data

        except httpx.TimeoutException as e:
            error_msg = f"Request timeout for item: {item_name}"
            logger.error(error_msg)
            raise PerplexityAPIError(error_msg) from e
        except httpx.NetworkError as e:
            error_msg = f"Network error for item: {item_name}"
            logger.error(error_msg)
            raise PerplexityAPIError(error_msg) from e
        except Exception as e:
            error_msg = f"Unexpected error researching item {item_name}: {str(e)}"
            logger.error(error_msg)
            raise PerplexityAPIError(error_msg) from e

    async def batch_research(
        self,
        items: list,
        max_concurrent: int = 5
    ) -> Dict[str, Dict[str, Any]]:
        """Research multiple items concurrently.

        Args:
            items: List of items to research
            max_concurrent: Maximum concurrent requests

        Returns:
            Dictionary mapping item names to research results
        """
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def research_with_semaphore(item):
            async with semaphore:
                try:
                    result = await self.research_item(
                        item_name=item["name"],
                        item_price=item["price"],
                        category=item.get("category"),
                    )
                    return item["name"], result
                except PerplexityAPIError as e:
                    logger.error(f"Failed to research {item['name']}: {e}")
                    return item["name"], {"error": str(e)}

        tasks = [research_with_semaphore(item) for item in items]
        results = await asyncio.gather(*tasks)
        
        return dict(results)

    def _build_query(
        self,
        item_name: str,
        item_price: float,
        category: Optional[str] = None
    ) -> str:
        """Build research query for the item.

        Args:
            item_name: Name of the item
            item_price: Price of the item
            category: Optional category

        Returns:
            Formatted query string
        """
        query_parts = [
            f"Research the following product: {item_name}",
            f"Price point: ${item_price:.2f}",
        ]
        
        if category:
            query_parts.append(f"Category: {category}")
        
        query_parts.extend([
            "\nPlease provide:",
            "1. Product specifications and features",
            "2. Market comparison with similar products",
            "3. User reviews and ratings summary",
            "4. Price analysis and value proposition",
            "5. Recommendations and alternatives",
        ])
        
        return "\n".join(query_parts)

    def _parse_response(
        self,
        response: Dict[str, Any],
        item_name: str
    ) -> Dict[str, Any]:
        """Parse Perplexity API response.

        Args:
            response: Raw API response
            item_name: Name of the researched item

        Returns:
            Parsed research data
        """
        try:
            # Extract the message content
            content = response["choices"][0]["message"]["content"]
            
            # Get citations if available
            citations = response.get("citations", [])
            
            return {
                "item_name": item_name,
                "research_content": content,
                "citations": citations,
                "model": response.get("model", "unknown"),
                "usage": response.get("usage", {}),
                "timestamp": response.get("created"),
            }
        except (KeyError, IndexError) as e:
            logger.error(f"Failed to parse response for {item_name}: {e}")
            return {
                "item_name": item_name,
                "research_content": "Failed to parse response",
                "error": str(e),
            }


# Singleton instance
_client: Optional[PerplexityClient] = None


def get_perplexity_client() -> PerplexityClient:
    """Get or create Perplexity client instance.

    Returns:
        PerplexityClient instance
    """
    global _client
    if _client is None:
        _client = PerplexityClient()
    return _client