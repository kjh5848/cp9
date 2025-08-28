"""도메인 엔티티 - 프레임워크 의존성이 없는 순수 비즈니스 객체.

주요 역할:
- 핵심 비즈니스 로직 및 규칙 캡슐화
- 프레임워크에 독립적인 데이터 구조 정의
- 엔티티 간 관계 및 생명주기 관리
- 비즈니스 불변성 및 검증 규칙 적용

JSDoc:
@module DomainEntities
@description Clean Architecture 도메인 계층의 핵심 비즈니스 엔티티
@version 1.0.0
@author Backend Team
@since 2024-01-01
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4


def _get_now() -> datetime:
    """데이터베이스 호환성을 위해 UTC 형태의 현재 시간을 반환합니다.
    
    Returns:
        datetime: 타임존 정보가 제거된 UTC 현재 시간
        
    Note:
        - KST 시간을 UTC로 변환하여 PostgreSQL 호환성 보장
        - ImportError 발생시 UTC 시간 직접 반환
    """
    try:
        from app.utils.timezone import now_kst
        kst_time = now_kst()
        # PostgreSQL TIMESTAMP WITHOUT TIME ZONE 호환성을 위해 UTC로 변환
        return kst_time.astimezone(timezone.utc).replace(tzinfo=None)
    except ImportError:
        return datetime.utcnow()  # UTC로 폴백


class JobStatus(str, Enum):
    """리서치 작업 상태 열거형.
    
    작업의 전체적인 진행 상태를 나타냅니다.
    
    Values:
        PENDING: 대기중 - 작업이 생성되었지만 아직 시작되지 않음
        PROCESSING: 처리중 - 작업이 현재 진행중
        COMPLETED: 완료됨 - 작업이 성공적으로 완료됨
        FAILED: 실패함 - 작업이 실패하여 중단됨
        CANCELLED: 취소됨 - 사용자에 의해 취소됨
    """

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ResultStatus(str, Enum):
    """개별 결과 상태 열거형.
    
    각 아이템별 리서치 결과의 상태를 나타냅니다.
    
    Values:
        PENDING: 대기중 - 아직 처리되지 않음
        SUCCESS: 성공 - 리서치가 성공적으로 완료됨
        ERROR: 오류 - 리서치 중 오류 발생
        SKIPPED: 건너뜀 - 처리를 건너뜀
        COUPANG_PREVIEW: 쿠팡 미리보기 - 쿠팡 데이터만 조회됨
    """

    PENDING = "pending"
    SUCCESS = "success"
    ERROR = "error"
    SKIPPED = "skipped"
    COUPANG_PREVIEW = "coupang_preview"


@dataclass
class Item:
    """리서치 아이템 엔티티.
    
    개별 제품/아이템의 정보와 식별자를 관리하는 도메인 엔티티입니다.
    
    Attributes:
        product_name: 제품명 (필수)
        price_exact: 정확한 가격 (필수)
        category: 제품 카테고리 (선택)
        metadata: 추가 메타데이터 (JSON 형태)
        hash: 중복 방지용 고유 해시값
        
    JSDoc:
    @class Item
    @description 리서치 대상 제품의 기본 정보를 담는 도메인 엔티티
    @param {string} product_name - 제품명
    @param {number} price_exact - 정확한 가격
    @param {string|null} category - 제품 카테고리
    @param {Object} metadata - 추가 메타데이터
    @param {string|null} hash - 고유 해시값
    """

    product_name: str
    price_exact: float
    category: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    hash: Optional[str] = None

    def __post_init__(self) -> None:
        """초기화 후 아이템을 검증하고 해시를 생성합니다.
        
        Raises:
            ValueError: 제품명이 비어있거나 가격이 음수인 경우
            
        Note:
            - 제품명 필수 검증
            - 가격 음수 검증
            - 해시값 자동 생성
        """
        if not self.product_name:
            raise ValueError("제품명은 비어있을 수 없습니다")
        if self.price_exact < 0:
            raise ValueError("제품 가격은 음수일 수 없습니다")
        
        # 해시값이 없으면 생성
        if not self.hash:
            self.hash = self._generate_hash()
    
    def _generate_hash(self) -> str:
        """이 아이템의 고유 해시값을 생성합니다.
        
        Returns:
            str: SHA256 해시값 (64자)
            
        Note:
            - 제품명, 가격, 카테고리를 기반으로 일관된 해시 생성
            - 대소문자 구분 없음, 공백 제거
            - 가격은 소수점 둘째 자리까지 반올림
        """
        import hashlib
        
        # 아이템의 일관된 문자열 표현 생성
        hash_data = {
            "name": self.product_name.lower().strip(),
            "price": round(self.price_exact, 2),  # 일관성을 위해 소수점 둘째 자리까지 반올림
            "category": self.category.lower().strip() if self.category else None,
        }
        
        # 일관된 해싱을 위해 정렬된 문자열로 변환
        sorted_items = []
        for key in sorted(hash_data.keys()):
            value = hash_data[key]
            if value is not None:
                sorted_items.append(f"{key}:{value}")
        
        hash_string = "|".join(sorted_items)
        return hashlib.sha256(hash_string.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        """아이템을 딕셔너리로 변환합니다.
        
        Returns:
            Dict[str, Any]: 아이템의 모든 속성을 포함한 딕셔너리
        """
        return {
            "product_name": self.product_name,
            "price_exact": self.price_exact,
            "category": self.category,
            "metadata": self.metadata,
            "hash": self.hash,
        }


@dataclass
class Result:
    """리서치 결과 엔티티.
    
    개별 아이템의 리서치 결과와 상태를 관리하는 도메인 엔티티입니다.
    
    Attributes:
        id: 결과 고유 식별자 (UUID)
        item_hash: 연결된 아이템의 해시값
        item_name: 아이템 이름
        status: 결과 상태 (성공/실패/대기 등)
        data: 리서치 결과 데이터 (JSON 형태)
        error: 오류 메시지 (실패시)
        created_at: 결과 생성 시간
        updated_at: 마지막 업데이트 시간
        
    JSDoc:
    @class Result
    @description 아이템별 리서치 결과를 담는 도메인 엔티티
    @param {string} id - 결과 고유 식별자 (UUID)
    @param {string} item_hash - 아이템 해시값
    @param {string} item_name - 아이템 이름
    @param {ResultStatus} status - 결과 상태
    @param {Object} data - 리서치 결과 데이터
    @param {string|null} error - 오류 메시지
    @param {Date} created_at - 생성 시간
    @param {Date} updated_at - 업데이트 시간
    """

    id: UUID = field(default_factory=uuid4)
    item_hash: str = ""
    item_name: str = ""
    status: ResultStatus = ResultStatus.PENDING
    data: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    created_at: datetime = field(default_factory=_get_now)
    updated_at: datetime = field(default_factory=_get_now)

    def mark_success(self, data: Dict[str, Any]) -> None:
        """결과를 성공으로 표시합니다.
        
        Args:
            data: 리서치 결과 데이터
            
        Note:
            - 상태를 SUCCESS로 변경
            - 결과 데이터 저장
            - 오류 메시지 제거
            - 업데이트 시간 갱신
        """
        self.status = ResultStatus.SUCCESS
        self.data = data
        self.error = None
        self.updated_at = _get_now()

    def mark_error(self, error: str) -> None:
        """결과를 실패로 표시합니다.
        
        Args:
            error: 오류 메시지
            
        Note:
            - 상태를 ERROR로 변경
            - 오류 메시지 저장
            - 업데이트 시간 갱신
        """
        self.status = ResultStatus.ERROR
        self.error = error
        self.updated_at = _get_now()

    def mark_skipped(self, reason: str) -> None:
        """결과를 건너뜀으로 표시합니다.
        
        Args:
            reason: 건너뜀 사유
            
        Note:
            - 상태를 SKIPPED로 변경
            - 사유를 오류 필드에 저장
            - 업데이트 시간 갱신
        """
        self.status = ResultStatus.SKIPPED
        self.error = reason
        self.updated_at = _get_now()

    def to_dict(self) -> Dict[str, Any]:
        """결과를 딕셔너리로 변환합니다.
        
        Returns:
            Dict[str, Any]: 결과의 모든 속성을 포함한 딕셔너리
        """
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
    """리서치 작업 엔티티.
    
    여러 아이템의 리서치를 관리하는 메인 도메인 엔티티입니다.
    
    Attributes:
        id: 작업 고유 식별자 (UUID)
        status: 작업 상태 (대기/처리중/완료 등)
        items: 리서치할 아이템 목록
        results: 리서치 결과 목록
        total_items: 전체 아이템 수
        processed_items: 처리 완료된 아이템 수
        failed_items: 처리 실패한 아이템 수
        metadata: 작업 관련 메타데이터
        created_at: 작업 생성 시간
        updated_at: 마지막 업데이트 시간
        started_at: 작업 시작 시간 (시작시 설정)
        completed_at: 작업 완료 시간 (완료시 설정)
        
    JSDoc:
    @class ResearchJob
    @description 리서치 작업의 전체 생명주기를 관리하는 메인 도메인 엔티티
    @param {string} id - 작업 고유 식별자 (UUID)
    @param {JobStatus} status - 작업 상태
    @param {Array<Item>} items - 리서치할 아이템 목록
    @param {Array<Result>} results - 리서치 결과 목록
    @param {number} total_items - 전체 아이템 수
    @param {number} processed_items - 처리 완료 아이템 수
    @param {number} failed_items - 처리 실패 아이템 수
    @param {Object} metadata - 작업 메타데이터
    @param {Date} created_at - 생성 시간
    @param {Date} updated_at - 업데이트 시간
    @param {Date|null} started_at - 시작 시간
    @param {Date|null} completed_at - 완료 시간
    """

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
        """작업에 아이템을 추가합니다.
        
        Args:
            item: 추가할 아이템
            
        Note:
            - 아이템 목록에 추가
            - 전체 아이템 수 업데이트
            - 업데이트 시간 갱신
        """
        self.items.append(item)
        self.total_items = len(self.items)
        self.updated_at = _get_now()

    def add_items(self, items: List[Item]) -> None:
        """작업에 여러 아이템을 추가합니다.
        
        Args:
            items: 추가할 아이템 목록
            
        Note:
            - 모든 아이템을 목록에 추가
            - 전체 아이템 수 업데이트
            - 업데이트 시간 갱신
        """
        self.items.extend(items)
        self.total_items = len(self.items)
        self.updated_at = _get_now()

    def start(self) -> None:
        """작업을 시작 상태로 표시합니다.
        
        Note:
            - 상태를 PROCESSING으로 변경
            - 시작 시간 설정
            - 업데이트 시간 갱신
        """
        self.status = JobStatus.PROCESSING
        self.started_at = _get_now()
        self.updated_at = _get_now()

    def complete(self) -> None:
        """작업을 완료 상태로 표시합니다.
        
        Note:
            - 상태를 COMPLETED로 변경
            - 완료 시간 설정
            - 업데이트 시간 갱신
        """
        self.status = JobStatus.COMPLETED
        self.completed_at = _get_now()
        self.updated_at = _get_now()

    def fail(self, error: Optional[str] = None) -> None:
        """작업을 실패 상태로 표시합니다.
        
        Args:
            error: 실패 원인 (선택)
            
        Note:
            - 상태를 FAILED로 변경
            - 완료 시간 설정
            - 업데이트 시간 갱신
            - 오류 메시지를 메타데이터에 저장
        """
        self.status = JobStatus.FAILED
        self.completed_at = _get_now()
        self.updated_at = _get_now()
        if error:
            self.metadata["error"] = error

    def cancel(self) -> None:
        """작업을 취소 상태로 표시합니다.
        
        Note:
            - 상태를 CANCELLED로 변경
            - 완료 시간 설정
            - 업데이트 시간 갱신
        """
        self.status = JobStatus.CANCELLED
        self.completed_at = _get_now()
        self.updated_at = _get_now()

    def add_result(self, result: Result) -> None:
        """작업에 결과를 추가합니다.
        
        Args:
            result: 추가할 결과
            
        Note:
            - 결과 목록에 추가
            - 결과 상태에 따라 카운터 업데이트
            - 업데이트 시간 갱신
        """
        self.results.append(result)
        if result.status == ResultStatus.SUCCESS:
            self.processed_items += 1
        elif result.status == ResultStatus.ERROR:
            self.failed_items += 1
        self.updated_at = _get_now()

    def update_progress(self) -> None:
        """결과를 기반으로 작업 진행률을 업데이트합니다.
        
        Note:
            - 성공/실패 카운터를 결과 목록에서 재계산
            - 업데이트 시간 갱신
        """
        self.processed_items = sum(
            1 for r in self.results if r.status == ResultStatus.SUCCESS
        )
        self.failed_items = sum(
            1 for r in self.results if r.status == ResultStatus.ERROR
        )
        self.updated_at = _get_now()

    @property
    def is_complete(self) -> bool:
        """작업이 완료되었는지 확인합니다.
        
        Returns:
            bool: 완료된 경우 True (완료/실패/취소 상태)
        """
        return self.status in [
            JobStatus.COMPLETED,
            JobStatus.FAILED,
            JobStatus.CANCELLED,
        ]

    @property
    def is_active(self) -> bool:
        """작업이 활성 상태인지 확인합니다.
        
        Returns:
            bool: 현재 처리중인 경우 True
        """
        return self.status == JobStatus.PROCESSING

    @property
    def success_rate(self) -> float:
        """성공률을 계산합니다.
        
        Returns:
            float: 성공률 (0.0 ~ 1.0)
        """
        if self.total_items == 0:
            return 0.0
        return self.processed_items / self.total_items

    def to_dict(self) -> Dict[str, Any]:
        """작업을 딕셔너리로 변환합니다.
        
        Returns:
            Dict[str, Any]: 작업의 모든 정보를 포함한 딕셔너리
        """
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
