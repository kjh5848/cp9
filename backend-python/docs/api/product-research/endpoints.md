# 🔌 제품 리서치 API 엔드포인트 명세

## 1. 제품 리서치 생성

### `POST /api/v1/research/products`

새로운 제품 리서치 작업을 생성합니다.

#### 요청

##### 쿼리 파라미터
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `use_celery` | boolean | ❌ | false | Celery 백그라운드 작업 사용 여부 |

##### 요청 본문
```json
{
  "items": [
    {
      "product_name": "베이직스 2024 베이직북 14 N-시리즈",
      "category": "가전디지털", 
      "price_exact": 388000,
      "currency": "KRW",
      "seller_or_store": "베이직스 공식몰",
      "metadata": {
        "source": "official_store",
        "priority": "high"
      }
    }
  ],
  "priority": 5,
  "callback_url": "https://your-domain.com/webhook/research-complete"
}
```

##### 스키마 검증
- `items`: 1-10개 배열 (MAX_RESEARCH_BATCH_SIZE)
- `product_name`: 1-500자 문자열
- `category`: 1-100자 문자열  
- `price_exact`: 양수
- `currency`: 지원되는 통화 (KRW, USD, JPY, EUR)
- `priority`: 1-10 정수
- `callback_url`: 유효한 URL 형식

#### 응답

##### 201 Created - 작업 생성 성공
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "results": [],
  "metadata": {
    "total_items": 1,
    "successful_items": 0,
    "failed_items": 0,
    "success_rate": 0.0,
    "processing_time_ms": null,
    "created_at": "2024-01-20T10:00:00.000Z",
    "updated_at": "2024-01-20T10:00:00.000Z",
    "started_at": null,
    "completed_at": null
  }
}
```

##### 400 Bad Request - 잘못된 요청
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "items"],
      "msg": "배치 크기가 최대 허용 개수를 초과했습니다.",
      "input": 15,
      "ctx": {
        "max_allowed": 10
      }
    }
  ]
}
```

#### 처리 흐름
1. **요청 검증**: Pydantic 스키마로 입력 데이터 검증
2. **도메인 변환**: DTO → Domain Entity 변환
3. **작업 생성**: ProductResearchJob 생성 및 저장
4. **처리 시작**: 
   - `use_celery=true`: Celery 태스크 큐에 추가
   - `use_celery=false`: 즉시 비동기 처리 시작
5. **응답 반환**: job_id와 초기 상태 반환

---

## 2. 리서치 결과 조회

### `GET /api/v1/research/products/{job_id}`

완료된 리서치 작업의 전체 결과를 조회합니다.

#### 요청

##### 경로 파라미터
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `job_id` | UUID | 작업 고유 식별자 |

##### 쿼리 파라미터  
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `include_failed` | boolean | ❌ | true | 실패한 아이템 결과 포함 여부 |

#### 응답

##### 200 OK - 조회 성공
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "results": [
    {
      "product_name": "베이직스 2024 베이직북 14 N-시리즈",
      "brand": "베이직스",
      "category": "가전디지털",
      "model_or_variant": "베이직북 14 N-시리즈",
      "price_exact": 388000,
      "currency": "KRW",
      "seller_or_store": "베이직스 공식몰",
      "deeplink_or_product_url": "https://basic-s.com/products/basicbook-14",
      "coupang_price": 385000,
      "specs": {
        "main": [
          "Intel N95 CPU",
          "RAM 8GB (16GB 옵션)",
          "SSD 256GB (512GB 옵션)", 
          "14.1형 IPS FHD 디스플레이"
        ],
        "attributes": [
          {
            "name": "CPU",
            "value": "Intel N95 프로세서"
          },
          {
            "name": "메모리", 
            "value": "8GB DDR4 (최대 16GB)"
          }
        ],
        "size_or_weight": "1.35kg",
        "options": ["8GB/256GB", "16GB/512GB"],
        "included_items": ["노트북 본체", "충전기", "사용설명서"]
      },
      "reviews": {
        "rating_avg": 4.3,
        "review_count": 41,
        "summary_positive": [
          "가성비가 뛰어나다",
          "휴대성이 좋다",
          "배터리 지속시간이 만족스럽다"
        ],
        "summary_negative": [
          "터치패드 감도가 아쉽다",
          "스피커 음질이 평균적이다"
        ],
        "notable_reviews": [
          {
            "source": "에누리",
            "quote": "휴대성이 괜찮고 저렴한 티가 나지 않아 좋았습니다.",
            "url": "https://www.enuri.com/knowcom/detail.jsp?kbno=3463094"
          }
        ]
      },
      "sources": [
        "https://basic-s.com",
        "https://www.enuri.com", 
        "https://prod.danawa.com"
      ],
      "captured_at": "2024-01-20",
      "status": "success"
    }
  ],
  "metadata": {
    "total_items": 1,
    "successful_items": 1,
    "failed_items": 0,
    "success_rate": 1.0,
    "processing_time_ms": 3500,
    "created_at": "2024-01-20T10:00:00.000Z",
    "updated_at": "2024-01-20T10:00:03.500Z",
    "started_at": "2024-01-20T10:00:00.100Z",
    "completed_at": "2024-01-20T10:00:03.500Z"
  }
}
```

##### 404 Not Found - 작업을 찾을 수 없음
```json
{
  "detail": "작업 ID 550e8400-e29b-41d4-a716-446655440000를 찾을 수 없습니다."
}
```

#### 결과 필터링
- `include_failed=true`: 모든 결과 (성공 + 실패)
- `include_failed=false`: 성공한 결과만

---

## 3. 작업 상태 확인

### `GET /api/v1/research/products/{job_id}/status`

리서치 작업의 현재 진행 상황을 실시간으로 확인합니다.

#### 요청

##### 경로 파라미터
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `job_id` | string | 작업 ID (UUID 또는 Celery 태스크 ID) |

##### 쿼리 파라미터
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `is_celery` | boolean | ❌ | false | Celery 작업 여부 |

#### 응답

##### 200 OK - 일반 작업 상태
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": 0.7,
  "message": "10개 중 7개 처리 완료",
  "metadata": {
    "total": 10,
    "successful": 6,
    "failed": 1
  }
}
```

##### 200 OK - Celery 작업 상태
```json
{
  "job_id": "celery-task-123-456-789",
  "status": "processing",
  "progress": 0.3,
  "message": "리서치 진행 중...",
  "metadata": {
    "current_step": "데이터 수집",
    "estimated_completion": "30초"
  }
}
```

#### 상태 값
| 상태 | 설명 | 진행률 |
|------|------|--------|
| `pending` | 대기 중 | 0.0 |
| `processing` | 처리 중 | 0.0 ~ 0.99 |
| `success` | 완료 | 1.0 |
| `error` | 오류 | - |

#### 폴링 권장사항
- **폴링 간격**: 2-5초
- **최대 대기 시간**: 300초 (5분)
- **타임아웃 처리**: 응답 없을 시 에러 처리

---

## 4. 작업 취소

### `DELETE /api/v1/research/products/{job_id}`

진행 중인 리서치 작업을 취소합니다.

#### 요청

##### 경로 파라미터
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `job_id` | UUID | 취소할 작업 ID |

#### 응답

##### 204 No Content - 취소 성공
응답 본문 없음

##### 404 Not Found - 작업을 찾을 수 없음
```json
{
  "detail": "작업 ID 550e8400-e29b-41d4-a716-446655440000를 찾을 수 없습니다."
}
```

##### 400 Bad Request - 취소할 수 없는 상태
```json
{
  "detail": "작업이 이미 완료되었거나 취소할 수 없는 상태입니다."
}
```

#### 취소 가능 조건
- 작업 상태가 `pending` 또는 `processing`
- Celery 작업의 경우 워커에서 실행 중이 아닌 상태

---

## 공통 에러 응답

### 422 Validation Error - 입력 검증 실패
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "items", 0, "product_name"],
      "msg": "String should have at least 1 character",
      "input": "",
      "ctx": {
        "min_length": 1
      }
    }
  ]
}
```

### 429 Too Many Requests - 요청 제한 초과
```json
{
  "detail": "요청 제한을 초과했습니다. 잠시 후 다시 시도하세요."
}
```

### 500 Internal Server Error - 서버 오류
```json
{
  "detail": "리서치 작업 생성에 실패했습니다."
}
```

## 성능 고려사항

### 응답 시간
- **작업 생성**: < 200ms
- **상태 확인**: < 100ms  
- **결과 조회**: < 500ms (결과 크기에 따라)
- **작업 취소**: < 100ms

### 동시성
- 최대 동시 리서치 작업: 5개 (환경변수로 조정)
- 데이터베이스 연결: 풀링으로 최적화
- Celery 워커: 수평 확장 가능

### 캐싱 전략 (구현 예정)
- 동일 제품 24시간 캐싱
- Redis 기반 결과 캐싱
- ETL 기반 캐시 무효화