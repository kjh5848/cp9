'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EdgeFunctionTestPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const testHelloFunction = async () => {
    setLoading(prev => ({ ...prev, hello: true }))
    try {
      const response = await fetch('/api/edge-function-test/hello', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User' })
      })
      const data = await response.json()
      setResults(prev => ({ ...prev, hello: data }))
    } catch (error) {
      setResults(prev => ({ ...prev, hello: { error: error.message } }))
    } finally {
      setLoading(prev => ({ ...prev, hello: false }))
    }
  }

  const testLangGraphFunction = async () => {
    setLoading(prev => ({ ...prev, langgraph: true }))
    try {
      const response = await fetch('/api/edge-function-test/langgraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'test',
          input: { test: 'data' }
        })
      })
      const data = await response.json()
      setResults(prev => ({ ...prev, langgraph: data }))
    } catch (error) {
      setResults(prev => ({ ...prev, langgraph: { error: error.message } }))
    } finally {
      setLoading(prev => ({ ...prev, langgraph: false }))
    }
  }

  const testLangGraphExecute = async () => {
    setLoading(prev => ({ ...prev, execute: true }))
    try {
      const response = await fetch('/api/edge-function-test/langgraph-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'execute',
          input: { 
            urls: ['https://example.com'],
            keyword: 'test'
          }
        })
      })
      const data = await response.json()
      setResults(prev => ({ ...prev, execute: data }))
    } catch (error) {
      setResults(prev => ({ ...prev, execute: { error: error.message } }))
    } finally {
      setLoading(prev => ({ ...prev, execute: false }))
    }
  }

  const testCacheGateway = async () => {
    setLoading(prev => ({ ...prev, cache: true }))
    try {
      const response = await fetch('/api/edge-function-test/cache-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productIds: ['123', '456'],
          threadId: 'test-thread-123'
        })
      })
      const data = await response.json()
      setResults(prev => ({ ...prev, cache: data }))
    } catch (error) {
      setResults(prev => ({ ...prev, cache: { error: error.message } }))
    } finally {
      setLoading(prev => ({ ...prev, cache: false }))
    }
  }

  const testQueueWorker = async () => {
    setLoading(prev => ({ ...prev, queue: true }))
    try {
      const response = await fetch('/api/edge-function-test/queue-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'process',
          jobId: 'test-job-123'
        })
      })
      const data = await response.json()
      setResults(prev => ({ ...prev, queue: data }))
    } catch (error) {
      setResults(prev => ({ ...prev, queue: { error: error.message } }))
    } finally {
      setLoading(prev => ({ ...prev, queue: false }))
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Edge Function 테스트</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Hello Function</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testHelloFunction} 
              disabled={loading.hello}
              className="w-full"
            >
              {loading.hello ? '테스트 중...' : '테스트'}
            </Button>
            {results.hello && (
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(results.hello, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LangGraph Function</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testLangGraphFunction} 
              disabled={loading.langgraph}
              className="w-full"
            >
              {loading.langgraph ? '테스트 중...' : '테스트'}
            </Button>
            {results.langgraph && (
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(results.langgraph, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LangGraph Execute</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testLangGraphExecute} 
              disabled={loading.execute}
              className="w-full"
            >
              {loading.execute ? '테스트 중...' : '테스트'}
            </Button>
            {results.execute && (
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(results.execute, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Gateway</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testCacheGateway} 
              disabled={loading.cache}
              className="w-full"
            >
              {loading.cache ? '테스트 중...' : '테스트'}
            </Button>
            {results.cache && (
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(results.cache, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Worker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testQueueWorker} 
              disabled={loading.queue}
              className="w-full"
            >
              {loading.queue ? '테스트 중...' : '테스트'}
            </Button>
            {results.queue && (
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(results.queue, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
