# 쿠팡 파트너스 리포트(Reports) API 가이드

이 문서는 쿠팡 파트너스 Open API 중 실적 정보를 조회하는 **리포트 API**에 대한 명세 및 사용 가이드를 제공합니다.

---

## 1. 기본 정보 (Common Info)

*   **Host URL:** `https://api-gateway.coupang.com`
*   **Base Path:** `/v2/providers/affiliate_open_api/apis/openapi/v1`
*   **인증 방식:** 쿠팡 파트너스 HMAC 인증 (Access Key / Secret Key 필요)
*   **제한 사항:** 1시간당 최대 500회 호출 가능

---

## 2. 공통 요청 파라미터 (Query Parameters)

모든 리포트 API는 아래의 파라미터를 공통적으로 사용하거나 필수로 요구합니다.

| 파라미터 | 타입 | 필수 여부 | 설명 |
| :-- | :-- | :-- | :-- |
| `startDate` | String | **필수** | 조회 시작일 (형식: `yyyyMMdd`, 20181101 이후) |
| `endDate` | String | **필수** | 조회 종료일 (형식: `yyyyMMdd`, `startDate`와 최대 30일 차이) |
| `subId` | String | 선택 | 채널 아이디 (특정 채널 필터링 시 사용) |
| `page` | Integer | 선택 | 페이지 번호 (기본값: 0, 페이지당 최대 1000건 반환) |

---

## 3. 일반 실적 리포트 API

### 3.1 일 별 클릭 리포트 (Click Report)
파트너스 회원의 일 별 클릭 정보(트래킹 코드별 클릭 수)를 조회합니다.

*   **Endpoint:** `GET /reports/clicks`
*   **응답 필드:**
    *   `date`: 날짜 (`yyyyMMdd`)
    *   `trackingCode`: 트래킹 코드
    *   `subId`: 채널 ID
    *   `clicks`: 클릭 수

### 3.2 일 별 주문 리포트 (Order Report)
일 별 발생한 주문의 상세 내역을 조회합니다.

*   **Endpoint:** `GET /reports/orders`
*   **응답 필드:**
    *   `orderDate`: 주문 일시 (`yyyy-MM-dd HH:mm:ss`)
    *   `trackingCode`: 트래킹 코드
    *   `orderId`: 주문 번호
    *   `productId`: 상품 번호
    *   `productName`: 상품 명
    *   `quantity`: 수량
    *   `gmv`: 주문 금액 (판매가)
    *   `commissionRate`: 수수료율 (%)
    *   `commission`: 예상 수익

### 3.3 일 별 취소 리포트 (Cancel Report)
주문 후 취소된 내역을 조회합니다.

*   **Endpoint:** `GET /reports/cancels`
*   **응답 필드:** 주문 리포트 항목 + `cancelDate` (취소 일시), `cancelReason` (취소 사유)

### 3.4 일 별 수익 리포트 (Commission Report)
일 별 확정 수익 및 정산 관련 정보를 요약 조회합니다.

*   **Endpoint:** `GET /reports/commission`
*   **응답 필드:** `date`, `trackingCode`, `subId`, `commission` (해당 날짜의 수익 합계)

---

## 4. 광고 실적 리포트 API (배너 전용)
카테고리 배너, 다이나믹 배너 등의 실적을 조회합니다. (조회 기간 최대 14일)

*   `GET /reports/ads/impression-click`: 광고 노출 및 클릭 통계
*   `GET /reports/ads/orders`: 광고를 통한 주문 내역
*   `GET /reports/ads/performance`: 광고 효율(eCPM 등) 지표
*   `GET /reports/ads/commission`: 광고 수익 상세

---

## 5. 응답 형식 (Common Schema)

모든 API 응답은 아래와 같은 표준 JSON 형식을 따릅니다.

```json
{
  "rCode": "0",
  "rMessage": "success",
  "data": [
    {
      "date": "20240101",
      "trackingCode": "AF12345",
      "clicks": 150
    }
  ]
}
```

---

## 6. [참고] 상품별 클릭 추적 방법 (subId 활용)

리포트 API는 기본적으로 상품(productId) 단위 클릭을 제공하지 않지만, **딥링크 API**를 통해 상품별로 고유한 `subId`를 부여하여 링크를 생성하면 추적이 가능합니다.

*   **API**: `POST /deeplink`
*   **요청 예시**:
    ```json
    {
      "coupangUrls": ["https://www.coupang.com/vp/products/123"],
      "subId": "product_123_link"
    }
    ```
*   **결과**: 위와 같이 생성된 링크의 클릭 데이터는 리포트 API 호출 시 `subId: "product_123_link"` 항목으로 집계되어 나타납니다.

## 7. 본 프로젝트의 클릭 추적 방식 (자체 로깅)

현재 프로젝트(cp9)는 쿠팡 API의 지연 및 제한을 해결하기 위해 **자체 클릭 로깅 시스템**을 이미 갖추고 있습니다.

*   **DB 모델**: `CtaClick` (Prisma schema)
*   **API 엔드포인트**: `POST /api/cta-click`
*   **작동 원리**:
    1.  사용자가 생성된 페이지의 상품 버튼(CTA)을 클릭합니다.
    2.  쿠팡으로 리다이렉트되기 직전, 자사 서버(`/api/cta-click`)에 클릭 정보(어떤 상품인지, 어떤 페르소나인지 등)를 먼저 전송합니다.
    3.  서버에서 DB에 기록한 뒤 쿠팡 링크로 이동시킵니다.
*   **장점**: 실시간으로 어떤 상품(`itemId`)이 몇 번 클릭되었는지 **즉시 확인 가능**합니다.

---

> [!NOTE]
> 쿠팡 리포트 API는 정산 및 확정 수익 확인용으로 사용하시고, 서비스 내의 **실시간 상품별 클릭수**는 현재 구현된 `CtaClick` 데이터를 조회하여 확인하는 것이 가장 정확합니다.
