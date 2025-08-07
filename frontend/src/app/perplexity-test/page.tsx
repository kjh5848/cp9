'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  details?: string;
  logs?: string[];
  testInfo?: {
    testMode: string;
    keyword: string;
    executedAt: string;
    logs: string[];
  };
}

export default function PerplexityTestPage() {
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('무선 이어폰');
  const [result, setResult] = useState<TestResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const runPerplexityTest = async () => {
    setLoading(true);
    setResult(null);
    setLogs([]);
    
    addLog('🚀 Perplexity API 테스트 시작...');
    addLog(`🔍 테스트 키워드: "${keyword}"`);

    try {
      addLog('📡 백엔드 API 호출 중...');
      
      const response = await fetch('/api/test-perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testMode: 'full_workflow',
          keyword: keyword.trim() || '무선 이어폰'
        }),
      });

      addLog(`📥 응답 수신: ${response.status} ${response.statusText}`);

      const data: TestResult = await response.json();
      setResult(data);

      if (data.success) {
        addLog('✅ 테스트 성공!');
        if (data.testInfo?.logs) {
          data.testInfo.logs.forEach(log => addLog(log));
        }
      } else {
        addLog(`❌ 테스트 실패: ${data.error}`);
        if (data.logs) {
          data.logs.forEach(log => addLog(log));
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      addLog(`💥 네트워크 오류: ${errorMessage}`);
      setResult({
        success: false,
        error: errorMessage,
        message: '테스트 실행 중 네트워크 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
      addLog('🏁 테스트 완료');
    }
  };

  return (
    <div className=\"min-h-screen bg-gray-50 p-8\">
      <div className=\"max-w-6xl mx-auto\">
        <h1 className=\"text-3xl font-bold text-gray-900 mb-8\">
          🤖 Perplexity API 테스트 도구
        </h1>
        
        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8\">
          {/* 테스트 실행 패널 */}
          <Card className=\"p-6\">
            <h2 className=\"text-xl font-semibold mb-4\">테스트 실행</h2>
            
            <div className=\"space-y-4\">
              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                  테스트 키워드
                </label>
                <Input
                  type=\"text\"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder=\"예: 무선 이어폰, 블루투스 스피커\"
                  className=\"w-full\"
                />
                <p className=\"text-sm text-gray-500 mt-1\">
                  이 키워드로 상품을 검색하고 SEO 글을 생성합니다.
                </p>
              </div>
              
              <Button
                onClick={runPerplexityTest}
                disabled={loading}
                className=\"w-full py-3\"
              >
                {loading ? (
                  <div className=\"flex items-center gap-2\">
                    <div className=\"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin\"></div>
                    테스트 실행 중...
                  </div>
                ) : (
                  '🚀 Perplexity API 테스트 시작'
                )}
              </Button>
            </div>

            {/* 테스트 정보 */}
            <div className=\"mt-6 p-4 bg-blue-50 rounded-lg\">
              <h3 className=\"font-medium text-blue-900 mb-2\">테스트 내용</h3>
              <ul className=\"text-sm text-blue-700 space-y-1\">
                <li>• Perplexity API 연결 확인</li>
                <li>• 키워드 기반 상품 검색</li>
                <li>• AI 상품 조사 실행</li>
                <li>• SEO 최적화 블로그 글 생성</li>
                <li>• 전체 워크플로우 로그 확인</li>
              </ul>
            </div>
          </Card>

          {/* 실시간 로그 */}
          <Card className=\"p-6\">
            <h2 className=\"text-xl font-semibold mb-4\">실시간 로그</h2>
            
            <div className=\"bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto\">
              {logs.length === 0 ? (
                <div className=\"text-gray-500\">로그가 표시될 예정입니다...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className=\"mb-1\">{log}</div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* 테스트 결과 */}
        {result && (
          <Card className=\"mt-8 p-6\">
            <h2 className=\"text-xl font-semibold mb-4\">테스트 결과</h2>
            
            <div className={`p-4 rounded-lg mb-4 ${
              result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            } border`}>
              <div className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? '✅ 테스트 성공' : '❌ 테스트 실패'}
              </div>
              <div className={`text-sm mt-1 ${
                result.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.message}
              </div>
              {result.error && (
                <div className=\"text-red-600 text-sm mt-2\">
                  오류: {result.error}
                </div>
              )}
            </div>

            {/* SEO 콘텐츠 결과 */}
            {result.success && result.data?.workflow?.seoAgent && (
              <div className=\"space-y-6\">
                <div>
                  <h3 className=\"font-medium text-gray-900 mb-2\">생성된 SEO 콘텐츠</h3>
                  <div className=\"bg-gray-50 p-4 rounded-lg\">
                    <h4 className=\"font-medium text-lg mb-2\">
                      {result.data.workflow.seoAgent.title}
                    </h4>
                    <p className=\"text-gray-600 text-sm mb-3\">
                      {result.data.workflow.seoAgent.summary}
                    </p>
                    <div className=\"text-xs text-gray-500\">
                      키워드: {result.data.workflow.seoAgent.keywords?.join(', ')}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className=\"font-medium text-gray-900 mb-2\">생성된 콘텐츠 미리보기</h3>
                  <div className=\"bg-white p-4 rounded-lg border max-h-64 overflow-y-auto\">
                    <pre className=\"whitespace-pre-wrap text-sm text-gray-700\">
                      {result.data.workflow.seoAgent.content?.substring(0, 1000)}
                      {result.data.workflow.seoAgent.content?.length > 1000 && '...'}
                    </pre>
                  </div>
                </div>

                {/* 실행 통계 */}
                <div className=\"bg-blue-50 p-4 rounded-lg\">
                  <h3 className=\"font-medium text-blue-900 mb-2\">실행 통계</h3>
                  <div className=\"text-sm text-blue-700 space-y-1\">
                    <div>실행 시간: {result.data.metadata?.executionTime}ms</div>
                    <div>처리 상품 수: {result.data.workflow.aiProductResearch?.enrichedData?.length}개</div>
                    <div>생성된 콘텐츠 길이: {result.data.workflow.seoAgent.content?.length}자</div>
                    <div>완료된 노드: {result.data.metadata?.completedNodes?.join(', ')}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 원시 데이터 (개발용) */}
            <details className=\"mt-6\">
              <summary className=\"cursor-pointer font-medium text-gray-600 hover:text-gray-900\">
                원시 응답 데이터 보기 (개발용)
              </summary>
              <pre className=\"mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-64\">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </Card>
        )}
      </div>
    </div>
  );
}