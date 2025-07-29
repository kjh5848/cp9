// LangGraph 노드 테스트 스크립트
const { testExtractIdsNode } = require('./src/features/langgraph/nodes/extract-ids');
const { testStaticCrawlerNode } = require('./src/features/langgraph/nodes/static-crawler');
const { testDynamicCrawlerNode } = require('./src/features/langgraph/nodes/dynamic-crawler');
const { testFallbackLLMNode } = require('./src/features/langgraph/nodes/fallback-llm');
const { testSEOAgentNode } = require('./src/features/langgraph/nodes/seo-agent');
const { testWordPressPublisherNode } = require('./src/features/langgraph/nodes/wordpress-publisher');

async function runTests() {
  console.log('🚀 LangGraph 노드 테스트 시작\n');

  try {
    // 1. extractIds 노드 테스트
    console.log('1️⃣ extractIds 노드 테스트...');
    const extractResult = await testExtractIdsNode();
    console.log('✅ extractIds 결과:', JSON.stringify(extractResult, null, 2));
    console.log('');

    // 2. staticCrawler 노드 테스트
    console.log('2️⃣ staticCrawler 노드 테스트...');
    const staticResult = await testStaticCrawlerNode();
    console.log('✅ staticCrawler 결과:', JSON.stringify(staticResult, null, 2));
    console.log('');

    // 3. dynamicCrawler 노드 테스트
    console.log('3️⃣ dynamicCrawler 노드 테스트...');
    const dynamicResult = await testDynamicCrawlerNode();
    console.log('✅ dynamicCrawler 결과:', JSON.stringify(dynamicResult, null, 2));
    console.log('');

    // 4. fallbackLLM 노드 테스트
    console.log('4️⃣ fallbackLLM 노드 테스트...');
    const fallbackResult = await testFallbackLLMNode();
    console.log('✅ fallbackLLM 결과:', JSON.stringify(fallbackResult, null, 2));
    console.log('');

    // 5. seoAgent 노드 테스트
    console.log('5️⃣ seoAgent 노드 테스트...');
    const seoResult = await testSEOAgentNode();
    console.log('✅ seoAgent 결과:', JSON.stringify(seoResult, null, 2));
    console.log('');

    // 6. wordpressPublisher 노드 테스트
    console.log('6️⃣ wordpressPublisher 노드 테스트...');
    const wpResult = await testWordPressPublisherNode();
    console.log('✅ wordpressPublisher 결과:', JSON.stringify(wpResult, null, 2));
    console.log('');

    console.log('🎉 모든 노드 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

// 테스트 실행
runTests(); 