"""Enhanced response schemas for research list endpoints with user-friendly messages."""

from typing import List, Optional
from pydantic import BaseModel, Field

from .research_out import ResearchJobSummaryOut


class ResearchJobListResponse(BaseModel):
    """Enhanced response for research job list with metadata."""
    
    data: List[ResearchJobSummaryOut] = Field(
        description="List of research job summaries"
    )
    message: Optional[str] = Field(
        default=None,
        description="User-friendly message (especially when data is empty)"
    )
    total_count: int = Field(
        description="Total number of jobs available"
    )
    has_more: bool = Field(
        default=False,
        description="Whether more jobs are available beyond the current limit"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "data": [],
                "message": "아직 생성된 리서치 작업이 없습니다. 새로운 작업을 시작해 보세요.",
                "total_count": 0,
                "has_more": False
            }
        }