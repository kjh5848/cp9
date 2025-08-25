"""Exception handling system with separation of concerns.

This module provides a restructured exception system following SRP:
- Domain exceptions for business logic errors
- HTTP mapping for web API responses  
- Exception handling for conversion and logging
"""

# Domain exceptions
from app.core.exceptions.domain_exceptions import (
    BusinessLogicDomainException,
    DomainException,
    ExternalServiceDomainException,
    RateLimitDomainException,
    ResearchDomainException,
    ResourceDomainException,
    ValidationDomainException,
)

# HTTP mapping
from app.core.exceptions.http_exception_mapper import (
    HttpExceptionMapper,
    get_http_exception_mapper,
)

# Exception handling
from app.core.exceptions.exception_handler import (
    ExceptionHandler,
    get_exception_handler,
)

# Backward compatibility - maintain original interface
from app.core.exceptions.domain_exceptions import (
    DomainException as BaseAPIException,
    ValidationDomainException as ValidationException,
    ExternalServiceDomainException as ExternalServiceException,
    RateLimitDomainException as RateLimitException,
)

# Import from exceptions.py for backward compatibility and method injection
try:
    from ..exceptions import ErrorHandler, CoupangException
    # This import is crucial as it triggers _add_legacy_methods() execution
except ImportError:
    # Fallback if circular import occurs
    ErrorHandler = None
    CoupangException = None

__all__ = [
    # Domain exceptions
    "DomainException",
    "ValidationDomainException",
    "ResearchDomainException",
    "ExternalServiceDomainException",
    "RateLimitDomainException",
    "BusinessLogicDomainException",
    "ResourceDomainException",
    # HTTP mapping
    "HttpExceptionMapper",
    "get_http_exception_mapper",
    # Exception handling
    "ExceptionHandler",
    "get_exception_handler",
    # Backward compatibility
    "BaseAPIException",
    "ValidationException",
    "ExternalServiceException",
    "RateLimitException",
    "ErrorHandler",
    "CoupangException",
]
