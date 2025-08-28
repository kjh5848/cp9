"""Timezone utility functions."""

import os
from datetime import datetime, timezone
from typing import Optional

from zoneinfo import ZoneInfo

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def setup_timezone() -> None:
    """Setup system timezone based on settings."""
    try:
        # Set TZ environment variable for system-wide timezone
        os.environ['TZ'] = settings.timezone

        # Verify timezone is valid
        ZoneInfo(settings.timezone)

        logger.info(f"Timezone set to: {settings.timezone}")
    except Exception as e:
        logger.error(f"Failed to set timezone to {settings.timezone}: {e}")
        logger.warning("Falling back to UTC timezone")


def get_timezone() -> ZoneInfo:
    """Get the configured timezone object.

    Returns:
        ZoneInfo: Configured timezone object
    """
    try:
        return ZoneInfo(settings.timezone)
    except Exception as e:
        logger.error(f"Failed to get timezone {settings.timezone}: {e}")
        return ZoneInfo("UTC")


def now_kst() -> datetime:
    """Get current datetime in Korean timezone.

    Returns:
        datetime: Current datetime with Korean timezone
    """
    kst_tz = get_timezone()
    return datetime.now(kst_tz)


def utc_to_kst(dt: datetime) -> datetime:
    """Convert UTC datetime to Korean timezone.

    Args:
        dt: UTC datetime object

    Returns:
        datetime: Datetime in Korean timezone
    """
    if dt.tzinfo is None:
        # Assume UTC if no timezone info
        dt = dt.replace(tzinfo=timezone.utc)

    kst_tz = get_timezone()
    return dt.astimezone(kst_tz)


def kst_to_utc(dt: datetime) -> datetime:
    """Convert Korean timezone datetime to UTC.

    Args:
        dt: KST datetime object

    Returns:
        datetime: Datetime in UTC timezone
    """
    if dt.tzinfo is None:
        kst_tz = get_timezone()
        dt = dt.replace(tzinfo=kst_tz)

    return dt.astimezone(timezone.utc)


def format_kst_datetime(dt: Optional[datetime] = None, include_timezone: bool = True) -> str:
    """Format datetime in Korean timezone for API responses.

    Args:
        dt: Datetime to format (defaults to now)
        include_timezone: Whether to include timezone info in format

    Returns:
        str: Formatted datetime string
    """
    if dt is None:
        dt = now_kst()
    else:
        dt = utc_to_kst(dt)

    if include_timezone:
        return dt.isoformat()
    else:
        return dt.strftime('%Y-%m-%d %H:%M:%S')
