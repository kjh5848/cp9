"""Application constants and configuration values."""

import os
from typing import Final

# Research Batch Configuration
MAX_RESEARCH_BATCH_SIZE: Final[int] = int(os.getenv("MAX_RESEARCH_BATCH_SIZE", "10"))
DEFAULT_RESEARCH_BATCH_SIZE: Final[int] = int(os.getenv("DEFAULT_RESEARCH_BATCH_SIZE", "5"))
MIN_RESEARCH_BATCH_SIZE: Final[int] = int(os.getenv("MIN_RESEARCH_BATCH_SIZE", "1"))

# Perplexity API Models
PERPLEXITY_MODEL_SONAR_PRO: Final[str] = "sonar-pro"
PERPLEXITY_MODEL_SONAR_SMALL: Final[str] = "llama-3.1-sonar-small-128k-online"
PERPLEXITY_MODEL_SONAR_LARGE: Final[str] = "llama-3.1-sonar-large-128k-online"
PERPLEXITY_MODEL_SONAR_HUGE: Final[str] = "llama-3.1-sonar-huge-128k-online"

# Default Model
DEFAULT_PERPLEXITY_MODEL: Final[str] = os.getenv("PERPLEXITY_MODEL", PERPLEXITY_MODEL_SONAR_PRO)

# API Response Configuration
MAX_TOKENS_PER_ITEM: Final[int] = 2500
DEFAULT_TEMPERATURE: Final[float] = 0.1  # Low temperature for factual responses
MAX_SOURCES_PER_ITEM: Final[int] = 5
MIN_SOURCES_REQUIRED: Final[int] = 3

# Validation Rules
MIN_RATING: Final[float] = 0.0
MAX_RATING: Final[float] = 5.0
MIN_REVIEW_COUNT: Final[int] = 0

# Currency
DEFAULT_CURRENCY: Final[str] = "KRW"
SUPPORTED_CURRENCIES: Final[list] = ["KRW", "USD", "EUR", "JPY", "CNY"]

# Status Messages
STATUS_TOO_MANY_ITEMS: Final[str] = "too_many_items"
STATUS_INSUFFICIENT_SOURCES: Final[str] = "insufficient_sources"
STATUS_SUCCESS: Final[str] = "success"
STATUS_ERROR: Final[str] = "error"

# Required Fields for Product Research
REQUIRED_REVIEW_FIELDS: Final[list] = ["rating_avg", "review_count"]
REQUIRED_PRODUCT_FIELDS: Final[list] = ["product_name", "category", "price_exact", "currency"]

# Categories
PRODUCT_CATEGORIES: Final[dict] = {
    "electronics": "가전디지털",
    "fashion_women": "여성패션",
    "fashion_men": "남성패션",
    "fashion_kids": "유아동패션",
    "beauty": "뷰티",
    "baby": "출산/유아동",
    "food": "식품",
    "kitchen": "주방용품",
    "living": "생활용품",
    "home_interior": "홈인테리어",
    "sports": "스포츠/레저",
    "auto": "자동차용품",
    "books": "도서/음반/DVD",
    "toys": "완구/취미",
    "office": "문구/오피스",
    "health": "헬스/건강식품",
    "travel_domestic": "국내여행",
    "travel_overseas": "해외여행"
}

# Error Messages
ERROR_TOO_MANY_ITEMS: Final[str] = "요청한 아이템 수가 최대 허용 개수를 초과했습니다."
ERROR_INSUFFICIENT_SOURCES: Final[str] = "충분한 정보 소스를 찾을 수 없습니다."
ERROR_INVALID_RATING: Final[str] = "평점은 0에서 5 사이여야 합니다."
ERROR_MISSING_REQUIRED_FIELDS: Final[str] = "필수 필드가 누락되었습니다."

# Swagger/OpenAPI Tags
API_TAGS: Final[list] = [
    {
        "name": "제품 리서치",
        "description": "Perplexity AI를 활용한 제품 정보 리서치 API"
    },
    {
        "name": "작업 관리",
        "description": "리서치 작업 상태 관리 및 조회"
    },
    {
        "name": "헬스체크",
        "description": "시스템 상태 확인"
    }
]