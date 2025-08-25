"""Output DTOs for research endpoints."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ItemOut(BaseModel):
    """Output schema for research items."""

    product_name: str = Field(..., description="Product name")
    price_exact: float = Field(..., description="Product price")
    category: Optional[str] = Field(None, description="Item category")
    hash: Optional[str] = Field(None, description="Item hash")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Item metadata")

    class Config:
        json_schema_extra = {
            "example": {
                "product_name": "iPhone 15 Pro",
                "price_exact": 999.99,
                "category": "Electronics",
                "hash": "abc123...",
                "metadata": {"brand": "Apple", "color": "Space Black"},
            }
        }


class ResultOut(BaseModel):
    """Output schema for research results."""

    id: UUID = Field(..., description="Result ID")
    item_hash: str = Field(..., description="Item hash")
    item_name: str = Field(..., description="Item name")
    status: str = Field(..., description="Result status")
    data: Dict[str, Any] = Field(default_factory=dict, description="Research data")
    error: Optional[str] = Field(None, description="Error message if failed")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "item_hash": "abc123...",
                "item_name": "iPhone 15 Pro",
                "status": "success",
                "data": {
                    "research_content": "Comprehensive research results...",
                    "citations": ["source1.com", "source2.com"],
                },
                "error": None,
                "created_at": "2024-01-01T12:00:00Z",
                "updated_at": "2024-01-01T12:05:00Z",
            }
        }


class ResearchJobOut(BaseModel):
    """Output schema for research jobs."""

    id: UUID = Field(..., description="Job ID")
    status: str = Field(..., description="Job status")
    total_items: int = Field(..., description="Total number of items")
    processed_items: int = Field(..., description="Number of processed items")
    failed_items: int = Field(..., description="Number of failed items")
    success_rate: float = Field(..., description="Success rate (0.0 to 1.0)")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Job metadata")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    started_at: Optional[datetime] = Field(None, description="Start timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    items: List[ItemOut] = Field(default_factory=list, description="Job items")
    results: List[ResultOut] = Field(default_factory=list, description="Job results")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "status": "completed",
                "total_items": 2,
                "processed_items": 2,
                "failed_items": 0,
                "success_rate": 1.0,
                "metadata": {"priority": "high", "user_id": "12345"},
                "created_at": "2024-01-01T12:00:00Z",
                "updated_at": "2024-01-01T12:10:00Z",
                "started_at": "2024-01-01T12:01:00Z",
                "completed_at": "2024-01-01T12:10:00Z",
                "items": [
                    {
                        "product_name": "iPhone 15 Pro",
                        "price_exact": 999.99,
                        "category": "Electronics",
                        "hash": "abc123...",
                    }
                ],
                "results": [
                    {
                        "id": "550e8400-e29b-41d4-a716-446655440001",
                        "item_hash": "abc123...",
                        "item_name": "iPhone 15 Pro",
                        "status": "success",
                        "data": {"research_content": "..."},
                        "created_at": "2024-01-01T12:01:00Z",
                        "updated_at": "2024-01-01T12:05:00Z",
                    }
                ],
            }
        }


class ResearchJobSummaryOut(BaseModel):
    """Summary output schema for research jobs (list view)."""

    id: UUID = Field(..., description="Job ID")
    status: str = Field(..., description="Job status")
    total_items: int = Field(..., description="Total number of items")
    processed_items: int = Field(..., description="Number of processed items")
    failed_items: int = Field(..., description="Number of failed items")
    success_rate: float = Field(..., description="Success rate (0.0 to 1.0)")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    started_at: Optional[datetime] = Field(None, description="Start timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "status": "completed",
                "total_items": 2,
                "processed_items": 2,
                "failed_items": 0,
                "success_rate": 1.0,
                "created_at": "2024-01-01T12:00:00Z",
                "updated_at": "2024-01-01T12:10:00Z",
                "started_at": "2024-01-01T12:01:00Z",
                "completed_at": "2024-01-01T12:10:00Z",
            }
        }


class TaskStatusOut(BaseModel):
    """Output schema for task status."""

    task_id: str = Field(..., description="Celery task ID")
    status: str = Field(..., description="Task status")
    result: Optional[Dict[str, Any]] = Field(None, description="Task result")
    progress: Optional[Dict[str, Any]] = Field(None, description="Task progress")

    class Config:
        json_schema_extra = {
            "example": {
                "task_id": "celery-task-uuid",
                "status": "PROGRESS",
                "result": None,
                "progress": {
                    "job_id": "550e8400-e29b-41d4-a716-446655440000",
                    "processed": 1,
                    "total": 2,
                    "current_item": "iPhone 15 Pro",
                },
            }
        }


class ErrorOut(BaseModel):
    """Error output schema."""

    detail: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Error timestamp"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Job not found",
                "error_code": "JOB_NOT_FOUND",
                "timestamp": "2024-01-01T12:00:00Z",
            }
        }
