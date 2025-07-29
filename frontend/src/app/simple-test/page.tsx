'use client';

import { useState } from 'react';

export default function SimpleTestPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // URL에서 상품 ID 추출하는 함수
  const extractProductIdFromUrl = (url: string): string | null => {
    try {
      // 쿠팡 URL 패턴들
      const patterns = [
        /\/vp\/products\/(\d+)/,           // /vp/products/123456
        /pageKey=(\d+)/,                   // pageKey=123456
        /products\/(\d+)/,                 // /products/123456
        /itemId=(\d+)/                     // itemId=123456
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      return null;
    } catch (error) {
      console.error('[extractProductIdFromUrl] 오류:', error);
      return null;
    }
  };

  // 실제 extractIds 노드 로직 사용
  const testExtractIds = async () => {
    const testUrls = [
      'https://www.coupang.com/vp/products/123456?itemId=789012',
      'https://link.coupang.com/re/AFFSDP?pageKey=456789&itemId=123456',
      'https://www.coupang.com/products/987654'
    ];
    
    const productIds: string[] = [];
    
    for (const url of testUrls) {
      const productId = extractProductIdFromUrl(url);
      if (productId) {
        productIds.push(productId);
      }
    }
    
    return { productIds, urls: testUrls };
  };

  // 실제 static crawler 로직 시뮬레이션
  const testStaticCrawler = async () => {
    const productIds = ['123456', '789012'];
    const productInfo = productIds.map(id => ({
      productId: id,
      productName: `테스트 상품 ${id}`,
      productPrice: Math.floor(Math.random() * 1000000) + 100000,
      productImage: `https://example.com/images/${id}.jpg`,
      productUrl: `https://www.coupang.com/vp/products/${id}`,
      isRocket: Math.random() > 0.5,
      isFreeShipping: Math.random() > 0.5,
      categoryName: '가전디지털',
      rating: Math.random() * 5,
      reviewCount: Math.floor(Math.random() * 1000),
      description: `테스트 상품 ${id}의 상세 정보입니다.`,
      specifications: {
        '브랜드': '테스트 브랜드',
        '모델': `MODEL-${id}`,
        '색상': '블랙',
        '무게': '1.5kg'
      }
    }));
    
    return { productInfo };
  };

  // 실제 fallback LLM 로직 시뮬레이션
  const testFallbackLLM = async () => {
    const productIds = ['123456', '789012'];
    const enrichedData = productIds.map(id => ({
      productId: id,
      productName: `LLM 보강 상품 ${id}`,
      productPrice: Math.floor(Math.random() * 1000000) + 100000,
      productImage: `https://example.com/images/${id}.jpg`,
      productUrl: `https://www.coupang.com/vp/products/${id}`,
      isRocket: Math.random() > 0.5,
      isFreeShipping: Math.random() > 0.5,
      categoryName: '가전디지털',
      rating: Math.random() * 5,
      reviewCount: Math.floor(Math.random() * 1000),
      description: `LLM으로 보강된 상품 ${id}의 상세 정보입니다.`,
      specifications: {
        '브랜드': 'LLM 브랜드',
        '모델': `LLM-MODEL-${id}`,
        '색상': '화이트',
        '무게': '2.0kg'
      },
      enrichedFeatures: ['AI 추천', '스마트 기능', '고성능'],
      enrichedBenefits: ['편리함', '효율성', '안정성'],
      enrichedTargetAudience: '20-30대 직장인',
      enrichedComparison: '경쟁 제품 대비 우수한 성능',
      enrichedRecommendations: ['가성비 좋음', '디자인 우수', '기능 다양']
    }));
    
    return { enrichedData };
  };

  // 실제 SEO Agent 로직 시뮬레이션
  const testSEOAgent = async () => {
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

    // SEO 최적화된 제목 생성
    const title = `2024년 ${mockProducts[0].categoryName} 추천 TOP ${mockProducts.length} - 완벽 구매 가이드`;
    
    // SEO 최적화된 콘텐츠 생성
    const content = `# ${title}\n\n안녕하세요! 오늘은 ${mockProducts[0].categoryName}에 대해 알아보겠습니다.\n\n## 📊 분석 결과\n\n- 상품 비교: 평균 가격 ${mockProducts.reduce((sum, p) => sum + p.productPrice, 0).toLocaleString()}원\n- 타겟 고객: ${mockProducts[0].categoryName} 카테고리 관심 고객\n- 경쟁력: 로켓배송 ${mockProducts.filter(p => p.isRocket).length}개, 무료배송 ${mockProducts.filter(p => p.isFreeShipping).length}개\n- 구매 가이드: 가격, 기능, 배송 조건을 종합적으로 고려한 구매 가이드\n- 추천 상품: TOP ${mockProducts.length}: ${mockProducts.map(p => p.productName).join(', ')}\n- SEO 키워드: ${mockProducts[0].categoryName}, ${mockProducts[0].productName.split(' ')[0]}, 추천, 구매가이드\n\n## 🛍️ 추천 상품 리뷰\n\n${mockProducts.map((product, index) => `### ${index + 1}. ${product.productName}\n\n**가격**: ${product.productPrice.toLocaleString()}원\n**평점**: ${product.rating}/5 (리뷰 ${product.reviewCount}개)\n${product.isRocket ? '🚀 **로켓배송**\n' : ''}${product.isFreeShipping ? '📦 **무료배송**\n' : ''}**설명**: ${product.description}\n\n**주요 특징**:\n${product.enrichedFeatures?.map(feature => `- ${feature}`).join('\n') || '- 기본 기능'}\n\n[상품 보기](${product.productUrl})\n`).join('\n')}\n\n## 💡 구매 가이드\n\n1. **예산 설정**: ${mockProducts[0].categoryName} 구매 시 예산을 먼저 정하세요.\n2. **기능 확인**: 필요한 기능이 모두 포함되어 있는지 확인하세요.\n3. **리뷰 확인**: 실제 사용자 리뷰를 꼭 확인하세요.\n4. **배송 조건**: 로켓배송이나 무료배송 혜택을 활용하세요.\n\n## 🎯 결론\n\n이상으로 ${mockProducts[0].categoryName}에 대한 리뷰를 마치겠습니다. 각자의 필요에 맞는 상품을 선택하시기 바랍니다.`;
    
    const keywords = [mockProducts[0].categoryName, mockProducts[0].productName.split(' ')[0], '추천', '구매가이드'];
    const summary = `${mockProducts[0].categoryName} 추천 상품 ${mockProducts.length}개를 소개했습니다. 가격, 기능, 리뷰를 종합적으로 분석하여 최고의 선택을 도와드립니다.`;

    return { title, content, keywords, summary };
  };

  // 실제 WordPress Publisher 로직 시뮬레이션
  const testWordPressPublisher = async () => {
    const mockSEOContent = {
      title: '2024년 노트북 추천 TOP 1 - 완벽 구매 가이드',
      content: '# 2024년 노트북 추천 TOP 1\n\n노트북 추천 상품들을 소개합니다.',
      keywords: ['노트북', '추천', '구매가이드'],
      summary: '2024년 최고의 노트북 추천 상품들을 소개합니다.'
    };

    // WordPress API 호출 시뮬레이션
    const postResult = {
      id: Math.floor(Math.random() * 1000),
      link: 'https://example.com/wp/2024/01/test-post',
      status: 'draft'
    };

    return { 
      postId: postResult.id.toString(),
      postUrl: postResult.link,
      status: 'published',
      error: undefined
    };
  };

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFunction();
      setResults(prev => ({ ...prev, [testName]: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, [testName]: { error: error instanceof Error ? error.message : '알 수 없는 오류' } }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const tests = [
    { name: 'extractIds', function: testExtractIds },
    { name: 'staticCrawler', function: testStaticCrawler },
    { name: 'fallbackLLM', function: testFallbackLLM },
    { name: 'seoAgent', function: testSEOAgent },
    { name: 'wordpressPublisher', function: testWordPressPublisher },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">LangGraph 노드 간단 테스트</h1>
      
      <div className="grid gap-4">
        {tests.map(({ name, function: testFunction }) => (
          <div key={name} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{name}</h2>
              <button
                onClick={() => runTest(name, testFunction)}
                disabled={loading[name]}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading[name] ? '테스트 중...' : '테스트 실행'}
              </button>
            </div>
            
            {results[name] && (
              <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-semibold mb-2">결과:</h3>
                <pre className="text-sm overflow-auto max-h-64">
                  {JSON.stringify(results[name], null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">전체 테스트</h2>
        <button
          onClick={async () => {
            for (const { name, function: testFunction } of tests) {
              await runTest(name, testFunction);
            }
          }}
          disabled={Object.values(loading).some(Boolean)}
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          모든 테스트 실행
        </button>
      </div>
    </div>
  );
} 