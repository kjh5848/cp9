"""Rate limiting middleware and utilities."""

import time
from typing import Dict, Optional, Tuple
from collections import defaultdict, deque
from threading import Lock

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.exceptions import RateLimitException
from app.core.logging import get_logger

logger = get_logger(__name__)


class RateLimiter:
    """Thread-safe rate limiter using sliding window algorithm."""
    
    def __init__(self, max_requests: int, window_seconds: int):
        """Initialize rate limiter.
        
        Args:
            max_requests: Maximum requests allowed in time window
            window_seconds: Time window in seconds
        """
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: Dict[str, deque] = defaultdict(deque)
        self._lock = Lock()
    
    def is_allowed(self, key: str) -> Tuple[bool, Dict[str, int]]:
        """Check if request is allowed and return rate limit info.
        
        Args:
            key: Unique identifier for the client (IP, user ID, etc.)
            
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        current_time = time.time()
        
        with self._lock:
            # Clean old requests outside the window
            requests_queue = self._requests[key]
            while requests_queue and requests_queue[0] <= current_time - self.window_seconds:
                requests_queue.popleft()
            
            # Check if limit exceeded
            if len(requests_queue) >= self.max_requests:
                oldest_request = requests_queue[0] if requests_queue else current_time
                reset_time = int(oldest_request + self.window_seconds)
                
                rate_limit_info = {
                    "limit": self.max_requests,
                    "remaining": 0,
                    "reset_time": reset_time,
                    "retry_after": max(1, reset_time - int(current_time))
                }
                
                return False, rate_limit_info
            
            # Allow request and record it
            requests_queue.append(current_time)
            remaining = self.max_requests - len(requests_queue)
            
            # Calculate reset time (when oldest request will expire)
            oldest_request = requests_queue[0] if requests_queue else current_time
            reset_time = int(oldest_request + self.window_seconds)
            
            rate_limit_info = {
                "limit": self.max_requests,
                "remaining": remaining,
                "reset_time": reset_time,
                "retry_after": 0
            }
            
            return True, rate_limit_info
    
    def get_stats(self, key: str) -> Dict[str, int]:
        """Get current rate limit stats for a key.
        
        Args:
            key: Unique identifier for the client
            
        Returns:
            Rate limit statistics
        """
        current_time = time.time()
        
        with self._lock:
            # Clean old requests outside the window
            requests_queue = self._requests[key]
            while requests_queue and requests_queue[0] <= current_time - self.window_seconds:
                requests_queue.popleft()
            
            remaining = self.max_requests - len(requests_queue)
            oldest_request = requests_queue[0] if requests_queue else current_time
            reset_time = int(oldest_request + self.window_seconds)
            
            return {
                "limit": self.max_requests,
                "remaining": max(0, remaining),
                "reset_time": reset_time,
                "current_requests": len(requests_queue)
            }


class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for rate limiting."""
    
    def __init__(
        self,
        app,
        requests_per_minute: int = 100,
        requests_per_hour: int = 1000,
        burst_requests: int = 20,
        burst_window: int = 60,
        excluded_paths: Optional[list] = None
    ):
        """Initialize rate limiting middleware.
        
        Args:
            app: FastAPI application
            requests_per_minute: Requests allowed per minute
            requests_per_hour: Requests allowed per hour
            burst_requests: Burst requests allowed
            burst_window: Burst window in seconds
            excluded_paths: Paths to exclude from rate limiting
        """
        super().__init__(app)
        
        # Create rate limiters for different time windows
        self.minute_limiter = RateLimiter(requests_per_minute, 60)
        self.hour_limiter = RateLimiter(requests_per_hour, 3600)
        self.burst_limiter = RateLimiter(burst_requests, burst_window)
        
        self.excluded_paths = excluded_paths or ["/health", "/metrics", "/docs", "/redoc", "/openapi.json"]
        
        logger.info(
            f"Rate limiting enabled: {requests_per_minute}/min, {requests_per_hour}/hour, "
            f"burst: {burst_requests}/{burst_window}s"
        )
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """Process request with rate limiting.
        
        Args:
            request: FastAPI request
            call_next: Next middleware in chain
            
        Returns:
            HTTP response
        """
        # Skip rate limiting for excluded paths
        if any(request.url.path.startswith(path) for path in self.excluded_paths):
            return await call_next(request)
        
        # Get client identifier (IP address as fallback)
        client_id = self._get_client_id(request)
        
        try:
            # Check all rate limits
            rate_limit_checks = [
                ("burst", self.burst_limiter),
                ("minute", self.minute_limiter),
                ("hour", self.hour_limiter)
            ]
            
            for limit_type, limiter in rate_limit_checks:
                allowed, rate_info = limiter.is_allowed(client_id)
                
                if not allowed:
                    # Log rate limit violation
                    logger.warning(
                        f"Rate limit exceeded for {client_id}: "
                        f"{limit_type} limit ({rate_info['limit']} requests)"
                    )
                    
                    # Raise rate limit exception
                    raise RateLimitException(
                        limit=rate_info["limit"],
                        remaining=rate_info["remaining"],
                        reset_time=rate_info["reset_time"],
                        message=f"Rate limit exceeded: {limit_type} limit",
                        details=f"Client {client_id} exceeded {limit_type} rate limit"
                    )
            
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers to response
            minute_stats = self.minute_limiter.get_stats(client_id)
            response.headers["X-RateLimit-Limit"] = str(minute_stats["limit"])
            response.headers["X-RateLimit-Remaining"] = str(minute_stats["remaining"])
            response.headers["X-RateLimit-Reset"] = str(minute_stats["reset_time"])
            
            return response
            
        except RateLimitException as e:
            # Convert to HTTP exception and let error handler manage it
            raise e.to_http_exception()
        except Exception as e:
            logger.error(f"Error in rate limiting middleware: {e}")
            # Continue processing if rate limiting fails
            return await call_next(request)
    
    def _get_client_id(self, request: Request) -> str:
        """Get unique client identifier from request.
        
        Args:
            request: FastAPI request
            
        Returns:
            Client identifier string
        """
        # Try to get client IP from various headers (for reverse proxy setups)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Get first IP from comma-separated list
            client_ip = forwarded_for.split(",")[0].strip()
            return f"ip:{client_ip}"
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return f"ip:{real_ip}"
        
        # Fallback to direct client IP
        if request.client:
            return f"ip:{request.client.host}"
        
        # Ultimate fallback
        return "unknown"


class EndpointRateLimiter:
    """Decorator-based rate limiter for specific endpoints."""
    
    _limiters: Dict[str, RateLimiter] = {}
    
    @classmethod
    def limit(
        cls,
        endpoint: str,
        max_requests: int,
        window_seconds: int
    ):
        """Create rate limiter decorator for endpoint.
        
        Args:
            endpoint: Endpoint identifier
            max_requests: Maximum requests allowed
            window_seconds: Time window in seconds
            
        Returns:
            Decorator function
        """
        if endpoint not in cls._limiters:
            cls._limiters[endpoint] = RateLimiter(max_requests, window_seconds)
        
        def decorator(func):
            async def wrapper(*args, **kwargs):
                # Get request object from args/kwargs
                request = None
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
                
                if request:
                    client_id = cls._get_client_id_from_request(request)
                    limiter = cls._limiters[endpoint]
                    
                    allowed, rate_info = limiter.is_allowed(f"{endpoint}:{client_id}")
                    
                    if not allowed:
                        logger.warning(
                            f"Endpoint rate limit exceeded for {client_id} on {endpoint}"
                        )
                        
                        raise RateLimitException(
                            limit=rate_info["limit"],
                            remaining=rate_info["remaining"],
                            reset_time=rate_info["reset_time"],
                            message=f"Endpoint rate limit exceeded: {endpoint}",
                            details=f"Client {client_id} exceeded rate limit for {endpoint}"
                        )
                
                return await func(*args, **kwargs)
            
            return wrapper
        return decorator
    
    @staticmethod
    def _get_client_id_from_request(request: Request) -> str:
        """Extract client ID from request."""
        if request.client:
            return request.client.host
        return "unknown"