"""WebSocket endpoints for real-time research job updates."""

import time
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends, Query
from fastapi.responses import HTMLResponse

from app.core.logging import get_logger
from app.core.websocket_manager import get_connection_manager, ConnectionManager
from app.services.product_research_service import get_product_research_service
from app.services.product_research_service import ProductResearchService

logger = get_logger(__name__)

router = APIRouter(
    prefix="/ws",
    tags=["WebSocket"],
)


@router.websocket("/research/{job_id}")
async def websocket_research_updates(
    websocket: WebSocket,
    job_id: str,
    connection_manager: ConnectionManager = Depends(get_connection_manager),
    research_service: ProductResearchService = Depends(get_product_research_service)
):
    """WebSocket endpoint for real-time research job updates.
    
    Args:
        websocket: WebSocket connection
        job_id: Research job ID to subscribe to
        connection_manager: WebSocket connection manager
        research_service: Product research service
    """
    client_ip = websocket.client.host if websocket.client else "unknown"
    connection_start = time.time()
    
    # Rate limiting: max 5 connections per IP
    current_connections = sum(
        1 for connections in connection_manager.job_connections.values()
        for ws in connections
        if ws.client and ws.client.host == client_ip
    )
    
    if current_connections >= 5:
        await websocket.close(code=4008, reason="Too many connections from this IP")
        return
    
    # Validate job_id format
    try:
        UUID(job_id)
    except ValueError:
        await websocket.close(code=4000, reason="Invalid job ID format")
        return
    
    # Check if job exists
    try:
        job = await research_service.get_job_by_id(job_id)
        if not job:
            await websocket.close(code=4004, reason="Job not found")
            return
    except Exception as e:
        logger.error(f"Failed to validate job {job_id}: {e}")
        await websocket.close(code=4500, reason="Internal server error")
        return
    
    # Connect WebSocket
    connected = await connection_manager.connect(websocket, job_id)
    if not connected:
        return
    
    logger.info(
        f"WebSocket connected: job={job_id}, client={client_ip}, "
        f"total_connections={connection_manager.get_connection_count()}"
    )
    
    try:
        # Send initial job status
        await connection_manager.send_job_status_update(
            job_id=job_id,
            status=job.status.value,
            total_items=job.total_items,
            successful_items=job.successful_items,
            failed_items=job.failed_items,
            success_rate=job.success_rate,
            processing_time_ms=job.processing_time_ms
        )
        
        # Keep connection alive and handle client messages
        last_ping = time.time()
        while True:
            try:
                # Wait for client messages with timeout for connection cleanup
                data = await websocket.receive_text()
                
                # Handle client messages
                if data == "ping":
                    await websocket.send_text("pong")
                    last_ping = time.time()
                elif data == "get_status":
                    # Refresh job status from database
                    updated_job = await research_service.get_job_by_id(job_id)
                    if updated_job:
                        await connection_manager.send_job_status_update(
                            job_id=job_id,
                            status=updated_job.status.value,
                            total_items=updated_job.total_items,
                            successful_items=updated_job.successful_items,
                            failed_items=updated_job.failed_items,
                            success_rate=updated_job.success_rate,
                            processing_time_ms=updated_job.processing_time_ms
                        )
                else:
                    logger.debug(f"Received unknown message from client: {data}")
                
                # Auto-disconnect idle connections (30 minutes)
                if time.time() - last_ping > 1800:
                    logger.info(f"Auto-disconnecting idle WebSocket for job {job_id}")
                    break
                    
            except WebSocketDisconnect:
                logger.info(f"WebSocket client disconnected from job {job_id}")
                break
            except Exception as e:
                logger.error(f"Error handling WebSocket message for job {job_id}: {e}")
                try:
                    await websocket.send_text(f"Error: {str(e)}")
                except:
                    break  # Connection is broken
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from job {job_id}")
    except Exception as e:
        logger.error(f"WebSocket connection error for job {job_id}: {e}")
    finally:
        connection_duration = time.time() - connection_start
        logger.info(
            f"WebSocket disconnected: job={job_id}, client={client_ip}, "
            f"duration={connection_duration:.1f}s, "
            f"remaining_connections={connection_manager.get_connection_count() - 1}"
        )
        await connection_manager.disconnect(websocket)


@router.get(
    "/test",
    response_class=HTMLResponse,
    summary="WebSocket Test Page",
    description="Simple HTML page to test WebSocket connections"
)
async def websocket_test_page():
    """Simple HTML page to test WebSocket connections."""
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>WebSocket Research Updates Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; }
            .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
            .connected { background-color: #d4edda; border: 1px solid #c3e6cb; }
            .disconnected { background-color: #f8d7da; border: 1px solid #f5c6cb; }
            .message { 
                background-color: #f8f9fa; 
                border: 1px solid #dee2e6; 
                padding: 8px; 
                margin: 5px 0; 
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
            }
            button { padding: 8px 16px; margin: 5px; }
            input { padding: 8px; margin: 5px; width: 300px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>WebSocket Research Updates Test</h1>
            
            <div>
                <label for="jobId">Job ID:</label>
                <input type="text" id="jobId" placeholder="Enter job ID (UUID format)" />
                <button onclick="connect()">Connect</button>
                <button onclick="disconnect()">Disconnect</button>
            </div>
            
            <div id="status" class="status disconnected">Disconnected</div>
            
            <div>
                <button onclick="sendPing()">Send Ping</button>
                <button onclick="getStatus()">Get Status</button>
                <button onclick="clearMessages()">Clear Messages</button>
            </div>
            
            <h3>Messages:</h3>
            <div id="messages"></div>
        </div>

        <script>
            let ws = null;
            const statusDiv = document.getElementById('status');
            const messagesDiv = document.getElementById('messages');
            
            function updateStatus(message, isConnected) {
                statusDiv.textContent = message;
                statusDiv.className = isConnected ? 'status connected' : 'status disconnected';
            }
            
            function addMessage(message) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message';
                messageDiv.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
                messagesDiv.appendChild(messageDiv);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
            
            function connect() {
                const jobId = document.getElementById('jobId').value.trim();
                if (!jobId) {
                    alert('Please enter a job ID');
                    return;
                }
                
                if (ws) {
                    ws.close();
                }
                
                const wsUrl = `ws://localhost:8000/api/v1/ws/research/${jobId}`;
                addMessage(`Connecting to: ${wsUrl}`);
                
                ws = new WebSocket(wsUrl);
                
                ws.onopen = function(event) {
                    updateStatus(`Connected to job: ${jobId}`, true);
                    addMessage('WebSocket connected');
                };
                
                ws.onmessage = function(event) {
                    try {
                        const data = JSON.parse(event.data);
                        addMessage(`Received: ${JSON.stringify(data, null, 2)}`);
                    } catch (e) {
                        addMessage(`Received text: ${event.data}`);
                    }
                };
                
                ws.onclose = function(event) {
                    updateStatus(`Disconnected (Code: ${event.code}, Reason: ${event.reason || 'Unknown'})`, false);
                    addMessage(`WebSocket closed: ${event.code} - ${event.reason || 'Unknown'}`);
                    ws = null;
                };
                
                ws.onerror = function(event) {
                    addMessage('WebSocket error occurred');
                    console.error('WebSocket error:', event);
                };
            }
            
            function disconnect() {
                if (ws) {
                    ws.close();
                    ws = null;
                }
            }
            
            function sendPing() {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send('ping');
                    addMessage('Sent: ping');
                } else {
                    alert('WebSocket is not connected');
                }
            }
            
            function getStatus() {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send('get_status');
                    addMessage('Sent: get_status');
                } else {
                    alert('WebSocket is not connected');
                }
            }
            
            function clearMessages() {
                messagesDiv.innerHTML = '';
            }
        </script>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)


@router.get(
    "/stats",
    summary="WebSocket Statistics",
    description="Get WebSocket connection statistics"
)
async def websocket_stats(
    connection_manager: ConnectionManager = Depends(get_connection_manager)
):
    """Get WebSocket connection statistics."""
    
    return {
        "total_connections": connection_manager.get_connection_count(),
        "active_jobs": len(connection_manager.get_active_job_ids()),
        "job_connections": {
            job_id: connection_manager.get_connection_count(job_id)
            for job_id in connection_manager.get_active_job_ids()
        }
    }