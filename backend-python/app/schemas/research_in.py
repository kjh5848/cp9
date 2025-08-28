"""리서치 엔드포인트용 입력 DTO.

주요 역할:
- API 요청 데이터 검증 및 파싱
- 클라이언트로부터 받는 데이터 구조 정의
- 입력 데이터 타입 안전성 보장
- 요청 매개변수 문서화

JSDoc:
@module ResearchInputDTOs
@description 리서치 요청을 위한 Pydantic 입력 스키마
@version 1.0.0
@author Backend Team
@since 2024-01-01
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


class ItemIn(BaseModel):
    """Input schema for research items."""

    product_name: str = Field(..., min_length=1, max_length=500, description="Product name")
    price_exact: float = Field(..., ge=0, le=1000000, description="Product price")
    category: Optional[str] = Field(None, max_length=255, description="Product category")
    currency: Optional[str] = Field(default="KRW", description="Currency code")
    product_id: Optional[int] = Field(None, description="Product ID from Coupang")
    product_url: Optional[str] = Field(None, description="Product URL")
    product_image: Optional[str] = Field(None, description="Product image URL")
    is_rocket: Optional[bool] = Field(default=False, description="Rocket shipping available")
    is_free_shipping: Optional[bool] = Field(default=False, description="Free shipping available")
    category_name: Optional[str] = Field(None, description="Category display name")
    seller_or_store: Optional[str] = Field(None, description="Seller or store name")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional item metadata"
    )

    @field_validator("product_name")
    @classmethod
    def validate_product_name(cls, v: str) -> str:
        """Validate product name."""
        if not v.strip():
            raise ValueError("Product name cannot be empty")
        return v.strip()

    @field_validator("metadata")
    @classmethod
    def validate_metadata(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate metadata."""
        # Ensure metadata is not too large
        if len(str(v)) > 1000:
            raise ValueError("Metadata is too large")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "product_name": "탐사 샘물",
                "price_exact": 5720,
                "category": "식품",
                "currency": "KRW",
                "product_id": 7689270513,
                "product_url": "https://link.coupang.com/re/AFFSDP?lptag=AF7133746&pageKey=7689270513",
                "is_rocket": True,
                "seller_or_store": "쿠팡",
                "metadata": {},
            }
        }


class ResearchJobCreateIn(BaseModel):
    """Input schema for creating research jobs."""

    items: List[ItemIn] = Field(
        ..., min_length=1, max_length=10, description="List of items to research"
    )
    return_coupang_preview: Optional[bool] = Field(default=True, description="Return Coupang preview data")
    priority: Optional[int] = Field(default=5, ge=1, le=10, description="Job priority (1-10)")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Job metadata")

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: List[ItemIn]) -> List[ItemIn]:
        """Validate items list."""
        if not v:
            raise ValueError("Items list cannot be empty")

        # Check for duplicates based on name and price
        seen = set()
        for item in v:
            key = (item.product_name.lower(), item.price_exact)
            if key in seen:
                raise ValueError(f"Duplicate item found: {item.product_name}")
            seen.add(key)

        return v

    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "product_name": "탐사 샘물",
                        "price_exact": 5720,
                        "category": "식품",
                        "currency": "KRW",
                        "product_id": 7689270513,
                        "is_rocket": True,
                        "seller_or_store": "쿠팡",
                    },
                    {
                        "product_name": "돌 스위티오 바나나",
                        "price_exact": 3300,
                        "category": "로켓프레시",
                        "currency": "KRW",
                        "is_rocket": True,
                        "seller_or_store": "쿠팡",
                    },
                ],
                "return_coupang_preview": True,
                "priority": 5,
                "metadata": {},
            }
        }


class ResearchJobUpdateIn(BaseModel):
    """Input schema for updating research jobs."""

    status: Optional[str] = Field(
        None,
        description="Job status",
        pattern="^(pending|processing|completed|failed|cancelled)$",
    )
    metadata: Optional[Dict[str, Any]] = Field(None, description="Updated job metadata")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "cancelled",
                "metadata": {"cancelled_reason": "User request"},
            }
        }
