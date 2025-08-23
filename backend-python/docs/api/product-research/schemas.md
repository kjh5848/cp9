# 📋 제품 리서치 API 스키마 및 검증 규칙

## 입력 스키마 (Request Schemas)

### ProductItemRequest

개별 제품 리서치 요청 스키마

```python
class ProductItemRequest(BaseModel):
    product_name: str = Field(
        ..., 
        min_length=1, 
        max_length=500,
        description="제품명",
        examples=["베이직스 2024 베이직북 14 N-시리즈"]
    )
    category: str = Field(
        ..., 
        min_length=1, 
        max_length=100,
        description="제품 카테고리",
        examples=["가전디지털", "뷰티", "식품", "패션"]
    )
    price_exact: float = Field(
        ..., 
        gt=0,
        description="정확한 제품 가격",
        examples=[388000, 50000.0]
    )
    currency: str = Field(
        default="KRW",
        description="통화 단위",
        examples=["KRW", "USD", "JPY", "EUR"]
    )
    seller_or_store: Optional[str] = Field(
        None,
        max_length=200,
        description="판매자 또는 스토어명",
        examples=["베이직스 공식몰", "쿠팡", "네이버쇼핑"]
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="추가 메타데이터",
        examples=[{"source": "official_store", "priority": "high"}]
    )

    @field_validator('currency')
    @classmethod
    def validate_currency(cls, v: str) -> str:
        if v not in SUPPORTED_CURRENCIES:
            raise ValueError(f"지원되지 않는 통화입니다. 지원 통화: {SUPPORTED_CURRENCIES}")
        return v

    @field_validator('price_exact')
    @classmethod  
    def validate_price(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("가격은 0보다 커야 합니다.")
        if v > 999999999:  # 10억 미만
            raise ValueError("가격이 너무 큽니다.")
        return v
```

### ProductResearchRequest

제품 리서치 배치 요청 스키마

```python
class ProductResearchRequest(BaseModel):
    items: List[ProductItemRequest] = Field(
        ...,
        min_items=MIN_RESEARCH_BATCH_SIZE,  # 1
        max_items=MAX_RESEARCH_BATCH_SIZE,  # 10
        description="리서치할 제품 목록"
    )
    priority: int = Field(
        default=5,
        ge=1,
        le=10,
        description="작업 우선순위 (1=낮음, 10=높음)"
    )
    callback_url: Optional[AnyHttpUrl] = Field(
        None,
        description="완료 시 콜백 URL"
    )

    @field_validator('items')
    @classmethod
    def validate_items_uniqueness(cls, v: List[ProductItemRequest]) -> List[ProductItemRequest]:
        """아이템 중복 제거 (product_name + price_exact 기준)"""
        seen = set()
        unique_items = []
        
        for item in v:
            key = (item.product_name.lower().strip(), item.price_exact)
            if key not in seen:
                seen.add(key)
                unique_items.append(item)
        
        if len(unique_items) != len(v):
            logger.warning(f"중복 아이템 제거됨: {len(v)} -> {len(unique_items)}")
        
        return unique_items

    @model_validator(mode='after')
    def validate_batch_size(self) -> 'ProductResearchRequest':
        if len(self.items) > MAX_RESEARCH_BATCH_SIZE:
            raise ValueError(f"최대 {MAX_RESEARCH_BATCH_SIZE}개까지 리서치 가능합니다.")
        return self
```

### JobStatusRequest

작업 상태 확인 요청 스키마

```python  
class JobStatusRequest(BaseModel):
    job_id: str = Field(
        ...,
        description="작업 ID (UUID 또는 Celery 태스크 ID)"
    )
    is_celery: bool = Field(
        default=False,
        description="Celery 작업 여부"
    )

    @field_validator('job_id')
    @classmethod
    def validate_job_id(cls, v: str) -> str:
        if not v or len(v.strip()) == 0:
            raise ValueError("작업 ID는 비어있을 수 없습니다.")
        
        # UUID 형식 검증 (일반 작업)
        if not v.startswith('celery-'):
            try:
                UUID(v)
            except ValueError:
                raise ValueError("올바른 UUID 형식이 아닙니다.")
        
        return v.strip()
```

---

## 출력 스키마 (Response Schemas)

### ProductAttribute

제품 속성 스키마

```python
class ProductAttribute(BaseModel):
    name: str = Field(..., description="속성명")
    value: str = Field(..., description="속성값")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "CPU",
                "value": "Intel N95 프로세서"
            }
        }
```

### ProductSpecs

제품 스펙 스키마

```python
class ProductSpecs(BaseModel):
    main: List[str] = Field(
        default_factory=list,
        description="주요 스펙 목록"
    )
    attributes: List[ProductAttribute] = Field(
        default_factory=list,
        description="상세 속성 목록"
    )
    size_or_weight: Optional[str] = Field(
        None,
        description="크기 또는 무게"
    )
    options: List[str] = Field(
        default_factory=list,
        description="옵션 목록"
    )
    included_items: List[str] = Field(
        default_factory=list,
        description="포함된 아이템 목록"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "main": ["Intel N95 CPU", "RAM 8GB", "SSD 256GB"],
                "attributes": [
                    {"name": "CPU", "value": "Intel N95"},
                    {"name": "RAM", "value": "8GB DDR4"}
                ],
                "size_or_weight": "1.35kg",
                "options": ["8GB/256GB", "16GB/512GB"],
                "included_items": ["노트북 본체", "충전기"]
            }
        }
```

### NotableReview

주목할만한 리뷰 스키마

```python
class NotableReview(BaseModel):
    source: str = Field(..., description="출처")
    quote: str = Field(..., description="리뷰 내용")
    url: Optional[AnyHttpUrl] = Field(None, description="리뷰 URL")

    @field_validator('quote')
    @classmethod
    def validate_quote_length(cls, v: str) -> str:
        if len(v) > 500:
            return v[:497] + "..."
        return v
```

### ProductReviews

제품 리뷰 스키마

```python
class ProductReviews(BaseModel):
    rating_avg: float = Field(
        default=0.0,
        ge=0.0,
        le=5.0,
        description="평균 평점 (0-5)"
    )
    review_count: int = Field(
        default=0,
        ge=0,
        description="리뷰 개수"
    )
    summary_positive: List[str] = Field(
        default_factory=list,
        description="긍정적 리뷰 요약"
    )
    summary_negative: List[str] = Field(
        default_factory=list,
        description="부정적 리뷰 요약"
    )
    notable_reviews: List[NotableReview] = Field(
        default_factory=list,
        description="주목할만한 리뷰"
    )

    @field_validator('rating_avg')
    @classmethod
    def validate_rating(cls, v: float) -> float:
        return round(v, 1)  # 소수점 1자리로 반올림

    @model_validator(mode='after')
    def validate_reviews_consistency(self) -> 'ProductReviews':
        """평점과 리뷰 수의 일관성 검증"""
        if self.rating_avg > 0 and self.review_count == 0:
            logger.warning("평점은 있지만 리뷰 수가 0입니다.")
        elif self.rating_avg == 0 and self.review_count > 0:
            logger.warning("리뷰 수는 있지만 평점이 0입니다.")
        return self
```

### ProductResultResponse

제품 리서치 결과 스키마

```python
class ProductResultResponse(BaseModel):
    product_name: str = Field(..., description="제품명")
    brand: str = Field(default="", description="브랜드명")
    category: str = Field(..., description="카테고리")
    model_or_variant: str = Field(default="", description="모델/변형")
    price_exact: float = Field(..., description="정확한 가격")
    currency: str = Field(default="KRW", description="통화")
    seller_or_store: Optional[str] = Field(None, description="판매자/스토어")
    deeplink_or_product_url: Optional[AnyHttpUrl] = Field(None, description="제품 URL")
    coupang_price: Optional[float] = Field(None, description="쿠팡 가격")
    specs: ProductSpecs = Field(default_factory=ProductSpecs, description="제품 스펙")
    reviews: ProductReviews = Field(default_factory=ProductReviews, description="리뷰 정보")
    sources: List[AnyHttpUrl] = Field(default_factory=list, description="정보 출처")
    captured_at: str = Field(
        default_factory=lambda: datetime.now().strftime("%Y-%m-%d"),
        description="수집 일자"
    )
    status: ResearchStatusEnum = Field(..., description="리서치 상태")
    error_message: Optional[str] = Field(None, description="에러 메시지")
    missing_fields: List[str] = Field(default_factory=list, description="누락된 필드")
    suggested_queries: List[str] = Field(default_factory=list, description="제안 검색어")

    @field_validator('sources')
    @classmethod
    def validate_sources_count(cls, v: List[str]) -> List[str]:
        """최소 출처 개수 검증"""
        if len(v) < 3:
            logger.warning(f"출처가 부족합니다: {len(v)}개 (최소 3개 권장)")
        return v
```

### ResearchMetadataResponse

리서치 메타데이터 스키마

```python
class ResearchMetadataResponse(BaseModel):
    total_items: int = Field(..., ge=0, description="전체 아이템 수")
    successful_items: int = Field(..., ge=0, description="성공한 아이템 수")
    failed_items: int = Field(..., ge=0, description="실패한 아이템 수")
    success_rate: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="성공률 (0.0-1.0)"
    )
    processing_time_ms: Optional[int] = Field(
        None, 
        ge=0, 
        description="처리 시간 (밀리초)"
    )
    created_at: datetime = Field(..., description="작업 생성 시간")
    updated_at: datetime = Field(..., description="마지막 업데이트 시간")
    started_at: Optional[datetime] = Field(None, description="작업 시작 시간")
    completed_at: Optional[datetime] = Field(None, description="작업 완료 시간")

    @field_validator('success_rate')
    @classmethod
    def validate_success_rate(cls, v: float) -> float:
        return round(v, 3)  # 소수점 3자리로 반올림

    @model_validator(mode='after')
    def validate_items_count(self) -> 'ResearchMetadataResponse':
        """아이템 수 일관성 검증"""
        if self.successful_items + self.failed_items > self.total_items:
            raise ValueError("성공+실패 아이템 수가 전체 아이템 수를 초과할 수 없습니다.")
        return self
```

### ProductResearchResponse

제품 리서치 전체 응답 스키마

```python
class ProductResearchResponse(BaseModel):
    job_id: str = Field(..., description="작업 ID")
    status: str = Field(..., description="작업 상태")
    results: List[ProductResultResponse] = Field(
        default_factory=list, 
        description="리서치 결과 목록"
    )
    metadata: ResearchMetadataResponse = Field(..., description="메타데이터")

    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "550e8400-e29b-41d4-a716-446655440000",
                "status": "success",
                "results": [...],
                "metadata": {
                    "total_items": 1,
                    "successful_items": 1,
                    "failed_items": 0,
                    "success_rate": 1.0,
                    "processing_time_ms": 3500
                }
            }
        }
```

### JobStatusResponse

작업 상태 응답 스키마

```python
class JobStatusResponse(BaseModel):
    job_id: str = Field(..., description="작업 ID")
    status: str = Field(..., description="현재 상태")
    progress: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="진행률 (0.0-1.0)"
    )
    message: Optional[str] = Field(None, description="상태 메시지")
    metadata: Optional[Dict[str, Any]] = Field(
        None, 
        description="추가 메타데이터"
    )

    @field_validator('progress')
    @classmethod
    def validate_progress(cls, v: float) -> float:
        return round(v, 2)  # 소수점 2자리로 반올림
```

---

## 상수 및 제약사항

### 환경변수 기반 제약사항

```python
# app/core/constants.py

# 배치 크기 제한
MIN_RESEARCH_BATCH_SIZE = 1
DEFAULT_RESEARCH_BATCH_SIZE = 5
MAX_RESEARCH_BATCH_SIZE = 10  # 환경변수로 조정 가능

# 통화 지원
SUPPORTED_CURRENCIES = ["KRW", "USD", "JPY", "EUR"]
DEFAULT_CURRENCY = "KRW"

# 처리 제한
MAX_CONCURRENT_REQUESTS = 5
REQUEST_TIMEOUT = 60  # 초
RETRY_MAX_ATTEMPTS = 3
RETRY_BASE_DELAY = 1  # 초
RETRY_BACKOFF_MULTIPLIER = 2

# 품질 요구사항
MIN_SOURCES_COUNT = 3
MIN_RATING_FOR_VALID = 0.1
MIN_REVIEW_COUNT_FOR_VALID = 1
```

### 검증 우선순위

1. **Pydantic 필드 검증**: 타입, 길이, 범위
2. **커스텀 검증자**: 비즈니스 규칙
3. **모델 검증자**: 필드 간 일관성
4. **서비스 레이어 검증**: 도메인 규칙
5. **인프라 레이어 검증**: 외부 시스템 제약

### 에러 메시지 국제화

```python
ERROR_MESSAGES = {
    "ko": {
        "invalid_currency": "지원되지 않는 통화입니다.",
        "batch_size_exceeded": "배치 크기가 최대 허용 개수를 초과했습니다.",
        "invalid_price": "가격은 0보다 커야 합니다.",
        "job_not_found": "작업을 찾을 수 없습니다.",
        "cannot_cancel": "작업을 취소할 수 없는 상태입니다."
    },
    "en": {
        "invalid_currency": "Unsupported currency.",
        "batch_size_exceeded": "Batch size exceeds maximum allowed.",
        "invalid_price": "Price must be greater than 0.",
        "job_not_found": "Job not found.",
        "cannot_cancel": "Cannot cancel job in current state."
    }
}
```

## 성능 최적화

### 직렬화 최적화
- `orjson` 사용으로 JSON 직렬화 성능 향상
- 큰 객체에 대한 지연 로딩
- 불필요한 필드 제외 옵션

### 검증 최적화
- 가장 빠른 검증부터 실행
- 비용이 큰 검증은 마지막에 수행
- 캐시 가능한 검증 결과 저장