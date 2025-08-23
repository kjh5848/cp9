"""Product research input schemas."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

from app.core.constants import (
    DEFAULT_CURRENCY,
    DEFAULT_RESEARCH_BATCH_SIZE,
    MAX_RESEARCH_BATCH_SIZE,
    MIN_RESEARCH_BATCH_SIZE,
    SUPPORTED_CURRENCIES,
)


class ProductItemRequest(BaseModel):
    """Single product item request schema."""
    
    product_name: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="제품명",
        examples=["베이직스 2024 베이직북 14 N-시리즈"]
    )
    category: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="제품 카테고리",
        examples=["가전디지털", "뷰티", "식품"]
    )
    price_exact: float = Field(
        ...,
        gt=0,
        description="정확한 제품 가격",
        examples=[388000]
    )
    currency: str = Field(
        default=DEFAULT_CURRENCY,
        description="통화 단위",
        examples=["KRW", "USD"]
    )
    seller_or_store: Optional[str] = Field(
        None,
        max_length=200,
        description="판매자 또는 스토어명",
        examples=["쿠팡", "11번가"]
    )
    
    # Coupang API 실제 구조 기반 필드들
    product_id: Optional[int] = Field(
        None,
        description="쿠팡 제품 ID (productId)",
        examples=[7582946]
    )
    product_image: Optional[str] = Field(
        None,
        description="쿠팡 제품 이미지 URL (productImage)",
        examples=["https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/..."]
    )
    product_url: Optional[str] = Field(
        None,
        description="쿠팡 제품 상세 페이지 URL (productUrl)",
        examples=["https://www.coupang.com/vp/products/7582946"]
    )
    is_rocket: Optional[bool] = Field(
        None,
        description="로켓배송 여부 (isRocket)",
        examples=[True]
    )
    is_free_shipping: Optional[bool] = Field(
        None,
        description="무료배송 여부 (isFreeShipping)",
        examples=[True]
    )
    category_name: Optional[str] = Field(
        None,
        description="쿠팡 카테고리명 (categoryName)",
        examples=["이어폰/헤드폰"]
    )
    
    # 키워드 검색 전용 필드
    keyword: Optional[str] = Field(
        None,
        description="키워드 검색어 (keyword)",
        examples=["갤럭시 버드3 프로"]
    )
    rank: Optional[int] = Field(
        None,
        ge=1,
        description="키워드 검색 시 순위 (rank)",
        examples=[1]
    )
    
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="추가 메타데이터"
    )
    
    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        """Validate currency code."""
        if v not in SUPPORTED_CURRENCIES:
            raise ValueError(f"Currency must be one of {SUPPORTED_CURRENCIES}")
        return v
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "product_name": "삼성전자 갤럭시 버드3 프로",
                "category": "이어폰/헤드폰",
                "price_exact": 189000,
                "currency": "KRW",
                "seller_or_store": "쿠팡",
                "product_id": 7582946,
                "product_url": "https://www.coupang.com/vp/products/7582946",
                "product_image": "https://thumbnail10.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/...",
                "is_rocket": True,
                "is_free_shipping": True,
                "category_name": "이어폰/헤드폰",
                "metadata": {
                    "source": "coupang_partners",
                    "selected_at": "2024-08-23T10:30:00Z",
                    "frontend_session_id": "session_abc123"
                }
            }
        }


class ResearchOptions(BaseModel):
    """Research options schema."""
    
    include_coupang_price: bool = Field(
        default=True,
        description="쿠팡 가격 비교 포함 여부"
    )
    include_reviews: bool = Field(
        default=True,
        description="리뷰 정보 포함 여부"
    )
    include_specs: bool = Field(
        default=True,
        description="상세 스펙 포함 여부"
    )
    min_sources: int = Field(
        default=3,
        ge=1,
        le=10,
        description="최소 출처 개수"
    )
    max_concurrent: int = Field(
        default=5,
        ge=1,
        le=10,
        description="최대 동시 요청 수"
    )
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "include_coupang_price": True,
                "include_reviews": True,
                "include_specs": True,
                "min_sources": 3,
                "max_concurrent": 5
            }
        }


class ProductResearchRequest(BaseModel):
    """Product research batch request schema."""
    
    items: List[ProductItemRequest] = Field(
        ...,
        min_items=MIN_RESEARCH_BATCH_SIZE,
        max_items=MAX_RESEARCH_BATCH_SIZE,
        description=f"리서치할 제품 목록 (최대 {MAX_RESEARCH_BATCH_SIZE}개)"
    )
    options: Optional[ResearchOptions] = Field(
        default_factory=ResearchOptions,
        description="리서치 옵션"
    )
    callback_url: Optional[str] = Field(
        None,
        description="완료 시 콜백 URL"
    )
    priority: int = Field(
        default=5,
        ge=1,
        le=10,
        description="작업 우선순위 (1=낮음, 10=높음)"
    )
    
    @field_validator("items")
    @classmethod
    def validate_items_count(cls, v: List[ProductItemRequest]) -> List[ProductItemRequest]:
        """Validate items count."""
        if len(v) > MAX_RESEARCH_BATCH_SIZE:
            raise ValueError(f"최대 {MAX_RESEARCH_BATCH_SIZE}개의 제품만 동시에 리서치할 수 있습니다.")
        if len(v) < MIN_RESEARCH_BATCH_SIZE:
            raise ValueError(f"최소 {MIN_RESEARCH_BATCH_SIZE}개의 제품이 필요합니다.")
        return v
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "product_name": "베이직스 2024 베이직북 14 N-시리즈",
                        "category": "가전디지털",
                        "price_exact": 388000,
                        "currency": "KRW"
                    },
                    {
                        "product_name": "레노버 2025 아이디어패드 1 15IJL7",
                        "category": "가전디지털",
                        "price_exact": 339000,
                        "currency": "KRW"
                    }
                ],
                "options": {
                    "include_coupang_price": True,
                    "include_reviews": True,
                    "include_specs": True
                },
                "priority": 5
            }
        }


class JobStatusRequest(BaseModel):
    """Job status request schema."""
    
    include_details: bool = Field(
        default=True,
        description="상세 결과 포함 여부"
    )
    include_failed: bool = Field(
        default=True,
        description="실패한 아이템 포함 여부"
    )