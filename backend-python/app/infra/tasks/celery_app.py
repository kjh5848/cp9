"""Celery application configuration."""

from celery import Celery

from app.core.config import settings

# Create Celery instance
celery_app = Celery(
    "research-backend",
    broker=str(settings.celery_broker_url),
    backend=str(settings.celery_result_backend),
    include=["app.infra.tasks.workers"],
)

# Configure Celery
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Worker settings
    worker_prefetch_multiplier=1,  # Process one task at a time
    worker_max_tasks_per_child=100,  # Restart worker after 100 tasks
    worker_disable_rate_limits=False,
    # Task execution settings
    task_acks_late=True,  # Acknowledge task only after completion
    task_reject_on_worker_lost=True,  # Reject tasks if worker is lost
    task_track_started=True,  # Track when tasks start
    # Result backend settings
    result_expires=3600,  # Results expire after 1 hour
    result_persistent=True,  # Persist results in Redis
    # Task routing
    task_routes={
        "app.infra.tasks.workers.run_research": {"queue": "research"},
        "app.infra.tasks.workers.process_single_item": {"queue": "items"},
    },
    # Queue configuration
    task_default_queue="default",
    task_create_missing_queues=True,
    # Retry settings
    task_default_retry_delay=60,  # Default retry delay in seconds
    task_max_retries=3,  # Default max retries
    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
    # Beat settings (for periodic tasks if needed)
    beat_schedule={
        # Add periodic tasks here if needed
    },
)
