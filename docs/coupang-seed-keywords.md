# 쿠팡 파트너스 시드 키워드

이 파일은 Codex 쿠팡 파트너스 자동 발행의 C 자동화가 읽는 시드 키워드 인덱스다. 실제 상품 시드는 `docs/coupang-seed-keywords/` 아래 카테고리별 파일에서 관리한다.

운영 원칙:

- 쿠팡 주요 쇼핑 카테고리를 CP 하위 카테고리로 운영하되, 초기 성과 검증은 생활가전, 주방가전, 청소/생활, 기념일/선물을 우선한다.
- 기념일/선물 추천 키워드는 독립 카테고리로 관리하되 나이대, 상대, 상황, 가격대, 상품군을 조합한다.
- 중가형과 프리미엄 상품이 충분히 있는 키워드를 우선한다.
- 저가형 키워드는 가성비, 입문용, 1인 가구 포지션으로 일부 포함한다.
- C 자동화는 이 인덱스와 카테고리별 시드 파일을 함께 읽고, 네이버 연관검색어를 확장하고 검색광고, 데이터랩, 쇼핑인사이트 점수로 후보를 선별한다.
- 각 카테고리 파일의 제목은 후보의 기본 `category`로 사용하고, 실제 상품 조회어는 더 구체적인 상품명 중심으로 `coupangSearchTerm`에 넣는다.

## 카테고리별 시드 파일

| 카테고리 | 파일 | 운영 메모 |
|---|---|---|
| 생활가전 | [`docs/coupang-seed-keywords/living-appliances.md`](coupang-seed-keywords/living-appliances.md) | 초기 우선 카테고리 |
| 주방가전 | [`docs/coupang-seed-keywords/kitchen-appliances.md`](coupang-seed-keywords/kitchen-appliances.md) | 초기 우선 카테고리 |
| 청소/생활 | [`docs/coupang-seed-keywords/cleaning-living.md`](coupang-seed-keywords/cleaning-living.md) | 초기 우선 카테고리 |
| 기념일/선물 | [`docs/coupang-seed-keywords/gift-anniversary.md`](coupang-seed-keywords/gift-anniversary.md) | 독립 발행 카테고리 |
| 가전·디지털 | [`docs/coupang-seed-keywords/electronics-digital.md`](coupang-seed-keywords/electronics-digital.md) | 확장 카테고리 |
| 식품·신선식품 | [`docs/coupang-seed-keywords/food-fresh.md`](coupang-seed-keywords/food-fresh.md) | 확장 카테고리 |
| 생활용품 | [`docs/coupang-seed-keywords/living-goods.md`](coupang-seed-keywords/living-goods.md) | 확장 카테고리 |
| 홈·인테리어 | [`docs/coupang-seed-keywords/home-interior.md`](coupang-seed-keywords/home-interior.md) | 확장 카테고리 |
| 뷰티 | [`docs/coupang-seed-keywords/beauty.md`](coupang-seed-keywords/beauty.md) | 확장 카테고리 |
| 주방용품 | [`docs/coupang-seed-keywords/kitchen-goods.md`](coupang-seed-keywords/kitchen-goods.md) | 확장 카테고리 |
| 패션 | [`docs/coupang-seed-keywords/fashion.md`](coupang-seed-keywords/fashion.md) | 확장 카테고리 |
| 반려동물 | [`docs/coupang-seed-keywords/pet.md`](coupang-seed-keywords/pet.md) | 확장 카테고리 |
| 출산·유아동 | [`docs/coupang-seed-keywords/baby-kids.md`](coupang-seed-keywords/baby-kids.md) | 확장 카테고리 |
| 스포츠·레저 | [`docs/coupang-seed-keywords/sports-leisure.md`](coupang-seed-keywords/sports-leisure.md) | 확장 카테고리 |
| 문구·오피스 | [`docs/coupang-seed-keywords/office-stationery.md`](coupang-seed-keywords/office-stationery.md) | 확장 카테고리 |
| 자동차용품 | [`docs/coupang-seed-keywords/car-goods.md`](coupang-seed-keywords/car-goods.md) | 확장 카테고리 |
| 완구·취미 | [`docs/coupang-seed-keywords/toys-hobbies.md`](coupang-seed-keywords/toys-hobbies.md) | 확장 카테고리 |
| 도서 | [`docs/coupang-seed-keywords/books.md`](coupang-seed-keywords/books.md) | 확장 카테고리 |
| 건강·의료 | [`docs/coupang-seed-keywords/health-medical.md`](coupang-seed-keywords/health-medical.md) | 확장 카테고리 |

## 테스트/운영 보정 시드

| 목적 | 파일 |
|---|---|
| 저가형 테스트 | [`docs/coupang-seed-keywords/test-budget.md`](coupang-seed-keywords/test-budget.md) |
| 프리미엄 테스트 | [`docs/coupang-seed-keywords/test-premium.md`](coupang-seed-keywords/test-premium.md) |

## C 자동화 읽기 규칙

1. 이 인덱스에서 카테고리 파일 목록을 확인한다.
2. `docs/coupang-seed-keywords/*.md`를 모두 읽는다.
3. 카테고리 파일 제목을 후보의 `category`로 사용한다.
4. 각 목록 항목을 기본 `keyword` 또는 `coupangSearchTerm` 후보로 사용한다.
5. 기념일/선물 파일은 조합형 시드이므로 나이대, 상대, 상황, 가격대, 상품군을 조합한다.
