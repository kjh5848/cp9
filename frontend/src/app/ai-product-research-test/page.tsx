'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  input?: {
    productIds: string[];
    keyword: string;
  };
  output?: any;
  error?: string;
  details?: string;
  timestamp?: string;
}

export default function AIProductResearchTestPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [productIds, setProductIds] = useState<string>('123456,789012');
  const [keyword, setKeyword] = useState<string>('무선 이어폰');

  const runTest = async (testName: string, testFunction: () => Promise<TestResult>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFunction();
      setResults(prev => ({ ...prev, [testName]: result }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          error: error instanceof Error ? error.message : '알 수 없는 오류' 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  // GET 요청 테스트
  const testGetAPI = async (): Promise<TestResult> => {
    const response = await fetch('/api/test/ai-product-research');
    return await response.json();
  };

  // POST 요청 테스트
  const testPostAPI = async (): Promise<TestResult> => {
    const ids = productIds.split(',').map(id => id.trim()).filter(Boolean);
    
    const response = await fetch('/api/test/ai-product-research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productIds: ids,
        keyword: keyword
      }),
    });
    
    return await response.json();
  };

  // 전체 워크플로우 테스트
  const testFullWorkflow = async (): Promise<TestResult> => {
    const ids = productIds.split(',').map(id => id.trim()).filter(Boolean);
    
    // 1. extractIds 시뮬레이션
    const extractedIds = ids;
    
    // 2. aiProductResearch 실행
    const response = await fetch('/api/test/ai-product-research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productIds: extractedIds,
        keyword: keyword
      }),
    });
    
    const aiResult = await response.json();
    
    if (!aiResult.success) {
      return aiResult;
    }

    // 3. SEO Agent 시뮬레이션 (실제로는 별도 API 호출)
    const enrichedData = aiResult.output?.scrapedData?.enrichedData || [];
    const seoContent = {
      title: `${keyword} 추천 TOP ${enrichedData.length} - 완벽 구매 가이드`,
      content: `# ${keyword} 추천 상품\n\n${enrichedData.map((product: any, index: number) => 
        `## ${index + 1}. ${product.productName}\n\n**가격**: ${product.productPrice?.toLocaleString()}원\n**평점**: ${product.rating}/5\n\n${product.description || ''}`
      ).join('\n\n')}`,
      keywords: [keyword, '추천', '구매가이드'],
      summary: `${keyword} 추천 상품 ${enrichedData.length}개를 소개했습니다.`
    };

    // 4. WordPress Publisher 시뮬레이션
    const wordpressResult = {
      postId: Math.floor(Math.random() * 1000).toString(),
      postUrl: `https://example.com/wp/2024/01/ai-test-post`,
      status: 'published'
    };

    return {
      success: true,
      input: { productIds: extractedIds, keyword },
      output: {
        extractIds: { productIds: extractedIds },
        aiProductResearch: aiResult.output,
        seoAgent: { seoContent },
        wordpressPublisher: { wordpressResult }
      },
      timestamp: new Date().toISOString()
    };
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Product Research 실제 API 테스트</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">테스트 설정</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">상품 ID (쉼표로 구분)</label>
            <input
              type="text"
              value={productIds}
              onChange={(e) => setProductIds(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="123456,789012,987654"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">검색 키워드</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="무선 이어폰"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">GET API 테스트</h2>
            <button
              onClick={() => runTest('getAPI', testGetAPI)}
              disabled={loading['getAPI']}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading['getAPI'] ? '테스트 중...' : 'GET 테스트 실행'}
            </button>
          </div>
          
          {results['getAPI'] && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">결과:</h3>
              <pre className="text-sm overflow-auto max-h-64">
                {JSON.stringify(results['getAPI'], null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">POST API 테스트</h2>
            <button
              onClick={() => runTest('postAPI', testPostAPI)}
              disabled={loading['postAPI']}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading['postAPI'] ? '테스트 중...' : 'POST 테스트 실행'}
            </button>
          </div>
          
          {results['postAPI'] && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">결과:</h3>
              <pre className="text-sm overflow-auto max-h-64">
                {JSON.stringify(results['postAPI'], null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">전체 워크플로우 테스트</h2>
            <button
              onClick={() => runTest('fullWorkflow', testFullWorkflow)}
              disabled={loading['fullWorkflow']}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              {loading['fullWorkflow'] ? '테스트 중...' : '전체 워크플로우 테스트'}
            </button>
          </div>
          
          {results['fullWorkflow'] && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">결과:</h3>
              <pre className="text-sm overflow-auto max-h-64">
                {JSON.stringify(results['fullWorkflow'], null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 주의사항</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 실제 Perplexity API 키가 환경 변수에 설정되어 있어야 합니다.</li>
          <li>• API 호출 시 비용이 발생할 수 있습니다.</li>
          <li>• 테스트는 실제 상품 ID를 사용하므로 정확한 정보가 반환됩니다.</li>
          <li>• 환경 변수가 설정되지 않은 경우 API 호출이 실패할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
