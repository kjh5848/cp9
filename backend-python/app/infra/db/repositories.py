"""Repository implementations for database operations."""

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
    """Repository for research job operations."""

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session.

        Args:
            session: AsyncSession instance
        """
        self.session = session

    async def create(self, job: ResearchJob) -> ResearchJob:
        """Create a new research job.

        Args:
            job: ResearchJob entity

        Returns:
            Created ResearchJob entity
        """
        # Create job model
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

        # Create item models
        for item in job.items:
            item_model = ItemModel(
                job_id=job.id,
                name=item.name,
                price=item.price,
                category=item.category,
                hash=item.hash or "",
                metadata=item.metadata,
            )
            self.session.add(item_model)

        self.session.add(job_model)
        await self.session.flush()

        logger.info(f"Created research job: {job.id}")
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

    async def update_status(
        self,
        job_id: UUID,
        status: JobStatus,
        **kwargs
    ) -> bool:
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
                name=item_model.name,
                price=item_model.price,
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

    async def create(self, job_id: UUID, result: Result) -> Result:
        """Create a new result.

        Args:
            job_id: Job UUID
            result: Result entity

        Returns:
            Created Result entity
        """
        result_model = ResultModel(
            id=result.id,
            job_id=job_id,
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
        error: Optional[str] = None
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

        stmt = (
            update(ResultModel)
            .where(ResultModel.id == result_id)
            .values(**values)
        )
        result = await self.session.execute(stmt)
        await self.session.flush()

        updated = result.rowcount > 0
        if updated:
            logger.info(f"Updated result {result_id} status to {status.value}")
        
        return updated

    async def get_by_job_and_hash(
        self,
        job_id: UUID,
        item_hash: str
    ) -> Optional[Result]:
        """Get a result by job ID and item hash.

        Args:
            job_id: Job UUID
            item_hash: Item hash

        Returns:
            Result entity or None if not found
        """
        stmt = select(ResultModel).where(
            ResultModel.job_id == job_id,
            ResultModel.item_hash == item_hash
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