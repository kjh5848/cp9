"""WebSocket 통합을 위한 Celery 작업.

주요 역할:
- WebSocket을 통한 실시간 작업 상태 전송
- Celery 작업과 WebSocket 클라이언트 간 브릿지
- 비동기 이벤트 루프 관리
- 작업 생명주기 이벤트 처리

JSDoc:
@module WebSocketCeleryTasks
@description WebSocket 실시간 통신을 위한 Celery 작업 통합
@version 1.0.0
@author Backend Team
@since 2024-01-01
"""

import asyncio
from typing import Optional

from celery import current_task
from celery.signals import task_failure, task_prerun, task_success

from app.core.logging import get_logger

logger = get_logger(__name__)


# Celery 작업에서 비동기 작업을 위한 이벤트 루프 저장
_event_loop = None


def get_event_loop():
    """Celery 작업에서 비동기 작업을 위한 이벤트 루프를 가져오거나 생성합니다.
    
    Returns:
        asyncio.AbstractEventLoop: 사용할 이벤트 루프
        
    Note:
        - 기존 이벤트 루프가 있으면 재사용
        - 없으면 새로 생성하여 설정
    """
    global _event_loop
    try:
        # 현재 이벤트 루프 가져오기 시도
        _event_loop = asyncio.get_event_loop()
    except RuntimeError:
        # 존재하지 않으면 새 이벤트 루프 생성
        _event_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(_event_loop)
    return _event_loop


def run_async_in_celery(coro):
    """Run async coroutine in Celery task.

    Args:
        coro: Coroutine to run
    """
    try:
        loop = get_event_loop()
        return loop.run_until_complete(coro)
    except Exception as e:
        logger.error(f"Failed to run async operation in Celery task: {e}")


# Celery signal handlers for WebSocket notifications
@task_prerun.connect
def task_prerun_handler(
    sender=None, task_id=None, task=None, args=None, kwargs=None, **kwds
):
    """Handle task prerun signal to send progress updates."""
    try:
        # Extract job_id from task arguments
        job_id = None
        if args and len(args) > 0:
            job_id = args[0]
        elif kwargs and "job_id" in kwargs:
            job_id = kwargs["job_id"]

        if job_id:
            # Send job start notification
            from app.core.redis_pubsub import publish_job_status_update

            run_async_in_celery(
                publish_job_status_update(job_id=job_id, status="in_progress")
            )

            logger.info(f"Sent job start notification for {job_id}")

    except Exception as e:
        logger.error(f"Error in task prerun handler: {e}")


@task_success.connect
def task_success_handler(sender=None, task_id=None, result=None, **kwds):
    """Handle task success signal to send completion updates."""
    try:
        # Try to extract job info from result
        if isinstance(result, dict) and "job_id" in result:
            job_id = result["job_id"]

            from app.core.redis_pubsub import publish_job_completion

            run_async_in_celery(
                publish_job_completion(
                    job_id=job_id,
                    status="completed",
                    results_count=result.get("results_count", 0),
                    total_processing_time_ms=result.get("processing_time_ms", 0),
                )
            )

            logger.info(f"Sent job completion notification for {job_id}")

    except Exception as e:
        logger.error(f"Error in task success handler: {e}")


@task_failure.connect
def task_failure_handler(
    sender=None, task_id=None, exception=None, traceback=None, einfo=None, **kwds
):
    """Handle task failure signal to send error updates."""
    try:
        # Try to get job_id from task context
        if current_task and hasattr(current_task, "request"):
            args = current_task.request.args
            kwargs = current_task.request.kwargs

            job_id = None
            if args and len(args) > 0:
                job_id = args[0]
            elif kwargs and "job_id" in kwargs:
                job_id = kwargs["job_id"]

            if job_id:
                from app.core.redis_pubsub import publish_job_error

                run_async_in_celery(
                    publish_job_error(
                        job_id=job_id,
                        error_code="BACKGROUND_TASK_ERROR",
                        error_message=str(exception),
                        error_details=str(traceback) if traceback else None,
                    )
                )

                logger.info(f"Sent job error notification for {job_id}")

    except Exception as e:
        logger.error(f"Error in task failure handler: {e}")


# Helper functions for sending WebSocket updates from Celery tasks
def send_job_progress_update(
    job_id: str,
    current_item: int,
    total_items: int,
    current_item_name: Optional[str] = None,
):
    """Send job progress update from Celery task.

    Args:
        job_id: Job ID
        current_item: Current item number
        total_items: Total number of items
        current_item_name: Name of current item
    """
    try:
        from app.core.redis_pubsub import publish_job_progress_update

        run_async_in_celery(
            publish_job_progress_update(
                job_id=job_id,
                current_item=current_item,
                total_items=total_items,
                current_item_name=current_item_name,
            )
        )

        logger.debug(f"Sent progress update for {job_id}: {current_item}/{total_items}")

    except Exception as e:
        logger.error(f"Failed to send job progress update: {e}")


def send_job_status_update(
    job_id: str,
    status: str,
    total_items: int = 0,
    successful_items: int = 0,
    failed_items: int = 0,
    success_rate: float = 0.0,
    processing_time_ms: Optional[int] = None,
):
    """Send job status update from Celery task.

    Args:
        job_id: Job ID
        status: Current status
        total_items: Total items
        successful_items: Successfully processed items
        failed_items: Failed items
        success_rate: Success rate percentage
        processing_time_ms: Processing time in milliseconds
    """
    try:
        from app.core.redis_pubsub import publish_job_status_update

        run_async_in_celery(
            publish_job_status_update(
                job_id=job_id,
                status=status,
                total_items=total_items,
                successful_items=successful_items,
                failed_items=failed_items,
                success_rate=success_rate,
                processing_time_ms=processing_time_ms,
            )
        )

        logger.debug(f"Sent status update for {job_id}: {status}")

    except Exception as e:
        logger.error(f"Failed to send job status update: {e}")
