"""SQLAlchemy ORM 데이터베이스 모델.

주요 역할:
- 데이터베이스 테이블 구조 정의
- 도메인 엔티티와 데이터베이스 간 매핑
- 관계 설정 및 제약 조건 관리
- PostgreSQL 호환성 보장

JSDoc:
@module DatabaseModels
@description SQLAlchemy 기반 데이터베이스 ORM 모델 정의
@version 1.0.0
@author Backend Team
@since 2024-01-01
"""

from datetime import datetime, timezone
from uuid import uuid4


def _get_now():
    """PostgreSQL 호환성을 위해 UTC 형태의 현재 시간을 반환합니다.
    
    Returns:
        datetime: 타임존 정보가 없는 UTC 현재 시간
        
    Note:
        - PostgreSQL TIMESTAMP WITHOUT TIME ZONE과 직접 호환
        - 안정적이고 단순한 UTC 시간 생성
    """
    return datetime.utcnow()

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
# from app.utils.timezone import now_kst  # 사용 중지: timezone 호환성 문제


class ResearchJobModel(Base):
    """리서치 작업 데이터베이스 모델.
    
    리서치 작업의 전체 생명주기를 관리하는 메인 엔티티입니다.
    
    Attributes:
        id: 작업 고유 식별자 (UUID)
        status: 작업 상태 (pending, processing, success, error)
        total_items: 전체 처리할 아이템 수
        processed_items: 처리 완료된 아이템 수
        failed_items: 처리 실패한 아이템 수
        meta_data: 작업 관련 메타데이터 (JSON)
        created_at: 작업 생성 시간
        updated_at: 마지막 업데이트 시간
        started_at: 작업 시작 시간
        completed_at: 작업 완료 시간
        
    Relationships:
        items: 작업에 포함된 아이템 목록 (일대다)
        results: 작업 결과 목록 (일대다)
    """

    __tablename__ = "research_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    status = Column(String(50), nullable=False, default="pending", index=True)
    total_items = Column(Integer, nullable=False, default=0)
    processed_items = Column(Integer, nullable=False, default=0)
    failed_items = Column(Integer, nullable=False, default=0)
    meta_data = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, nullable=False, default=_get_now, index=True)
    updated_at = Column(
        DateTime, nullable=False, default=_get_now, onupdate=_get_now
    )
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # 관계 설정
    items = relationship(
        "ItemModel", back_populates="job", cascade="all, delete-orphan"
    )
    results = relationship(
        "ResultModel", back_populates="job", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<ResearchJob(id={self.id}, status={self.status})>"


class ItemModel(Base):
    """리서치 아이템 데이터베이스 모델.
    
    개별 리서치 대상 제품/아이템 정보를 저장합니다.
    
    Attributes:
        id: 아이템 고유 식별자 (UUID)
        job_id: 소속 작업 ID (외래키)
        name: 제품명 (최대 500자)
        price: 제품 가격 (부동소수점)
        category: 제품 카테고리 (최대 255자, 선택)
        hash: 중복 방지용 해시값 (64자, 인덱스)
        meta_data: 아이템 관련 메타데이터 (JSON)
        created_at: 아이템 생성 시간
        
    Relationships:
        job: 소속 리서치 작업 (다대일)
        result: 리서치 결과 (일대일)
        
    Constraints:
        - (job_id, hash) 조합의 유니크 제약 조건
    """

    __tablename__ = "items"
    __table_args__ = (UniqueConstraint("job_id", "hash", name="uq_job_item_hash"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    job_id = Column(
        UUID(as_uuid=True), ForeignKey("research_jobs.id"), nullable=False, index=True
    )
    name = Column(String(500), nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String(255), nullable=True)
    hash = Column(String(64), nullable=False, index=True)
    meta_data = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, nullable=False, default=_get_now)

    # 관계 설정
    job = relationship("ResearchJobModel", back_populates="items")
    result = relationship("ResultModel", back_populates="item", uselist=False)

    def __repr__(self) -> str:
        return f"<Item(id={self.id}, name={self.name}, price={self.price})>"


class ResultModel(Base):
    """리서치 결과 데이터베이스 모델.
    
    아이템별 리서치 결과 및 상태를 저장합니다.
    
    Attributes:
        id: 결과 고유 식별자 (UUID)
        job_id: 소속 작업 ID (외래키)
        item_id: 연결된 아이템 ID (외래키, 선택)
        item_hash: 아이템 해시값 (중복 방지용)
        item_name: 아이템 이름 (최대 500자)
        status: 리서치 상태 (pending, success, error 등)
        data: 리서치 결과 데이터 (JSON)
        error: 에러 메시지 (텍스트, 선택)
        created_at: 결과 생성 시간
        updated_at: 마지막 업데이트 시간
        
    Relationships:
        job: 소속 리서치 작업 (다대일)
        item: 연결된 아이템 (일대일)
        
    Constraints:
        - (job_id, item_hash) 조합의 유니크 제약 조건
    """

    __tablename__ = "results"
    __table_args__ = (
        UniqueConstraint("job_id", "item_hash", name="uq_job_result_item"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    job_id = Column(
        UUID(as_uuid=True), ForeignKey("research_jobs.id"), nullable=False, index=True
    )
    item_id = Column(UUID(as_uuid=True), ForeignKey("items.id"), nullable=True)
    item_hash = Column(String(64), nullable=False, index=True)
    item_name = Column(String(500), nullable=False)
    status = Column(String(50), nullable=False, default="pending", index=True)
    data = Column(JSON, nullable=False, default=dict)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=_get_now)
    updated_at = Column(
        DateTime, nullable=False, default=_get_now, onupdate=_get_now
    )

    # 관계 설정
    job = relationship("ResearchJobModel", back_populates="results")
    item = relationship("ItemModel", back_populates="result")

    def __repr__(self) -> str:
        return (
            f"<Result(id={self.id}, status={self.status}, item_name={self.item_name})>"
        )
