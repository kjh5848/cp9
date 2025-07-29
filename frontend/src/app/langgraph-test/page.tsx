'use client';

import { useState } from 'react';
import { testExtractIdsNode } from '@/features/langgraph/nodes/extract-ids';
import { testStaticCrawlerNode } from '@/features/langgraph/nodes/static-crawler';
import { testDynamicCrawlerNode } from '@/features/langgraph/nodes/dynamic-crawler';
import { testFallbackLLMNode } from '@/features/langgraph/nodes/fallback-llm';
import { testSEOAgentNode } from '@/features/langgraph/nodes/seo-agent';
import { testWordPressPublisherNode } from '@/features/langgraph/nodes/wordpress-publisher';
import { testMainGraph } from '@/features/langgraph/graphs/main-graph';

export default function LangGraphTestPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

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
    { name: 'extractIds', function: testExtractIdsNode },
    { name: 'staticCrawler', function: testStaticCrawlerNode },
    { name: 'dynamicCrawler', function: testDynamicCrawlerNode },
    { name: 'fallbackLLM', function: testFallbackLLMNode },
    { name: 'seoAgent', function: testSEOAgentNode },
    { name: 'wordpressPublisher', function: testWordPressPublisherNode },
    { name: 'mainGraph', function: testMainGraph },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">LangGraph 노드 테스트</h1>
      
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