"""Input DTOs for research endpoints."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


class ItemIn(BaseModel):
    """Input schema for research items."""

    name: str = Field(..., min_length=1, max_length=500, description="Item name")
    price: float = Field(..., ge=0, le=1000000, description="Item price")
    category: Optional[str] = Field(None, max_length=255, description="Item category")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional item metadata"
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate item name."""
        if not v.strip():
            raise ValueError("Item name cannot be empty")
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
                "name": "iPhone 15 Pro",
                "price": 999.99,
                "category": "Electronics",
                "metadata": {"brand": "Apple", "color": "Space Black"},
            }
        }


class ResearchJobCreateIn(BaseModel):
    """Input schema for creating research jobs."""

    items: List[ItemIn] = Field(
        ..., min_length=1, max_length=10, description="List of items to research"
    )
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
            key = (item.name.lower(), item.price)
            if key in seen:
                raise ValueError(f"Duplicate item found: {item.name}")
            seen.add(key)

        return v

    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "name": "iPhone 15 Pro",
                        "price": 999.99,
                        "category": "Electronics",
                    },
                    {
                        "name": "Samsung Galaxy S24",
                        "price": 899.99,
                        "category": "Electronics",
                    },
                ],
                "metadata": {"priority": "high", "user_id": "12345"},
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
