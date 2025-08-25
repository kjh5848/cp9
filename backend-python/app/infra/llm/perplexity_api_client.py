"""Perplexity API HTTP client focused on communication."""

from typing import Any, Dict, Optional

import httpx

from app.core.circuit_breaker import (
    CircuitBreaker,
    CircuitBreakerConfig,
    CircuitBreakerRegistry,
)
from app.core.config import settings
from app.core.constants import DEFAULT_PERPLEXITY_MODEL
from app.core.exceptions import ExternalServiceException
from app.core.logging import get_logger
from app.schemas.error_responses import ErrorCode

logger = get_logger(__name__)


class PerplexityApiError(Exception):
    """Perplexity API communication error."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class PerplexityApiClient:
    """HTTP client for Perplexity API communication.

    Responsibilities:
    - Handle HTTP communication with Perplexity API
    - Manage authentication and headers
    - Implement circuit breaker for reliability
    - Handle network-level errors and timeouts
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        timeout: Optional[int] = None,
        model: Optional[str] = None,
        circuit_breaker_config: Optional[CircuitBreakerConfig] = None,
    ):
        """Initialize Perplexity API client.

        Args:
            api_key: API key for authentication
            api_url: Base URL for API
            timeout: Request timeout in seconds
            model: Model to use for research
            circuit_breaker_config: Circuit breaker configuration
        """
        self.api_key = api_key or settings.perplexity_api_key
        self.api_url = api_url or settings.perplexity_api_url
        self.timeout = timeout or settings.perplexity_timeout
        self.model = model or DEFAULT_PERPLEXITY_MODEL

        if not self.api_key:
            raise ValueError("Perplexity API key is required")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        # Initialize circuit breaker with custom configuration
        cb_config = circuit_breaker_config or CircuitBreakerConfig(
            failure_threshold=3,
            success_threshold=2,
            timeout_seconds=120,
            max_failures_per_window=5,
            window_seconds=300,
            slow_call_threshold_ms=self.timeout * 1000 if self.timeout else 30000,
            error_rate_threshold=0.6,
        )

        self.circuit_breaker = CircuitBreakerRegistry.get_breaker(
            "perplexity_api", cb_config
        )

    async def call_api(self, query: str) -> Dict[str, Any]:
        """Call Perplexity API with circuit breaker protection.

        Args:
            query: Query string to send to API

        Returns:
            API response data

        Raises:
            PerplexityApiError: If API call fails
            ExternalServiceException: If circuit breaker is open
        """
        try:
            response_data = await self.circuit_breaker.acall(
                self._call_api_internal, query
            )
            return response_data

        except ExternalServiceException:
            # Re-raise circuit breaker exceptions
            raise

        except Exception as e:
            logger.error(f"Perplexity API call failed: {str(e)}")
            raise PerplexityApiError(f"API call failed: {str(e)}")

    async def _call_api_internal(self, query: str) -> Dict[str, Any]:
        """Internal API call method.

        Args:
            query: Query string to send to API

        Returns:
            API response data

        Raises:
            PerplexityApiError: If API call fails
        """
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": query}],
            "temperature": 0.1,
            "max_tokens": 4000,
            "stream": False,
        }

        logger.debug(f"Calling Perplexity API with model {self.model}")

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    self.api_url, headers=self.headers, json=payload
                )

                logger.debug(f"Perplexity API response status: {response.status_code}")

                if response.status_code != 200:
                    error_msg = f"Perplexity API error {response.status_code}"
                    try:
                        error_data = response.json()
                        error_msg += f": {error_data.get('error', {}).get('message', 'Unknown error')}"
                    except Exception:
                        error_msg += f": {response.text[:200]}"

                    logger.error(error_msg)
                    raise PerplexityApiError(error_msg, response.status_code)

                try:
                    response_data = response.json()
                    return response_data
                except Exception as e:
                    logger.error(f"Failed to parse API response as JSON: {e}")
                    raise PerplexityApiError(f"Invalid JSON response: {str(e)}")

        except httpx.TimeoutException as e:
            logger.error(f"Perplexity API timeout: {e}")
            raise ExternalServiceException(
                error_code=ErrorCode.PERPLEXITY_API_TIMEOUT,
                service_name="perplexity",
                details=f"Request timed out after {self.timeout}s",
            )

        except httpx.RequestError as e:
            logger.error(f"Perplexity API request error: {e}")
            raise ExternalServiceException(
                error_code=ErrorCode.PERPLEXITY_API_ERROR,
                service_name="perplexity",
                details=str(e),
            )

        except Exception as e:
            logger.error(f"Unexpected error calling Perplexity API: {e}")
            raise PerplexityApiError(f"Unexpected API error: {str(e)}")

    def get_circuit_breaker_stats(self) -> Dict[str, Any]:
        """Get circuit breaker statistics.

        Returns:
            Dictionary with circuit breaker stats
        """
        return self.circuit_breaker.get_stats()

    def reset_circuit_breaker(self) -> None:
        """Reset circuit breaker to closed state."""
        self.circuit_breaker.reset()

    def get_client_info(self) -> Dict[str, Any]:
        """Get client configuration information.

        Returns:
            Dictionary with client info
        """
        return {
            "api_url": self.api_url,
            "model": self.model,
            "timeout": self.timeout,
            "circuit_breaker": self.circuit_breaker.get_stats(),
        }
