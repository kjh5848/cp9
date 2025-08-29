"""
타임존 유틸리티 함수 모듈.

이 모듈은 애플리케이션 전체에서 일관된 타임존 처리를 위한
유틸리티 함수들을 제공합니다. 주로 한국 시간대(KST) 처리에
최적화되어 있습니다.
"""

import os
from datetime import datetime, timezone
from typing import Optional

from zoneinfo import ZoneInfo

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

def setup_timezone() -> None:
    """
    설정에 기반한 시스템 타임존을 설정합니다.
    
    환경 변수를 통해 시스템 전역 타임존을 설정하고,
    설정된 타임존의 유효성을 검증합니다.
    실패 시 UTC로 폴백합니다.
    """
    try:
        # 시스템 전역 타임존을 위한 TZ 환경 변수 설정
        os.environ['TZ'] = settings.timezone

        # 타임존 유효성 검증
        ZoneInfo(settings.timezone)

        logger.info(f"타임존이 설정되었습니다: {settings.timezone}")
    except Exception as e:
        logger.error(f"{settings.timezone} 타임존 설정 실패: {e}")
        logger.warning("UTC 타임존으로 폴백합니다")


def get_timezone() -> ZoneInfo:
    """
    설정된 타임존 객체를 가져옵니다.

    Returns:
        ZoneInfo: 설정된 타임존 객체 (실패 시 UTC 반환)
    """
    try:
        return ZoneInfo(settings.timezone)
    except Exception as e:
        logger.error(f"타임존 {settings.timezone} 가져오기 실패: {e}")
        return ZoneInfo("UTC")


def now_kst() -> datetime:
    """
    한국 시간대의 현재 시각을 가져옵니다.

    Returns:
        datetime: 한국 시간대(KST)가 적용된 현재 시각
    """
    kst_tz = get_timezone()
    return datetime.now(kst_tz)


def utc_to_kst(dt: datetime) -> datetime:
    """
    UTC 시간을 한국 시간대로 변환합니다.

    Args:
        dt: UTC datetime 객체 (타임존 정보가 없으면 UTC로 가정)

    Returns:
        datetime: 한국 시간대로 변환된 datetime 객체
    """
    if dt.tzinfo is None:
        # 타임존 정보가 없으면 UTC로 가정
        dt = dt.replace(tzinfo=timezone.utc)

    kst_tz = get_timezone()
    return dt.astimezone(kst_tz)


def kst_to_utc(dt: datetime) -> datetime:
    """
    한국 시간대를 UTC로 변환합니다.

    Args:
        dt: KST datetime 객체 (타임존 정보가 없으면 KST로 가정)

    Returns:
        datetime: UTC 타임존으로 변환된 datetime 객체
    """
    if dt.tzinfo is None:
        kst_tz = get_timezone()
        dt = dt.replace(tzinfo=kst_tz)

    return dt.astimezone(timezone.utc)


def format_kst_datetime(dt: Optional[datetime] = None, include_timezone: bool = True) -> str:
    """
    API 응답을 위해 datetime을 한국 시간대 형식으로 포맷합니다.

    Args:
        dt: 포맷할 datetime 객체 (None일 경우 현재 시각 사용)
        include_timezone: 타임존 정보 포함 여부

    Returns:
        str: 포맷된 datetime 문자열
            - include_timezone=True: ISO 8601 형식 (예: 2024-01-01T09:00:00+09:00)
            - include_timezone=False: 간단한 형식 (예: 2024-01-01 09:00:00)
    """
    if dt is None:
        dt = now_kst()
    else:
        dt = utc_to_kst(dt)

    if include_timezone:
        return dt.isoformat()
    else:
        return dt.strftime('%Y-%m-%d %H:%M:%S')
