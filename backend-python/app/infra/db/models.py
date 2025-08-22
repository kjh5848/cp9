"""SQLAlchemy ORM models."""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.infra.db.session import Base


class ResearchJobModel(Base):
    """Research job database model."""

    __tablename__ = "research_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    status = Column(String(50), nullable=False, default="pending", index=True)
    total_items = Column(Integer, nullable=False, default=0)
    processed_items = Column(Integer, nullable=False, default=0)
    failed_items = Column(Integer, nullable=False, default=0)
    metadata = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    items = relationship("ItemModel", back_populates="job", cascade="all, delete-orphan")
    results = relationship("ResultModel", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<ResearchJob(id={self.id}, status={self.status})>"


class ItemModel(Base):
    """Research item database model."""

    __tablename__ = "items"
    __table_args__ = (
        UniqueConstraint("job_id", "hash", name="uq_job_item_hash"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("research_jobs.id"), nullable=False, index=True)
    name = Column(String(500), nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String(255), nullable=True)
    hash = Column(String(64), nullable=False, index=True)
    metadata = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    job = relationship("ResearchJobModel", back_populates="items")
    result = relationship("ResultModel", back_populates="item", uselist=False)

    def __repr__(self) -> str:
        return f"<Item(id={self.id}, name={self.name}, price={self.price})>"


class ResultModel(Base):
    """Research result database model."""

    __tablename__ = "results"
    __table_args__ = (
        UniqueConstraint("job_id", "item_hash", name="uq_job_result_item"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("research_jobs.id"), nullable=False, index=True)
    item_id = Column(UUID(as_uuid=True), ForeignKey("items.id"), nullable=True)
    item_hash = Column(String(64), nullable=False, index=True)
    item_name = Column(String(500), nullable=False)
    status = Column(String(50), nullable=False, default="pending", index=True)
    data = Column(JSON, nullable=False, default=dict)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job = relationship("ResearchJobModel", back_populates="results")
    item = relationship("ItemModel", back_populates="result")

    def __repr__(self) -> str:
        return f"<Result(id={self.id}, status={self.status}, item_name={self.item_name})>"