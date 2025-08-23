"""SEO generation service specific exceptions."""

from typing import Any, Dict, Optional

from app.core.exceptions import BaseAPIException, ExternalServiceException
from app.schemas.error_responses import ErrorCode


class SEOException(BaseAPIException):
    """SEO generation related exceptions."""
    
    def __init__(
        self,
        error_code: ErrorCode,
        message: Optional[str] = None,
        **kwargs
    ):
        super().__init__(error_code, message, **kwargs)


class ContentLengthExceedException(SEOException):
    """Exception for content length exceeded errors."""
    
    def __init__(
        self,
        current_length: int,
        max_length: int,
        **kwargs
    ):
        super().__init__(
            error_code=ErrorCode.CONTENT_LENGTH_EXCEEDED,
            metadata={
                "current_length": current_length,
                "max_length": max_length,
                "exceeded_by": current_length - max_length,
                **kwargs.get("metadata", {})
            },
            **kwargs
        )


class KeywordValidationException(SEOException):
    """Exception for keyword validation errors."""
    
    def __init__(
        self,
        invalid_keywords: list,
        reason: str,
        **kwargs
    ):
        super().__init__(
            error_code=ErrorCode.KEYWORD_VALIDATION_FAILED,
            details=f"키워드 검증 실패: {reason}",
            metadata={
                "invalid_keywords": invalid_keywords,
                "validation_reason": reason,
                **kwargs.get("metadata", {})
            },
            **kwargs
        )


class SEOTemplateNotFoundException(SEOException):
    """Exception for SEO template not found errors."""
    
    def __init__(
        self,
        template_name: str,
        available_templates: Optional[list] = None,
        **kwargs
    ):
        super().__init__(
            error_code=ErrorCode.SEO_TEMPLATE_NOT_FOUND,
            details=f"SEO 템플릿 '{template_name}'을 찾을 수 없습니다.",
            metadata={
                "template_name": template_name,
                "available_templates": available_templates,
                **kwargs.get("metadata", {})
            },
            **kwargs
        )


class GPTAPIException(ExternalServiceException):
    """GPT API related exceptions."""
    
    def __init__(
        self,
        error_code: ErrorCode,
        gpt_error_code: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs
    ):
        super().__init__(
            error_code=error_code, 
            service_name="gpt_api",
            **kwargs
        )
        
        if gpt_error_code:
            self.metadata["gpt_error_code"] = gpt_error_code
        if model:
            self.metadata["gpt_model"] = model


class GPTQuotaExceededException(GPTAPIException):
    """Exception for GPT API quota exceeded errors."""
    
    def __init__(
        self,
        retry_after: Optional[int] = None,
        **kwargs
    ):
        super().__init__(
            error_code=ErrorCode.GPT_API_QUOTA_EXCEEDED,
            **kwargs
        )
        
        if retry_after:
            self.metadata["retry_after"] = retry_after


class GPTTokenLimitException(GPTAPIException):
    """Exception for GPT token limit exceeded errors."""
    
    def __init__(
        self,
        token_count: int,
        max_tokens: int,
        **kwargs
    ):
        super().__init__(
            error_code=ErrorCode.GPT_TOKEN_LIMIT_EXCEEDED,
            details=f"GPT 토큰 한도 초과: {token_count}/{max_tokens}",
            metadata={
                "token_count": token_count,
                "max_tokens": max_tokens,
                "exceeded_by": token_count - max_tokens,
                **kwargs.get("metadata", {})
            },
            **kwargs
        )


class GPTContentPolicyException(GPTAPIException):
    """Exception for GPT content policy violations."""
    
    def __init__(
        self,
        policy_violation: str,
        **kwargs
    ):
        super().__init__(
            error_code=ErrorCode.GPT_CONTENT_POLICY_VIOLATION,
            details=f"GPT 정책 위반: {policy_violation}",
            metadata={
                "policy_violation": policy_violation,
                **kwargs.get("metadata", {})
            },
            **kwargs
        )


def map_gpt_error_to_exception(error: Exception, model: str = "gpt-4o") -> GPTAPIException:
    """Map OpenAI API errors to custom exceptions.
    
    Args:
        error: OpenAI API error
        model: GPT model being used
        
    Returns:
        Mapped GPTAPIException
    """
    error_str = str(error).lower()
    
    # Rate limit / quota errors
    if "rate_limit" in error_str or "quota" in error_str:
        return GPTQuotaExceededException(
            model=model,
            details=f"GPT API 사용량 한도 초과: {error}"
        )
    
    # Token limit errors
    elif "token" in error_str and ("limit" in error_str or "maximum" in error_str):
        return GPTTokenLimitException(
            token_count=0,  # Could be extracted from error message
            max_tokens=4000,  # Default, could be model-specific
            model=model,
            details=f"GPT 토큰 한도 초과: {error}"
        )
    
    # Content policy violations
    elif "policy" in error_str or "violation" in error_str or "inappropriate" in error_str:
        return GPTContentPolicyException(
            policy_violation=str(error),
            model=model
        )
    
    # Timeout errors
    elif "timeout" in error_str or "timed out" in error_str:
        return GPTAPIException(
            error_code=ErrorCode.GPT_API_TIMEOUT,
            model=model,
            details=f"GPT API 응답 시간 초과: {error}"
        )
    
    # Generic API errors
    else:
        return GPTAPIException(
            error_code=ErrorCode.GPT_API_ERROR,
            model=model,
            details=f"GPT API 오류: {error}",
            gpt_error_code=type(error).__name__
        )