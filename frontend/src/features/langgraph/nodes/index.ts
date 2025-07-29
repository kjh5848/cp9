// 노드들 export
export { extractIdsNode, extractIdsCondition, testExtractIdsNode } from './extract-ids';
export { staticCrawlerNode, staticCrawlerCondition, testStaticCrawlerNode } from './static-crawler';
export { dynamicCrawlerNode, dynamicCrawlerCondition, testDynamicCrawlerNode } from './dynamic-crawler';
export { fallbackLLMNode, fallbackLLMCondition, testFallbackLLMNode } from './fallback-llm';
export { seoAgentNode, seoAgentCondition, testSEOAgentNode } from './seo-agent';
export { wordpressPublisherNode, wordpressPublisherCondition, testWordPressPublisherNode, validateWordPressConfig } from './wordpress-publisher';

// 노드 타입 정의
export type LangGraphNodeType = 
  | 'extractIds'
  | 'staticCrawler'
  | 'dynCrawler'
  | 'fallbackLLM'
  | 'seoAgent'
  | 'wordpressPublisher';

// 노드 실행 순서
export const NODE_EXECUTION_ORDER: LangGraphNodeType[] = [
  'extractIds',
  'staticCrawler',
  'dynCrawler',
  'fallbackLLM',
  'seoAgent',
  'wordpressPublisher'
];

// 노드 의존성 정의
export const NODE_DEPENDENCIES: Record<LangGraphNodeType, LangGraphNodeType[]> = {
  extractIds: [],
  staticCrawler: ['extractIds'],
  dynCrawler: ['extractIds'],
  fallbackLLM: ['extractIds'],
  seoAgent: ['extractIds', 'staticCrawler', 'dynCrawler', 'fallbackLLM'],
  wordpressPublisher: ['seoAgent']
};

// 모든 노드 테스트 함수
export async function testAllNodes(): Promise<void> {
  console.log('[testAllNodes] 모든 노드 테스트 시작');
  
  try {
    // 각 노드별 테스트 실행
    await testExtractIdsNode();
    console.log('✅ extractIds 노드 테스트 완료');
    
    await testStaticCrawlerNode();
    console.log('✅ staticCrawler 노드 테스트 완료');
    
    await testDynamicCrawlerNode();
    console.log('✅ dynamicCrawler 노드 테스트 완료');
    
    await testFallbackLLMNode();
    console.log('✅ fallbackLLM 노드 테스트 완료');
    
    await testSEOAgentNode();
    console.log('✅ seoAgent 노드 테스트 완료');
    
    await testWordPressPublisherNode();
    console.log('✅ wordpressPublisher 노드 테스트 완료');
    
    console.log('[testAllNodes] 모든 노드 테스트 완료');
  } catch (error) {
    console.error('[testAllNodes] 노드 테스트 실패:', error);
    throw error;
  }
} 