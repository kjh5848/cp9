"""Centralized error messages and constants for API responses."""

from typing import Dict

from app.schemas.error_responses import ErrorAction, ErrorCode, ErrorSeverity


class ErrorMessages:
    """Centralized error message constants."""

    # Korean user-facing messages
    KR_MESSAGES: Dict[ErrorCode, str] = {
        # Validation errors
        ErrorCode.VALIDATION_ERROR: "입력 데이터 검증에 실패했습니다.",
        ErrorCode.INVALID_REQUEST: "잘못된 요청입니다.",
        ErrorCode.INVALID_UUID_FORMAT: "잘못된 작업 ID 형식입니다.",
        ErrorCode.BATCH_SIZE_EXCEEDED: "한 번에 처리할 수 있는 항목 수를 초과했습니다.",
        ErrorCode.MISSING_REQUIRED_FIELDS: "필수 입력 항목이 누락되었습니다.",
        # Resource errors
        ErrorCode.RESOURCE_NOT_FOUND: "요청한 리소스를 찾을 수 없습니다.",
        ErrorCode.JOB_NOT_FOUND: "요청한 작업을 찾을 수 없습니다.",
        ErrorCode.TASK_NOT_FOUND: "요청한 태스크를 찾을 수 없습니다.",
        ErrorCode.JOB_CANNOT_BE_CANCELLED: "작업이 이미 완료되었거나 취소할 수 없는 상태입니다.",
        # Rate limiting
        ErrorCode.RATE_LIMIT_EXCEEDED: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
        ErrorCode.TOO_MANY_CONCURRENT_REQUESTS: "동시 요청 수가 너무 많습니다. 잠시 후 다시 시도해주세요.",
        # Coupang specific
        ErrorCode.COUPANG_DATA_UNAVAILABLE: "쿠팡 정보를 가져올 수 없습니다.",
        ErrorCode.COUPANG_PARTIAL_DATA: "쿠팡 정보 중 일부만 사용 가능합니다.",
        ErrorCode.COUPANG_EXTRACTION_FAILED: "쿠팡 데이터 추출에 실패했습니다.",
        # SEO generation error messages
        ErrorCode.SEO_GENERATION_FAILED: "SEO 콘텐츠 생성에 실패했습니다.",
        ErrorCode.CONTENT_LENGTH_EXCEEDED: "콘텐츠가 최대 허용 길이를 초과했습니다.",
        ErrorCode.KEYWORD_VALIDATION_FAILED: "키워드 검증에 실패했습니다.",
        ErrorCode.SEO_TEMPLATE_NOT_FOUND: "요청한 SEO 템플릿을 찾을 수 없습니다.",
        # GPT-4o API error messages
        ErrorCode.GPT_API_ERROR: "GPT API 호출 중 오류가 발생했습니다.",
        ErrorCode.GPT_API_TIMEOUT: "GPT API 응답 시간이 초과되었습니다.",
        ErrorCode.GPT_API_QUOTA_EXCEEDED: "GPT API 사용량 한도를 초과했습니다.",
        ErrorCode.GPT_CONTENT_POLICY_VIOLATION: "콘텐츠가 GPT 정책을 위반했습니다.",
        ErrorCode.GPT_TOKEN_LIMIT_EXCEEDED: "GPT 토큰 한도를 초과했습니다.",
        # External service errors
        ErrorCode.EXTERNAL_API_ERROR: "외부 서비스 연결에 문제가 발생했습니다.",
        ErrorCode.PERPLEXITY_API_ERROR: "AI 리서치 서비스에서 오류가 발생했습니다.",
        ErrorCode.PERPLEXITY_API_TIMEOUT: "AI 리서치 서비스 응답 시간이 초과되었습니다.",
        ErrorCode.PERPLEXITY_API_UNAVAILABLE: "AI 리서치 서비스가 일시적으로 사용할 수 없습니다.",
        # Internal server errors
        ErrorCode.INTERNAL_SERVER_ERROR: "서버 내부 오류가 발생했습니다.",
        ErrorCode.DATABASE_ERROR: "데이터베이스 연결에 문제가 발생했습니다.",
        ErrorCode.BACKGROUND_TASK_ERROR: "백그라운드 작업 처리 중 오류가 발생했습니다.",
        ErrorCode.SERVICE_UNAVAILABLE: "서비스가 일시적으로 사용할 수 없습니다.",
    }

    # English technical messages for developers
    EN_MESSAGES: Dict[ErrorCode, str] = {
        # Validation errors
        ErrorCode.VALIDATION_ERROR: "Input validation failed",
        ErrorCode.INVALID_REQUEST: "Invalid request",
        ErrorCode.INVALID_UUID_FORMAT: "Invalid UUID format",
        ErrorCode.BATCH_SIZE_EXCEEDED: "Batch size limit exceeded",
        ErrorCode.MISSING_REQUIRED_FIELDS: "Required fields missing",
        # Resource errors
        ErrorCode.RESOURCE_NOT_FOUND: "Resource not found",
        ErrorCode.JOB_NOT_FOUND: "Job not found",
        ErrorCode.TASK_NOT_FOUND: "Task not found",
        ErrorCode.JOB_CANNOT_BE_CANCELLED: "Job cannot be cancelled",
        # Rate limiting
        ErrorCode.RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
        ErrorCode.TOO_MANY_CONCURRENT_REQUESTS: "Too many concurrent requests",
        # Coupang specific
        ErrorCode.COUPANG_DATA_UNAVAILABLE: "Coupang data unavailable",
        ErrorCode.COUPANG_PARTIAL_DATA: "Partial Coupang data available",
        ErrorCode.COUPANG_EXTRACTION_FAILED: "Coupang data extraction failed",
        # SEO generation error messages
        ErrorCode.SEO_GENERATION_FAILED: "SEO content generation failed",
        ErrorCode.CONTENT_LENGTH_EXCEEDED: "Content length exceeded maximum limit",
        ErrorCode.KEYWORD_VALIDATION_FAILED: "Keyword validation failed",
        ErrorCode.SEO_TEMPLATE_NOT_FOUND: "SEO template not found",
        # GPT-4o API error messages
        ErrorCode.GPT_API_ERROR: "GPT API error occurred",
        ErrorCode.GPT_API_TIMEOUT: "GPT API request timeout",
        ErrorCode.GPT_API_QUOTA_EXCEEDED: "GPT API quota exceeded",
        ErrorCode.GPT_CONTENT_POLICY_VIOLATION: "Content violates GPT policy",
        ErrorCode.GPT_TOKEN_LIMIT_EXCEEDED: "GPT token limit exceeded",
        # External service errors
        ErrorCode.EXTERNAL_API_ERROR: "External API error",
        ErrorCode.PERPLEXITY_API_ERROR: "Perplexity API error",
        ErrorCode.PERPLEXITY_API_TIMEOUT: "Perplexity API timeout",
        ErrorCode.PERPLEXITY_API_UNAVAILABLE: "Perplexity API unavailable",
        # Internal server errors
        ErrorCode.INTERNAL_SERVER_ERROR: "Internal server error",
        ErrorCode.DATABASE_ERROR: "Database error",
        ErrorCode.BACKGROUND_TASK_ERROR: "Background task error",
        ErrorCode.SERVICE_UNAVAILABLE: "Service unavailable",
    }


class ErrorConfig:
    """Error configuration mappings."""

    # Error severity mapping
    SEVERITY_MAP: Dict[ErrorCode, ErrorSeverity] = {
        # Low severity - user can continue with minor inconvenience
        ErrorCode.COUPANG_PARTIAL_DATA: ErrorSeverity.LOW,
        ErrorCode.COUPANG_DATA_UNAVAILABLE: ErrorSeverity.LOW,
        ErrorCode.VALIDATION_ERROR: ErrorSeverity.LOW,
        ErrorCode.INVALID_REQUEST: ErrorSeverity.LOW,
        ErrorCode.INVALID_UUID_FORMAT: ErrorSeverity.LOW,
        # Medium severity - significant functionality affected
        ErrorCode.BATCH_SIZE_EXCEEDED: ErrorSeverity.MEDIUM,
        ErrorCode.MISSING_REQUIRED_FIELDS: ErrorSeverity.MEDIUM,
        ErrorCode.RESOURCE_NOT_FOUND: ErrorSeverity.MEDIUM,
        ErrorCode.JOB_NOT_FOUND: ErrorSeverity.MEDIUM,
        ErrorCode.TASK_NOT_FOUND: ErrorSeverity.MEDIUM,
        ErrorCode.JOB_CANNOT_BE_CANCELLED: ErrorSeverity.MEDIUM,
        ErrorCode.RATE_LIMIT_EXCEEDED: ErrorSeverity.MEDIUM,
        ErrorCode.TOO_MANY_CONCURRENT_REQUESTS: ErrorSeverity.MEDIUM,
        ErrorCode.COUPANG_EXTRACTION_FAILED: ErrorSeverity.MEDIUM,
        ErrorCode.PERPLEXITY_API_TIMEOUT: ErrorSeverity.MEDIUM,
        # High severity - core functionality affected
        ErrorCode.EXTERNAL_API_ERROR: ErrorSeverity.HIGH,
        ErrorCode.PERPLEXITY_API_ERROR: ErrorSeverity.HIGH,
        ErrorCode.PERPLEXITY_API_UNAVAILABLE: ErrorSeverity.HIGH,
        ErrorCode.DATABASE_ERROR: ErrorSeverity.HIGH,
        ErrorCode.BACKGROUND_TASK_ERROR: ErrorSeverity.HIGH,
        # Critical severity - system-wide issues
        ErrorCode.INTERNAL_SERVER_ERROR: ErrorSeverity.CRITICAL,
        ErrorCode.SERVICE_UNAVAILABLE: ErrorSeverity.CRITICAL,
        # SEO generation severity mapping
        ErrorCode.SEO_GENERATION_FAILED: ErrorSeverity.MEDIUM,
        ErrorCode.CONTENT_LENGTH_EXCEEDED: ErrorSeverity.LOW,
        ErrorCode.KEYWORD_VALIDATION_FAILED: ErrorSeverity.LOW,
        ErrorCode.SEO_TEMPLATE_NOT_FOUND: ErrorSeverity.MEDIUM,
        # GPT API severity mapping
        ErrorCode.GPT_API_ERROR: ErrorSeverity.HIGH,
        ErrorCode.GPT_API_TIMEOUT: ErrorSeverity.MEDIUM,
        ErrorCode.GPT_API_QUOTA_EXCEEDED: ErrorSeverity.HIGH,
        ErrorCode.GPT_CONTENT_POLICY_VIOLATION: ErrorSeverity.MEDIUM,
        ErrorCode.GPT_TOKEN_LIMIT_EXCEEDED: ErrorSeverity.LOW,
    }

    # Recommended actions mapping
    ACTION_MAP: Dict[ErrorCode, ErrorAction] = {
        # Check input actions
        ErrorCode.VALIDATION_ERROR: ErrorAction.CHECK_INPUT,
        ErrorCode.INVALID_REQUEST: ErrorAction.CHECK_INPUT,
        ErrorCode.INVALID_UUID_FORMAT: ErrorAction.CHECK_INPUT,
        ErrorCode.BATCH_SIZE_EXCEEDED: ErrorAction.CHECK_INPUT,
        ErrorCode.MISSING_REQUIRED_FIELDS: ErrorAction.CHECK_INPUT,
        ErrorCode.RESOURCE_NOT_FOUND: ErrorAction.CHECK_INPUT,
        ErrorCode.JOB_NOT_FOUND: ErrorAction.CHECK_INPUT,
        ErrorCode.TASK_NOT_FOUND: ErrorAction.CHECK_INPUT,
        ErrorCode.JOB_CANNOT_BE_CANCELLED: ErrorAction.CHECK_INPUT,
        # Retry later actions
        ErrorCode.RATE_LIMIT_EXCEEDED: ErrorAction.RETRY_LATER,
        ErrorCode.TOO_MANY_CONCURRENT_REQUESTS: ErrorAction.RETRY_LATER,
        ErrorCode.PERPLEXITY_API_TIMEOUT: ErrorAction.RETRY_LATER,
        ErrorCode.PERPLEXITY_API_UNAVAILABLE: ErrorAction.RETRY_LATER,
        ErrorCode.SERVICE_UNAVAILABLE: ErrorAction.RETRY_LATER,
        # Retry immediately actions
        ErrorCode.EXTERNAL_API_ERROR: ErrorAction.RETRY,
        ErrorCode.PERPLEXITY_API_ERROR: ErrorAction.RETRY,
        # No action needed
        ErrorCode.COUPANG_PARTIAL_DATA: ErrorAction.NO_ACTION,
        ErrorCode.COUPANG_DATA_UNAVAILABLE: ErrorAction.NO_ACTION,
        # Contact support actions
        ErrorCode.INTERNAL_SERVER_ERROR: ErrorAction.CONTACT_SUPPORT,
        ErrorCode.DATABASE_ERROR: ErrorAction.CONTACT_SUPPORT,
        ErrorCode.BACKGROUND_TASK_ERROR: ErrorAction.CONTACT_SUPPORT,
        ErrorCode.COUPANG_EXTRACTION_FAILED: ErrorAction.CONTACT_SUPPORT,
        # SEO generation action mapping
        ErrorCode.SEO_GENERATION_FAILED: ErrorAction.RETRY_LATER,
        ErrorCode.CONTENT_LENGTH_EXCEEDED: ErrorAction.CHECK_INPUT,
        ErrorCode.KEYWORD_VALIDATION_FAILED: ErrorAction.CHECK_INPUT,
        ErrorCode.SEO_TEMPLATE_NOT_FOUND: ErrorAction.CHECK_INPUT,
        # GPT API action mapping
        ErrorCode.GPT_API_ERROR: ErrorAction.RETRY_LATER,
        ErrorCode.GPT_API_TIMEOUT: ErrorAction.RETRY_LATER,
        ErrorCode.GPT_API_QUOTA_EXCEEDED: ErrorAction.CONTACT_SUPPORT,
        ErrorCode.GPT_CONTENT_POLICY_VIOLATION: ErrorAction.CHECK_INPUT,
        ErrorCode.GPT_TOKEN_LIMIT_EXCEEDED: ErrorAction.CHECK_INPUT,
    }

    # Retry delay mapping (in seconds)
    RETRY_DELAY_MAP: Dict[ErrorCode, int] = {
        ErrorCode.RATE_LIMIT_EXCEEDED: 3600,  # 1 hour
        ErrorCode.TOO_MANY_CONCURRENT_REQUESTS: 60,  # 1 minute
        ErrorCode.PERPLEXITY_API_TIMEOUT: 30,  # 30 seconds
        ErrorCode.PERPLEXITY_API_UNAVAILABLE: 300,  # 5 minutes
        ErrorCode.SERVICE_UNAVAILABLE: 1800,  # 30 minutes
        ErrorCode.EXTERNAL_API_ERROR: 10,  # 10 seconds
        ErrorCode.PERPLEXITY_API_ERROR: 5,  # 5 seconds
        # SEO generation retry delays
        ErrorCode.SEO_GENERATION_FAILED: 30,  # 30 seconds
        # GPT API retry delays
        ErrorCode.GPT_API_ERROR: 15,  # 15 seconds
        ErrorCode.GPT_API_TIMEOUT: 30,  # 30 seconds
        ErrorCode.GPT_API_QUOTA_EXCEEDED: 3600,  # 1 hour
    }
