# 📚 제품 리서치 API 레퍼런스

## 개요

Perplexity AI를 활용한 제품 정보 리서치 API입니다. 최대 10개의 제품을 동시에 리서치하여 상세 정보, 리뷰, 가격 비교 등을 제공합니다.

## 기본 정보

- **Base URL**: `http://localhost:8000/api/v1`
- **API 버전**: 1.0.0
- **인증**: 현재 인증 없음 (프로덕션에서는 API 키 추가 필요)

## 엔드포인트

### 1. 제품 리서치 요청

**POST** `/research/products`

최대 10개의 제품을 동시에 리서치합니다.

#### 요청 본문

```json
{
  "items": [
    {
      "product_name": "베이직스 2024 베이직북 14 N-시리즈",
      "category": "가전디지털",
      "price_exact": 388000,
      "currency": "KRW",
      "seller_or_store": "베이직스 공식몰",
      "metadata": {}
    }
  ],
  "options": {
    "include_coupang_price": true,
    "include_reviews": true,
    "include_specs": true,
    "min_sources": 3,
    "max_concurrent": 5
  },
  "callback_url": "https://your-callback-url.com/webhook",
  "priority": 5
}
```

#### 요청 파라미터

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| items | Array | ✅ | 리서치할 제품 목록 (최대 10개) |
| items[].product_name | String | ✅ | 제품명 |
| items[].category | String | ✅ | 제품 카테고리 |
| items[].price_exact | Number | ✅ | 정확한 제품 가격 |
| items[].currency | String | ⚪ | 통화 단위 (기본: KRW) |
| items[].seller_or_store | String | ⚪ | 판매자 또는 스토어명 |
| items[].metadata | Object | ⚪ | 추가 메타데이터 |
| options | Object | ⚪ | 리서치 옵션 |
| callback_url | String | ⚪ | 완료 시 콜백 URL |
| priority | Integer | ⚪ | 작업 우선순위 (1-10, 기본: 5) |

#### 응답

**201 Created**

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
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T10:00:00Z",
    "started_at": null,
    "completed_at": null
  }
}
```

### 2. 리서치 결과 조회

**GET** `/research/products/{job_id}`

완료된 리서치 작업의 결과를 조회합니다.

#### 경로 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| job_id | UUID | 작업 ID |

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| include_failed | Boolean | ⚪ | 실패한 아이템 포함 여부 (기본: true) |

#### 응답

**200 OK**

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
      "deeplink_or_product_url": "https://basic-s.com/product/123",
      "coupang_price": null,
      "specs": {
        "main": [
          "Intel N95 CPU",
          "RAM 8GB (16GB 옵션)",
          "SSD 256GB (512GB 옵션)",
          "14.1형 IPS FHD 디스플레이"
        ],
        "attributes": [
          {
            "name": "포트",
            "value": "USB 3.0 x2, Mini HDMI, Type-C"
          }
        ],
        "size_or_weight": "1.35kg",
        "options": ["RAM 8GB/16GB", "SSD 256GB/512GB"],
        "included_items": ["노트북 본체", "충전기"]
      },
      "reviews": {
        "rating_avg": 4.3,
        "review_count": 41,
        "summary_positive": [
          "가성비가 뛰어나다",
          "휴대성이 좋다"
        ],
        "summary_negative": [
          "터치패드 감도가 아쉽다"
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
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T10:00:03.5Z",
    "started_at": "2024-01-20T10:00:00Z",
    "completed_at": "2024-01-20T10:00:03.5Z"
  }
}
```

### 3. 작업 상태 조회

**GET** `/research/products/{job_id}/status`

리서치 작업의 현재 상태를 조회합니다.

#### 경로 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| job_id | String | 작업 ID |

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| is_celery | Boolean | ⚪ | Celery 작업 여부 (기본: false) |

#### 응답

**200 OK**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": 0.5,
  "message": "2개 중 1개 아이템 처리 완료",
  "metadata": {
    "processed": 1,
    "total": 2
  }
}
```

### 4. 작업 취소

**DELETE** `/research/products/{job_id}`

진행 중인 리서치 작업을 취소합니다.

#### 경로 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| job_id | UUID | 작업 ID |

#### 응답

**204 No Content**

작업이 성공적으로 취소됨

## 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 204 | 콘텐츠 없음 |
| 400 | 잘못된 요청 |
| 404 | 찾을 수 없음 |
| 429 | 요청 제한 초과 |
| 500 | 서버 내부 오류 |

## 작업 상태

| 상태 | 설명 |
|------|------|
| pending | 대기 중 |
| processing | 처리 중 |
| success | 성공 |
| error | 오류 |
| insufficient_sources | 정보 소스 부족 |
| too_many_items | 아이템 수 초과 |

## 제한 사항

- 최대 동시 리서치 제품 수: 10개 (환경변수로 조정 가능)
- API 타임아웃: 30초
- 최소 정보 소스 요구: 3개
- 필수 리뷰 데이터: 평점(rating_avg), 리뷰 수(review_count)

## 에러 응답

```json
{
  "error": "ValidationError",
  "message": "요청한 아이템 수가 최대 허용 개수를 초과했습니다.",
  "details": {
    "max_allowed": 10,
    "received": 15
  }
}
```

## 사용 예시

### cURL

```bash
# 제품 리서치 요청
curl -X POST "http://localhost:8000/api/v1/research/products" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_name": "베이직스 노트북",
        "category": "가전디지털",
        "price_exact": 388000,
        "currency": "KRW"
      }
    ]
  }'

# 결과 조회
curl "http://localhost:8000/api/v1/research/products/{job_id}"

# 상태 확인
curl "http://localhost:8000/api/v1/research/products/{job_id}/status"
```

### Python

```python
import httpx
import asyncio

async def research_products():
    async with httpx.AsyncClient() as client:
        # 리서치 요청
        response = await client.post(
            "http://localhost:8000/api/v1/research/products",
            json={
                "items": [
                    {
                        "product_name": "베이직스 노트북",
                        "category": "가전디지털",
                        "price_exact": 388000,
                        "currency": "KRW"
                    }
                ]
            }
        )
        job_data = response.json()
        job_id = job_data["job_id"]
        
        # 결과 대기 및 조회
        await asyncio.sleep(5)
        
        result = await client.get(
            f"http://localhost:8000/api/v1/research/products/{job_id}"
        )
        return result.json()

# 실행
result = asyncio.run(research_products())
print(result)
```