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
                "product_name": "베이직스 2024 베이직북 14 N-시리즈",
                "category": "가전디지털",
                "price_exact": 388000,
                "currency": "KRW",
                "seller_or_store": "베이직스 공식몰"
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