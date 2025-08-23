# 🚨 공통 에러 핸들링 가이드

이 문서는 백엔드 서비스들이 공유하는 표준화된 에러 처리 시스템에 대한 완전한 가이드입니다.  
현재 **Product Research API**와 향후 추가될 **SEO 생성 API** 등 모든 서비스에서 일관된 에러 처리를 제공합니다.

## 📋 목차

1. [공통 에러 핸들러 구조](#1-공통-에러-핸들러-구조)
2. [새 서비스 추가 시 에러 코드 확장](#2-새-서비스-추가-시-에러-코드-확장)
3. [외부 API 에러 처리 패턴](#3-외부-api-에러-처리-패턴)
4. [프론트엔드 에러 처리 표준화](#4-프론트엔드-에러-처리-표준화)
5. [서비스별 특화 에러 처리](#5-서비스별-특화-에러-처리)

---

## 1. 공통 에러 핸들러 구조

### 🏗️ 에러 핸들링 아키텍처

```
📦 에러 처리 시스템
├── 🎯 app/schemas/error_responses.py    # 표준 응답 스키마
├── ⚡ app/core/exceptions.py           # 공통 예외 클래스
├── 🌐 app/core/error_handlers.py       # 글로벌 에러 핸들러
├── 📝 app/core/error_messages.py       # 다국어 메시지
└── 🔧 app/main.py                      # 핸들러 등록
```

### 🎯 표준 에러 응답 구조

모든 API 에러는 다음 구조로 표준화됩니다:

```python
{
    "error_code": "VALIDATION_ERROR",           # 고유 에러 코드
    "message": "입력 데이터 검증에 실패했습니다.",    # 사용자 친화적 메시지
    "details": "제품명은 필수 항목입니다.",         # 상세 정보
    "severity": "low",                         # low, medium, high, critical
    "recommended_action": "check_input",        # 권장 해결 방법
    "retry_after": null,                       # 재시도 권장 시간 (초)
    "metadata": {                              # 추가 메타데이터
        "field": "product_name",
        "received_value": null
    },
    "request_id": "req_12345",                 # 요청 추적 ID
    "timestamp": "2024-01-01T00:00:00Z"        # 에러 발생 시간
}
```

### ⚙️ 핵심 컴포넌트

#### 1. ErrorCode Enum (error_responses.py)
```python
class ErrorCode(str, Enum):
    # Validation (4xx)
    VALIDATION_ERROR = "VALIDATION_ERROR"
    BATCH_SIZE_EXCEEDED = "BATCH_SIZE_EXCEEDED"
    
    # Resource (4xx)
    JOB_NOT_FOUND = "JOB_NOT_FOUND"
    
    # Rate Limiting (429)
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    
    # External Services (5xx)
    PERPLEXITY_API_ERROR = "PERPLEXITY_API_ERROR"
    GPT_API_ERROR = "GPT_API_ERROR"          # 🆕 SEO 서비스용
    
    # Internal (5xx)
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
```

#### 2. BaseAPIException (exceptions.py)
```python
class BaseAPIException(Exception):
    """모든 API 예외의 기본 클래스"""
    
    def __init__(
        self,
        error_code: ErrorCode,
        message: Optional[str] = None,
        details: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        http_status: Optional[int] = None,
    ):
        # 자동 HTTP 상태 코드 매핑
        # 자동 다국어 메시지 선택
        # 구조화된 에러 응답 생성
```

#### 3. 글로벌 에러 핸들러 (error_handlers.py)
```python
def setup_error_handlers(app: FastAPI) -> None:
    """FastAPI 앱에 글로벌 에러 핸들러 등록"""
    
    # 커스텀 API 예외 처리
    app.add_exception_handler(BaseAPIException, base_api_exception_handler)
    
    # FastAPI HTTP 예외 처리  
    app.add_exception_handler(HTTPException, http_exception_handler)
    
    # 검증 에러 처리
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    
    # 예상치 못한 예외 처리 (catch-all)
    app.add_exception_handler(Exception, generic_exception_handler)
```

---

## 2. 새 서비스 추가 시 에러 코드 확장

### 🚀 SEO 생성 서비스 예시

새로운 서비스를 추가할 때는 다음 단계를 따르세요:

#### Step 1: 에러 코드 추가 (error_responses.py)
```python
class ErrorCode(str, Enum):
    # 기존 에러 코드들...
    
    # 🆕 SEO 생성 관련 에러 코드
    SEO_GENERATION_FAILED = "SEO_GENERATION_FAILED"
    CONTENT_LENGTH_EXCEEDED = "CONTENT_LENGTH_EXCEEDED"
    KEYWORD_VALIDATION_FAILED = "KEYWORD_VALIDATION_FAILED"
    SEO_TEMPLATE_NOT_FOUND = "SEO_TEMPLATE_NOT_FOUND"
    
    # 🆕 GPT-4o API 관련 에러 코드  
    GPT_API_ERROR = "GPT_API_ERROR"
    GPT_API_TIMEOUT = "GPT_API_TIMEOUT"
    GPT_API_QUOTA_EXCEEDED = "GPT_API_QUOTA_EXCEEDED"
    GPT_CONTENT_POLICY_VIOLATION = "GPT_CONTENT_POLICY_VIOLATION"
    GPT_TOKEN_LIMIT_EXCEEDED = "GPT_TOKEN_LIMIT_EXCEEDED"
```

#### Step 2: 한글 메시지 추가 (error_messages.py)
```python
KR_MESSAGES: Dict[ErrorCode, str] = {
    # 기존 메시지들...
    
    # SEO 생성 에러 메시지
    ErrorCode.SEO_GENERATION_FAILED: "SEO 콘텐츠 생성에 실패했습니다.",
    ErrorCode.CONTENT_LENGTH_EXCEEDED: "콘텐츠가 최대 허용 길이를 초과했습니다.",
    ErrorCode.KEYWORD_VALIDATION_FAILED: "키워드 검증에 실패했습니다.",
    ErrorCode.SEO_TEMPLATE_NOT_FOUND: "요청한 SEO 템플릿을 찾을 수 없습니다.",
    
    # GPT-4o API 에러 메시지
    ErrorCode.GPT_API_ERROR: "GPT API 호출 중 오류가 발생했습니다.",
    ErrorCode.GPT_API_TIMEOUT: "GPT API 응답 시간이 초과되었습니다.",
    ErrorCode.GPT_API_QUOTA_EXCEEDED: "GPT API 사용량 한도를 초과했습니다.",
    ErrorCode.GPT_CONTENT_POLICY_VIOLATION: "콘텐츠가 GPT 정책을 위반했습니다.",
    ErrorCode.GPT_TOKEN_LIMIT_EXCEEDED: "GPT 토큰 한도를 초과했습니다.",
}
```

#### Step 3: 심각도 및 권장 액션 매핑 (error_messages.py)
```python
SEVERITY_MAP: Dict[ErrorCode, ErrorSeverity] = {
    # 기존 매핑들...
    
    # SEO 생성 심각도
    ErrorCode.SEO_GENERATION_FAILED: ErrorSeverity.MEDIUM,
    ErrorCode.CONTENT_LENGTH_EXCEEDED: ErrorSeverity.LOW,
    ErrorCode.KEYWORD_VALIDATION_FAILED: ErrorSeverity.LOW,
    ErrorCode.SEO_TEMPLATE_NOT_FOUND: ErrorSeverity.MEDIUM,
    
    # GPT API 심각도
    ErrorCode.GPT_API_ERROR: ErrorSeverity.HIGH,
    ErrorCode.GPT_API_TIMEOUT: ErrorSeverity.MEDIUM,
    ErrorCode.GPT_API_QUOTA_EXCEEDED: ErrorSeverity.HIGH,
    ErrorCode.GPT_CONTENT_POLICY_VIOLATION: ErrorSeverity.MEDIUM,
    ErrorCode.GPT_TOKEN_LIMIT_EXCEEDED: ErrorSeverity.LOW,
}

ACTION_MAP: Dict[ErrorCode, ErrorAction] = {
    # 기존 매핑들...
    
    # SEO 생성 권장 액션
    ErrorCode.SEO_GENERATION_FAILED: ErrorAction.RETRY_LATER,
    ErrorCode.CONTENT_LENGTH_EXCEEDED: ErrorAction.CHECK_INPUT,
    ErrorCode.KEYWORD_VALIDATION_FAILED: ErrorAction.CHECK_INPUT,
    ErrorCode.SEO_TEMPLATE_NOT_FOUND: ErrorAction.CHECK_INPUT,
    
    # GPT API 권장 액션
    ErrorCode.GPT_API_ERROR: ErrorAction.RETRY_LATER,
    ErrorCode.GPT_API_TIMEOUT: ErrorAction.RETRY_LATER,
    ErrorCode.GPT_API_QUOTA_EXCEEDED: ErrorAction.CONTACT_SUPPORT,
    ErrorCode.GPT_CONTENT_POLICY_VIOLATION: ErrorAction.CHECK_INPUT,
    ErrorCode.GPT_TOKEN_LIMIT_EXCEEDED: ErrorAction.CHECK_INPUT,
}
```

#### Step 4: 서비스별 예외 클래스 (exceptions.py)
```python
class SEOException(BaseAPIException):
    """SEO 생성 관련 예외"""
    
    def __init__(
        self,
        error_code: ErrorCode,
        message: Optional[str] = None,
        **kwargs
    ):
        super().__init__(error_code, message, **kwargs)

class GPTAPIException(ExternalServiceException):
    """GPT API 관련 예외"""
    
    def __init__(
        self,
        error_code: ErrorCode,
        gpt_error_code: Optional[str] = None,
        **kwargs
    ):
        super().__init__(error_code, service_name="gpt_api", **kwargs)
        if gpt_error_code:
            self.metadata["gpt_error_code"] = gpt_error_code
```

---

## 3. 외부 API 에러 처리 패턴

### 🔄 Circuit Breaker 패턴 활용

외부 API (Perplexity, GPT-4o 등) 호출 시 Circuit Breaker를 사용하여 장애 전파를 방지합니다:

```python
# 1. Circuit Breaker 등록
circuit_breaker = CircuitBreaker(
    service_name="gpt_api",
    failure_threshold=5,        # 5회 실패 시 차단
    recovery_timeout=60,        # 60초 후 재시도
    expected_exception=GPTAPIException
)

# 2. API 호출 시 적용
async def generate_seo_content(prompt: str) -> str:
    try:
        response = await circuit_breaker.acall(
            gpt_client.chat.completions.create,
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    
    except openai.RateLimitError as e:
        raise GPTAPIException(
            error_code=ErrorCode.GPT_API_QUOTA_EXCEEDED,
            details=f"Rate limit exceeded: {e}",
            metadata={"retry_after": e.retry_after}
        )
    
    except openai.APITimeoutError as e:
        raise GPTAPIException(
            error_code=ErrorCode.GPT_API_TIMEOUT,
            details=f"API timeout: {e}"
        )
    
    except openai.APIError as e:
        if "content_policy_violation" in str(e):
            raise GPTAPIException(
                error_code=ErrorCode.GPT_CONTENT_POLICY_VIOLATION,
                details=f"Content policy violation: {e}"
            )
        else:
            raise GPTAPIException(
                error_code=ErrorCode.GPT_API_ERROR,
                details=f"GPT API error: {e}"
            )
```

### 📊 HTTP 상태 코드 매핑

외부 API별 에러 매핑 예시:

```python
def map_gpt_error_to_api_exception(error: Exception) -> GPTAPIException:
    """GPT API 에러를 내부 예외로 변환"""
    
    if isinstance(error, openai.AuthenticationError):
        return GPTAPIException(
            error_code=ErrorCode.EXTERNAL_API_ERROR,
            http_status=500,  # 내부 설정 문제
            details="GPT API 인증 실패"
        )
    
    elif isinstance(error, openai.PermissionDeniedError):
        return GPTAPIException(
            error_code=ErrorCode.GPT_API_ERROR,
            http_status=403,
            details="GPT API 권한 부족"
        )
    
    elif isinstance(error, openai.RateLimitError):
        return GPTAPIException(
            error_code=ErrorCode.GPT_API_QUOTA_EXCEEDED,
            http_status=429,
            details="GPT API 사용량 한도 초과",
            metadata={"retry_after": getattr(error, 'retry_after', 60)}
        )
    
    elif isinstance(error, openai.BadRequestError):
        return GPTAPIException(
            error_code=ErrorCode.GPT_TOKEN_LIMIT_EXCEEDED,
            http_status=400,
            details="GPT API 요청 형식 오류"
        )
    
    else:
        return GPTAPIException(
            error_code=ErrorCode.GPT_API_ERROR,
            http_status=500,
            details=f"알 수 없는 GPT API 오류: {error}"
        )
```

---

## 4. 프론트엔드 에러 처리 표준화

### 🎯 TypeScript 타입 정의

프론트엔드에서 사용할 표준 타입들:

```typescript
// 표준 에러 응답 타입
interface StandardErrorResponse {
  error_code: string;
  message: string;
  details?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommended_action: 'no_action' | 'retry' | 'check_input' | 'contact_support' | 'retry_later';
  retry_after?: number;
  metadata?: Record<string, any>;
  request_id?: string;
  timestamp: string;
}

// SEO 생성 에러 코드 타입
type SEOErrorCode = 
  | 'SEO_GENERATION_FAILED'
  | 'CONTENT_LENGTH_EXCEEDED'
  | 'KEYWORD_VALIDATION_FAILED'
  | 'SEO_TEMPLATE_NOT_FOUND'
  | 'GPT_API_ERROR'
  | 'GPT_API_TIMEOUT'
  | 'GPT_API_QUOTA_EXCEEDED'
  | 'GPT_CONTENT_POLICY_VIOLATION'
  | 'GPT_TOKEN_LIMIT_EXCEEDED';

// Product Research 에러 코드 타입
type ProductResearchErrorCode = 
  | 'VALIDATION_ERROR'
  | 'BATCH_SIZE_EXCEEDED'
  | 'JOB_NOT_FOUND'
  | 'PERPLEXITY_API_ERROR'
  | 'COUPANG_DATA_UNAVAILABLE';

// 통합 에러 코드 타입
type APIErrorCode = SEOErrorCode | ProductResearchErrorCode | 'RATE_LIMIT_EXCEEDED' | 'INTERNAL_SERVER_ERROR';
```

### ⚛️ React 에러 처리 훅

```typescript
// useAPIError.ts - 공통 에러 처리 훅
import { useState, useCallback } from 'react';

interface APIErrorState {
  error: StandardErrorResponse | null;
  isError: boolean;
  clearError: () => void;
  handleError: (error: any) => void;
}

export const useAPIError = (): APIErrorState => {
  const [error, setError] = useState<StandardErrorResponse | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: any) => {
    // Axios 에러 처리
    if (error.response?.data) {
      setError(error.response.data);
    }
    // Fetch 에러 처리  
    else if (error.json) {
      error.json().then(setError);
    }
    // 기타 에러
    else {
      setError({
        error_code: 'INTERNAL_SERVER_ERROR',
        message: '예상치 못한 오류가 발생했습니다.',
        severity: 'high',
        recommended_action: 'retry_later',
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  return {
    error,
    isError: error !== null,
    clearError,
    handleError
  };
};
```

### 🎨 에러 표시 컴포넌트

```typescript
// ErrorDisplay.tsx - 에러 표시 공통 컴포넌트
interface ErrorDisplayProps {
  error: StandardErrorResponse;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  onDismiss 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'yellow';
      case 'medium': return 'orange';
      case 'high': return 'red';
      case 'critical': return 'purple';
      default: return 'gray';
    }
  };

  const getActionButton = (action: string) => {
    switch (action) {
      case 'retry':
      case 'retry_later':
        return onRetry ? (
          <button onClick={onRetry} className="retry-btn">
            다시 시도
          </button>
        ) : null;
        
      case 'check_input':
        return (
          <span className="hint">
            입력 내용을 확인해주세요
          </span>
        );
        
      case 'contact_support':
        return (
          <a href="mailto:support@example.com" className="support-link">
            지원팀 문의
          </a>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={`error-display severity-${error.severity}`}>
      <div className="error-header">
        <span className="error-code">{error.error_code}</span>
        <span className={`severity-badge ${getSeverityColor(error.severity)}`}>
          {error.severity.toUpperCase()}
        </span>
        {onDismiss && (
          <button onClick={onDismiss} className="dismiss-btn">×</button>
        )}
      </div>
      
      <div className="error-content">
        <p className="error-message">{error.message}</p>
        {error.details && (
          <p className="error-details">{error.details}</p>
        )}
      </div>
      
      <div className="error-actions">
        {getActionButton(error.recommended_action)}
        {error.retry_after && (
          <span className="retry-hint">
            {error.retry_after}초 후 다시 시도해주세요
          </span>
        )}
      </div>
      
      {error.request_id && (
        <div className="error-footer">
          <small>Request ID: {error.request_id}</small>
        </div>
      )}
    </div>
  );
};
```

### 🚀 서비스별 에러 처리 예시

```typescript
// SEO 생성 서비스 에러 처리
const useSEOGeneration = () => {
  const { error, handleError, clearError } = useAPIError();
  const [isLoading, setIsLoading] = useState(false);

  const generateSEOContent = async (params: SEOGenerationParams) => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await fetch('/api/v1/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // GPT API 할당량 초과 시 특별 처리
        if (errorData.error_code === 'GPT_API_QUOTA_EXCEEDED') {
          // 사용자에게 별도 안내 메시지 표시
          showQuotaExceededModal(errorData);
          return;
        }
        
        // 콘텐츠 정책 위반 시 특별 처리
        if (errorData.error_code === 'GPT_CONTENT_POLICY_VIOLATION') {
          // 가이드라인 안내 모달 표시
          showContentPolicyModal(errorData);
          return;
        }
        
        handleError({ response: { data: errorData } });
        return;
      }

      const result = await response.json();
      return result;

    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateSEOContent,
    isLoading,
    error,
    clearError
  };
};
```

---

## 5. 서비스별 특화 에러 처리

### 🛍️ Product Research 서비스

#### 특화 에러 패턴:
```python
# Coupang 데이터 추출 실패 시 우아한 성능 저하
try:
    coupang_data = await extract_coupang_data(product_url)
except CoupangException as e:
    # Coupang 실패해도 일반 리서치는 계속 진행
    logger.warning(f"Coupang extraction failed: {e}")
    coupang_data = None
    
    # 사용자에게 부분 결과 안내
    raise CoupangException(
        error_code=ErrorCode.COUPANG_PARTIAL_DATA,
        details="Coupang 데이터 추출에 실패했지만 일반 리서치는 진행됩니다.",
        metadata={
            "fallback_available": True,
            "missing_data": ["product_image", "category_name"]
        }
    )
```

### 🔍 SEO 생성 서비스

#### 특화 에러 패턴:
```python
# 콘텐츠 길이 제한 처리
def validate_seo_content(content: str, max_length: int = 5000) -> None:
    if len(content) > max_length:
        raise SEOException(
            error_code=ErrorCode.CONTENT_LENGTH_EXCEEDED,
            details=f"생성된 콘텐츠가 최대 길이 {max_length}자를 초과했습니다.",
            metadata={
                "current_length": len(content),
                "max_length": max_length,
                "exceeded_by": len(content) - max_length
            }
        )

# GPT 토큰 제한 처리
def estimate_tokens_and_validate(prompt: str) -> None:
    estimated_tokens = len(prompt) // 4  # 대략적 추정
    max_tokens = 4000
    
    if estimated_tokens > max_tokens:
        raise GPTAPIException(
            error_code=ErrorCode.GPT_TOKEN_LIMIT_EXCEEDED,
            details=f"프롬프트가 GPT 토큰 제한을 초과합니다.",
            metadata={
                "estimated_tokens": estimated_tokens,
                "max_tokens": max_tokens,
                "suggestion": "더 짧은 텍스트로 다시 시도해주세요."
            }
        )
```

---

## 📚 참고 문서

### 🔗 관련 가이드
- **[Product Research 프론트엔드 가이드](frontend/API_INTEGRATION_GUIDE.md)**: Product Research API 통합 가이드
- **[개발 환경 설정](CLAUDE.md)**: 프로젝트 설정 및 개발 명령어

### 🌐 API 엔드포인트
- **[API 문서](http://localhost:8000/docs)**: Swagger UI (개발 서버 실행 시)
- **[헬스 체크](http://localhost:8000/api/v1/health)**: 서비스 상태 모니터링
- **[Circuit Breaker 상태](http://localhost:8000/api/v1/health/circuit-breakers)**: 외부 서비스 상태 확인

### 🚀 향후 서비스 가이드
- **SEO 생성 서비스**: GPT-4o 기반 SEO 콘텐츠 생성 API (개발 예정)

---

## 🛠️ 개발자 체크리스트

새 서비스 추가 시 다음 항목들을 확인하세요:

- [ ] `ErrorCode` enum에 서비스별 에러 코드 추가
- [ ] `error_messages.py`에 한글 메시지 추가
- [ ] 심각도 및 권장 액션 매핑 설정
- [ ] 서비스별 예외 클래스 정의
- [ ] Circuit breaker 설정 (외부 API 사용 시)
- [ ] 프론트엔드 TypeScript 타입 정의
- [ ] 통합 테스트 작성
- [ ] 문서 업데이트

---

*💡 **팁**: 이 가이드는 모든 백엔드 서비스의 일관성을 보장합니다. 새로운 패턴이나 개선사항이 있다면 이 문서를 먼저 업데이트하여 다른 개발자들과 공유하세요.*