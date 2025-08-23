"""Circuit breaker pattern implementation for external service calls."""

import time
from enum import Enum
from typing import Any, Callable, Dict, Optional
from dataclasses import dataclass
from threading import Lock

from app.core.logging import get_logger

logger = get_logger(__name__)


class CircuitState(Enum):
    """Circuit breaker states."""
    
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Service is down, failing fast
    HALF_OPEN = "half_open"  # Testing if service is recovered


@dataclass
class CircuitBreakerConfig:
    """Configuration for circuit breaker."""
    
    failure_threshold: int = 5          # Number of failures to open circuit
    success_threshold: int = 3          # Number of successes to close circuit (from half-open)
    timeout_seconds: int = 60           # Time to wait before trying again (open -> half-open)
    max_failures_per_window: int = 10   # Max failures in sliding window
    window_seconds: int = 300           # Sliding window duration
    
    # Service-specific thresholds
    slow_call_threshold_ms: int = 5000  # Calls slower than this count as failures
    error_rate_threshold: float = 0.5   # Error rate to trigger circuit opening (0.0-1.0)


class CircuitBreaker:
    """Circuit breaker for protecting against failing external services."""
    
    def __init__(self, service_name: str, config: Optional[CircuitBreakerConfig] = None):
        """Initialize circuit breaker.
        
        Args:
            service_name: Name of the service being protected
            config: Circuit breaker configuration
        """
        self.service_name = service_name
        self.config = config or CircuitBreakerConfig()
        
        # Circuit state
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time = 0
        self._last_success_time = 0
        
        # Statistics
        self._total_calls = 0
        self._total_failures = 0
        self._total_successes = 0
        self._call_history = []  # List of (timestamp, success, duration_ms)
        
        # Thread safety
        self._lock = Lock()
        
        logger.info(f"Circuit breaker initialized for {service_name}")
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection.
        
        Args:
            func: Function to execute
            *args: Function arguments
            **kwargs: Function keyword arguments
            
        Returns:
            Function result
            
        Raises:
            CircuitBreakerOpenException: When circuit is open
            Exception: Original exception from function call
        """
        with self._lock:
            self._cleanup_old_calls()
            
            # Check if circuit should be opened based on error rate
            if self._state == CircuitState.CLOSED:
                self._check_error_rate()
            
            # Handle different circuit states
            if self._state == CircuitState.OPEN:
                if time.time() - self._last_failure_time >= self.config.timeout_seconds:
                    logger.info(f"Circuit breaker for {self.service_name} moving to HALF_OPEN")
                    self._state = CircuitState.HALF_OPEN
                    self._success_count = 0
                else:
                    # Fail fast
                    from app.core.exceptions import ExternalServiceException
                    from app.schemas.error_responses import ErrorCode
                    
                    estimated_recovery = int(
                        self._last_failure_time + self.config.timeout_seconds - time.time()
                    )
                    
                    raise ExternalServiceException(
                        error_code=ErrorCode.PERPLEXITY_API_UNAVAILABLE,
                        service_name=self.service_name,
                        service_status="circuit_open",
                        estimated_recovery=max(0, estimated_recovery),
                        details=f"Circuit breaker is OPEN. Service {self.service_name} is unavailable."
                    )
        
        # Execute the function call
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Check if call was too slow (counts as failure)
            if duration_ms > self.config.slow_call_threshold_ms:
                self._record_failure(duration_ms, "slow_call")
                logger.warning(
                    f"Slow call to {self.service_name}: {duration_ms}ms "
                    f"(threshold: {self.config.slow_call_threshold_ms}ms)"
                )
            else:
                self._record_success(duration_ms)
            
            return result
            
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            self._record_failure(duration_ms, str(type(e).__name__))
            raise
    
    async def acall(self, func: Callable, *args, **kwargs) -> Any:
        """Execute async function with circuit breaker protection.
        
        Args:
            func: Async function to execute
            *args: Function arguments
            **kwargs: Function keyword arguments
            
        Returns:
            Function result
            
        Raises:
            CircuitBreakerOpenException: When circuit is open
            Exception: Original exception from function call
        """
        with self._lock:
            self._cleanup_old_calls()
            
            # Check if circuit should be opened based on error rate
            if self._state == CircuitState.CLOSED:
                self._check_error_rate()
            
            # Handle different circuit states
            if self._state == CircuitState.OPEN:
                if time.time() - self._last_failure_time >= self.config.timeout_seconds:
                    logger.info(f"Circuit breaker for {self.service_name} moving to HALF_OPEN")
                    self._state = CircuitState.HALF_OPEN
                    self._success_count = 0
                else:
                    # Fail fast
                    from app.core.exceptions import ExternalServiceException
                    from app.schemas.error_responses import ErrorCode
                    
                    estimated_recovery = int(
                        self._last_failure_time + self.config.timeout_seconds - time.time()
                    )
                    
                    raise ExternalServiceException(
                        error_code=ErrorCode.PERPLEXITY_API_UNAVAILABLE,
                        service_name=self.service_name,
                        service_status="circuit_open",
                        estimated_recovery=max(0, estimated_recovery),
                        details=f"Circuit breaker is OPEN. Service {self.service_name} is unavailable."
                    )
        
        # Execute the async function call
        start_time = time.time()
        
        try:
            result = await func(*args, **kwargs)
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Check if call was too slow (counts as failure)
            if duration_ms > self.config.slow_call_threshold_ms:
                self._record_failure(duration_ms, "slow_call")
                logger.warning(
                    f"Slow call to {self.service_name}: {duration_ms}ms "
                    f"(threshold: {self.config.slow_call_threshold_ms}ms)"
                )
            else:
                self._record_success(duration_ms)
            
            return result
            
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            self._record_failure(duration_ms, str(type(e).__name__))
            raise
    
    def _record_success(self, duration_ms: int) -> None:
        """Record successful call."""
        current_time = time.time()
        
        with self._lock:
            self._total_calls += 1
            self._total_successes += 1
            self._last_success_time = current_time
            
            # Add to call history
            self._call_history.append((current_time, True, duration_ms))
            
            # Handle state transitions
            if self._state == CircuitState.HALF_OPEN:
                self._success_count += 1
                if self._success_count >= self.config.success_threshold:
                    logger.info(f"Circuit breaker for {self.service_name} moving to CLOSED")
                    self._state = CircuitState.CLOSED
                    self._failure_count = 0
            elif self._state == CircuitState.CLOSED:
                # Reset failure count on successful call
                self._failure_count = max(0, self._failure_count - 1)
    
    def _record_failure(self, duration_ms: int, error_type: str) -> None:
        """Record failed call."""
        current_time = time.time()
        
        with self._lock:
            self._total_calls += 1
            self._total_failures += 1
            self._last_failure_time = current_time
            self._failure_count += 1
            
            # Add to call history
            self._call_history.append((current_time, False, duration_ms))
            
            logger.warning(
                f"Circuit breaker for {self.service_name}: failure recorded "
                f"({error_type}, {duration_ms}ms, failure_count={self._failure_count})"
            )
            
            # Handle state transitions
            if self._state in [CircuitState.CLOSED, CircuitState.HALF_OPEN]:
                if self._failure_count >= self.config.failure_threshold:
                    logger.error(f"Circuit breaker for {self.service_name} moving to OPEN")
                    self._state = CircuitState.OPEN
                    self._success_count = 0
    
    def _check_error_rate(self) -> None:
        """Check if error rate exceeds threshold and open circuit if needed."""
        if len(self._call_history) < 5:  # Need minimum calls to calculate rate
            return
        
        recent_calls = [call for call in self._call_history 
                       if call[0] > time.time() - self.config.window_seconds]
        
        if len(recent_calls) < 5:
            return
        
        failures = sum(1 for call in recent_calls if not call[1])
        error_rate = failures / len(recent_calls)
        
        if error_rate >= self.config.error_rate_threshold:
            logger.warning(
                f"High error rate for {self.service_name}: {error_rate:.2%} "
                f"(threshold: {self.config.error_rate_threshold:.2%})"
            )
            if failures >= self.config.max_failures_per_window:
                logger.error(f"Circuit breaker for {self.service_name} opening due to high error rate")
                self._state = CircuitState.OPEN
                self._failure_count = failures
    
    def _cleanup_old_calls(self) -> None:
        """Remove old calls from history to prevent memory bloat."""
        cutoff_time = time.time() - self.config.window_seconds
        self._call_history = [call for call in self._call_history if call[0] > cutoff_time]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get circuit breaker statistics.
        
        Returns:
            Dictionary with circuit breaker statistics
        """
        with self._lock:
            self._cleanup_old_calls()
            
            recent_calls = [call for call in self._call_history 
                           if call[0] > time.time() - self.config.window_seconds]
            
            recent_failures = sum(1 for call in recent_calls if not call[1])
            recent_successes = sum(1 for call in recent_calls if call[1])
            
            avg_response_time = 0
            if recent_calls:
                avg_response_time = sum(call[2] for call in recent_calls) / len(recent_calls)
            
            return {
                "service_name": self.service_name,
                "state": self._state.value,
                "total_calls": self._total_calls,
                "total_failures": self._total_failures,
                "total_successes": self._total_successes,
                "failure_count": self._failure_count,
                "success_count": self._success_count,
                "recent_calls": len(recent_calls),
                "recent_failures": recent_failures,
                "recent_successes": recent_successes,
                "error_rate": recent_failures / len(recent_calls) if recent_calls else 0,
                "avg_response_time_ms": int(avg_response_time),
                "last_failure_time": self._last_failure_time,
                "last_success_time": self._last_success_time,
                "time_until_retry": max(0, int(
                    self._last_failure_time + self.config.timeout_seconds - time.time()
                )) if self._state == CircuitState.OPEN else 0
            }
    
    def reset(self) -> None:
        """Reset circuit breaker to closed state."""
        with self._lock:
            self._state = CircuitState.CLOSED
            self._failure_count = 0
            self._success_count = 0
            self._call_history = []
            logger.info(f"Circuit breaker for {self.service_name} reset to CLOSED")
    
    def force_open(self) -> None:
        """Force circuit breaker to open state."""
        with self._lock:
            self._state = CircuitState.OPEN
            self._last_failure_time = time.time()
            logger.warning(f"Circuit breaker for {self.service_name} forced to OPEN")


class CircuitBreakerRegistry:
    """Registry for managing multiple circuit breakers."""
    
    _breakers: Dict[str, CircuitBreaker] = {}
    _lock = Lock()
    
    @classmethod
    def get_breaker(
        cls,
        service_name: str,
        config: Optional[CircuitBreakerConfig] = None
    ) -> CircuitBreaker:
        """Get or create circuit breaker for service.
        
        Args:
            service_name: Name of the service
            config: Circuit breaker configuration
            
        Returns:
            CircuitBreaker instance
        """
        with cls._lock:
            if service_name not in cls._breakers:
                cls._breakers[service_name] = CircuitBreaker(service_name, config)
            return cls._breakers[service_name]
    
    @classmethod
    def get_all_stats(cls) -> Dict[str, Any]:
        """Get statistics for all circuit breakers.
        
        Returns:
            Dictionary with all circuit breaker statistics
        """
        with cls._lock:
            return {
                name: breaker.get_stats() 
                for name, breaker in cls._breakers.items()
            }
    
    @classmethod
    def reset_all(cls) -> None:
        """Reset all circuit breakers."""
        with cls._lock:
            for breaker in cls._breakers.values():
                breaker.reset()
            logger.info("All circuit breakers reset")
    
    @classmethod
    def remove_breaker(cls, service_name: str) -> bool:
        """Remove circuit breaker for service.
        
        Args:
            service_name: Name of the service
            
        Returns:
            True if breaker was removed, False if not found
        """
        with cls._lock:
            if service_name in cls._breakers:
                del cls._breakers[service_name]
                logger.info(f"Circuit breaker for {service_name} removed")
                return True
            return False