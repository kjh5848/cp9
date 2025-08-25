"""Product research domain entities."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4


class ResearchStatus(str, Enum):
    """Research status enumeration."""

    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    ERROR = "error"
    INSUFFICIENT_SOURCES = "insufficient_sources"
    TOO_MANY_ITEMS = "too_many_items"


@dataclass
class ProductAttribute:
    """Product attribute entity."""

    name: str
    value: str

    def to_dict(self) -> Dict[str, str]:
        """Convert to dictionary."""
        return {"name": self.name, "value": self.value}


@dataclass
class ProductSpecs:
    """Product specifications entity."""

    main: List[str] = field(default_factory=list)
    attributes: List[ProductAttribute] = field(default_factory=list)
    size_or_weight: Optional[str] = None
    options: List[str] = field(default_factory=list)
    included_items: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "main": self.main,
            "attributes": [attr.to_dict() for attr in self.attributes],
            "size_or_weight": self.size_or_weight,
            "options": self.options,
            "included_items": self.included_items,
        }


@dataclass
class NotableReview:
    """Notable review entity."""

    source: str
    quote: str
    url: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {"source": self.source, "quote": self.quote, "url": self.url}


@dataclass
class ProductReviews:
    """Product reviews entity."""

    rating_avg: float = 0.0
    review_count: int = 0
    summary_positive: List[str] = field(default_factory=list)
    summary_negative: List[str] = field(default_factory=list)
    notable_reviews: List[NotableReview] = field(default_factory=list)

    def __post_init__(self) -> None:
        """Validate reviews after initialization."""
        if not 0 <= self.rating_avg <= 5:
            raise ValueError(
                f"Rating average must be between 0 and 5, got {self.rating_avg}"
            )
        if self.review_count < 0:
            raise ValueError(
                f"Review count cannot be negative, got {self.review_count}"
            )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "rating_avg": round(self.rating_avg, 1),
            "review_count": self.review_count,
            "summary_positive": self.summary_positive,
            "summary_negative": self.summary_negative,
            "notable_reviews": [review.to_dict() for review in self.notable_reviews],
        }


@dataclass
class ProductResearchItem:
    """Product research input entity."""

    product_name: str
    category: str
    price_exact: float
    currency: str = "KRW"
    seller_or_store: Optional[str] = None

    # Coupang API 실제 구조 기반 필드들
    product_id: Optional[int] = None
    product_image: Optional[str] = None
    product_url: Optional[str] = None
    is_rocket: Optional[bool] = None
    is_free_shipping: Optional[bool] = None
    category_name: Optional[str] = None

    # 키워드 검색 전용 필드
    keyword: Optional[str] = None
    rank: Optional[int] = None

    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        """Validate item after initialization."""
        if not self.product_name:
            raise ValueError("Product name cannot be empty")
        if not self.category:
            raise ValueError("Category cannot be empty")
        if self.price_exact < 0:
            raise ValueError(f"Price cannot be negative, got {self.price_exact}")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "product_name": self.product_name,
            "category": self.category,
            "price_exact": self.price_exact,
            "currency": self.currency,
            "seller_or_store": self.seller_or_store,
            "product_id": self.product_id,
            "product_image": self.product_image,
            "product_url": self.product_url,
            "is_rocket": self.is_rocket,
            "is_free_shipping": self.is_free_shipping,
            "category_name": self.category_name,
            "keyword": self.keyword,
            "rank": self.rank,
            "metadata": self.metadata,
        }


@dataclass
class ProductResearchResult:
    """Product research result entity."""

    id: UUID = field(default_factory=uuid4)
    product_name: str = ""
    brand: str = ""
    category: str = ""
    model_or_variant: str = ""
    price_exact: float = 0.0
    currency: str = "KRW"
    seller_or_store: Optional[str] = None
    deeplink_or_product_url: Optional[str] = None
    coupang_price: Optional[float] = None
    specs: ProductSpecs = field(default_factory=ProductSpecs)
    reviews: ProductReviews = field(default_factory=ProductReviews)
    sources: List[str] = field(default_factory=list)
    captured_at: str = field(
        default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d")
    )
    status: ResearchStatus = ResearchStatus.PENDING
    error_message: Optional[str] = None
    missing_fields: List[str] = field(default_factory=list)
    suggested_queries: List[str] = field(default_factory=list)

    def mark_success(self) -> None:
        """Mark research as successful."""
        self.status = ResearchStatus.SUCCESS
        self.error_message = None
        self.missing_fields = []
        self.suggested_queries = []

    def mark_error(self, error: str) -> None:
        """Mark research as failed."""
        self.status = ResearchStatus.ERROR
        self.error_message = error

    def mark_insufficient_sources(
        self, missing_fields: List[str], suggested_queries: List[str]
    ) -> None:
        """Mark research as having insufficient sources."""
        self.status = ResearchStatus.INSUFFICIENT_SOURCES
        self.missing_fields = missing_fields
        self.suggested_queries = suggested_queries

    def is_valid(self) -> bool:
        """Check if research result has all required data."""
        return (
            self.status == ResearchStatus.SUCCESS
            and self.reviews.rating_avg > 0
            and self.reviews.review_count > 0
            and len(self.sources) >= 3
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        result = {
            "id": str(self.id),
            "product_name": self.product_name,
            "brand": self.brand,
            "category": self.category,
            "model_or_variant": self.model_or_variant,
            "price_exact": self.price_exact,
            "currency": self.currency,
            "seller_or_store": self.seller_or_store,
            "deeplink_or_product_url": self.deeplink_or_product_url,
            "coupang_price": self.coupang_price,
            "specs": self.specs.to_dict(),
            "reviews": self.reviews.to_dict(),
            "sources": self.sources,
            "captured_at": self.captured_at,
            "status": self.status.value,
        }

        # Add error information if present
        if self.status == ResearchStatus.ERROR:
            result["error_message"] = self.error_message
        elif self.status == ResearchStatus.INSUFFICIENT_SOURCES:
            result["missing_fields"] = self.missing_fields
            result["suggested_queries"] = self.suggested_queries

        return result


@dataclass
class ProductResearchJob:
    """Product research job entity."""

    id: UUID = field(default_factory=uuid4)
    items: List[ProductResearchItem] = field(default_factory=list)
    results: List[ProductResearchResult] = field(default_factory=list)
    status: ResearchStatus = ResearchStatus.PENDING
    total_items: int = 0
    successful_items: int = 0
    failed_items: int = 0
    processing_time_ms: Optional[int] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def add_items(self, items: List[ProductResearchItem]) -> None:
        """Add items to research job."""
        self.items.extend(items)
        self.total_items = len(self.items)
        self.updated_at = datetime.utcnow()

    def start(self) -> None:
        """Mark job as started."""
        self.status = ResearchStatus.PROCESSING
        self.started_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def add_result(self, result: ProductResearchResult) -> None:
        """Add a result to the job."""
        self.results.append(result)
        if result.status == ResearchStatus.SUCCESS:
            self.successful_items += 1
        elif result.status in [
            ResearchStatus.ERROR,
            ResearchStatus.INSUFFICIENT_SOURCES,
        ]:
            self.failed_items += 1
        self.updated_at = datetime.utcnow()

    def complete(self) -> None:
        """Mark job as completed."""
        self.status = ResearchStatus.SUCCESS
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

        # Calculate processing time
        if self.started_at:
            delta = self.completed_at - self.started_at
            self.processing_time_ms = int(delta.total_seconds() * 1000)

    def fail(self, error: str) -> None:
        """Mark job as failed."""
        self.status = ResearchStatus.ERROR
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.metadata["error"] = error

    @property
    def success_rate(self) -> float:
        """Calculate success rate."""
        if self.total_items == 0:
            return 0.0
        return self.successful_items / self.total_items

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "job_id": str(self.id),
            "status": self.status.value,
            "results": [result.to_dict() for result in self.results],
            "metadata": {
                "total_items": self.total_items,
                "successful_items": self.successful_items,
                "failed_items": self.failed_items,
                "success_rate": round(self.success_rate, 2),
                "processing_time_ms": self.processing_time_ms,
                "created_at": self.created_at.isoformat(),
                "updated_at": self.updated_at.isoformat(),
                "started_at": self.started_at.isoformat() if self.started_at else None,
                "completed_at": self.completed_at.isoformat()
                if self.completed_at
                else None,
                **self.metadata,
            },
        }
