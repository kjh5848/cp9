"""Utility functions for exponential backoff and retry logic."""

import asyncio
import random
import time
from typing import Any, Callable, Optional, Type, Union

from app.core.logging import get_logger

logger = get_logger(__name__)


class BackoffStrategy:
    """Base class for backoff strategies."""

    def calculate_delay(self, attempt: int) -> float:
        """Calculate delay for the given attempt number.

        Args:
            attempt: Attempt number (starting from 1)

        Returns:
            Delay in seconds
        """
        raise NotImplementedError


class ExponentialBackoff(BackoffStrategy):
    """Exponential backoff with optional jitter."""

    def __init__(
        self,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        multiplier: float = 2.0,
        jitter: bool = True,
    ):
        """Initialize exponential backoff.

        Args:
            base_delay: Base delay in seconds
            max_delay: Maximum delay in seconds
            multiplier: Multiplier for each attempt
            jitter: Whether to add random jitter
        """
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.multiplier = multiplier
        self.jitter = jitter

    def calculate_delay(self, attempt: int) -> float:
        """Calculate exponential backoff delay."""
        delay = self.base_delay * (self.multiplier ** (attempt - 1))
        delay = min(delay, self.max_delay)

        if self.jitter:
            # Add random jitter (±25% of delay)
            jitter_range = delay * 0.25
            delay += random.uniform(-jitter_range, jitter_range)
            delay = max(0, delay)  # Ensure non-negative

        return delay


class LinearBackoff(BackoffStrategy):
    """Linear backoff strategy."""

    def __init__(
        self, base_delay: float = 1.0, increment: float = 1.0, max_delay: float = 30.0
    ):
        """Initialize linear backoff.

        Args:
            base_delay: Base delay in seconds
            increment: Delay increment per attempt
            max_delay: Maximum delay in seconds
        """
        self.base_delay = base_delay
        self.increment = increment
        self.max_delay = max_delay

    def calculate_delay(self, attempt: int) -> float:
        """Calculate linear backoff delay."""
        delay = self.base_delay + (self.increment * (attempt - 1))
        return min(delay, self.max_delay)


class FixedBackoff(BackoffStrategy):
    """Fixed delay backoff strategy."""

    def __init__(self, delay: float = 1.0):
        """Initialize fixed backoff.

        Args:
            delay: Fixed delay in seconds
        """
        self.delay = delay

    def calculate_delay(self, attempt: int) -> float:
        """Calculate fixed delay."""
        return self.delay


def retry_sync(
    max_attempts: int = 3,
    backoff_strategy: Optional[BackoffStrategy] = None,
    exceptions: Union[Type[Exception], tuple] = Exception,
    on_retry: Optional[Callable[[int, Exception], None]] = None,
) -> Callable:
    """Decorator for synchronous retry with backoff.

    Args:
        max_attempts: Maximum number of attempts
        backoff_strategy: Backoff strategy to use
        exceptions: Exception types to catch and retry
        on_retry: Callback function called on each retry

    Returns:
        Decorator function
    """
    if backoff_strategy is None:
        backoff_strategy = ExponentialBackoff()

    def decorator(func: Callable) -> Callable:
        def wrapper(*args, **kwargs):
            attempt = 1

            while attempt <= max_attempts:
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts:
                        logger.error(
                            f"Function {func.__name__} failed after {max_attempts} attempts: {e}"
                        )
                        raise

                    delay = backoff_strategy.calculate_delay(attempt)

                    if on_retry:
                        on_retry(attempt, e)

                    logger.warning(
                        f"Function {func.__name__} failed on attempt {attempt}/{max_attempts}: {e}. "
                        f"Retrying in {delay:.2f} seconds..."
                    )

                    time.sleep(delay)
                    attempt += 1

        return wrapper

    return decorator


def retry_async(
    max_attempts: int = 3,
    backoff_strategy: Optional[BackoffStrategy] = None,
    exceptions: Union[Type[Exception], tuple] = Exception,
    on_retry: Optional[Callable[[int, Exception], None]] = None,
) -> Callable:
    """Decorator for asynchronous retry with backoff.

    Args:
        max_attempts: Maximum number of attempts
        backoff_strategy: Backoff strategy to use
        exceptions: Exception types to catch and retry
        on_retry: Callback function called on each retry

    Returns:
        Decorator function
    """
    if backoff_strategy is None:
        backoff_strategy = ExponentialBackoff()

    def decorator(func: Callable) -> Callable:
        async def wrapper(*args, **kwargs):
            attempt = 1

            while attempt <= max_attempts:
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts:
                        logger.error(
                            f"Function {func.__name__} failed after {max_attempts} attempts: {e}"
                        )
                        raise

                    delay = backoff_strategy.calculate_delay(attempt)

                    if on_retry:
                        on_retry(attempt, e)

                    logger.warning(
                        f"Function {func.__name__} failed on attempt {attempt}/{max_attempts}: {e}. "
                        f"Retrying in {delay:.2f} seconds..."
                    )

                    await asyncio.sleep(delay)
                    attempt += 1

        return wrapper

    return decorator


async def retry_async_function(
    func: Callable,
    *args,
    max_attempts: int = 3,
    backoff_strategy: Optional[BackoffStrategy] = None,
    exceptions: Union[Type[Exception], tuple] = Exception,
    **kwargs,
) -> Any:
    """Retry an async function with backoff.

    Args:
        func: Function to retry
        *args: Function positional arguments
        max_attempts: Maximum number of attempts
        backoff_strategy: Backoff strategy to use
        exceptions: Exception types to catch and retry
        **kwargs: Function keyword arguments

    Returns:
        Function result

    Raises:
        Exception: If all attempts fail
    """
    if backoff_strategy is None:
        backoff_strategy = ExponentialBackoff()

    attempt = 1

    while attempt <= max_attempts:
        try:
            return await func(*args, **kwargs)
        except exceptions as e:
            if attempt == max_attempts:
                logger.error(
                    f"Function {func.__name__} failed after {max_attempts} attempts: {e}"
                )
                raise

            delay = backoff_strategy.calculate_delay(attempt)

            logger.warning(
                f"Function {func.__name__} failed on attempt {attempt}/{max_attempts}: {e}. "
                f"Retrying in {delay:.2f} seconds..."
            )

            await asyncio.sleep(delay)
            attempt += 1


def calculate_total_backoff_time(
    max_attempts: int, backoff_strategy: BackoffStrategy
) -> float:
    """Calculate total time for all backoff attempts.

    Args:
        max_attempts: Maximum number of attempts
        backoff_strategy: Backoff strategy

    Returns:
        Total backoff time in seconds
    """
    total_time = 0.0
    for attempt in range(1, max_attempts):  # Don't count the last attempt
        total_time += backoff_strategy.calculate_delay(attempt)
    return total_time
