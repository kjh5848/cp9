"""도메인 유스케이스 - 비즈니스 규칙과 정책.

주요 역할:
- 핵심 비즈니스 규칙 및 정책 정의
- 도메인 엔티티 간 상호작용 규칙
- 비즈니스 검증 로직 및 제약 조건
- 유스케이스별 워크플로우 관리

JSDoc:
@module DomainUseCases
@description Clean Architecture 도메인 계층의 비즈니스 유스케이스
@version 1.0.0
@author Backend Team
@since 2024-01-01
"""

from typing import List

from app.domain.entities import Item, ResearchJob


class ResearchUseCases:
    """리서치 작업을 위한 비즈니스 규칙.
    
    리서치 도메인의 핵심 비즈니스 로직과 제약 조건을 정의합니다.
    
    Constants:
        MAX_BATCH_SIZE: 최대 배치 크기 (10개)
        MIN_BATCH_SIZE: 최소 배치 크기 (1개)
        MAX_ITEM_NAME_LENGTH: 최대 아이템명 길이 (500자)
        MAX_PRICE: 최대 가격 (1,000,000)
        MIN_PRICE: 최소 가격 (0.0)
        
    JSDoc:
    @class ResearchUseCases
    @description 리서치 작업의 비즈니스 규칙 및 검증 로직
    @static
    """

    MAX_BATCH_SIZE = 10
    MIN_BATCH_SIZE = 1
    MAX_ITEM_NAME_LENGTH = 500
    MAX_PRICE = 1000000.0
    MIN_PRICE = 0.0

    @staticmethod
    def validate_batch_size(items: List[Item]) -> None:
        """비즈니스 규칙에 따라 배치 크기를 검증합니다.

        Args:
            items: 검증할 아이템 목록

        Raises:
            ValueError: 배치 크기가 유효하지 않은 경우
            
        Note:
            - 최소 배치 크기: 1개
            - 최대 배치 크기: 10개
        """
        batch_size = len(items)
        if batch_size < ResearchUseCases.MIN_BATCH_SIZE:
            raise ValueError(
                f"배치 크기는 최소 {ResearchUseCases.MIN_BATCH_SIZE}개 이상이어야 합니다"
            )
        if batch_size > ResearchUseCases.MAX_BATCH_SIZE:
            raise ValueError(
                f"배치 크기는 최대 {ResearchUseCases.MAX_BATCH_SIZE}개를 초과할 수 없습니다"
            )

    @staticmethod
    def validate_item(item: Item) -> None:
        """비즈니스 규칙에 따라 개별 아이템을 검증합니다.

        Args:
            item: 검증할 아이템

        Raises:
            ValueError: 아이템이 유효하지 않은 경우
            
        Note:
            - 제품명: 비어있지 않고 500자 이하
            - 가격: 0 이상 1,000,000 이하
        """
        # 제품명 검증
        if not item.product_name or not item.product_name.strip():
            raise ValueError("제품명은 비어있을 수 없습니다")
        if len(item.product_name) > ResearchUseCases.MAX_ITEM_NAME_LENGTH:
            raise ValueError(
                f"제품명은 {ResearchUseCases.MAX_ITEM_NAME_LENGTH}자를 초과할 수 없습니다"
            )

        # 가격 검증
        if item.price_exact < ResearchUseCases.MIN_PRICE:
            raise ValueError(
                f"제품 가격은 {ResearchUseCases.MIN_PRICE}보다 작을 수 없습니다"
            )
        if item.price_exact > ResearchUseCases.MAX_PRICE:
            raise ValueError(f"제품 가격은 {ResearchUseCases.MAX_PRICE}를 초과할 수 없습니다")

    @staticmethod
    def validate_items(items: List[Item]) -> None:
        """아이템 목록을 검증합니다.

        Args:
            items: 검증할 아이템 목록

        Raises:
            ValueError: 아이템이 유효하지 않은 경우
            
        Note:
            - 빈 목록 검증
            - 배치 크기 검증
            - 개별 아이템 검증
        """
        if not items:
            raise ValueError("아이템 목록은 비어있을 수 없습니다")

        # 배치 크기 검증
        ResearchUseCases.validate_batch_size(items)

        # 각 아이템 검증
        for idx, item in enumerate(items):
            try:
                ResearchUseCases.validate_item(item)
            except ValueError as e:
                raise ValueError(f"인덱스 {idx}번째 아이템: {str(e)}")

    @staticmethod
    def can_process_job(job: ResearchJob) -> bool:
        """작업이 처리 가능한지 확인합니다.

        Args:
            job: 확인할 리서치 작업

        Returns:
            bool: 처리 가능한 경우 True, 그렇지 않으면 False
            
        Note:
            - 완료된 작업은 처리 불가
            - 아이템이 없는 작업은 처리 불가
            - 최대 배치 크기 초과시 처리 불가
        """
        # 작업이 완료되지 않아야 함
        if job.is_complete:
            return False

        # 작업에 아이템이 있어야 함
        if not job.items:
            return False

        # 배치 크기를 초과하지 않아야 함
        if len(job.items) > ResearchUseCases.MAX_BATCH_SIZE:
            return False

        return True

    @staticmethod
    def should_retry_item(item: Item, error_count: int, max_retries: int = 3) -> bool:
        """아이템을 재시도해야 하는지 결정합니다.

        Args:
            item: 실패한 아이템
            error_count: 이 아이템이 실패한 횟수
            max_retries: 허용되는 최대 재시도 횟수

        Returns:
            bool: 재시도해야 하는 경우 True, 그렇지 않으면 False
            
        Note:
            - 최대 재시도 횟수 초과시 재시도 안함
            - no_retry 플래그가 설정된 경우 재시도 안함
            - 일시적 실패의 경우 재시도 허용
        """
        # 최대 재시도 횟수를 초과한 경우 재시도 안함
        if error_count >= max_retries:
            return False

        # 특정 메타데이터 플래그가 있는 경우 재시도 안함
        if item.metadata.get("no_retry", False):
            return False

        # 일시적 실패의 경우 재시도
        return True

    @staticmethod
    def calculate_priority(job: ResearchJob) -> int:
        """작업의 우선순위 점수를 계산합니다.

        Args:
            job: 리서치 작업

        Returns:
            int: 우선순위 점수 (높을수록 중요함)
            
        Note:
            - 기본 점수: 100점
            - 작은 배치: +20점 (빠른 완료)
            - 큰 배치: -10점
            - 높은 우선순위 플래그: +50점
            - 낮은 우선순위 플래그: -30점
            - 많은 실패: -20점
        """
        priority = 100  # 기본 우선순위

        # 작은 배치에 대해 우선순위 증가 (빠른 완료)
        if len(job.items) <= 3:
            priority += 20

        # 큰 배치에 대해 우선순위 감소
        if len(job.items) >= 8:
            priority -= 10

        # 메타데이터 우선순위 플래그가 있는 경우 우선순위 조정
        if job.metadata.get("priority") == "high":
            priority += 50
        elif job.metadata.get("priority") == "low":
            priority -= 30

        # 실패가 많은 작업의 우선순위 감소
        if job.failed_items > job.processed_items:
            priority -= 20

        return max(0, priority)  # 음수가 되지 않도록 보장

    @staticmethod
    def split_batch(items: List[Item], chunk_size: int = 5) -> List[List[Item]]:
        """아이템을 작은 배치로 분할합니다.

        Args:
            items: 분할할 아이템 목록
            chunk_size: 각 청크의 크기

        Returns:
            List[List[Item]]: 아이템 배치 목록
            
        Raises:
            ValueError: 청크 크기가 0 이하인 경우
        """
        if chunk_size <= 0:
            raise ValueError("청크 크기는 양수여야 합니다")
        if chunk_size > ResearchUseCases.MAX_BATCH_SIZE:
            chunk_size = ResearchUseCases.MAX_BATCH_SIZE

        batches = []
        for i in range(0, len(items), chunk_size):
            batch = items[i : i + chunk_size]
            batches.append(batch)

        return batches

    @staticmethod
    def merge_duplicate_items(items: List[Item]) -> List[Item]:
        """해시를 기반으로 중복 아이템을 병합합니다.

        Args:
            items: 중복을 포함할 수 있는 아이템 목록

        Returns:
            List[Item]: 중복이 제거된 고유 아이템 목록
            
        Note:
            - 해시값을 기준으로 중복 제거
            - 해시가 없는 아이템은 모두 유지
        """
        seen_hashes = set()
        unique_items = []

        for item in items:
            if item.hash and item.hash in seen_hashes:
                continue
            if item.hash:
                seen_hashes.add(item.hash)
            unique_items.append(item)

        return unique_items

    @staticmethod
    def estimate_processing_time(job: ResearchJob) -> float:
        """작업의 예상 처리 시간을 초 단위로 계산합니다.

        Args:
            job: 리서치 작업

        Returns:
            float: 예상 처리 시간 (초)
            
        Note:
            - 기본 아이템당 처리 시간: 2초
            - 작업 설정/정리 오버헤드: 5초
            - 재시도 활성화시 20% 버퍼 추가
        """
        # 아이템당 기본 시간 (초)
        time_per_item = 2.0

        # 작업 크기에 따른 조정
        total_time = len(job.items) * time_per_item

        # 작업 설정/정리를 위한 오버헤드 추가
        total_time += 5.0

        # 재시도를 위한 버퍼 추가
        if job.metadata.get("retry_enabled", True):
            total_time *= 1.2

        return total_time
