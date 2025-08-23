"""Product research output schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ProductAttributeResponse(BaseModel):
    """Product attribute response schema."""
    
    name: str = Field(..., description="속성명")
    value: str = Field(..., description="속성값")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "name": "포트",
                "value": "USB 3.0 x2, Mini HDMI, Type-C"
            }
        }


class ProductSpecsResponse(BaseModel):
    """Product specifications response schema."""
    
    main: List[str] = Field(
        default_factory=list,
        description="주요 스펙 목록"
    )
    attributes: List[ProductAttributeResponse] = Field(
        default_factory=list,
        description="상세 속성 목록"
    )
    size_or_weight: Optional[str] = Field(
        None,
        description="크기 또는 무게"
    )
    options: List[str] = Field(
        default_factory=list,
        description="옵션 목록"
    )
    included_items: List[str] = Field(
        default_factory=list,
        description="포함 구성품"
    )
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "main": [
                    "Intel N95 CPU",
                    "RAM 8GB",
                    "SSD 256GB",
                    "14.1형 IPS FHD 디스플레이"
                ],
                "attributes": [
                    {"name": "포트", "value": "USB 3.0 x2, Mini HDMI, Type-C"},
                    {"name": "카메라", "value": "전면 2MP"}
                ],
                "size_or_weight": "1.35kg",
                "options": ["RAM 8GB/16GB", "SSD 256GB/512GB"],
                "included_items": ["노트북 본체", "충전기"]
            }
        }


class NotableReviewResponse(BaseModel):
    """Notable review response schema."""
    
    source: str = Field(..., description="리뷰 출처")
    quote: str = Field(..., description="리뷰 인용")
    url: Optional[str] = Field(None, description="리뷰 URL")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "source": "에누리",
                "quote": "휴대성이 괜찮고 저렴한 티가 나지 않아 좋았습니다.",
                "url": "https://www.enuri.com/knowcom/detail.jsp?kbno=3463094"
            }
        }


class ProductReviewsResponse(BaseModel):
    """Product reviews response schema."""
    
    rating_avg: float = Field(
        0.0,
        ge=0,
        le=5,
        description="평균 평점 (5점 만점)"
    )
    review_count: int = Field(
        0,
        ge=0,
        description="리뷰 개수"
    )
    summary_positive: List[str] = Field(
        default_factory=list,
        description="긍정적 리뷰 요약"
    )
    summary_negative: List[str] = Field(
        default_factory=list,
        description="부정적 리뷰 요약"
    )
    notable_reviews: List[NotableReviewResponse] = Field(
        default_factory=list,
        description="주목할 만한 리뷰"
    )
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "rating_avg": 4.3,
                "review_count": 41,
                "summary_positive": [
                    "가성비가 뛰어나다",
                    "휴대성이 좋다"
                ],
                "summary_negative": [
                    "터치패드 감도가 아쉽다"
                ],
                "notable_reviews": [
                    {
                        "source": "에누리",
                        "quote": "휴대성이 괜찮고 저렴한 티가 나지 않아 좋았습니다.",
                        "url": "https://www.enuri.com/knowcom/detail.jsp?kbno=3463094"
                    }
                ]
            }
        }


class ProductResultResponse(BaseModel):
    """Single product research result response schema."""
    
    product_name: str = Field(..., description="제품명")
    brand: str = Field("", description="브랜드")
    category: str = Field(..., description="카테고리")
    model_or_variant: str = Field("", description="모델명 또는 변형")
    price_exact: float = Field(..., description="정확한 가격")
    currency: str = Field("KRW", description="통화 단위")
    seller_or_store: Optional[str] = Field(None, description="판매자 또는 스토어")
    deeplink_or_product_url: Optional[str] = Field(None, description="제품 상세 URL")
    coupang_price: Optional[float] = Field(None, description="쿠팡 가격")
    specs: ProductSpecsResponse = Field(
        default_factory=ProductSpecsResponse,
        description="제품 스펙"
    )
    reviews: ProductReviewsResponse = Field(
        default_factory=ProductReviewsResponse,
        description="리뷰 정보"
    )
    sources: List[str] = Field(
        default_factory=list,
        description="정보 출처"
    )
    captured_at: str = Field(
        ...,
        description="정보 수집 날짜"
    )
    status: str = Field(..., description="리서치 상태")
    error_message: Optional[str] = Field(None, description="에러 메시지")
    missing_fields: Optional[List[str]] = Field(None, description="누락된 필드")
    suggested_queries: Optional[List[str]] = Field(None, description="추천 검색어")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "product_name": "베이직스 2024 베이직북 14 N-시리즈",
                "brand": "베이직스",
                "category": "가전디지털",
                "model_or_variant": "베이직북 14 N-시리즈",
                "price_exact": 388000,
                "currency": "KRW",
                "seller_or_store": "베이직스 공식몰",
                "deeplink_or_product_url": "https://basic-s.com/product/123",
                "coupang_price": None,
                "specs": {
                    "main": ["Intel N95 CPU", "RAM 8GB"],
                    "size_or_weight": "1.35kg"
                },
                "reviews": {
                    "rating_avg": 4.3,
                    "review_count": 41
                },
                "sources": [
                    "https://basic-s.com",
                    "https://www.enuri.com",
                    "https://prod.danawa.com"
                ],
                "captured_at": "2024-01-20",
                "status": "success"
            }
        }


class ResearchMetadataResponse(BaseModel):
    """Research job metadata response schema."""
    
    total_items: int = Field(0, description="전체 아이템 수")
    successful_items: int = Field(0, description="성공한 아이템 수")
    failed_items: int = Field(0, description="실패한 아이템 수")
    success_rate: float = Field(0.0, description="성공률")
    processing_time_ms: Optional[int] = Field(None, description="처리 시간 (밀리초)")
    created_at: datetime = Field(..., description="생성 시간")
    updated_at: datetime = Field(..., description="업데이트 시간")
    started_at: Optional[datetime] = Field(None, description="시작 시간")
    completed_at: Optional[datetime] = Field(None, description="완료 시간")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "total_items": 2,
                "successful_items": 2,
                "failed_items": 0,
                "success_rate": 1.0,
                "processing_time_ms": 3500,
                "created_at": "2024-01-20T10:00:00Z",
                "updated_at": "2024-01-20T10:00:03.5Z",
                "started_at": "2024-01-20T10:00:00Z",
                "completed_at": "2024-01-20T10:00:03.5Z"
            }
        }


class ProductResearchResponse(BaseModel):
    """Product research batch response schema."""
    
    job_id: UUID = Field(..., description="작업 ID")
    status: str = Field(..., description="작업 상태")
    results: List[ProductResultResponse] = Field(
        default_factory=list,
        description="리서치 결과 목록"
    )
    metadata: ResearchMetadataResponse = Field(
        ...,
        description="작업 메타데이터"
    )
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "job_id": "550e8400-e29b-41d4-a716-446655440000",
                "status": "success",
                "results": [
                    {
                        "product_name": "베이직스 2024 베이직북 14 N-시리즈",
                        "brand": "베이직스",
                        "category": "가전디지털",
                        "price_exact": 388000,
                        "currency": "KRW",
                        "reviews": {
                            "rating_avg": 4.3,
                            "review_count": 41
                        },
                        "sources": ["https://basic-s.com"],
                        "captured_at": "2024-01-20",
                        "status": "success"
                    }
                ],
                "metadata": {
                    "total_items": 1,
                    "successful_items": 1,
                    "failed_items": 0,
                    "success_rate": 1.0,
                    "processing_time_ms": 3500,
                    "created_at": "2024-01-20T10:00:00Z",
                    "updated_at": "2024-01-20T10:00:03.5Z"
                }
            }
        }


class JobStatusResponse(BaseModel):
    """Job status response schema."""
    
    job_id: UUID = Field(..., description="작업 ID")
    status: str = Field(..., description="작업 상태")
    progress: float = Field(
        0.0,
        ge=0,
        le=1,
        description="진행률 (0-1)"
    )
    message: Optional[str] = Field(None, description="상태 메시지")
    metadata: Optional[Dict[str, Any]] = Field(None, description="추가 메타데이터")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "job_id": "550e8400-e29b-41d4-a716-446655440000",
                "status": "processing",
                "progress": 0.5,
                "message": "2개 중 1개 아이템 처리 완료",
                "metadata": {
                    "processed": 1,
                    "total": 2
                }
            }
        }


class ErrorResponse(BaseModel):
    """Error response schema."""
    
    error: str = Field(..., description="에러 타입")
    message: str = Field(..., description="에러 메시지")
    details: Optional[Dict[str, Any]] = Field(None, description="상세 정보")
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "error": "ValidationError",
                "message": "요청한 아이템 수가 최대 허용 개수를 초과했습니다.",
                "details": {
                    "max_allowed": 10,
                    "received": 15
                }
            }
        }