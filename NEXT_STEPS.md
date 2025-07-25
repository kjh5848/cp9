# 🚀 LangGraph 자동화 시스템 - 다음 작업 가이드

## 현재 상태

### ✅ 완료된 작업
1. **프로젝트 상태 분석** - 기존 CP9 구조와 LangGraph 통합 가능성 검토
2. **LangGraph 아키텍처 설계** - 딥링크 → 쿠팡 → Perplexity → SEO → WordPress 플로우 설계
3. **Infrastructure 레이어 확장** - Perplexity MCP, Redis, WordPress API 클라이언트 추가
4. **Edge Functions 구현** - Cache Gateway와 Queue Worker 구현

### 🔄 진행 중인 작업
5. **LangGraph 노드 구현** - Scrape Graph와 SEO Agent 노드들 구현
6. **WordPress 연동 구현** - WordPress REST API 클라이언트와 중복 게시 방지 로직
7. **프론트엔드 통합** - 기존 CP9 UI에 LangGraph 기반 자동화 플로우 통합
8. **테스트 및 최적화** - 전체 플로우 E2E 테스트, 성능 최적화, 오류 처리 개선

## 다음 작업: LangGraph 노드 구현

### 작업 목표
Scrape Graph와 SEO Agent 노드들을 TypeScript로 구현하고 메모리 관리 전략을 적용합니다.

### 구현할 파일들

#### 1. LangGraph 노드 구현
```
frontend/src/features/langgraph/nodes/
├── extract-ids.ts          # 상품 ID 추출 노드
├── static-crawler.ts       # 정적 크롤링 노드
├── dynamic-crawler.ts      # 동적 크롤링 노드 (Playwright)
├── fallback-llm.ts         # LLM 보강 노드 (Perplexity)
├── seo-agent.ts           # SEO 콘텐츠 생성 노드
└── wordpress-publisher.ts  # WordPress 발행 노드
```

#### 2. LangGraph 그래프 조합
```
frontend/src/features/langgraph/graphs/
├── scrape-graph.ts         # 스크래핑 그래프
├── seo-graph.ts           # SEO 그래프
└── main-graph.ts          # 메인 그래프 (전체 플로우)
```

#### 3. 메모리 관리 구현
```
frontend/src/features/langgraph/memory/
├── redis-saver.ts         # Redis 체크포인트 저장
├── memory-saver.ts        # 메모리 요약 저장
└── cross-thread-kv.ts     # 크로스 스레드 키-값 저장
```

### 구현 순서

#### 1단계: 기본 노드 구현
1. **extract-ids.ts** - URL에서 상품 ID 추출
2. **static-crawler.ts** - 정적 HTML 파싱
3. **dynamic-crawler.ts** - Playwright 동적 크롤링

#### 2단계: LLM 노드 구현
4. **fallback-llm.ts** - Perplexity API 연동
5. **seo-agent.ts** - SEO 콘텐츠 생성 (ReAct 패턴)

#### 3단계: 발행 노드 구현
6. **wordpress-publisher.ts** - WordPress REST API 연동

#### 4단계: 그래프 조합
7. **scrape-graph.ts** - 스크래핑 워크플로우
8. **seo-graph.ts** - SEO 워크플로우
9. **main-graph.ts** - 전체 플로우 조합

### 핵심 구현 포인트

#### 메모리 관리 전략
```typescript
// RedisSaver - 장기 스냅샷 저장
const redisSaver = new RedisSaver({
  redisUrl: process.env.REDIS_URL,
  ttl: 86400 // 24시간
});

// MemorySaver - 대화 히스토리 요약
const memorySaver = new MemorySaver({
  maxMessages: 10,
  summaryThreshold: 5
});

// Cross-thread KV - 중복 방지
const crossThreadKV = new CrossThreadKV({
  redisUrl: process.env.REDIS_URL
});
```

#### 노드 실행 순서
```typescript
const nodeExecutionOrder = [
  'extractIds',
  'cacheGateway', 
  'staticCrawler',
  'dynCrawler',
  'fallbackLLM',
  'seoAgent',
  'wordpressPublisher'
];
```

#### 오류 처리 및 재시도
```typescript
// 조건부 실행 규칙
const conditionalExecution = {
  skipOnCacheHit: ['staticCrawler', 'dynCrawler', 'fallbackLLM'],
  fallbackNodes: {
    staticCrawler: 'dynCrawler',
    dynCrawler: 'fallbackLLM',
    fallbackLLM: null
  }
};
```

### 필요한 의존성

#### LangGraph JS
```bash
npm install @langchain/langgraph
npm install @langchain/langgraph-redis
```

#### Playwright (동적 크롤링)
```bash
npm install playwright
npx playwright install
```

#### 기타 유틸리티
```bash
npm install cheerio          # HTML 파싱
npm install puppeteer-core   # 브라우저 자동화
```

### 테스트 방법

#### 1. 개별 노드 테스트
```typescript
// extract-ids 노드 테스트
const testUrls = [
  'https://www.coupang.com/vp/products/123456',
  'https://www.coupang.com/vp/products/789012'
];

const result = await extractIdsNode.invoke({
  urls: testUrls
});
```

#### 2. 그래프 통합 테스트
```typescript
// 전체 플로우 테스트
const initialState = {
  input: {
    urls: testUrls,
    productIds: [],
    keyword: '노트북'
  }
};

const result = await mainGraph.invoke(initialState, {
  configurable: { threadId: 'test_thread_123' }
});
```

### 환경변수 설정

#### .env.local 추가
```bash
# LangGraph 설정
LANGGRAPH_REDIS_URL=your_redis_url
LANGGRAPH_QUEUE_NAME=langgraph-queue
LANGGRAPH_MAX_CONCURRENCY=5

# Playwright 설정
PLAYWRIGHT_BROWSER_PATH=/usr/bin/chromium-browser
PLAYWRIGHT_HEADLESS=true

# 기타 설정
NODE_ENV=development
```

### 다음 작업 시작 방법

1. **저장소 클론**
```bash
git clone https://github.com/your-username/cp9.git
cd cp9
```

2. **의존성 설치**
```bash
cd frontend
npm install
```

3. **환경변수 설정**
```bash
cp .env.example .env.local
# .env.local 파일에 필요한 환경변수 설정
```

4. **개발 서버 시작**
```bash
npm run dev
```

5. **LangGraph 노드 구현 시작**
```bash
# 1단계: extract-ids 노드부터 시작
touch src/features/langgraph/nodes/extract-ids.ts
```

### 참고 자료

- [LangGraph JS 공식문서](https://langchain-ai.github.io/langgraph/)
- [LangGraph 메모리 관리 가이드](https://langchain-ai.github.io/langgraph/how-tos/memory/)
- [Playwright 공식문서](https://playwright.dev/)
- [Perplexity API 문서](https://docs.perplexity.ai/)

### 문제 해결

#### 자주 발생하는 문제
1. **Redis 연결 실패**: 환경변수 확인
2. **Playwright 설치 오류**: `npx playwright install --with-deps`
3. **메모리 부족**: Node.js 메모리 제한 증가 (`--max-old-space-size=4096`)

#### 디버깅 방법
```typescript
// 노드별 로깅
console.log('Node execution:', nodeName, input);

// 그래프 상태 추적
graph.on('nodeStart', (nodeName, input) => {
  console.log(`Starting node: ${nodeName}`);
});

graph.on('nodeEnd', (nodeName, output) => {
  console.log(`Completed node: ${nodeName}`);
});
```

---

**다음 작업자**: LangGraph 노드 구현을 시작하세요! 🚀 