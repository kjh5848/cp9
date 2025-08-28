"""데이터베이스 작업을 위한 리포지토리 구현체.

주요 역할:
- 도메인 엔티티와 데이터베이스 모델 간의 변환 처리
- CRUD 작업의 추상화 및 캡슐화
- 트랜잭션 관리 및 데이터 일관성 보장
- 비동기 데이터베이스 연산 지원

JSDoc:
@module Repositories
@description Clean Architecture의 인프라 계층 - 데이터 영속성 담당
@version 1.0.0
@author Backend Team
@since 2024-01-01
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging import get_logger
from app.domain.entities import Item, JobStatus, ResearchJob, Result, ResultStatus
from app.infra.db.models import ItemModel, ResearchJobModel, ResultModel

logger = get_logger(__name__)


class ResearchJobRepository:
    """리서치 작업 관련 데이터베이스 작업을 처리하는 리포지토리.
    
    주요 책임:
    - ResearchJob 도메인 엔티티의 CRUD 작업
    - 데이터베이스 모델과 도메인 엔티티 간 변환
    - 작업 상태 관리 및 업데이트
    - 관련 Item 및 Result 엔티티 관리
    
    JSDoc:
    @class ResearchJobRepository
    @description 리서치 작업 데이터 영속성을 담당하는 리포지토리
    @implements {Repository<ResearchJob>}
    @uses {ResearchJobModel, ItemModel, ResultModel}
    """

    def __init__(self, session: AsyncSession):
        """데이터베이스 세션으로 리포지토리를 초기화합니다.

        Args:
            session: SQLAlchemy 비동기 세션 인스턴스
            
        JSDoc:
        @constructor
        @description 리포지토리 인스턴스 초기화 및 DB 세션 할당
        @param {AsyncSession} session - 비동기 데이터베이스 세션
        """
        self.session = session

    async def create(self, job: ResearchJob) -> ResearchJob:
        """새로운 리서치 작업을 생성합니다.

        Args:
            job: ResearchJob 도메인 엔티티

        Returns:
            생성된 ResearchJob 엔티티
            
        JSDoc:
        @async
        @method create
        @description 새로운 리서치 작업을 데이터베이스에 저장
        @param {ResearchJob} job - 저장할 작업 도메인 엔티티
        @returns {Promise<ResearchJob>} 저장된 작업 엔티티
        @throws {DatabaseError} 데이터베이스 저장 실패시
        """
        # request_id 추출을 위한 컨텍스트 변수 사용
        from uuid import uuid4
        from app.core.context import REQUEST_ID_VAR
        
        request_id = REQUEST_ID_VAR.get(str(uuid4()))
            
        logger.info(
            f"[Step 8] 💾 데이터베이스 작업 저장 시작 | request_id={request_id} | job_id={job.id} | items_count={len(job.items)}",
            extra={
                "step": 8,
                "request_id": request_id,
                "job_id": str(job.id),
                "repository_method": "create",
                "items_count": len(job.items),
                "file_location": "app/infra/db/repositories.py:ResearchJobRepository.create"
            }
        )
        
        # 작업 모델 생성
        job_model = ResearchJobModel(
            id=job.id,
            status=job.status.value,
            total_items=job.total_items,
            processed_items=job.processed_items,
            failed_items=job.failed_items,
            metadata=job.metadata,
            created_at=job.created_at,
            updated_at=job.updated_at,
            started_at=job.started_at,
            completed_at=job.completed_at,
        )

        # Create item models and store for later reference
        item_models = []
        for item in job.items:
            # Triple validation to ensure hash is never empty
            if not item.hash or item.hash.strip() == "":
                logger.error(f"Empty hash detected for item: {item.product_name}")
                # Force regenerate hash using utility function as fallback
                from app.utils.hashing import calculate_item_hash
                item.hash = calculate_item_hash(item)
                logger.info(f"Regenerated hash for {item.product_name}: {item.hash}")
            
            # Final validation before database insertion
            if not item.hash or item.hash.strip() == "":
                raise ValueError(f"Failed to generate valid hash for item: {item.product_name}")

            item_model = ItemModel(
                job_id=job.id,
                name=item.product_name,
                price=item.price_exact,
                category=item.category,
                hash=item.hash,
                metadata=item.metadata,
            )
            item_models.append(item_model)
            self.session.add(item_model)

        self.session.add(job_model)
        await self.session.flush()  # 이렇게 하면 item_models에 ID가 할당됩니다

        logger.info(
            f"[Step 8] ✅ 데이터베이스 작업 저장 완료 | request_id={request_id} | job_id={job.id} | items_saved={len(item_models)}",
            extra={
                "step": 8,
                "request_id": request_id,
                "job_id": str(job.id),
                "repository_method": "create",
                "items_saved_count": len(item_models),
                "database_operation": "completed",
                "status": "success"
            }
        )
        
        return job

    async def get_by_id(self, job_id: UUID) -> Optional[ResearchJob]:
        """Get a research job by ID.

        Args:
            job_id: Job UUID

        Returns:
            ResearchJob entity or None if not found
        """
        stmt = (
            select(ResearchJobModel)
            .where(ResearchJobModel.id == job_id)
            .options(selectinload(ResearchJobModel.items))
            .options(selectinload(ResearchJobModel.results))
        )
        result = await self.session.execute(stmt)
        job_model = result.scalar_one_or_none()

        if not job_model:
            return None

        return self._to_entity(job_model)

    async def update_status(self, job_id: UUID, status: JobStatus, **kwargs) -> bool:
        """Update job status.

        Args:
            job_id: Job UUID
            status: New status
            **kwargs: Additional fields to update

        Returns:
            True if updated, False if not found
        """
        stmt = (
            update(ResearchJobModel)
            .where(ResearchJobModel.id == job_id)
            .values(status=status.value, **kwargs)
        )
        result = await self.session.execute(stmt)
        await self.session.flush()

        updated = result.rowcount > 0
        if updated:
            logger.info(f"Updated job {job_id} status to {status.value}")

        return updated

    async def list_pending(self, limit: int = 10) -> List[ResearchJob]:
        """List pending research jobs.

        Args:
            limit: Maximum number of jobs to return

        Returns:
            List of pending ResearchJob entities
        """
        stmt = (
            select(ResearchJobModel)
            .where(ResearchJobModel.status == JobStatus.PENDING.value)
            .order_by(ResearchJobModel.created_at)
            .limit(limit)
            .options(selectinload(ResearchJobModel.items))
        )
        result = await self.session.execute(stmt)
        job_models = result.scalars().all()

        return [self._to_entity(model) for model in job_models]

    async def list_active(self) -> List[ResearchJob]:
        """List active (processing) research jobs.

        Returns:
            List of active ResearchJob entities
        """
        stmt = (
            select(ResearchJobModel)
            .where(ResearchJobModel.status == JobStatus.PROCESSING.value)
            .options(selectinload(ResearchJobModel.items))
            .options(selectinload(ResearchJobModel.results))
        )
        result = await self.session.execute(stmt)
        job_models = result.scalars().all()

        return [self._to_entity(model) for model in job_models]

    def _to_entity(self, model: ResearchJobModel) -> ResearchJob:
        """Convert database model to domain entity.

        Args:
            model: ResearchJobModel instance

        Returns:
            ResearchJob entity
        """
        job = ResearchJob(
            id=model.id,
            status=JobStatus(model.status),
            total_items=model.total_items,
            processed_items=model.processed_items,
            failed_items=model.failed_items,
            metadata=model.metadata or {},
            created_at=model.created_at,
            updated_at=model.updated_at,
            started_at=model.started_at,
            completed_at=model.completed_at,
        )

        # Convert items
        for item_model in model.items:
            item = Item(
                product_name=item_model.name,
                price_exact=item_model.price,
                category=item_model.category,
                metadata=item_model.metadata or {},
                hash=item_model.hash,
            )
            job.items.append(item)

        # Convert results
        for result_model in model.results:
            result = Result(
                id=result_model.id,
                item_hash=result_model.item_hash,
                item_name=result_model.item_name,
                status=ResultStatus(result_model.status),
                data=result_model.data or {},
                error=result_model.error,
                created_at=result_model.created_at,
                updated_at=result_model.updated_at,
            )
            job.results.append(result)

        return job


class ResultRepository:
    """Repository for result operations."""

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session.

        Args:
            session: AsyncSession instance
        """
        self.session = session

    async def create(self, job_id: UUID, result: Result, item_id: Optional[UUID] = None) -> Result:
        """Create a new result.

        Args:
            job_id: Job UUID
            result: Result entity
            item_id: Optional item UUID for foreign key reference

        Returns:
            Created Result entity
        """
        # If item_id is not provided, try to find it by hash
        if item_id is None and result.item_hash:
            item_stmt = select(ItemModel.id).where(
                ItemModel.job_id == job_id,
                ItemModel.hash == result.item_hash
            )
            item_result = await self.session.execute(item_stmt)
            item_id = item_result.scalar_one_or_none()

        result_model = ResultModel(
            id=result.id,
            job_id=job_id,
            item_id=item_id,
            item_hash=result.item_hash,
            item_name=result.item_name,
            status=result.status.value,
            data=result.data,
            error=result.error,
            created_at=result.created_at,
            updated_at=result.updated_at,
        )

        self.session.add(result_model)
        await self.session.flush()

        logger.info(f"Created result for job {job_id}: {result.id}")
        return result

    async def update(
        self,
        result_id: UUID,
        status: ResultStatus,
        data: Optional[dict] = None,
        error: Optional[str] = None,
    ) -> bool:
        """Update a result.

        Args:
            result_id: Result UUID
            status: New status
            data: Result data
            error: Error message

        Returns:
            True if updated, False if not found
        """
        values = {"status": status.value}
        if data is not None:
            values["data"] = data
        if error is not None:
            values["error"] = error

        stmt = update(ResultModel).where(ResultModel.id == result_id).values(**values)
        result = await self.session.execute(stmt)
        await self.session.flush()

        updated = result.rowcount > 0
        if updated:
            logger.info(f"Updated result {result_id} status to {status.value}")

        return updated

    async def get_by_job_and_hash(
        self, job_id: UUID, item_hash: str
    ) -> Optional[Result]:
        """Get a result by job ID and item hash.

        Args:
            job_id: Job UUID
            item_hash: Item hash

        Returns:
            Result entity or None if not found
        """
        stmt = select(ResultModel).where(
            ResultModel.job_id == job_id, ResultModel.item_hash == item_hash
        )
        result = await self.session.execute(stmt)
        result_model = result.scalar_one_or_none()

        if not result_model:
            return None

        return self._to_entity(result_model)

    def _to_entity(self, model: ResultModel) -> Result:
        """Convert database model to domain entity.

        Args:
            model: ResultModel instance

        Returns:
            Result entity
        """
        return Result(
            id=model.id,
            item_hash=model.item_hash,
            item_name=model.item_name,
            status=ResultStatus(model.status),
            data=model.data or {},
            error=model.error,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
