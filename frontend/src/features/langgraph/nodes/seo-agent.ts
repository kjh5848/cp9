'use server';

import { LangGraphState, LangGraphNode } from '../types';

/**
 * ReAct 패턴을 사용한 SEO 콘텐츠 생성 노드
 * 상품 정보를 바탕으로 SEO 최적화된 블로그 콘텐츠를 생성
 * 
 * @param state - LangGraph 상태 객체
 * @returns 업데이트된 상태 객체
 */
export async function seoAgentNode(state: LangGraphState): Promise<Partial<LangGraphState>> {
  try {
    const { productInfo, enrichedData } = state.scrapedData;
    const { keyword } = state.input;
    
    // 상품 정보 선택 (크롤링된 정보 또는 LLM 보강 정보)
    const products = productInfo.length > 0 ? productInfo : enrichedData;
    
    if (!products || products.length === 0) {
      throw new Error('상품 정보가 없습니다');
    }

    console.log(`[seoAgent] ${products.length}개 상품으로 SEO 콘텐츠 생성 시작`);

    // SEO 콘텐츠 생성
    const seoContent = await generateSEOContent(products, keyword);

    console.log('[seoAgent] SEO 콘텐츠 생성 완료');

    return {
      seoContent,
      metadata: {
        ...state.metadata,
        currentNode: 'seoAgent',
        completedNodes: [...state.metadata.completedNodes, 'seoAgent'],
        updatedAt: Date.now()
      }
    };
  } catch (error) {
    console.error('[seoAgent] 오류:', error);
    throw new Error(`SEO 콘텐츠 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

/**
 * ReAct 패턴을 사용하여 SEO 콘텐츠를 생성하는 함수
 * 
 * @param products - 상품 정보 배열
 * @param keyword - 검색 키워드
 * @returns SEO 콘텐츠 객체
 */
async function generateSEOContent(products: any[], keyword?: string): Promise<{
  title: string;
  content: string;
  keywords: string[];
  summary: string;
}> {
  try {
    // ReAct 패턴: Think -> Act -> Observe -> Reflect
    const thoughts = await thinkAboutContent(products, keyword);
    const actions = await planActions(thoughts);
    const observations = await executeActions(actions, products);
    const reflection = await reflectOnResults(observations);

    // 최종 SEO 콘텐츠 생성
    const seoContent = await createFinalContent(reflection, products, keyword);

    return seoContent;
  } catch (error) {
    console.error('[generateSEOContent] 오류:', error);
    // 오류 발생 시 기본 콘텐츠 생성
    return generateFallbackContent(products, keyword);
  }
}

/**
 * ReAct 패턴 1단계: 콘텐츠에 대한 사고
 */
async function thinkAboutContent(products: any[], keyword?: string): Promise<string[]> {
  const thoughts: string[] = [];
  
  // 상품 분석
  thoughts.push(`분석할 상품 수: ${products.length}개`);
  
  if (keyword) {
    thoughts.push(`타겟 키워드: ${keyword}`);
  }
  
  // 상품 카테고리 분석
  const categories = [...new Set(products.map(p => p.categoryName))];
  thoughts.push(`상품 카테고리: ${categories.join(', ')}`);
  
  // 가격대 분석
  const prices = products.map(p => p.productPrice).filter(p => p > 0);
  if (prices.length > 0) {
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    thoughts.push(`평균 가격: ${avgPrice.toLocaleString()}원`);
  }
  
  // 특징 분석
  const hasRocket = products.some(p => p.isRocket);
  const hasFreeShipping = products.some(p => p.isFreeShipping);
  thoughts.push(`로켓배송 상품: ${hasRocket ? '있음' : '없음'}`);
  thoughts.push(`무료배송 상품: ${hasFreeShipping ? '있음' : '없음'}`);
  
  return thoughts;
}

/**
 * ReAct 패턴 2단계: 액션 계획
 */
async function planActions(thoughts: string[]): Promise<string[]> {
  const actions: string[] = [];
  
  actions.push('상품 비교 분석 수행');
  actions.push('타겟 고객층 분석');
  actions.push('경쟁력 분석');
  actions.push('구매 가이드 작성');
  actions.push('추천 상품 선별');
  actions.push('SEO 키워드 최적화');
  
  return actions;
}

/**
 * ReAct 패턴 3단계: 액션 실행
 */
async function executeActions(actions: string[], products: any[]): Promise<Record<string, any>> {
  const observations: Record<string, any> = {};
  
  for (const action of actions) {
    try {
      switch (action) {
        case '상품 비교 분석 수행':
          observations.comparison = await analyzeProductComparison(products);
          break;
        case '타겟 고객층 분석':
          observations.targetAudience = await analyzeTargetAudience(products);
          break;
        case '경쟁력 분석':
          observations.competitiveness = await analyzeCompetitiveness(products);
          break;
        case '구매 가이드 작성':
          observations.buyingGuide = await createBuyingGuide(products);
          break;
        case '추천 상품 선별':
          observations.recommendations = await selectRecommendations(products);
          break;
        case 'SEO 키워드 최적화':
          observations.seoKeywords = await optimizeSEOKeywords(products);
          break;
      }
    } catch (error) {
      console.error(`[executeActions] ${action} 실행 실패:`, error);
    }
  }
  
  return observations;
}

/**
 * ReAct 패턴 4단계: 결과 반영
 */
async function reflectOnResults(observations: Record<string, any>): Promise<string> {
  let reflection = '분석 결과:\n';
  
  if (observations.comparison) {
    reflection += `- 상품 비교: ${observations.comparison}\n`;
  }
  
  if (observations.targetAudience) {
    reflection += `- 타겟 고객: ${observations.targetAudience}\n`;
  }
  
  if (observations.competitiveness) {
    reflection += `- 경쟁력: ${observations.competitiveness}\n`;
  }
  
  if (observations.buyingGuide) {
    reflection += `- 구매 가이드: ${observations.buyingGuide}\n`;
  }
  
  if (observations.recommendations) {
    reflection += `- 추천 상품: ${observations.recommendations}\n`;
  }
  
  if (observations.seoKeywords) {
    reflection += `- SEO 키워드: ${observations.seoKeywords}\n`;
  }
  
  return reflection;
}

/**
 * 최종 SEO 콘텐츠 생성
 */
async function createFinalContent(
  reflection: string, 
  products: any[], 
  keyword?: string
): Promise<{
  title: string;
  content: string;
  keywords: string[];
  summary: string;
}> {
  // 제목 생성
  const title = generateTitle(products, keyword);
  
  // 본문 콘텐츠 생성
  const content = generateContent(reflection, products, keyword);
  
  // 키워드 추출
  const keywords = extractKeywords(products, keyword);
  
  // 요약 생성
  const summary = generateSummary(products, keyword);
  
  return {
    title,
    content,
    keywords,
    summary
  };
}

/**
 * 제목 생성
 */
function generateTitle(products: any[], keyword?: string): string {
  const category = products[0]?.categoryName || '상품';
  const count = products.length;
  
  if (keyword) {
    return `2024년 ${keyword} 추천 TOP ${count} - ${category} 완벽 가이드`;
  }
  
  return `2024년 ${category} 추천 TOP ${count} - 완벽 구매 가이드`;
}

/**
 * 본문 콘텐츠 생성
 */
function generateContent(reflection: string, products: any[], keyword?: string): string {
  let content = '';
  
  // 헤더
  content += `# ${generateTitle(products, keyword)}\n\n`;
  
  // 소개
  content += `안녕하세요! 오늘은 ${keyword || '최고의 상품'}에 대해 알아보겠습니다.\n\n`;
  
  // 분석 결과
  content += `## 📊 분석 결과\n\n`;
  content += reflection + '\n\n';
  
  // 상품 리뷰
  content += `## 🛍️ 추천 상품 리뷰\n\n`;
  
  products.forEach((product, index) => {
    content += `### ${index + 1}. ${product.productName}\n\n`;
    content += `**가격**: ${product.productPrice.toLocaleString()}원\n`;
    content += `**평점**: ${product.rating}/5 (리뷰 ${product.reviewCount}개)\n`;
    
    if (product.isRocket) {
      content += `🚀 **로켓배송**\n`;
    }
    
    if (product.isFreeShipping) {
      content += `📦 **무료배송**\n`;
    }
    
    content += `**설명**: ${product.description || '상품 설명이 없습니다.'}\n\n`;
    
    if (product.enrichedFeatures) {
      content += `**주요 특징**:\n`;
      product.enrichedFeatures.forEach((feature: string) => {
        content += `- ${feature}\n`;
      });
      content += '\n';
    }
    
    content += `[상품 보기](${product.productUrl})\n\n`;
  });
  
  // 구매 가이드
  content += `## 💡 구매 가이드\n\n`;
  content += `1. **예산 설정**: ${products[0]?.categoryName} 구매 시 예산을 먼저 정하세요.\n`;
  content += `2. **기능 확인**: 필요한 기능이 모두 포함되어 있는지 확인하세요.\n`;
  content += `3. **리뷰 확인**: 실제 사용자 리뷰를 꼭 확인하세요.\n`;
  content += `4. **배송 조건**: 로켓배송이나 무료배송 혜택을 활용하세요.\n\n`;
  
  // 결론
  content += `## 🎯 결론\n\n`;
  content += `이상으로 ${keyword || '추천 상품'}에 대한 리뷰를 마치겠습니다. `;
  content += `각자의 필요에 맞는 상품을 선택하시기 바랍니다.\n\n`;
  
  return content;
}

/**
 * 키워드 추출
 */
function extractKeywords(products: any[], keyword?: string): string[] {
  const keywords: string[] = [];
  
  if (keyword) {
    keywords.push(keyword);
  }
  
  // 카테고리 키워드
  const categories = [...new Set(products.map(p => p.categoryName))];
  keywords.push(...categories);
  
  // 상품명에서 키워드 추출
  products.forEach(product => {
    const nameKeywords = product.productName.split(' ').slice(0, 3);
    keywords.push(...nameKeywords);
  });
  
  // 중복 제거 및 정리
  return [...new Set(keywords)].filter(k => k.length > 1).slice(0, 10);
}

/**
 * 요약 생성
 */
function generateSummary(products: any[], keyword?: string): string {
  const count = products.length;
  const category = products[0]?.categoryName || '상품';
  
  return `${keyword || category} 추천 상품 ${count}개를 소개했습니다. ` +
         `가격, 기능, 리뷰를 종합적으로 분석하여 최고의 선택을 도와드립니다.`;
}

/**
 * 상품 비교 분석
 */
async function analyzeProductComparison(products: any[]): Promise<string> {
  const prices = products.map(p => p.productPrice).filter(p => p > 0);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  
  return `평균 가격 ${avgPrice.toLocaleString()}원, 가격대 ${Math.min(...prices).toLocaleString()}원~${Math.max(...prices).toLocaleString()}원`;
}

/**
 * 타겟 고객층 분석
 */
async function analyzeTargetAudience(products: any[]): Promise<string> {
  const categories = [...new Set(products.map(p => p.categoryName))];
  return `${categories.join(', ')} 카테고리 관심 고객`;
}

/**
 * 경쟁력 분석
 */
async function analyzeCompetitiveness(products: any[]): Promise<string> {
  const rocketCount = products.filter(p => p.isRocket).length;
  const freeShippingCount = products.filter(p => p.isFreeShipping).length;
  
  return `로켓배송 ${rocketCount}개, 무료배송 ${freeShippingCount}개`;
}

/**
 * 구매 가이드 작성
 */
async function createBuyingGuide(products: any[]): Promise<string> {
  return '가격, 기능, 배송 조건을 종합적으로 고려한 구매 가이드';
}

/**
 * 추천 상품 선별
 */
async function selectRecommendations(products: any[]): Promise<string> {
  const topProducts = products.slice(0, 3).map(p => p.productName);
  return `TOP 3: ${topProducts.join(', ')}`;
}

/**
 * SEO 키워드 최적화
 */
async function optimizeSEOKeywords(products: any[]): Promise<string> {
  const keywords = extractKeywords(products);
  return keywords.slice(0, 5).join(', ');
}

/**
 * 기본 콘텐츠 생성 (오류 시 사용)
 */
function generateFallbackContent(products: any[], keyword?: string): {
  title: string;
  content: string;
  keywords: string[];
  summary: string;
} {
  const title = generateTitle(products, keyword);
  const content = `# ${title}\n\n상품 정보를 불러오는 중 오류가 발생했습니다.`;
  const keywords = extractKeywords(products, keyword);
  const summary = '상품 정보 로딩 중 오류 발생';
  
  return { title, content, keywords, summary };
}

/**
 * seoAgent 노드의 조건부 실행 함수
 * 
 * @param state - LangGraph 상태 객체
 * @returns 다음 노드 이름
 */
export function seoAgentCondition(state: LangGraphState): string {
  const { title, content } = state.seoContent;
  
  // SEO 콘텐츠가 성공적으로 생성되었으면 다음 노드로 진행
  if (title && content) {
    return 'wordpressPublisher';
  }
  
  // 콘텐츠 생성 실패 시 종료
  console.log('[seoAgent] SEO 콘텐츠 생성 실패, 프로세스 종료');
  return 'END';
}

/**
 * seoAgent 노드 테스트 함수
 */
export async function testSEOAgentNode() {
  const mockProducts = [
    {
      productId: '123456',
      productName: '삼성 갤럭시북4',
      productPrice: 1499000,
      categoryName: '노트북',
      rating: 4.8,
      reviewCount: 156,
      description: '인텔 i5 15.6인치 사무용 노트북',
      isRocket: true,
      isFreeShipping: true,
      productUrl: 'https://example.com',
      enrichedFeatures: ['가벼운 무게', '긴 배터리 수명', '빠른 성능']
    }
  ];

  const initialState: LangGraphState = {
    input: {
      urls: [],
      productIds: ['123456'],
      keyword: '노트북'
    },
    scrapedData: { 
      productInfo: mockProducts, 
      enrichedData: [] 
    },
    seoContent: { title: '', content: '', keywords: [], summary: '' },
    wordpressPost: { status: 'draft' },
    metadata: {
      threadId: 'test-thread-123',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentNode: 'seoAgent',
      completedNodes: ['extractIds', 'staticCrawler']
    }
  };

  try {
    const result = await seoAgentNode(initialState);
    console.log('테스트 결과:', result);
    return result;
  } catch (error) {
    console.error('테스트 실패:', error);
    throw error;
  }
} 