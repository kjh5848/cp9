"""제품 리서치 서비스 계층.

이 서비스는 향상된 관심사의 분리를 위해 새로운 오케스트레이터 기반 아키텍처에
위임하면서 하위 호환성을 제공합니다.

주요 역할:
- 기존 API와의 하위 호환성 유지
- 오케스트레이터 패턴을 통한 비즈니스 로직 위임
- 요청 검증 및 에러 처리 중앙화
- 클라이언트와 도메인 로직 간의 파사드 역할

JSDoc:
@module ProductResearchService
@description 제품 리서치 작업 관리를 위한 서비스 파사드 클래스
@version 1.0.0
@author Backend Team
@since 2024-01-01
"""

from typing import Dict, List, Optional
from uuid import UUID

from app.core.logging import get_logger
from app.domain.product_entities import (
    ProductResearchItem,
    ProductResearchJob,
)
from app.infra.db.repositories import ResearchJobRepository
from app.services.product_research_orchestrator import get_product_research_orchestrator

logger = get_logger(__name__)


class ProductResearchService:
    """제품 리서치 작업 관리를 위한 서비스 클래스.

    이 클래스는 새로운 오케스트레이터 기반 아키텍처 위의 파사드 역할을 하며,
    기존 코드의 하위 호환성을 제공하면서 향상된 관심사의 분리로부터 이익을 얻습니다.
    
    주요 책임:
    - 제품 리서치 작업 생성 및 관리
    - 작업 상태 조회 및 결과 반환
    - Celery 백그라운드 작업 관리
    - 오케스트레이터와의 통신 중계
    
    JSDoc:
    @class ProductResearchService
    @description 제품 리서치 작업의 생명주기를 관리하는 파사드 서비스
    @implements {ServiceInterface}
    @uses {ProductResearchOrchestrator}
    """

    def __init__(self, repository: Optional[ResearchJobRepository] = None):
        """제품 리서치 서비스를 초기화합니다.

        Args:
            repository: 리서치 리포지토리 인스턴스 (선택적, 하위 호환성용)
            
        JSDoc:
        @constructor
        @description 서비스 인스턴스 초기화 및 오케스트레이터 연결
        @param {ResearchJobRepository|None} repository - 리포지토리 인스턴스
        """
        self.orchestrator = get_product_research_orchestrator()

    async def create_research_job(
        self,
        items: List[ProductResearchItem],
        priority: int = 5,
        callback_url: Optional[str] = None,
    ) -> ProductResearchJob:
        """새로운 제품 리서치 작업을 생성합니다.

        Args:
            items: 리서치할 제품 목록
            priority: 작업 우선순위 (1-10, 높을수록 우선)
            callback_url: 작업 완료시 호출할 콜백 URL (선택적)

        Returns:
            생성된 리서치 작업 객체
            
        JSDoc:
        @async
        @method create_research_job
        @description 표준 제품 리서치 작업 생성 (비동기 처리)
        @param {ProductResearchItem[]} items - 리서치 대상 제품 배열
        @param {number} priority - 작업 우선순위 (기본값: 5)
        @param {string|null} callback_url - 완료 콜백 URL
        @returns {Promise<ProductResearchJob>} 생성된 작업 객체
        @throws {ValidationError} 입력 검증 실패시
        @throws {ServiceError} 서비스 처리 실패시
        """
        # request_id는 extra 로그 컨텍스트에서 추출 또는 새로 생성
        import contextvars
        from uuid import uuid4
        
        # 컨텍스트 변수에서 request_id 가져오기 (API에서 설정됨)
        request_id = getattr(contextvars.copy_context().get('request_id', None), 'get', lambda: str(uuid4()))()
        if not request_id:
            request_id = str(uuid4())
            
        logger.info(
            f"[Step 5C-1] 🎯 오케스트레이터 작업 생성 호출 | request_id={request_id} | items_count={len(items)}",
            extra={
                "step": "5C-1", 
                "request_id": request_id,
                "service_method": "create_research_job",
                "orchestrator_call": "create_research_job",
                "file_location": "app/services/product_research_orchestrator.py:create_research_job"
            }
        )
        
        job = await self.orchestrator.create_research_job(
            items=items,
            priority=priority,
            callback_url=callback_url,
        )
        
        logger.info(
            f"[Step 5C-2] ✅ 오케스트레이터 작업 생성 완료 | request_id={request_id} | job_id={job.id}",
            extra={
                "step": "5C-2",
                "request_id": request_id,
                "job_id": str(job.id),
                "service_method": "create_research_job",
                "status": "delegated_to_orchestrator"
            }
        )
        
        return job

    async def get_job_status(self, job_id: UUID) -> Optional[ProductResearchJob]:
        """리서치 작업 상태를 조회합니다.

        Args:
            job_id: 조회할 작업 ID

        Returns:
            작업이 존재하면 작업 객체, 없으면 None
            
        JSDoc:
        @async
        @method get_job_status
        @description 지정된 작업 ID의 현재 상태 조회
        @param {UUID} job_id - 조회할 작업 고유 식별자
        @returns {Promise<ProductResearchJob|null>} 작업 객체 또는 null
        @throws {ServiceError} 조회 과정에서 오류 발생시
        """
        return await self.orchestrator.get_job_status(job_id)

    async def get_job_results(
        self, job_id: UUID, include_failed: bool = True
    ) -> Optional[ProductResearchJob]:
        """리서치 작업 결과를 조회합니다.

        Args:
            job_id: 조회할 작업 ID
            include_failed: 실패한 항목도 결과에 포함할지 여부

        Returns:
            결과가 포함된 작업 객체, 작업이 없으면 None
            
        JSDoc:
        @async
        @method get_job_results
        @description 작업 결과 조회 (성공/실패 항목 필터링 가능)
        @param {UUID} job_id - 조회할 작업 고유 식별자
        @param {boolean} include_failed - 실패 항목 포함 여부 (기본값: true)
        @returns {Promise<ProductResearchJob|null>} 결과 포함 작업 객체
        @throws {ServiceError} 결과 조회 실패시
        """
        return await self.orchestrator.get_job_results(job_id, include_failed)

    async def create_research_job_with_coupang_preview(
        self,
        items: List[ProductResearchItem],
        priority: int = 5,
        callback_url: Optional[str] = None,
    ) -> ProductResearchJob:
        """쿠팡 미리보기가 포함된 리서치 작업을 생성합니다.

        Args:
            items: 리서치할 제품 목록
            priority: 작업 우선순위 (1-10)
            callback_url: 작업 완료시 호출할 콜백 URL

        Returns:
            쿠팡 정보가 즉시 포함된 리서치 작업 객체
            
        JSDoc:
        @async
        @method create_research_job_with_coupang_preview
        @description 쿠팡 미리보기 데이터를 즉시 제공하는 작업 생성
        @param {ProductResearchItem[]} items - 리서치 대상 제품 배열
        @param {number} priority - 작업 우선순위
        @param {string|null} callback_url - 완료 콜백 URL
        @returns {Promise<ProductResearchJob>} 쿠팡 정보 포함 작업 객체
        @throws {CoupangAPIError} 쿠팡 API 오류시
        @throws {ServiceError} 서비스 처리 실패시
        """
        # request_id는 컨텍스트에서 가져오기
        import contextvars
        from uuid import uuid4
        
        request_id = getattr(contextvars.copy_context().get('request_id', None), 'get', lambda: str(uuid4()))()
        if not request_id:
            request_id = str(uuid4())
            
        logger.info(
            f"[Step 5B-1] 🛒 오케스트레이터 쿠팡 미리보기 작업 호출 | request_id={request_id} | items_count={len(items)}",
            extra={
                "step": "5B-1",
                "request_id": request_id,
                "service_method": "create_research_job_with_coupang_preview",
                "orchestrator_call": "create_research_job_with_coupang_preview",
                "file_location": "app/services/product_research_orchestrator.py:create_research_job_with_coupang_preview"
            }
        )

        # 오케스트레이터를 통한 쿠팡 미리보기 작업 생성
        # 데이터베이스 작업은 이제 오케스트레이터 내에서 처리됨
        job = await self.orchestrator.create_research_job_with_coupang_preview(
            items=items,
            priority=priority,
            callback_url=callback_url,
        )
        
        logger.info(
            f"[Step 5B-2] ✅ 오케스트레이터 쿠팡 미리보기 작업 완료 | request_id={request_id} | job_id={job.id} | coupang_results={len(job.results)}",
            extra={
                "step": "5B-2",
                "request_id": request_id,
                "job_id": str(job.id),
                "service_method": "create_research_job_with_coupang_preview",
                "coupang_results_count": len(job.results),
                "status": "delegated_to_orchestrator"
            }
        )

        return job

    async def cancel_job(self, job_id: UUID) -> bool:
        """리서치 작업을 취소합니다.

        Args:
            job_id: 취소할 작업 ID

        Returns:
            작업 취소 성공시 True, 실패시 False
            
        JSDoc:
        @async
        @method cancel_job
        @description 진행 중인 리서치 작업 취소
        @param {UUID} job_id - 취소할 작업 고유 식별자
        @returns {Promise<boolean>} 취소 성공 여부
        @throws {ServiceError} 취소 과정에서 오류 발생시
        """
        return await self.orchestrator.cancel_job(job_id)

    def create_celery_task(self, items: List[Dict], priority: int = 5) -> str:
        """리서치를 위한 Celery 백그라운드 작업을 생성합니다.

        Args:
            items: 제품 딕셔너리 목록
            priority: 작업 우선순위

        Returns:
            Celery 작업 ID
            
        JSDoc:
        @method create_celery_task
        @description Celery 큐를 통한 비동기 백그라운드 작업 생성
        @param {Object[]} items - 제품 데이터 딕셔너리 배열
        @param {number} priority - 작업 우선순위 (기본값: 5)
        @returns {string} Celery 작업 고유 식별자
        @throws {CeleryError} Celery 작업 생성 실패시
        """
        return self.orchestrator.create_celery_task(items, priority)

    def get_celery_task_status(self, task_id: str) -> Dict:
        """Celery 작업 상태를 조회합니다.

        Args:
            task_id: Celery 작업 ID

        Returns:
            작업 상태 정보가 담긴 딕셔너리
            
        JSDoc:
        @method get_celery_task_status
        @description Celery 백그라운드 작업의 현재 상태 조회
        @param {string} task_id - 조회할 Celery 작업 ID
        @returns {Object} 작업 상태 정보 객체
        @returns {string} returns.status - 작업 상태 (PENDING, STARTED, SUCCESS, FAILURE)
        @returns {number} returns.progress - 진행률 (0.0-1.0)
        @returns {string} returns.message - 상태 메시지
        @throws {TaskNotFoundError} 작업을 찾을 수 없을 때
        """
        return self.orchestrator.get_celery_task_status(task_id)


# Singleton instance
_service: Optional[ProductResearchService] = None


def get_product_research_service() -> ProductResearchService:
    """제품 리서치 서비스 인스턴스를 가져오거나 생성합니다.

    Returns:
        ProductResearchService 싱글톤 인스턴스
        
    JSDoc:
    @function get_product_research_service
    @description 서비스 싱글톤 인스턴스 팩토리 함수
    @returns {ProductResearchService} 서비스 인스턴스
    @pattern Singleton
    @threadsafe true
    """
    global _service
    if _service is None:
        _service = ProductResearchService()
    return _service
