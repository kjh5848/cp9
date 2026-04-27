# Codex 쿠팡 파트너스 자동 발행 설계서

## 1. 목적

Codex Automation을 사용해 쿠팡 파트너스 기반 콘텐츠를 주기적으로 발굴, 작성, 검수, 배포한다.

이 자동화는 CP9 내부 오토파일럿 파이프라인이나 프로젝트에 연결된 OpenAI, Claude, Gemini API 키를 사용하지 않는다. 글의 판단과 작성은 Codex Automation이 담당하고, 외부 API는 데이터 수집과 업로드에만 사용한다.

## 2. 핵심 원칙

- 글 생성 주체는 Codex Automation이다.
- 쿠팡, 네이버, WordPress, 네이버 카페 API는 데이터 조회와 업로드에만 사용한다.
- 현재 샘플 품질 기준에서는 WordPress `publish` 공개 발행을 기본값으로 둔다.
- WordPress 자동 발행은 30분마다 실행한다.
- 네이버 카페는 WordPress 공개 발행 성공 후 요약 업로드 대상으로 둔다.
- 키워드 후보와 발행 기록은 삭제하지 않고 상태값으로 관리한다.
- 로컬 원문 파일은 발행 성공 후 보관하지 않고, 최소 이력만 남긴다.
- macOS 로컬 알림은 WordPress 공개 발행 성공/실패 시 표시한다.

## 3. 자동화 구성

### C 자동화: 키워드 발굴

3시간마다 실행한다.

기존 6시간 주기는 WordPress 발행 주기가 1시간일 때, 다음 키워드 발굴 전까지 최대 6회 발행을 소화하는 리듬이었다. A 자동화가 30분 발행으로 바뀐 뒤에도 같은 후보 신선도와 검증 주기를 유지하려면 C 자동화는 3시간마다 실행한다. 이렇게 하면 발굴 사이에 최대 6회 발행이 일어나므로 후보 풀이 너무 오래 고이지 않고, 네이버/쿠팡 계열 외부 API를 과도하게 호출하지 않는다.

역할:

- `docs/coupang-seed-keywords.md` 인덱스와 `docs/coupang-seed-keywords/*.md` 카테고리별 시드 파일을 읽는다.
- 쿠팡 주요 쇼핑 카테고리를 CP 하위 카테고리로 운영하고, 후보의 실제 쇼핑 의도에 맞춰 `category`를 지정한다.
- 기념일/선물 추천 시드는 독립 발행 카테고리로 관리하고, 나이대·상대·기념일·가격대·상품군 조합을 만든다.
- 네이버 연관검색어로 키워드를 확장한다.
- 네이버 데이터랩, 쇼핑인사이트, 검색광고 키워드 도구로 수요를 검증한다.
- 중복 키워드와 최근 발행 의도를 제외한다.
- 회당 최대 20개의 후보를 `data/keyword-candidates.json`에 저장한다.
- 14일 이상 지난 `pending` 후보는 삭제하지 않고 `stale`로 바꾼 뒤 재점수화한다.

키워드 점수:

```text
월간 검색량 35%
쇼핑 의도 25%
최근 상승 추세 20%
중복 회피/신선도 10%
카테고리 적합성 10%
```

시드 순환:

```text
기본은 카테고리 균형
성과가 좋은 시드는 가중치 부여
최근 많이 사용한 시드는 후순위
실패가 반복된 시드는 빈도 축소
```

운영 카테고리:

```text
생활가전
주방가전
청소/생활
기념일/선물
가전·디지털
식품·신선식품
생활용품
홈·인테리어
뷰티
주방용품
패션
반려동물
출산·유아동
스포츠·레저
문구·오피스
자동차용품
완구·취미
도서
건강·의료
```

기념일/선물 키워드 조합:

```text
나이대: 10대, 20대, 30대, 40대, 50대, 60대
상대: 엄마, 아빠, 부모님, 아내, 남편, 여자친구, 남자친구, 직장동료, 선생님
상황: 생일, 생신, 결혼기념일, 집들이, 어버이날, 스승의날, 크리스마스, 명절, 퇴사, 취업, 입학, 졸업
가격대: 1만원대, 2만원대, 3만원대, 5만원대, 10만원대, 20만원대
의도 접두어: 추천, 센스있는, 실용적인, 부담없는, 고급, 가성비
상품군: 건강가전, 마사지기, 커피머신, 공기청정기, 가습기, 로봇청소기, 무선청소기, 주방용품, 생활용품
```

예:

```text
10대 여자 생일선물 추천
30대 남자 생일선물 가전
50대 엄마 생일선물 추천
60대 부모님 생신선물 건강가전
결혼기념일 아내 선물 추천
5만원대 센스있는 집들이 선물
어버이날 부모님 마사지기 추천
```

기념일 후보는 `category=기념일/선물`로 저장한다. `keyword`에는 검색 의도 문구를 넣고, `coupangSearchTerm`에는 실제 상품 조회에 적합한 상품군을 넣는다. 예를 들어 `keyword=어버이날 부모님 마사지기 추천`, `coupangSearchTerm=마사지기`처럼 분리한다.

### A 자동화: WordPress 공개 발행

30분마다 실행한다.

역할:

- `data/keyword-candidates.json`에서 `pending` 후보 1개를 선택한다.
- 쿠팡 상품 후보를 조회한다.
- 가격대, 브랜드, 상품 차별점, 글 유형 적합도, 판매처별 구성 차이를 기준으로 상품을 선별한다.
- 로봇청소기처럼 모델 적합도가 중요한 글은 웹 리서치로 인기 모델과 핵심 기능을 먼저 좁힌 뒤, 쿠팡 상품 검색 결과와 정확히 매칭한다.
- Codex가 한국어 SEO 글을 작성한다.
- WordPress에 `publish`로 공개 발행한다.
- 네이버 카페 업로드가 설정되어 있으면 요약 글을 함께 업로드한다.
- 발행 성공 후 로컬 Markdown/HTML/JPEG 원본은 삭제하고, `data/codex-publisher-history.json`에는 최소 이력만 남긴다.
- WordPress 공개 발행 성공 또는 실패 시 macOS 알림을 표시한다.

키워드 선택 점수:

```text
priorityScore 60%
pending 대기 시간 20%
카테고리 균형 15%
글 유형 비율 보정 5%
```

발행량 조절:

```text
기본 주기: 30분당 1개
일일 상한: 48개 이하
API 오류, 중복 주제, 품질 점수 미달 시 해당 회차 발행 중단
```

중복/품질 방어:

```text
최근 발행 이력과 WordPress slug를 비교한다.
동일 키워드/동일 상품 조합은 건너뛴다.
본문 품질 점수, 쿠팡 고지, 이미지, 링크, 표 구조가 미달이면 발행하지 않는다.
```

### B 자동화: 보조 배포

현재는 기본 운영에서 사용하지 않고 `PAUSED` 상태로 둔다. 사람이 별도로 승인 큐 기반 배포를 원할 때만 사용한다.

역할:

- `data/approved-posts.json`에서 승인된 WordPress post id를 읽는다.
- 해당 WordPress draft를 `publish`로 전환한다.
- 네이버 카페에 요약 글을 업로드한다.
- 카페 글에는 쿠팡 파트너스 링크와 WordPress 원문 링크를 함께 넣는다.
- 처리 결과를 `data/codex-publisher-history.json`에 반영한다.
- 성공 또는 실패 시 macOS 알림을 표시한다.

초기 운영에서는 A 자동화가 WordPress 공개 발행까지 처리하므로 B 자동화는 보조 경로다.

## 4. 카테고리와 글 유형

초기 카테고리는 생활가전, 주방가전, 청소/생활 중심으로 제한한다.

글 유형 비율:

```text
탑 3~5 비교: 60%
20가지 큐레이션: 30%
카테고리 딥다이브: 10%
```

딥다이브는 단일 상품 리뷰가 아니라 카테고리 구매 가이드로 작성한다.

예:

```text
에어프라이어 고르는 법 용량, 코팅, 세척, 전기요금까지
```

딥다이브 운영 기준:

```text
최소 분량: 공백 제외 8,000자 이상
핵심 소재: 유명 브랜드, 대표 아이템, 브랜드 철학, 브랜드 이미지, 사용자가 얻는 의미
보조 이미지: Pexels 무료 사진
상품 링크 역할: 본문 중심이 아니라 구매 확인용 보조 영역
금지: 상품명, 가격, 이미지, 링크만 나열하는 얕은 구매 가이드
```

딥다이브는 특정 상품 5개의 짧은 설명이 아니라 “왜 이 브랜드와 방식이 시장에서 의미를 갖는가”를 설명해야 한다. 예를 들어 커피머신 글이라면 네스프레소, 드롱기, 브레빌, 필립스 전자동처럼 독자가 이미 들어봤을 브랜드를 중심으로 철학, 사용 장면, 디자인 이미지, 유지 비용, 브랜드별 한계를 다룬다.

딥다이브 서식은 리포트/보고서형으로 고정한다.

```text
상단 요약: 핵심 판단, 읽어야 할 사람, 가장 큰 리스크
본문 구조: h2별 독립 섹션, 긴 문단 사이 이미지 또는 요약 카드 삽입
문체: 광고 문안이 아니라 구매 판단 보고서
목표: 스크롤 중간에서도 지금 읽는 섹션의 판단 기준이 보이게 한다
```

딥다이브 이미지 운영 기준:

```text
브랜드/라이프스타일 무드 이미지: Pexels API 검색 결과
상품 구매 확인 이미지: 쿠팡 파트너스에서 제공되는 상품 이미지
직접 설명 이미지: 사용하지 않음
출처 표기: 본문에는 노출하지 않고 history에 sourceUrl, photographer, license만 기록
```

HTML/SVG 자체 도식은 블로그 품질이 낮아 보이면 사용하지 않는다. 딥다이브 설명 이미지는 Pexels 사진 위에 HTML 텍스트 레이어를 합성한 960x560 JPEG로 만들고 WordPress 미디어에 업로드한다. 공개 본문에서는 Pexels 원본 URL로 링크하지 않고, Pexels 외부 이미지를 직접 로드하지 않는다. 본문에는 Pexels 작가 출처 문구를 직접 노출하지 않고, 이미지 하단에는 해당 섹션의 구매 판단 의미만 짧게 붙인다. 일반 블로그, 뉴스, 리뷰 사이트, 쇼핑몰 상세페이지, 브랜드 공식몰 이미지는 명시적 사용 허가나 프레스킷 조건이 없으면 사용하지 않는다.

20가지 큐레이션 운영 기준:

```text
아이템 수: 20개
아이템별 설명: 300자 내외
레이아웃: 표가 아니라 모바일 우선 카드형 섹션
필수 요소: 이미지, 상품명, 역할, 가격, 300자 내외 설명, 가격 확인 버튼
```

큐레이션은 “빠른 리스트”이지만 설명이 너무 짧으면 저품질 링크 모음으로 보인다. 각 아이템은 어떤 문제를 해결하는지, 어디에 쓰는지, 구매 전 무엇을 확인해야 하는지를 최소 한 문단으로 설명한다.

## 4-1. GEO와 AI 스니펫 대응

AI 검색, AI 브리핑, AI 스니펫 노출을 노린 글은 단순 키워드 반복보다 “질문에 바로 답할 수 있는 사실 단위”가 중요하다. 자동화는 모든 글 유형에서 상품별로 아래 구조를 반드시 만든다.

```text
1. 확인 팩트: 브랜드, 카테고리, 확인 가능한 스펙, 작성 시점 가격, 구성품, 도착 예정일
2. 해석 문장: 이 상품이 어떤 사용 장면에 맞는지 1~2문장으로 설명
3. 구매 전 질문: 용량, 설치, 보관, 소모품, AS처럼 구매자가 확인해야 할 질문
4. 구조화 데이터: 상품 리스트는 ItemList + Product + Offer 형태의 JSON-LD로 보강
```

팩트 수집 원칙:

- 상품명, 가격, 이미지, 링크, 구성품, 카테고리, 상품 상세 페이지의 공개 메타 정보를 우선 사용한다.
- 쿠팡 상품 검색 결과만으로 글을 쓰지 않는다. 웹 리서치로 현재 많이 언급되는 대표 모델과 기능 포인트를 수집하고, 쿠팡 상품 후보가 해당 주제와 맞는지 필터링한 뒤, 상품별 전환 문구와 설명을 작성한다.
- 로봇청소기, 식기세척기, 프리미엄 생활가전은 공식몰, 대형가전몰, 오픈마켓, 리뷰성 콘텐츠에서 반복 언급되는 장점과 불편을 함께 확인한다.
- 확인되지 않은 리뷰 수, 평점, 판매량, 공식 인증, 수상 이력은 쓰지 않는다.
- 상품 상세 페이지 접근이 실패하면 상품명과 작성 시점 상품 정보만으로 보수적으로 작성한다.
- 공개 본문에는 데이터 수집 방식이나 내부 필드명을 쓰지 않고, 독자가 이해할 수 있는 표현으로 바꾼다.
- TOP 3~5 비교는 모든 상품 섹션에 팩트 블록을 넣고, 큐레이션은 모든 카드에 축약 팩트 블록을 넣으며, 딥다이브는 구매 확인용 상품 영역에 최소 3개 이상 팩트 블록을 넣는다.

## 5. 상품 선별 기준

가격대 비율:

```text
중가형 55%: 10만~25만 원
프리미엄 25%: 30만 원 이상
저가형 20%: 3만~10만 원
```

저가형 포지션:

- 가성비 대표
- 입문용 대표
- 1인 가구/소형 대표

상품 점수:

```text
상품 신뢰도 25%
가격대 적합성 20%
판매처/혜택 15%
상품 차별점 20%
글 유형 적합도 20%
```

상품 신뢰도 기준:

- 쿠팡 파트너스 상품 검색 API 응답에는 리뷰 수와 평점 필드가 없으므로 리뷰/평점은 필수 게이트로 사용하지 않는다.
- 상품 검색 응답에서 확인 가능한 `productPrice`, `productImage`, `productUrl`, `categoryName`, `isRocket`, `isFreeShipping`, 상품명, 브랜드/스펙 문구를 1차 신뢰도 기준으로 사용한다.
- 리뷰/평점 데이터를 별도 검증 가능한 출처로 확보한 경우에만 추가 가점으로 사용한다.
- 상품 정보 불완전, 이미지 없음, 파트너스 URL 없음, 품절 가능성이 높은 상품은 제외한다.

판매처 확인 기준:

- 저가형 생활상품은 가격과 구성품 확인 가능성을 우선한다.
- 중가형 상품은 도착 예정일, 사은품, 소모품 포함 여부를 함께 본다.
- 프리미엄 상품은 브랜드, 스펙, AS, 설치/보증, 공식몰과 오픈마켓의 구성 차이를 우선한다.
- 공개 본문에서는 특정 배송 뱃지를 전환 요소로 쓰지 않는다.

브랜드 구성:

- 대표 브랜드 1~2개
- 가성비 브랜드 1~2개
- 프리미엄/특화 브랜드 1개
- 같은 브랜드만 반복하지 않는다.

## 6. 제목과 본문 원칙

제목은 핵심 검색 키워드와 문제/타깃을 조합한다.

예:

```text
에어프라이어 추천 TOP 5 1인 가구부터 대용량까지 고르는 법
로봇청소기 추천, 물걸레 기능까지 볼 때 후회 줄이는 기준
제습기 고르는 법 원룸·거실·장마철 사용 기준별 비교
```

본문 원칙:

- WordPress 글은 원본 SEO 자산으로 작성한다.
- 네이버 카페 글은 요약형/전환형으로 재작성한다.
- 카페 글에는 추천 상품 3~5개, 쿠팡 링크, WordPress 원문 링크를 포함한다.
- 같은 본문을 WordPress와 카페에 그대로 복사하지 않는다.
- 공개되는 WordPress 본문과 네이버 카페 글에는 `API`, `검색 API`, `응답`, `productImage`, `productUrl`, `productPrice` 같은 데이터 수집 방식이나 내부 필드명을 쓰지 않는다.
- 상품 정보 출처는 독자 관점에서 “작성 시점에 확인 가능한 상품명, 가격, 이미지, 링크, 구성품”처럼 표현한다.
- 상품 비교 글은 구매자 페르소나를 명확히 둔다. 생활가전과 청소 가전은 30대~60대 여성, 직장인 주부, 엄마, 친구에게 추천하는 사람의 관점으로 작성한다.
- 전환 문구는 단순 “바로가기”가 아니라 생활 장면의 고민을 해결하는 문맥 뒤에 배치한다. 예를 들어 로봇청소기는 “퇴근 후 바닥을 다시 밀지 않아도 되는가”, “아이 간식 부스러기와 머리카락을 매일 줄일 수 있는가” 같은 질문을 먼저 제시한 뒤 가격 확인 버튼을 둔다.
- 상품 설명은 스펙 나열보다 생활 장면, 후기에서 확인해야 할 반복 불편, 가족 기준 구매 질문을 포함한다.

TOP 3~5 비교 글의 상품별 섹션은 단순 설명문으로 끝내지 않는다. 각 상품마다 아래 요소를 포함한다.

```text
1. 핵심 판단: 가격대, 용량/스펙, 관리 포인트, 판매처별 구성 차이
2. 좋은 점: 구매를 당길 수 있는 강점 2~3개
3. 조심할 점: 후회 방지를 위한 주의점 2~3개
4. 추천 대상: 어떤 사용자에게 맞는지
5. 구매 전 체크: 상세 페이지에서 확인할 항목
```

상품별 설명은 최소 2문단과 목록형 판단 블록을 포함한다. 자동화가 상품 이미지, 링크, 가격만 나열하고 실사용 판단 근거를 제공하지 못하면 발행하지 않는다.

상품 이미지는 본문 폭 안에서 중앙 정렬한다. TOP 비교, 딥다이브 구매 확인 영역, Pexels 설명 이미지는 모두 `margin-left:auto`, `margin-right:auto` 또는 동등한 inline 스타일을 가져야 한다. 모바일에서 이미지가 좌측으로 붙어 보이면 발행 품질 미달로 본다.

딥다이브 글은 본문 생성 후 HTML 태그와 공백을 제거한 글자 수가 8,000자 미만이면 발행하지 않는다. 큐레이션 글은 각 카드 설명이 300자 내외의 독립 문단을 갖지 못하면 발행하지 않는다.

쿠팡 파트너스 고지 문구는 본문 하단에 넣는다.

기본 문구:

```text
이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
```

이 문구가 누락되면 발행하지 않는다.

### 비교표 디자인

TOP 3~5 비교 글의 첫 비교 영역은 데스크톱과 모바일을 분리해 렌더링한다.

기본 원칙:

```text
데스크톱: 901px 이상에서 사진, 상품명, 가격, 링크가 있는 4열 테이블
모바일/태블릿: 900px 이하에서 같은 데이터를 1열 상품 카드 리스트로 변환
```

900px 이하 화면에서 데스크톱 테이블을 그대로 축소하면 상품명이 눌리고 버튼이 화면 밖으로 밀리므로 사용하지 않는다. 모바일 카드에는 상품 이미지, 상품명, 가격, 바로가기 버튼만 남긴다. 가격과 버튼은 한 화면에서 바로 보여야 하며, 각 카드는 선과 여백으로 분리한다.

## 7. 이미지 정책

본문 상품 이미지는 쿠팡 파트너스에서 제공되는 상품 이미지를 사용한다. 공개 본문에는 이미지 확보 방식이나 내부 필드명을 설명하지 않는다.

기본 정책:

```text
상품별 본문 이미지: 쿠팡 파트너스에서 제공되는 상품 이미지
딥다이브 보조 이미지: Pexels API 검색 결과
딥다이브 설명 이미지: Pexels 사진 위에 HTML 텍스트 레이어를 합성한 JPEG
WordPress 대표 이미지: HTML/CSS 썸네일을 Playwright로 JPEG 캡처
생성형 이미지 API: 초기 자동화 범위에서 제외
Playwright 상품 페이지 스크래핑: API 이미지 실패 시 fallback 후보로만 보류
```

딥다이브에서 웹 이미지를 사용할 때는 아래 메타데이터를 `data/codex-publisher-history.json` 또는 실행 리포트에 최소 기록한다.

```json
{
  "imageUrl": "실제 이미지 URL",
  "sourceUrl": "라이선스를 확인한 원본 페이지 URL",
  "author": "저작자 또는 제공처",
  "license": "Unsplash / Pexels / Public Domain / CC BY / CC BY-SA / Press Kit",
  "attributionText": "본문 노출 없음, 내부 추적용"
}
```

대표 썸네일은 실제 상품 이미지를 합성하지 않고, 글 제목과 카테고리 맥락을 중심으로 만든다. 디자인은 본문과 동일한 톤을 유지하고, 중앙에 제목이 선명하게 보이도록 구성한다.

대표 썸네일의 제목은 원문 제목을 그대로 한 줄에 넣지 않는다. 모든 제목은 `tools/codex-publisher/thumbnail-title.mjs`의 규칙으로 분해한다.

```text
1. 원문 제목과 모든 h1~h6 제목에 콜론(: 또는 ：)을 쓰지 않는다.
2. TOP 3~5, TOP 5, 20가지 같은 숫자 배지는 독립 토큰으로 분리하고 줄바꿈하지 않는다.
3. "기준으로 고르는 법"은 썸네일에서 "기준"으로 줄이고, "고르는 법" 반복 표현은 제거한다.
4. 메인 제목은 최대 2줄, 보조 기준은 최대 1~2줄로 제한한다.
5. 글자 길이에 따라 폰트 크기를 낮추고, Playwright 캡처 전 1200x630 overflow를 검사한다.
6. overflow가 발생하면 WordPress 업로드 전에 실패 처리하고 제목 분해 규칙을 수정한다.
```

예:

```text
원문: 음식물처리기 추천 TOP 5 건조·분쇄·자동세척 기준으로 고르는 법
썸네일:
구매 전 빠른 비교
음식물처리기 추천 TOP 5
건조·분쇄·자동세척 기준
```

대표 썸네일 생성 흐름:

```text
1. A 자동화가 글 제목과 카테고리 정보를 확정
2. `tools/codex-publisher/thumbnail-title.mjs` 규칙으로 썸네일 HTML 생성
3. Playwright로 1200x630 JPEG 캡처 및 overflow 검증
4. WordPress 미디어 라이브러리에 업로드
5. 생성된 media id를 draft의 featured_media로 설정
6. HTML/JPEG 원본 경로와 WordPress media id를 history/report에 기록
```

본문 상품 이미지는 각 상품 섹션의 제목 바로 아래에 배치한다. `alt`에는 상품명을 넣고, `loading="lazy"`와 `decoding="async"`를 사용한다.

## 8. 중복 방지

중복 방지는 키워드, 상품, 검색 의도, 제목을 함께 본다.

기준:

```text
핵심 키워드 재사용 금지: 30일
같은 상품 ID 재사용 금지: 14일
같은 검색 의도 재사용 금지: 21일
유사 제목 재사용 금지: 30일
```

예:

```text
무선청소기 추천
가성비 무선청소기 추천
무선청소기 TOP 5
```

위 예시는 모두 "무선청소기 구매 비교" 의도로 보고 중복에 가깝게 처리한다.

반면 아래는 다른 의도로 분리할 수 있다.

```text
무선청소기 추천
물걸레 무선청소기 추천
차량용 무선청소기 추천
```

## 9. 운영 파일

```text
docs/coupang-seed-keywords.md
docs/coupang-seed-keywords/*.md
data/keyword-candidates.json
data/codex-publisher-history.json
frontend/.env.local
```

역할:

- `docs/coupang-seed-keywords.md`: 시드 키워드 인덱스
- `docs/coupang-seed-keywords/*.md`: 사람이 관리하는 카테고리별 시드 키워드
- `data/keyword-candidates.json`: C 자동화가 만든 키워드 후보
- `data/codex-publisher-history.json`: 최소 발굴/작성/발행 이력
- `content/codex-publisher/drafts/`: 수동 검수 또는 장애 분석 때만 임시 사용하고, 공개 발행 성공 후 삭제
- `frontend/.env.local`: 로컬 API 키와 비밀값

## 9-1. 로컬 CLI 실행

자동화는 두 가지 CLI 경로를 둔다.

1. `tools/codex-publisher/autopublish-cli.mjs`: Codex CLI를 호출해 A 자동화 프롬프트를 실행하는 운영용 진입점
2. `tools/codex-publisher/publish-candidate.mjs`: 특정 pending 후보를 deterministic하게 발행하고 유형별 렌더링을 검증할 때 쓰는 점검용 진입점

운영 전 점검:

```bash
node tools/codex-publisher/autopublish-cli.mjs preflight
```

Codex 기반 A 자동화 1회 실행:

```bash
node tools/codex-publisher/autopublish-cli.mjs batch --count 1
```

로컬 맥에서 쿠팡/WordPress DNS 또는 네트워크가 Codex sandbox 안에서 막히면 아래처럼 sandbox 우회 모드로 실행한다. 이 모드는 로컬 파일과 네트워크 접근 권한이 넓어지므로, `frontend/.env.local`의 비밀값을 출력하지 않는 프롬프트와 preflight를 먼저 확인한 뒤 사용한다.

```bash
node tools/codex-publisher/autopublish-cli.mjs batch --count 1 --bypass-sandbox
```

글 유형별 점검 발행:

```bash
node tools/codex-publisher/publish-candidate.mjs --type deepdive
node tools/codex-publisher/publish-candidate.mjs --type curation_20
```

점검용 CLI도 `frontend/.env.local`에서 비밀값을 읽지만 값을 출력하지 않는다. 발행 성공 시 `data/keyword-candidates.json`의 후보를 `published`로 바꾸고, `data/codex-publisher-history.json`에는 WordPress post id, URL, media id, 상품 id와 가격만 남긴다.

## 10. 환경 변수

`frontend/.env.local`은 git에 커밋하지 않는다. 현재 `frontend/.gitignore`에서 제외되어 있으므로 자동화는 이 파일에서만 비밀값을 읽는다.

현재 확인된 필수 기본값:

```env
WORDPRESS_SITE_URL=
WORDPRESS_USERNAME=
WORDPRESS_APP_PASSWORD=

COUPANG_ACCESS_KEY=
COUPANG_SECRET_KEY=

NAVER_API_KEY=
NAVER_SECRET_KEY=

PEXELS_API_KEY=
```

`COUPANG_PARTNER_ID`는 쿠팡 파트너스 API 인증 필수값이 아니다. 상품 검색 API가 반환하는 `productUrl`에 파트너스 추적 링크가 포함되므로, `COUPANG_PARTNER_ID`가 비어 있어도 WordPress 발행을 막지 않는다. 이 값은 별도 추적 식별자가 필요할 때만 선택적으로 사용한다.

현재 `NAVER_API_KEY`와 `NAVER_SECRET_KEY`는 네이버 검색광고 API의 액세스 라이선스와 비밀키로 사용한다.

검색광고 키워드 도구를 사용하려면 추가로 필요하다.

```env
NAVER_SEARCHAD_CUSTOMER_ID=
```

검색광고 API 호출 시 `NAVER_API_KEY`, `NAVER_SECRET_KEY`, `NAVER_SEARCHAD_CUSTOMER_ID`를 함께 사용한다. `NAVER_SEARCHAD_CUSTOMER_ID`는 광고 계정 식별자이며, 키워드 도구 호출에 필요하다.

네이버 데이터랩/쇼핑인사이트를 사용하려면 별도 네이버 개발자 애플리케이션 Client ID/Secret을 사용한다.

```env
NAVER_DATALAB_CLIENT_ID=
NAVER_DATALAB_CLIENT_SECRET=
```

네이버 카페 업로드를 사용하려면 추가로 필요하다.

```env
NAVER_CAFE_ID=
NAVER_CAFE_MENU_ID=
NAVER_CAFE_ACCESS_TOKEN=
NAVER_CAFE_MENU_LIVING_APPLIANCE_ID=
NAVER_CAFE_MENU_KITCHEN_APPLIANCE_ID=
NAVER_CAFE_MENU_CLEANING_LIVING_ID=
NAVER_CAFE_MENU_GIFT_ID=
NAVER_CAFE_MENU_ELECTRONICS_DIGITAL_ID=
NAVER_CAFE_MENU_FOOD_FRESH_ID=
NAVER_CAFE_MENU_LIVING_GOODS_ID=
NAVER_CAFE_MENU_HOME_INTERIOR_ID=
NAVER_CAFE_MENU_BEAUTY_ID=
NAVER_CAFE_MENU_KITCHEN_GOODS_ID=
NAVER_CAFE_MENU_FASHION_ID=
NAVER_CAFE_MENU_PET_ID=
NAVER_CAFE_MENU_BABY_KIDS_ID=
NAVER_CAFE_MENU_SPORTS_LEISURE_ID=
NAVER_CAFE_MENU_OFFICE_STATIONERY_ID=
NAVER_CAFE_MENU_CAR_GOODS_ID=
NAVER_CAFE_MENU_TOYS_HOBBIES_ID=
NAVER_CAFE_MENU_BOOKS_ID=
NAVER_CAFE_MENU_HEALTH_MEDICAL_ID=
```

WordPress 카테고리 라우팅을 사용하려면 CP 루트와 하위 카테고리 ID를 등록한다. 하위 카테고리 ID가 비어 있으면 CP 루트 카테고리만 사용한다.

```env
WORDPRESS_CATEGORY_CP_ID=85
WORDPRESS_CATEGORY_LIVING_APPLIANCE_ID=
WORDPRESS_CATEGORY_KITCHEN_APPLIANCE_ID=
WORDPRESS_CATEGORY_CLEANING_LIVING_ID=
WORDPRESS_CATEGORY_GIFT_ID=
WORDPRESS_CATEGORY_ELECTRONICS_DIGITAL_ID=
WORDPRESS_CATEGORY_FOOD_FRESH_ID=
WORDPRESS_CATEGORY_LIVING_GOODS_ID=
WORDPRESS_CATEGORY_HOME_INTERIOR_ID=
WORDPRESS_CATEGORY_BEAUTY_ID=
WORDPRESS_CATEGORY_KITCHEN_GOODS_ID=
WORDPRESS_CATEGORY_FASHION_ID=
WORDPRESS_CATEGORY_PET_ID=
WORDPRESS_CATEGORY_BABY_KIDS_ID=
WORDPRESS_CATEGORY_SPORTS_LEISURE_ID=
WORDPRESS_CATEGORY_OFFICE_STATIONERY_ID=
WORDPRESS_CATEGORY_CAR_GOODS_ID=
WORDPRESS_CATEGORY_TOYS_HOBBIES_ID=
WORDPRESS_CATEGORY_BOOKS_ID=
WORDPRESS_CATEGORY_HEALTH_MEDICAL_ID=
```

카페 메뉴도 같은 방식으로 라우팅한다. 카테고리별 메뉴 ID가 비어 있으면 `NAVER_CAFE_MENU_ID`를 fallback으로 사용하고, 기본 메뉴 ID도 없으면 카페 업로드만 건너뛴다.

발행 상태는 아래 값으로 제어한다.

```env
WP_AUTOPUBLISH_STATUS=publish
CODEX_AUTOPUBLISH_INTERVAL_MINUTES=30
CODEX_DELETE_SOURCE_AFTER_PUBLISH=true
CODEX_CONTENT_RETENTION_DAYS=0
CODEX_SAVE_LOCAL_DRAFTS=false
```

현재 운영에서는 `WP_AUTOPUBLISH_STATUS=publish`를 기본값으로 둔다. `CODEX_DELETE_SOURCE_AFTER_PUBLISH=true`, `CODEX_CONTENT_RETENTION_DAYS=0`, `CODEX_SAVE_LOCAL_DRAFTS=false`를 기본값으로 두어 공개 발행 성공 후 로컬 원본을 보관하지 않는다.

## 11. WordPress 식별 정보

WordPress draft는 태그와 커스텀 meta를 함께 사용해 식별한다.

태그:

```text
codex-automation
coupang-partners
pending-review
```

커스텀 meta:

```text
cp_source = codex_automation
cp_workflow = coupang_partners
cp_review_status = pending_review
cp_keyword = 선택된 키워드
cp_article_type = 글 유형
```

단, WordPress REST API에서 커스텀 meta를 쓰려면 해당 meta key가 `show_in_rest`로 등록되어 있어야 할 수 있다. 초기 구현에서는 태그 기반을 필수로 하고, meta 등록이 가능하면 함께 저장한다.

## 12. 검수 기준

초기 1~2주는 WordPress draft를 사람이 검수한다.

검수 점수:

```text
키워드 적합성 20점
상품 선별 근거 25점
가격대/브랜드 균형 15점
본문 정보성 20점
전환 요소와 버튼 문맥 자연스러움 10점
고지/링크 정상성 10점
총점 100점
```

자동 publish 전환 기준:

```text
최근 30개 draft 중 85점 이상 글 비율 80% 이상
사람이 폐기한 글 10% 이하
쿠팡 링크 오류 0건
중복 주제 오류 0건
```

## 13. 원본 보관 정책

A 자동화는 WordPress 공개 발행에 필요한 동안만 원문과 썸네일 산출물을 임시 파일로 사용할 수 있다.

운영 흐름:

```text
1. A 자동화가 글 생성
2. 필요 시 임시 Markdown/HTML/썸네일 파일 생성
3. WordPress `publish` 업로드 성공
4. 네이버 카페 요약 업로드 시도
5. `data/codex-publisher-history.json`에 post id, URL, 키워드, 상품 id, 상태만 기록
6. 임시 Markdown/HTML/썸네일 파일 삭제
```

기본 정책:

```text
발행 성공 후 원본을 보관하지 않는다.
기본 보존 기간은 0일이다.
장애 분석이나 수동 검수 목적일 때만 `CODEX_SAVE_LOCAL_DRAFTS=true`로 임시 보관한다.
```

원본을 로컬에 남기지 않는 이유는 공개 발행 후 WordPress가 원본 저장소 역할을 하고, 로컬에는 중복 방지와 감사에 필요한 최소 메타데이터만 있으면 충분하기 때문이다.

## 14. macOS 알림

A 자동화는 WordPress 공개 발행 성공 또는 실패 시마다 macOS 로컬 알림을 표시한다.

예:

```text
제목: 쿠팡 자동 발행
내용: WordPress 공개 발행 완료: 에어프라이어 추천 TOP 5
```

실패 알림 대상:

- 필수 API 키 누락
- 네이버 데이터 수집 실패
- 쿠팡 상품 조회 실패
- WordPress 업로드 실패
- 하루 생성 상한 도달
- WordPress draft 수와 로컬 JSON 기록 불일치

macOS 알림은 로컬 실행 환경에서만 동작한다. 맥북이 잠자기 상태이거나 Codex Automation 실행 환경이 local이 아니면 보장되지 않는다.

## 15. 구현 순서

1. 운영 파일과 `frontend/.env.local` 로딩 방식 정의
2. C 자동화용 키워드 후보 생성 스크립트 작성
3. A 자동화용 WordPress draft 생성 스크립트 작성
4. B 자동화용 승인 후 배포 스크립트 작성
5. Codex Automation 3개 등록
6. 첫 1~2주 draft 검수 운영
7. 검수 통과율 기준 충족 시 publish 전환 검토

## 16. CLI 운영 흐름

A 자동화는 Codex 자체 모델이 글 판단과 작성을 담당해야 하므로, CLI도 CP9 내부 오토파일럿 파이프라인이나 프로젝트 LLM API 키를 직접 호출하지 않는다. 로컬 반복 실행은 `tools/codex-publisher/autopublish-cli.mjs`를 사용한다.

검증용 1건 발행:

```bash
node tools/codex-publisher/autopublish-cli.mjs preview
```

이 명령은 `pending` 후보 1개만 처리하고 WordPress에는 `draft` 상태로 올리도록 Codex CLI에 지시한다. 목적은 공개 배치 전에 본문 디자인, 비교표, 모바일 카드, 이미지, 가격 확인 버튼, 쿠팡 고지, 링크 구조를 사람이 확인하는 것이다.

검증 통과 후 배치 공개 발행:

```bash
node tools/codex-publisher/autopublish-cli.mjs batch --count 3
```

Codex child session에서 외부 네트워크가 막히는 환경에서는 `--bypass-sandbox`를 붙인다.

```bash
node tools/codex-publisher/autopublish-cli.mjs batch --count 3 --bypass-sandbox
```

배치 명령은 A 자동화 계약 그대로 `publish` 상태 발행을 반복한다. 각 반복은 `data/keyword-candidates.json`의 다음 `pending` 후보 1개를 선택하며, 품질 점수, 쿠팡 고지, 이미지, 링크, 표 구조가 미달이면 해당 회차를 중단하고 오류를 보고한다.

실행 전 점검:

```bash
node tools/codex-publisher/autopublish-cli.mjs preflight
```

preflight는 필수 파일과 환경변수의 존재 여부만 확인한다. `frontend/.env.local`의 비밀값은 출력하지 않고 `set` 또는 `empty`만 표시한다.

## 17. 보류 항목

- 티스토리는 공식 API 기반 발행이 어려우므로 1차 범위에서 제외한다.
- 티스토리 Playwright 자동화는 별도 설계로 분리한다.
- 외부 푸시 알림은 초기 범위에서 제외하고 macOS 로컬 알림부터 사용한다.
- 네이버 카페 업로드는 승인된 WordPress 글만 대상으로 한다.
