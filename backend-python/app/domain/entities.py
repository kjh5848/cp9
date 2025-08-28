"""Domain entities - Pure business objects with no framework dependencies."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4


def _get_now() -> datetime:
    """Get current datetime in UTC for database compatibility."""
    try:
        from app.utils.timezone import now_kst
        kst_time = now_kst()
        # Convert to UTC for PostgreSQL TIMESTAMP WITHOUT TIME ZONE compatibility
        return kst_time.astimezone(timezone.utc).replace(tzinfo=None)
    except ImportError:
        return datetime.utcnow()  # Fallback to UTC


class JobStatus(str, Enum):
    """Research job status enumeration."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ResultStatus(str, Enum):
    """Individual result status enumeration."""

    PENDING = "pending"
    SUCCESS = "success"
    ERROR = "error"
    SKIPPED = "skipped"
    COUPANG_PREVIEW = "coupang_preview"


@dataclass
class Item:
    """Research item entity."""

    product_name: str
    price_exact: float
    category: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    hash: Optional[str] = None

    def __post_init__(self) -> None:
        """Validate item after initialization and generate hash if missing."""
        if not self.product_name:
            raise ValueError("Product name cannot be empty")
        if self.price_exact < 0:
            raise ValueError("Product price cannot be negative")
        
        # Generate hash if not provided
        if not self.hash:
            self.hash = self._generate_hash()
    
    def _generate_hash(self) -> str:
        """Generate a unique hash for this item."""
        import hashlib
        
        # Create a consistent string representation of the item
        hash_data = {
            "name": self.product_name.lower().strip(),
            "price": round(self.price_exact, 2),  # Round to 2 decimal places for consistency
            "category": self.category.lower().strip() if self.category else None,
        }
        
        # Convert to sorted string for consistent hashing
        sorted_items = []
        for key in sorted(hash_data.keys()):
            value = hash_data[key]
            if value is not None:
                sorted_items.append(f"{key}:{value}")
        
        hash_string = "|".join(sorted_items)
        return hashlib.sha256(hash_string.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        """Convert item to dictionary."""
        return {
            "product_name": self.product_name,
            "price_exact": self.price_exact,
            "category": self.category,
            "metadata": self.metadata,
            "hash": self.hash,
        }


@dataclass
class Result:
    """Research result entity."""

    id: UUID = field(default_factory=uuid4)
    item_hash: str = ""
    item_name: str = ""
    status: ResultStatus = ResultStatus.PENDING
    data: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    created_at: datetime = field(default_factory=_get_now)
    updated_at: datetime = field(default_factory=_get_now)

    def mark_success(self, data: Dict[str, Any]) -> None:
        """Mark result as successful."""
        self.status = ResultStatus.SUCCESS
        self.data = data
        self.error = None
        self.updated_at = _get_now()

    def mark_error(self, error: str) -> None:
        """Mark result as failed."""
        self.status = ResultStatus.ERROR
        self.error = error
        self.updated_at = _get_now()

    def mark_skipped(self, reason: str) -> None:
        """Mark result as skipped."""
        self.status = ResultStatus.SKIPPED
        self.error = reason
        self.updated_at = _get_now()

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary."""
        return {
            "id": str(self.id),
            "item_hash": self.item_hash,
            "item_name": self.item_name,
            "status": self.status.value,
            "data": self.data,
            "error": self.error,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


@dataclass
class ResearchJob:
    """Research job entity."""

    id: UUID = field(default_factory=uuid4)
    status: JobStatus = JobStatus.PENDING
    items: List[Item] = field(default_factory=list)
    results: List[Result] = field(default_factory=list)
    total_items: int = 0
    processed_items: int = 0
    failed_items: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=_get_now)
    updated_at: datetime = field(default_factory=_get_now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    def add_item(self, item: Item) -> None:
        """Add an item to the research job."""
        self.items.append(item)
        self.total_items = len(self.items)
        self.updated_at = _get_now()

    def add_items(self, items: List[Item]) -> None:
        """Add multiple items to the research job."""
        self.items.extend(items)
        self.total_items = len(self.items)
        self.updated_at = _get_now()

    def start(self) -> None:
        """Mark job as started."""
        self.status = JobStatus.PROCESSING
        self.started_at = _get_now()
        self.updated_at = _get_now()

    def complete(self) -> None:
        """Mark job as completed."""
        self.status = JobStatus.COMPLETED
        self.completed_at = _get_now()
        self.updated_at = _get_now()

    def fail(self, error: Optional[str] = None) -> None:
        """Mark job as failed."""
        self.status = JobStatus.FAILED
        self.completed_at = _get_now()
        self.updated_at = _get_now()
        if error:
            self.metadata["error"] = error

    def cancel(self) -> None:
        """Mark job as cancelled."""
        self.status = JobStatus.CANCELLED
        self.completed_at = _get_now()
        self.updated_at = _get_now()

    def add_result(self, result: Result) -> None:
        """Add a result to the job."""
        self.results.append(result)
        if result.status == ResultStatus.SUCCESS:
            self.processed_items += 1
        elif result.status == ResultStatus.ERROR:
            self.failed_items += 1
        self.updated_at = _get_now()

    def update_progress(self) -> None:
        """Update job progress based on results."""
        self.processed_items = sum(
            1 for r in self.results if r.status == ResultStatus.SUCCESS
        )
        self.failed_items = sum(
            1 for r in self.results if r.status == ResultStatus.ERROR
        )
        self.updated_at = _get_now()

    @property
    def is_complete(self) -> bool:
        """Check if job is complete."""
        return self.status in [
            JobStatus.COMPLETED,
            JobStatus.FAILED,
            JobStatus.CANCELLED,
        ]

    @property
    def is_active(self) -> bool:
        """Check if job is active."""
        return self.status == JobStatus.PROCESSING

    @property
    def success_rate(self) -> float:
        """Calculate success rate."""
        if self.total_items == 0:
            return 0.0
        return self.processed_items / self.total_items

    def to_dict(self) -> Dict[str, Any]:
        """Convert job to dictionary."""
        return {
            "id": str(self.id),
            "status": self.status.value,
            "total_items": self.total_items,
            "processed_items": self.processed_items,
            "failed_items": self.failed_items,
            "success_rate": self.success_rate,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat()
            if self.completed_at
            else None,
            "items": [item.to_dict() for item in self.items],
            "results": [result.to_dict() for result in self.results],
        }
