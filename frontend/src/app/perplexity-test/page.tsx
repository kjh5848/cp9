'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    console.log(`[${new Date().toISOString()}] ${message}`)
  }

  const runPerplexityTest = async () => {
    if (!keyword.trim()) {
      alert('키워드를 입력해주세요')
      return
    }

    setLoading(true)
    addLog(`Perplexity 테스트 시작: ${keyword}`)

    try {
      // 테스트 1: 기본 API 호출
      addLog('테스트 1: 기본 API 호출')
      const response1 = await fetch('/api/test-perplexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() })
      })

      const result1: TestResult = await response1.json()
      result1.testInfo = {
        testMode: '기본 API 호출',
        keyword: keyword.trim(),
        executedAt: new Date().toISOString(),
        logs: [`API 응답 상태: ${response1.status}`]
      }

      setResults(prev => [result1, ...prev])
      addLog(`테스트 1 완료: ${result1.success ? '성공' : '실패'}`)

      // 테스트 2: Edge Function 직접 호출
      addLog('테스트 2: Edge Function 직접 호출')
      try {
        const response2 = await fetch('http://127.0.0.1:54321/functions/v1/item-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            itemName: keyword.trim(),
            projectId: 'test-project',
            itemId: 'test-item'
          })
        })

        const result2: TestResult = await response2.json()
        result2.testInfo = {
          testMode: 'Edge Function 직접 호출',
          keyword: keyword.trim(),
          executedAt: new Date().toISOString(),
          logs: [`Edge Function 응답 상태: ${response2.status}`]
        }

        setResults(prev => [result2, ...prev])
        addLog(`테스트 2 완료: ${result2.success ? '성공' : '실패'}`)
      } catch (edgeError) {
        addLog(`Edge Function 오류: ${edgeError}`)
        const result2: TestResult = {
          success: false,
          message: 'Edge Function 호출 실패',
          error: edgeError instanceof Error ? edgeError.message : '알 수 없는 오류',
          testInfo: {
            testMode: 'Edge Function 직접 호출',
            keyword: keyword.trim(),
            executedAt: new Date().toISOString(),
            logs: [`Edge Function 오류: ${edgeError}`]
          }
        }
        setResults(prev => [result2, ...prev])
      }

    } catch (error) {
      addLog(`전체 테스트 오류: ${error}`)
      const errorResult: TestResult = {
        success: false,
        message: '테스트 실행 중 오류 발생',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        testInfo: {
          testMode: '전체 테스트',
          keyword: keyword.trim(),
          executedAt: new Date().toISOString(),
          logs: [`테스트 오류: ${error}`]
        }
      }
      setResults(prev => [errorResult, ...prev])
    } finally {
      setLoading(false)
      addLog('Perplexity 테스트 완료')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Perplexity API 테스트</h1>
          <p className="text-gray-600 mb-8">
            Perplexity API와 Edge Function의 동작을 테스트합니다.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>테스트 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium mb-2">
                테스트 키워드
              </label>
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="예: 무선 이어폰, 노트북 등"
                className="w-full"
              />
            </div>
            <Button 
              onClick={runPerplexityTest} 
              disabled={loading || !keyword.trim()}
              className="w-full"
            >
              {loading ? '테스트 중...' : '테스트 실행'}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>테스트 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        {result.testInfo?.testMode || '테스트'}
                      </h3>
                      <span className={`px-2 py-1 rounded text-sm ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? '성공' : '실패'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <p><strong>키워드:</strong> {result.testInfo?.keyword}</p>
                      <p><strong>실행 시간:</strong> {result.testInfo?.executedAt}</p>
                    </div>

                    {result.message && (
                      <p className="mb-2"><strong>메시지:</strong> {result.message}</p>
                    )}

                    {result.error && (
                      <p className="mb-2 text-red-600"><strong>오류:</strong> {result.error}</p>
                    )}

                    {result.data && (
                      <div className="mb-2">
                        <strong>데이터:</strong>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}

                    {result.testInfo?.logs && result.testInfo.logs.length > 0 && (
                      <div>
                        <strong>로그:</strong>
                        <div className="bg-gray-100 p-2 rounded text-xs space-y-1">
                          {result.testInfo.logs.map((log, logIndex) => (
                            <div key={logIndex} className="text-gray-700">{log}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}