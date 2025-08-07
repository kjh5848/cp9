'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * Edge Function 테스트 페이지
 * Supabase Edge Function들의 동작을 테스트합니다.
 */
export default function EdgeFunctionTestPage() {
  const [name, setName] = useState('CP9');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState('test-thread-123');
  const [productIds, setProductIds] = useState('123456,789012');

  /**
   * Hello Edge Function 테스트
   */
  const testHelloFunction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/edge-function', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionName: 'hello',
          data: { name },
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * LangGraph API Edge Function 테스트
   */
  const testLangGraphFunction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/edge-function', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionName: 'langgraph-api',
          data: {
            action: 'status',
            threadId,
          },
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * LangGraph 실행 테스트
   */
  const testLangGraphExecute = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/edge-function', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionName: 'langgraph-api',
          data: {
            action: 'execute',
            initialState: {
              input: {
                urls: [`https://www.coupang.com/vp/products/${productIds.split(',')[0]}`],
                productIds: productIds.split(',').map(id => id.trim()),
              },
            },
            threadId: `execute-${Date.now()}`,
          },
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cache Gateway 테스트
   */
  const testCacheGateway = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/edge-function', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionName: 'cache-gateway',
          data: {
            productIds: productIds.split(',').map(id => id.trim()),
            threadId: `cache-${Date.now()}`,
            forceRefresh: false,
          },
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Queue Worker 테스트
   */
  const testQueueWorker = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/edge-function', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionName: 'queue-worker',
          data: {
            action: 'process',
          },
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edge Function 테스트</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Hello Function 테스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="테스트할 이름을 입력하세요"
              />
            </div>
            <Button 
              onClick={testHelloFunction} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '테스트 중...' : 'Hello Function 테스트'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LangGraph API 테스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="threadId">Thread ID</Label>
              <Input
                id="threadId"
                value={threadId}
                onChange={(e) => setThreadId(e.target.value)}
                placeholder="테스트할 Thread ID"
              />
            </div>
            <Button 
              onClick={testLangGraphFunction} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '테스트 중...' : '상태 조회 테스트'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LangGraph 실행 테스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productIds">상품 ID (쉼표로 구분)</Label>
              <Input
                id="productIds"
                value={productIds}
                onChange={(e) => setProductIds(e.target.value)}
                placeholder="123456,789012"
              />
            </div>
            <Button 
              onClick={testLangGraphExecute} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '실행 중...' : 'LangGraph 실행'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Gateway 테스트</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testCacheGateway} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '테스트 중...' : 'Cache Gateway 테스트'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Worker 테스트</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testQueueWorker} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '테스트 중...' : 'Queue Worker 테스트'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>결과</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
