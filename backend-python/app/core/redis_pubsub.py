"""Redis PubSub integration for WebSocket messaging."""

import asyncio
import json
import logging
from typing import Dict, Any, Optional

import redis.asyncio as redis
from pydantic import BaseModel

from app.core.config import settings
from app.core.logging import get_logger
from app.core.websocket_manager import get_connection_manager

logger = get_logger(__name__)


class JobUpdateMessage(BaseModel):
    """Message structure for job updates via Redis PubSub."""
    
    job_id: str
    message_type: str  # "status", "progress", "complete", "error"
    data: Dict[str, Any]


class RedisPubSubManager:
    """Manages Redis PubSub for WebSocket message broadcasting."""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.pubsub: Optional[redis.client.PubSub] = None
        self.is_listening = False
        self.listen_task: Optional[asyncio.Task] = None
    
    async def connect(self) -> bool:
        """Connect to Redis and set up PubSub.
        
        Returns:
            True if connected successfully
        """
        try:
            # Create Redis connection
            self.redis_client = redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            
            # Test connection
            await self.redis_client.ping()
            
            # Create PubSub
            self.pubsub = self.redis_client.pubsub()
            
            # Subscribe to job update channels
            await self.pubsub.subscribe("job_updates")
            
            logger.info("Connected to Redis PubSub for WebSocket messaging")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Redis PubSub: {e}")
            return False
    
    async def disconnect(self):
        """Disconnect from Redis PubSub."""
        try:
            if self.is_listening and self.listen_task:
                self.is_listening = False
                self.listen_task.cancel()
                try:
                    await self.listen_task
                except asyncio.CancelledError:
                    pass
            
            if self.pubsub:
                await self.pubsub.unsubscribe("job_updates")
                await self.pubsub.close()
                self.pubsub = None
            
            if self.redis_client:
                await self.redis_client.close()
                self.redis_client = None
                
            logger.info("Disconnected from Redis PubSub")
            
        except Exception as e:
            logger.error(f"Error disconnecting from Redis PubSub: {e}")
    
    async def start_listening(self):
        """Start listening for PubSub messages."""
        if not self.pubsub:
            logger.error("PubSub not initialized")
            return
        
        self.is_listening = True
        self.listen_task = asyncio.create_task(self._listen_for_messages())
        logger.info("Started listening for Redis PubSub messages")
    
    async def _listen_for_messages(self):
        """Listen for PubSub messages and forward to WebSocket connections."""
        connection_manager = get_connection_manager()
        
        try:
            async for message in self.pubsub.listen():
                if not self.is_listening:
                    break
                
                # Skip subscription confirmation messages
                if message["type"] != "message":
                    continue
                
                try:
                    # Parse message
                    data = json.loads(message["data"])
                    job_update = JobUpdateMessage(**data)
                    
                    logger.debug(f"Received job update via PubSub: {job_update.job_id} - {job_update.message_type}")
                    
                    # Forward to WebSocket connections
                    await self._forward_to_websocket(connection_manager, job_update)
                    
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"Invalid PubSub message format: {e}")
                except Exception as e:
                    logger.error(f"Error processing PubSub message: {e}")
                    
        except asyncio.CancelledError:
            logger.info("Redis PubSub listener cancelled")
        except Exception as e:
            logger.error(f"Error in Redis PubSub listener: {e}")
    
    async def _forward_to_websocket(
        self, 
        connection_manager, 
        job_update: JobUpdateMessage
    ):
        """Forward job update to WebSocket connections.
        
        Args:
            connection_manager: WebSocket connection manager
            job_update: Job update message
        """
        try:
            if job_update.message_type == "status":
                await connection_manager.send_job_status_update(
                    job_id=job_update.job_id,
                    status=job_update.data.get("status", "unknown"),
                    total_items=job_update.data.get("total_items", 0),
                    successful_items=job_update.data.get("successful_items", 0),
                    failed_items=job_update.data.get("failed_items", 0),
                    success_rate=job_update.data.get("success_rate", 0.0),
                    processing_time_ms=job_update.data.get("processing_time_ms")
                )
            
            elif job_update.message_type == "progress":
                await connection_manager.send_job_progress_update(
                    job_id=job_update.job_id,
                    current_item=job_update.data.get("current_item", 0),
                    total_items=job_update.data.get("total_items", 0),
                    current_item_name=job_update.data.get("current_item_name")
                )
            
            elif job_update.message_type == "complete":
                await connection_manager.send_job_completion(
                    job_id=job_update.job_id,
                    status=job_update.data.get("status", "completed"),
                    results_count=job_update.data.get("results_count", 0),
                    total_processing_time_ms=job_update.data.get("total_processing_time_ms", 0)
                )
            
            elif job_update.message_type == "error":
                await connection_manager.send_job_error(
                    job_id=job_update.job_id,
                    error_code=job_update.data.get("error_code", "UNKNOWN_ERROR"),
                    error_message=job_update.data.get("error_message", "Unknown error occurred"),
                    error_details=job_update.data.get("error_details")
                )
            
            else:
                logger.warning(f"Unknown job update message type: {job_update.message_type}")
                
        except Exception as e:
            logger.error(f"Error forwarding job update to WebSocket: {e}")
    
    async def publish_job_update(
        self,
        job_id: str,
        message_type: str,
        data: Dict[str, Any]
    ):
        """Publish job update message to Redis.
        
        Args:
            job_id: Job ID
            message_type: Type of update
            data: Update data
        """
        if not self.redis_client:
            logger.error("Redis client not initialized")
            return
        
        try:
            message = JobUpdateMessage(
                job_id=job_id,
                message_type=message_type,
                data=data
            )
            
            await self.redis_client.publish(
                "job_updates", 
                message.json()
            )
            
            logger.debug(f"Published job update to Redis: {job_id} - {message_type}")
            
        except Exception as e:
            logger.error(f"Failed to publish job update to Redis: {e}")


# Global PubSub manager instance
pubsub_manager = RedisPubSubManager()


def get_pubsub_manager() -> RedisPubSubManager:
    """Get the global PubSub manager instance.
    
    Returns:
        RedisPubSubManager instance
    """
    return pubsub_manager


# Utility functions for Celery integration
async def publish_job_status_update(
    job_id: str,
    status: str,
    total_items: int = 0,
    successful_items: int = 0,
    failed_items: int = 0,
    success_rate: float = 0.0,
    processing_time_ms: Optional[int] = None
):
    """Publish job status update.
    
    Args:
        job_id: Job ID
        status: Job status
        total_items: Total items
        successful_items: Successful items
        failed_items: Failed items
        success_rate: Success rate
        processing_time_ms: Processing time in milliseconds
    """
    manager = get_pubsub_manager()
    await manager.publish_job_update(
        job_id=job_id,
        message_type="status",
        data={
            "status": status,
            "total_items": total_items,
            "successful_items": successful_items,
            "failed_items": failed_items,
            "success_rate": success_rate,
            "processing_time_ms": processing_time_ms
        }
    )


async def publish_job_progress_update(
    job_id: str,
    current_item: int,
    total_items: int,
    current_item_name: Optional[str] = None
):
    """Publish job progress update.
    
    Args:
        job_id: Job ID
        current_item: Current item being processed
        total_items: Total items
        current_item_name: Name of current item
    """
    manager = get_pubsub_manager()
    await manager.publish_job_update(
        job_id=job_id,
        message_type="progress",
        data={
            "current_item": current_item,
            "total_items": total_items,
            "current_item_name": current_item_name
        }
    )


async def publish_job_completion(
    job_id: str,
    status: str,
    results_count: int,
    total_processing_time_ms: int
):
    """Publish job completion.
    
    Args:
        job_id: Job ID
        status: Final job status
        results_count: Number of results
        total_processing_time_ms: Total processing time
    """
    manager = get_pubsub_manager()
    await manager.publish_job_update(
        job_id=job_id,
        message_type="complete",
        data={
            "status": status,
            "results_count": results_count,
            "total_processing_time_ms": total_processing_time_ms
        }
    )


async def publish_job_error(
    job_id: str,
    error_code: str,
    error_message: str,
    error_details: Optional[str] = None
):
    """Publish job error.
    
    Args:
        job_id: Job ID
        error_code: Error code
        error_message: Error message
        error_details: Additional error details
    """
    manager = get_pubsub_manager()
    await manager.publish_job_update(
        job_id=job_id,
        message_type="error",
        data={
            "error_code": error_code,
            "error_message": error_message,
            "error_details": error_details
        }
    )