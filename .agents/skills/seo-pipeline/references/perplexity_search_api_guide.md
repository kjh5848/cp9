# Perplexity Search API 가이드 (Quickstart 분석)

이 문서는 Perplexity의 공식 [Search API Quickstart](https://docs.perplexity.ai/docs/search/quickstart) 문서를 바탕으로 작성된 한국어 요약 및 가이드입니다. 

---

## 1. 설치 및 인증 (Installation & Authentication)

Perplexity Search API를 사용하려면 공식 Python SDK인 `perplexityai`를 설치해야 합니다.

```bash
pip install perplexityai
```

**환경 변수 설정**
운영체제에 맞게 API 키를 `PERPLEXITY_API_KEY` 환경 변수로 설정합니다.
```bash
export PERPLEXITY_API_KEY="your_api_key_here"
```

---

## 2. 핵심 기능 및 기본 사용법 (Basic Usage)

### 2.1 단일 쿼리 검색 (Single Web Search)
문자열(String) 형태로 검색어를 전달하여 결과를 가져옵니다.

```python
from perplexity import Perplexity
client = Perplexity()

search = client.search.create(
    query="latest AI developments 2024",
    max_results=5,
    max_tokens_per_page=4096
)

# 단일 쿼리의 경우 search.results는 1차원 리스트(List) 형태입니다.
for result in search.results:
    print(f"{result.title}: {result.url}")
```

### 2.2 다중 쿼리 검색 (Multi-Query Web Search)
배열(List) 형태로 여러 검색어를 한 번에 요청할 수 있습니다.

```python
search = client.search.create(
    query=[
        "artificial intelligence trends 2024",
        "machine learning breakthroughs recent",
        "AI applications in healthcare"
    ],
    max_results=5
)

# 다중 쿼리의 경우 search.results는 2차원 리스트(List[List]) 형태가 됩니다.
for i, query_results in enumerate(search.results):
    print(f"Results for query {i+1}:")
    for result in query_results:
        print(f"  {result.title}: {result.url}")
```

### 2.3 지역 필터링 (Regional Web Search)
ISO 국가 코드를 사용하여 특정 국가/지역의 검색 결과를 우선적으로 가져옵니다.
```python
search = client.search.create(
    query="government policies on renewable energy",
    country="US", # ISO 국가 코드 (예: KR, US)
    max_results=5
)
```

### 2.4 도메인 필터링 (Domain Filtering)
특정 도메인만 포함(Allowlist)하거나 제외(Denylist)할 수 있습니다.
* **Allowlist**: `search_domain_filter=["science.org", "pnas.org"]` (해당 도메인만 검색)
* **Denylist**: `search_domain_filter=["-pinterest.com", "-reddit.com"]` (앞에 `-` 기호 추가 시 제외)

### 2.5 언어 필터링 (Language Filtering)
원하는 언어의 웹페이지 결과만 필터링합니다. 다국어 배열을 지원합니다.
```python
search = client.search.create(
    query="latest AI news",
    search_language_filter=["en", "fr", "de", "ko"],
    max_results=10
)
```

### 2.6 토큰(콘텐츠) 추출 예산 제어 (Content Budget Control)
가져온 웹 문서의 스니펫(요약 텍스트) 길이를 제어하는 두 가지 파라미터가 있습니다.
* `max_tokens_per_page`: **단일 결과(페이지) 당** 추출할 최대 토큰 수
* `max_tokens`: **전체 결과의** 누적 최대 토큰 수 (예산)
```python
detailed_search = client.search.create(
    query="renewable energy technologies",
    max_results=10,
    max_tokens=50000,         # 총 콘텐츠 예산
    max_tokens_per_page=4096  # 페이지 당 최대 토큰 한도
)
```

---

## 🚨 3. 공식 문서상의 오류 및 주의사항 (Errors in Perplexity Docs)

공식 Quickstart 문서에는 개발자에게 혼선을 줄 수 있는 몇 가지 명백한 오류(혹은 설계상 아쉬운 점)가 존재합니다.

### ① `search.results` 반환 타입의 비일관성 (Type Inconsistency)
단일 쿼리(`query="string"`)를 보낼 때와 다중 쿼리(`query=["array"]`)를 보낼 때 응답 객체 `search.results`의 구조가 동적으로 바뀝니다.
- **단일 쿼리 응답**: `List[Result]` (1차원 배열)
- **다중 쿼리 응답**: `List[List[Result]]` (2차원 배열)
이는 파이썬과 같이 정적 타입 힌팅을 주로 사용하는 모던 환경에서 예기치 않은 `TypeError`, `AttributeError` 버그를 유발하기 쉬운 설계(안티패턴)입니다. 예제 코드의 반복문(`for`) 구조가 달라진 것을 반드시 유의해야 합니다.

### ② JSON 응답 예제의 환각 데이터 날짜 오류 (Hallucinated Dates)
공식 문서 내 **Basic Usage** 항목에서 보여주고 있는 응답 JSON 샘플 객체를 보면 다음과 같은 데이터가 하드코딩되어 있습니다.
```json
{
  "title": "2024: A year of extraordinary progress and advancement in AI...",
  "date": "2025-01-23",
  "last_updated": "2025-09-25"
}
```
2024년의 소식을 다루는 문서임에도 불구하고 업데이트 일자(`last_updated`)가 문서 작성 시점 대비 훨씬 미래인 `2025-09-25`로 들어가 있습니다. 이는 문서 에디터가 예시 페이로드를 생성할 때 AI(LLM)에 의존하면서 발생한 환각(Hallucination)이 검수 없이 배포되었을 가능성을 강하게 시사합니다.

### ③ 패키지 설치명과 모듈 임포트명 불일치
* **설치 (Install)**: `pip install perplexityai`
* **사용 (Import)**: `from perplexity import Perplexity`
설치하는 패키지명은 `perplexityai`이지만, 파이썬 코드상에서 불러오는 모듈의 이름은 `perplexity`입니다. 처음 연동하는 개발자가 무심코 `import perplexityai`를 시도하다가 `ModuleNotFoundError`를 겪기 쉬우므로 주의가 필요합니다.
