# 쿠팡 파트너스 Open API 명세서 (상품 관련)

쿠팡 파트너스 공식 가이드라인([Open API 도움말](https://partners.coupang.com/#help/open-api))을 기준으로, 프로덕트 검색 및 딥링크 생성에 필요한 상품 관련 API 명세입니다.

---

## 공통 사항
- **Base URL:** `https://api-gateway.coupang.com/v2/providers/affiliate_open_api/apis/openapi/v1`
- **인증 방식:** HMAC 서명 방식을 사용합니다. 
  - 요청 헤더에 `Authorization` 키 값으로 생성된 서명(Signature)을 포함하여 전송해야 합니다. (Access Key, Secret Key 필요)

---

## 1. 상품 검색 API (Product Search API)

검색 키워드에 대한 쿠팡 파트너스 상품 검색 결과를 반환합니다. 

- **엔드포인트:** `GET /products/search`
- **제한 사항:** 1분당 최대 50번 호출 가능

### Request
| 필드명 | 타입 | 필수 여부 | 설명 |
|---|---|---|---|
| `keyword` | String | **필수** | 검색할 키워드 (예: "티셔츠") |
| `limit` | Integer | 선택 | 반환할 상품 수 (최대 10개, 기본값 10) |
| `subId` | String | 선택 | 하위 채널 ID (정산 및 성과 분석용 트래킹 파라미터) |
| `imageSize` | String | 선택 | 이미지 사이즈 (예: 512x512) |
| `srpLinkOnly` | Boolean| 선택 | 상품 상세 정보 생략 여부 (TRUE일 경우 링크 데이터만 제공) |

> [!WARNING]
> `limit` 값을 10 초과로 설정할 경우, 쿠팡 API 서버에서 정상적인 데이터를 반환하지 않고 빈 배열(`[]`)을 응답할 수 있으므로 최대 10까지만 설정하세요.

### Response `data.productData` 객체 스키마
- 반환되는 결과값은 배열(`productData`)안에 아래의 정보를 담고 있습니다.

| 필드명 | 타입 | 설명 |
|---|---|---|
| `productId` | Number | 상품 ID |
| `productName` | String | 상품명 |
| `productPrice` | Number | 상품 가격 |
| `productImage` | String | 상품 이미지 URL |
| `productUrl` | String | 파트너스 트래킹 코드가 포함된 상품 상세 URL |
| `categoryName` | String | 카테고리명 |
| `isRocket` | Boolean| 로켓배송 상품 여부 |
| `isFreeShipping` | Boolean| 무료배송 적용 여부 |

---

## 2. 카테고리 베스트 상품 API (Category Best API)

특정 카테고리의 인기 베스트 상품 리스트를 반환합니다.

- **엔드포인트:** `GET /products/bestcategories/{categoryId}`

### Request
| 필드명 | 타입 | 필수 여부 | 위치 | 설명 |
|---|---|---|---|---|
| `categoryId` | Integer | **필수** | Path | 카테고리 ID (예: 1001-여성패션, 1010-가전/디지털 등) |
| `limit` | Integer | 선택 | Query | 반환할 상품 수 (최대 10개) |
| `subId` | String | 선택 | Query | 채널 ID 트래킹 용도 |
| `imageSize` | String | 선택 | Query | 다운로드 할 이미지 해상도 크기 |

### Response
- 상품 검색 API(`GET /products/search`)와 동일하게 `productData` 배열 형식으로 반환됩니다.

---

## 3. 단축 URL 딥링크 API (Deep Link API)

일반적인 쿠팡 상품 링크를 입력받아 파트너스 수익 창출이 가능한 트래킹 코드 포함 단축 URL(딥링크)로 변환합니다.

- **엔드포인트:** `POST /deeplink`

### Request (JSON Body)
| 필드명 | 타입 | 필수 여부 | 설명 |
|---|---|---|---|
| `coupangUrls` | Array[String] | **필수** | 변환할 원본 쿠팡 관련 URL 목록 (한 번에 최대 50개) |
| `subId` | String | 선택 | 성과 추적을 위한 하위 채널 아이디 구성 |

### Response `data` 객체 스키마
| 필드명 | 타입 | 설명 |
|---|---|---|
| `originalUrl` | String | 사용자가 입력한 원본 URL |
| `shortenUrl` | String | 생성된 파트너스 활동용 단축 URL |
| `landingUrl` | String | 최종적으로 이동하는 상세 랜딩 URL 주소 |

---

## 4. 쿠팡 PL 브랜드별 상품 API
특정 쿠팡 PL 브랜드의 베스트 상품 리스트를 반환합니다.

- **엔드포인트:** `GET /products/coupangPL/{brandId}`

### Request
| 필드명 | 타입 | 필수 여부 | 위치 | 설명 |
|---|---|---|---|---|
| `brandId` | Integer | **필수** | Path | 브랜드 ID (예: 1001-탐사, 1002-코멧, 1003-Gomgom, 1004-줌, 1006-곰곰, 1007-꼬리별, 1008-베이스알파에센셜, 1010-비타할로, 1011-비지엔젤) |
| `limit` | Integer | 선택 | Query | 반환할 상품 수 (최대 100개, 기본값 20) |
| `subId` | String | 선택 | Query | 하위 채널 ID (성과 분석용) |
| `imageSize` | String | 선택 | Query | 이미지 사이즈 (예: 512x512) |

---

## 5. 쿠팡 PL 상품 API
쿠팡 PL 브랜드 (탐사, 코멧, 곰곰 등) 전체 상품 중 베스트 상품 리스트를 반환합니다.

- **엔드포인트:** `GET /products/coupangPL`

### Request
| 필드명 | 타입 | 필수 여부 | 위치 | 설명 |
|---|---|---|---|---|
| `limit` | Integer | 선택 | Query | 반환할 상품 수 (최대 100개, 기본값 20) |
| `subId` | String | 선택 | Query | 하위 채널 ID |
| `imageSize` | String | 선택 | Query | 이미지 사이즈 |

---

## 6. 골드박스 상품 API
매일 오전 7시 30분에 업데이트되는 24시간 일일 특가 카테고리인 '골드박스' 상품 리스트를 반환합니다.

- **엔드포인트:** `GET /products/goldbox`

### Request
| 필드명 | 타입 | 필수 여부 | 위치 | 설명 |
|---|---|---|---|---|
| `subId` | String | 선택 | Query | 하위 채널 ID |
| `imageSize` | String | 선택 | Query | 이미지 사이즈 |

> [!NOTE]
> 골드박스 API의 경우, 제공되는 품목이 당일 한정 수량/리스트로 고정되어 있으므로 별도의 `limit` 파라미터가 포함되지 않습니다.

---

*(위 API들의 Response의 `data` 항목 내부는 상품 관련 기본 응답(productName, productPrice, productImage, productUrl 등) 스키마와 동일합니다.)*
