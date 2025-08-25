"""WebSocket connection manager for real-time research job updates."""

import asyncio
from typing import Dict, List, Optional

from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.core.logging import get_logger

logger = get_logger(__name__)


class WebSocketMessage(BaseModel):
    """WebSocket message structure."""

    type: str  # "job_status", "job_progress", "job_complete", "job_error"
    job_id: str
    data: dict
    timestamp: str


class ConnectionManager:
    """Manages WebSocket connections for research job updates."""

    def __init__(self):
        # job_id -> List[WebSocket] mapping
        self.job_connections: Dict[str, List[WebSocket]] = {}
        # WebSocket -> job_id mapping for cleanup
        self.connection_jobs: Dict[WebSocket, str] = {}
        self.connection_lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, job_id: str) -> bool:
        """Connect a WebSocket to a specific job.

        Args:
            websocket: WebSocket connection
            job_id: Research job ID

        Returns:
            True if connected successfully
        """
        try:
            await websocket.accept()

            async with self.connection_lock:
                # Add to job connections
                if job_id not in self.job_connections:
                    self.job_connections[job_id] = []

                self.job_connections[job_id].append(websocket)
                self.connection_jobs[websocket] = job_id

                logger.info(
                    f"WebSocket connected to job {job_id}. "
                    f"Total connections for this job: {len(self.job_connections[job_id])}"
                )

                return True

        except Exception as e:
            logger.error(f"Failed to connect WebSocket to job {job_id}: {e}")
            return False

    async def disconnect(self, websocket: WebSocket):
        """Disconnect a WebSocket and clean up.

        Args:
            websocket: WebSocket connection to disconnect
        """
        async with self.connection_lock:
            if websocket not in self.connection_jobs:
                return

            job_id = self.connection_jobs[websocket]

            # Remove from job connections
            if job_id in self.job_connections:
                try:
                    self.job_connections[job_id].remove(websocket)

                    # Clean up empty job connection lists
                    if not self.job_connections[job_id]:
                        del self.job_connections[job_id]

                except ValueError:
                    pass  # WebSocket already removed

            # Remove from connection mapping
            del self.connection_jobs[websocket]

            logger.info(
                f"WebSocket disconnected from job {job_id}. "
                f"Remaining connections for this job: "
                f"{len(self.job_connections.get(job_id, []))}"
            )

    async def send_message_to_job(self, job_id: str, message: WebSocketMessage):
        """Send message to all WebSocket connections for a specific job.

        Args:
            job_id: Research job ID
            message: Message to send
        """
        if job_id not in self.job_connections:
            logger.debug(f"No WebSocket connections for job {job_id}")
            return

        connections = self.job_connections[
            job_id
        ].copy()  # Avoid modification during iteration
        disconnected_connections = []

        for websocket in connections:
            try:
                await websocket.send_text(message.json())
                logger.debug(
                    f"Sent message to WebSocket for job {job_id}: {message.type}"
                )

            except WebSocketDisconnect:
                logger.info(
                    f"WebSocket disconnected during message send for job {job_id}"
                )
                disconnected_connections.append(websocket)

            except Exception as e:
                logger.error(
                    f"Failed to send message to WebSocket for job {job_id}: {e}"
                )
                disconnected_connections.append(websocket)

        # Clean up disconnected connections
        for websocket in disconnected_connections:
            await self.disconnect(websocket)

    async def send_job_status_update(
        self,
        job_id: str,
        status: str,
        total_items: int = 0,
        successful_items: int = 0,
        failed_items: int = 0,
        success_rate: float = 0.0,
        processing_time_ms: Optional[int] = None,
    ):
        """Send job status update message.

        Args:
            job_id: Research job ID
            status: Current job status
            total_items: Total items in the job
            successful_items: Successfully processed items
            failed_items: Failed items
            success_rate: Success rate percentage
            processing_time_ms: Processing time in milliseconds
        """
        from datetime import datetime

        message = WebSocketMessage(
            type="job_status",
            job_id=job_id,
            data={
                "status": status,
                "total_items": total_items,
                "successful_items": successful_items,
                "failed_items": failed_items,
                "success_rate": success_rate,
                "processing_time_ms": processing_time_ms,
            },
            timestamp=datetime.utcnow().isoformat(),
        )

        await self.send_message_to_job(job_id, message)

    async def send_job_progress_update(
        self,
        job_id: str,
        current_item: int,
        total_items: int,
        current_item_name: Optional[str] = None,
    ):
        """Send job progress update message.

        Args:
            job_id: Research job ID
            current_item: Current item being processed
            total_items: Total items in the job
            current_item_name: Name of current item being processed
        """
        from datetime import datetime

        progress_percentage = (
            (current_item / total_items * 100) if total_items > 0 else 0
        )

        message = WebSocketMessage(
            type="job_progress",
            job_id=job_id,
            data={
                "current_item": current_item,
                "total_items": total_items,
                "progress_percentage": round(progress_percentage, 2),
                "current_item_name": current_item_name,
            },
            timestamp=datetime.utcnow().isoformat(),
        )

        await self.send_message_to_job(job_id, message)

    async def send_job_completion(
        self,
        job_id: str,
        status: str,
        results_count: int,
        total_processing_time_ms: int,
    ):
        """Send job completion message.

        Args:
            job_id: Research job ID
            status: Final job status
            results_count: Number of results
            total_processing_time_ms: Total processing time
        """
        from datetime import datetime

        message = WebSocketMessage(
            type="job_complete",
            job_id=job_id,
            data={
                "status": status,
                "results_count": results_count,
                "total_processing_time_ms": total_processing_time_ms,
            },
            timestamp=datetime.utcnow().isoformat(),
        )

        await self.send_message_to_job(job_id, message)

    async def send_job_error(
        self,
        job_id: str,
        error_code: str,
        error_message: str,
        error_details: Optional[str] = None,
    ):
        """Send job error message.

        Args:
            job_id: Research job ID
            error_code: Error code
            error_message: Error message
            error_details: Additional error details
        """
        from datetime import datetime

        message = WebSocketMessage(
            type="job_error",
            job_id=job_id,
            data={
                "error_code": error_code,
                "error_message": error_message,
                "error_details": error_details,
            },
            timestamp=datetime.utcnow().isoformat(),
        )

        await self.send_message_to_job(job_id, message)

    def get_connection_count(self, job_id: Optional[str] = None) -> int:
        """Get connection count.

        Args:
            job_id: Specific job ID, or None for total count

        Returns:
            Number of connections
        """
        if job_id:
            return len(self.job_connections.get(job_id, []))
        else:
            return sum(
                len(connections) for connections in self.job_connections.values()
            )

    def get_active_job_ids(self) -> List[str]:
        """Get list of job IDs with active connections.

        Returns:
            List of job IDs
        """
        return list(self.job_connections.keys())


# Global connection manager instance
connection_manager = ConnectionManager()


def get_connection_manager() -> ConnectionManager:
    """Get the global connection manager instance.

    Returns:
        ConnectionManager instance
    """
    return connection_manager
