"""Celery 애플리케이션 설정.

주요 역할:
- Celery 분산 작업 큐 설정 및 초기화
- Redis 브로커 및 결과 백엔드 연결
- 워커 설정 및 작업 라우팅 관리
- 재시도 로직 및 모니터링 설정

JSDoc:
@module CeleryApp
@description 비동기 백그라운드 작업을 위한 Celery 설정
@version 1.0.0
@author Backend Team
@since 2024-01-01
"""

from celery import Celery

from app.core.config import settings

# Celery 인스턴스 생성
celery_app = Celery(
    "research-backend",
    broker=str(settings.celery_broker_url),
    backend=str(settings.celery_result_backend),
    include=["app.infra.tasks.workers"],
)

# Celery 설정
celery_app.conf.update(
    # 작업 설정
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # 워커 설정
    worker_prefetch_multiplier=1,  # 한 번에 하나의 작업만 처리
    worker_max_tasks_per_child=100,  # 100개 작업 후 워커 재시작
    worker_disable_rate_limits=False,
    # 작업 실행 설정
    task_acks_late=True,  # 작업 완료 후에만 확인
    task_reject_on_worker_lost=True,  # 워커 손실시 작업 거부
    task_track_started=True,  # 작업 시작 시점 추적
    # 결과 백엔드 설정
    result_expires=3600,  # 1시간 후 결과 만료
    result_persistent=True,  # Redis에 결과 영구 저장
    # 작업 라우팅
    task_routes={
        "app.infra.tasks.workers.run_research": {"queue": "research"},
        "app.infra.tasks.workers.process_single_item": {"queue": "items"},
    },
    # 큐 설정
    task_default_queue="default",
    task_create_missing_queues=True,
    # 재시도 설정
    task_default_retry_delay=60,  # 기본 재시도 지연 시간 (초)
    task_max_retries=3,  # 기본 최대 재시도 횟수
    # 모니터링
    worker_send_task_events=True,
    task_send_sent_event=True,
    # Beat 설정 (주기적 작업용, 필요시)
    beat_schedule={
        # 필요한 주기적 작업을 여기에 추가
    },
)
