"""Perplexity query and prompt builder."""

from typing import List

from app.core.constants import (
    ERROR_TOO_MANY_ITEMS,
    MAX_RESEARCH_BATCH_SIZE,
    STATUS_INSUFFICIENT_SOURCES,
    STATUS_TOO_MANY_ITEMS,
)
from app.core.logging import get_logger
from app.domain.product_entities import ProductResearchItem

logger = get_logger(__name__)


class PerplexityQueryBuilder:
    """Builds queries and prompts for Perplexity API.

    Responsibilities:
    - Construct system prompts with dynamic parameters
    - Build batch research queries
    - Format product items for API consumption
    - Manage prompt templates and variables
    """

    # System prompt template for product research
    SYSTEM_PROMPT_TEMPLATE = """역할: 신뢰 가능한 출처만 사용하는 리서치 에이전트.
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

    REQUIRED_OUTPUT_SCHEMA = """
필수 출력 스키마 (모든 필드 필수, null 허용):
{{
  "product_name": "<입력값 그대로>",
  "category": "<입력값 그대로>",
  "price_exact": <입력값 그대로>,
  "currency": "<입력값 그대로>",
  "seller_or_store": "<입력값 있으면 그대로, 없으면 null>",
  "brand": "<브랜드명 또는 null>",
  "model_or_variant": "<모델/변형 또는 null>",
  "deeplink_or_product_url": "<구매링크 또는 null>",
  "coupang_price": <쿠팡가격(정수KRW) 또는 null>,
  "specs": {{
    "attributes": [
      {{"name": "<속성명>", "value": "<값>", "unit": "<단위 또는 null>"}}, ...
    ]
  }},
  "reviews": {{
    "rating_avg": <5점만점평균평점 또는 null>,
    "review_count": <리뷰수정수 또는 null>,
    "summary_positive": "<긍정요약 또는 null>",
    "summary_negative": "<부정요약 또는 null>",
    "notable_reviews": [
      {{"text": "<리뷰내용>", "rating": <평점>, "source": "<출처>", "source_url": "<URL>"}}, ...
    ]
  }},
  "sources": ["<URL1>", "<URL2>", "<URL3>", ...],
  "status": "success",
  "captured_at": "<YYYY-MM-DD HH:MM:SS>"
}}"""

    def build_system_prompt(self) -> str:
        """Build the complete system prompt.

        Returns:
            Formatted system prompt string
        """
        return (
            self.SYSTEM_PROMPT_TEMPLATE.format(
                max_items=MAX_RESEARCH_BATCH_SIZE,
                max_items_plus=MAX_RESEARCH_BATCH_SIZE + 1,
                status_too_many=STATUS_TOO_MANY_ITEMS,
                status_insufficient=STATUS_INSUFFICIENT_SOURCES,
            )
            + self.REQUIRED_OUTPUT_SCHEMA
        )

    def build_batch_query(self, items: List[ProductResearchItem]) -> str:
        """Build batch query for multiple products.

        Args:
            items: List of products to research

        Returns:
            Formatted query string
        """
        if not items:
            raise ValueError("Items list cannot be empty")

        logger.debug(f"Building batch query for {len(items)} items")

        # Build system prompt
        system_prompt = self.build_system_prompt()

        # Build items array for the query
        items_json = "[\n"
        for i, item in enumerate(items):
            if i > 0:
                items_json += ",\n"

            item_json = self._format_item_for_query(item)
            items_json += f"  {item_json}"

        items_json += "\n]"

        # Combine system prompt with items
        query = f"{system_prompt}\n\n입력:\n{items_json}"

        logger.debug(f"Built query with {len(query)} characters")
        return query

    def _format_item_for_query(self, item: ProductResearchItem) -> str:
        """Format a single item for the query.

        Args:
            item: Product research item

        Returns:
            JSON-formatted string for the item
        """
        item_dict = {
            "product_name": item.product_name,
            "category": item.category,
            "price_exact": item.price_exact,
            "currency": item.currency,
        }

        # Add optional fields if they exist
        if item.seller_or_store:
            item_dict["seller_or_store"] = item.seller_or_store

        # Convert to JSON string manually for precise formatting
        import json

        return json.dumps(item_dict, ensure_ascii=False)

    def validate_batch_size(self, items: List[ProductResearchItem]) -> None:
        """Validate that batch size is within limits.

        Args:
            items: List of items to validate

        Raises:
            ValueError: If batch size exceeds maximum
        """
        if len(items) > MAX_RESEARCH_BATCH_SIZE:
            raise ValueError(
                f"Batch size {len(items)} exceeds maximum {MAX_RESEARCH_BATCH_SIZE}"
            )

    def get_query_metrics(self, query: str) -> dict:
        """Get metrics about the constructed query.

        Args:
            query: Query string to analyze

        Returns:
            Dictionary with query metrics
        """
        return {
            "query_length": len(query),
            "estimated_tokens": len(query.split()) * 1.3,  # Rough estimate
            "line_count": query.count("\n") + 1,
        }

    def build_single_item_query(self, item: ProductResearchItem) -> str:
        """Build query for a single product item.

        Args:
            item: Product research item

        Returns:
            Formatted query string
        """
        return self.build_batch_query([item])

    def extract_prompt_variables(self) -> dict:
        """Extract variables used in prompt templates.

        Returns:
            Dictionary with prompt variables and their current values
        """
        return {
            "max_items": MAX_RESEARCH_BATCH_SIZE,
            "max_items_plus": MAX_RESEARCH_BATCH_SIZE + 1,
            "status_too_many": STATUS_TOO_MANY_ITEMS,
            "status_insufficient": STATUS_INSUFFICIENT_SOURCES,
            "error_too_many_items": ERROR_TOO_MANY_ITEMS,
        }
