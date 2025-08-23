"""Enhanced Perplexity API client for product research."""

import asyncio
import json
import time
from typing import Any, Dict, List, Optional

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.circuit_breaker import CircuitBreakerRegistry, CircuitBreakerConfig
from app.core.config import settings
from app.core.constants import (
    DEFAULT_PERPLEXITY_MODEL,
    DEFAULT_TEMPERATURE,
    ERROR_INSUFFICIENT_SOURCES,
    ERROR_TOO_MANY_ITEMS,
    MAX_RESEARCH_BATCH_SIZE,
    MAX_TOKENS_PER_ITEM,
    MIN_SOURCES_REQUIRED,
    REQUIRED_REVIEW_FIELDS,
    STATUS_INSUFFICIENT_SOURCES,
    STATUS_TOO_MANY_ITEMS,
)
from app.core.exceptions import ExternalServiceException
from app.core.logging import get_logger
from app.schemas.error_responses import ErrorCode
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


class PerplexityResearchError(Exception):
    """Perplexity research API error."""
    
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class PerplexityResearchClient:
    """Enhanced client for Perplexity API product research."""
    
    # System prompt for product research
    SYSTEM_PROMPT = """역할: 신뢰 가능한 출처만 사용하는 리서치 에이전트.
규칙:
- 출력은 반드시 "JSON 배열" 한 개만(설명/코드펜스 금지). 배열 길이·순서는 입력과 동일.
- 한 요청당 입력 아이템은 최대 {max_items}개. {max_items_plus}개 이상이면 단일 JSON 객체로 오류 반환:
  {{ "status":"{status_too_many}", "max_allowed":{max_items}, "received":<N> }}
- SEO 필드 금지.
- price_exact는 입력값 그대로 사용(가공/범위 금지).
- 쿠팡가격 시도: 동일/근접 상품이 있으면 coupang_price(정수 KRW)만 채움. 없으면 null 유지.
- sources는 3개 이상이며, 반드시 제조사/공식 도메인 1개 이상 포함. 불명확하면 추측 금지("" 또는 null).

[리뷰 수집 의무]
- 리테일러 또는 전문매체에서 **숫자 평점과 리뷰 수를 최소 1곳 이상에서 추출**하여
  reviews.rating_avg(5점 환산)과 reviews.review_count를 **반드시 채워라**.
- 불가하면 해당 아이템은 실패로 반환:
  {{ "product_name":"<입력>", "category":"<입력>", "price_exact":<입력>, "currency":"<입력>",
    "status":"{status_insufficient}", "missing_fields":["reviews.rating_avg","reviews.review_count", ...],
    "suggested_queries":["<제조사 공식 모델명 조합>", "<리테일러 리뷰탭/전문매체 리뷰 검색어>"], "sources":[] }}
- 평점 환산 규칙: 100점 만점→/20, 10점 만점→/2. 소수점 한 자리 반올림.
- 다수 출처가 있을 경우 가능하면 5점 환산 후 가중 평균(전문매체 1.2, 리테일러 1.0, 커뮤니티 0.8; review_count 없으면 1로 간주).
- summary_positive/negative는 **2개 이상 출처** 또는 **5회 이상 빈출 의견**만 포함. notable_reviews는 2~3개, 짧은 인용(20단어 내) + 출처/URL."""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        timeout: Optional[int] = None,
        model: Optional[str] = None,
        circuit_breaker_config: Optional[CircuitBreakerConfig] = None,
    ):
        """Initialize enhanced Perplexity research client with circuit breaker.
        
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
            error_rate_threshold=0.6
        )
        
        self.circuit_breaker = CircuitBreakerRegistry.get_breaker("perplexity_api", cb_config)
    
    async def research_products(
        self,
        items: List[ProductResearchItem],
        max_concurrent: int = 5
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
        # Validate batch size
        if len(items) > MAX_RESEARCH_BATCH_SIZE:
            error_result = ProductResearchResult(
                status=ResearchStatus.TOO_MANY_ITEMS,
                error_message=ERROR_TOO_MANY_ITEMS
            )
            error_result.metadata = {
                "status": STATUS_TOO_MANY_ITEMS,
                "max_allowed": MAX_RESEARCH_BATCH_SIZE,
                "received": len(items)
            }
            return [error_result]
        
        # Build the research query
        query = self._build_batch_query(items)
        
        # Call Perplexity API with circuit breaker protection
        try:
            response_data = await self.circuit_breaker.acall(self._call_perplexity_api_internal, query)
            
            # Parse the response
            results = self._parse_batch_response(response_data, items)
            
            logger.info(f"Successfully researched {len(items)} products")
            return results
            
        except ExternalServiceException:
            # Circuit breaker is open - fail fast
            logger.error("Circuit breaker is open for Perplexity API")
            return [
                self._create_error_result(item, "Perplexity API is temporarily unavailable")
                for item in items
            ]
        except Exception as e:
            logger.error(f"Failed to research products: {str(e)}")
            # Return error results for all items
            return [
                self._create_error_result(item, str(e))
                for item in items
            ]
    
    async def _call_perplexity_api_internal(self, query: str) -> Dict[str, Any]:
        """Call Perplexity API internal method (used by circuit breaker).
        
        Args:
            query: Research query
            
        Returns:
            API response data
            
        Raises:
            ExternalServiceException: If API request fails
        """
        # Prepare system prompt with variables
        system_prompt = self.SYSTEM_PROMPT.format(
            max_items=MAX_RESEARCH_BATCH_SIZE,
            max_items_plus=MAX_RESEARCH_BATCH_SIZE + 1,
            status_too_many=STATUS_TOO_MANY_ITEMS,
            status_insufficient=STATUS_INSUFFICIENT_SOURCES
        )
        
        # Prepare request payload
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": query
                }
            ],
            "temperature": DEFAULT_TEMPERATURE,
            "max_tokens": MAX_TOKENS_PER_ITEM * MAX_RESEARCH_BATCH_SIZE,
            "return_citations": True,
            "return_sources": True,
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    json=payload,
                    headers=self.headers,
                    timeout=self.timeout,
                )
                
                if response.status_code == 429:
                    # Rate limiting from Perplexity
                    raise ExternalServiceException(
                        error_code=ErrorCode.RATE_LIMIT_EXCEEDED,
                        service_name="Perplexity AI",
                        service_status="rate_limited",
                        details=f"Rate limit exceeded: {response.text}",
                        estimated_recovery=60
                    )
                elif response.status_code >= 500:
                    # Server error
                    raise ExternalServiceException(
                        error_code=ErrorCode.PERPLEXITY_API_UNAVAILABLE,
                        service_name="Perplexity AI",
                        service_status="server_error",
                        details=f"Server error {response.status_code}: {response.text}",
                        estimated_recovery=300
                    )
                elif response.status_code == 408:
                    # Timeout
                    raise ExternalServiceException(
                        error_code=ErrorCode.PERPLEXITY_API_TIMEOUT,
                        service_name="Perplexity AI",
                        service_status="timeout",
                        details=f"Request timeout: {response.text}",
                        estimated_recovery=30
                    )
                elif response.status_code != 200:
                    # Other client errors
                    raise ExternalServiceException(
                        error_code=ErrorCode.PERPLEXITY_API_ERROR,
                        service_name="Perplexity AI",
                        service_status="client_error",
                        details=f"API error {response.status_code}: {response.text}",
                        estimated_recovery=10
                    )
                
                return response.json()
                
        except httpx.TimeoutException:
            raise ExternalServiceException(
                error_code=ErrorCode.PERPLEXITY_API_TIMEOUT,
                service_name="Perplexity AI",
                service_status="timeout",
                details="Request timeout",
                estimated_recovery=30
            )
        except httpx.NetworkError as e:
            raise ExternalServiceException(
                error_code=ErrorCode.PERPLEXITY_API_UNAVAILABLE,
                service_name="Perplexity AI",
                service_status="network_error",
                details=f"Network error: {str(e)}",
                estimated_recovery=60
            )
        except httpx.HTTPStatusError as e:
            raise ExternalServiceException(
                error_code=ErrorCode.PERPLEXITY_API_ERROR,
                service_name="Perplexity AI",
                service_status="http_error",
                details=f"HTTP error: {str(e)}",
                estimated_recovery=10
            )
    
    def _build_batch_query(self, items: List[ProductResearchItem]) -> str:
        """Build batch research query for products.
        
        Args:
            items: List of products to research
            
        Returns:
            Formatted query string
        """
        query_parts = [
            "아래 아이템들을 개별로 검색하여 위 스키마에 맞춰 JSON 배열로만 반환하라.",
            f"입력 아이템 (최소 1, 최대 {MAX_RESEARCH_BATCH_SIZE}; 줄바꿈 표기):"
        ]
        
        for item in items:
            item_str = json.dumps({
                "product_name": item.product_name,
                "category": item.category,
                "price_exact": item.price_exact,
                "currency": item.currency
            }, ensure_ascii=False)
            query_parts.append(f"- {item_str}")
        
        return "\n".join(query_parts)
    
    def _parse_batch_response(
        self,
        response_data: Dict[str, Any],
        items: List[ProductResearchItem]
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
            
            # Parse JSON array from content
            try:
                # Remove any markdown code blocks if present
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                
                results_data = json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                logger.debug(f"Raw content: {content}")
                # Return error results for all items
                return [
                    self._create_error_result(item, "Failed to parse API response")
                    for item in items
                ]
            
            # Handle single error object (too many items)
            if isinstance(results_data, dict) and "status" in results_data:
                if results_data["status"] == STATUS_TOO_MANY_ITEMS:
                    error_result = ProductResearchResult(
                        status=ResearchStatus.TOO_MANY_ITEMS,
                        error_message=ERROR_TOO_MANY_ITEMS
                    )
                    error_result.metadata = results_data
                    return [error_result]
            
            # Parse each product result
            results = []
            for i, result_data in enumerate(results_data):
                if i >= len(items):
                    break
                    
                result = self._parse_single_result(result_data, items[i])
                results.append(result)
            
            # Add citations if available
            citations = response_data.get("citations", [])
            for result in results:
                if citations and not result.sources:
                    result.sources = citations[:MIN_SOURCES_REQUIRED]
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to parse batch response: {e}")
            return [
                self._create_error_result(item, str(e))
                for item in items
            ]
    
    def _parse_single_result(
        self,
        data: Dict[str, Any],
        original_item: ProductResearchItem
    ) -> ProductResearchResult:
        """Parse single product result from API response.
        
        Args:
            data: Product data from API
            original_item: Original research item
            
        Returns:
            Parsed product research result
        """
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
                suggested_queries=data.get("suggested_queries", [])
            )
            return result
        
        # Parse basic product info
        result.brand = data.get("brand", "")
        result.model_or_variant = data.get("model_or_variant", "")
        result.seller_or_store = data.get("seller_or_store")
        result.deeplink_or_product_url = data.get("deeplink_or_product_url")
        result.coupang_price = data.get("coupang_price")
        result.captured_at = data.get("captured_at", result.captured_at)
        
        # Parse specifications
        specs_data = data.get("specs", {})
        result.specs = ProductSpecs(
            main=specs_data.get("main", []),
            attributes=[
                ProductAttribute(name=attr["name"], value=attr["value"])
                for attr in specs_data.get("attributes", [])
            ],
            size_or_weight=specs_data.get("size_or_weight"),
            options=specs_data.get("options", []),
            included_items=specs_data.get("included_items", [])
        )
        
        # Parse reviews
        reviews_data = data.get("reviews", {})
        result.reviews = ProductReviews(
            rating_avg=float(reviews_data.get("rating_avg", 0)),
            review_count=int(reviews_data.get("review_count", 0)),
            summary_positive=reviews_data.get("summary_positive", []),
            summary_negative=reviews_data.get("summary_negative", []),
            notable_reviews=[
                NotableReview(
                    source=review["source"],
                    quote=review["quote"],
                    url=review.get("url")
                )
                for review in reviews_data.get("notable_reviews", [])
            ]
        )
        
        # Parse sources
        result.sources = data.get("sources", [])
        
        # Validate and mark status
        if result.reviews.rating_avg > 0 and result.reviews.review_count > 0:
            result.mark_success()
        else:
            result.mark_insufficient_sources(
                missing_fields=REQUIRED_REVIEW_FIELDS,
                suggested_queries=[
                    f"{result.brand} {result.model_or_variant} 리뷰",
                    f"{result.product_name} 평점"
                ]
            )
        
        return result
    
    def _create_error_result(
        self,
        item: ProductResearchItem,
        error: str
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