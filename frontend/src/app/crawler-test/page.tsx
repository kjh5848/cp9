'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * 크롤링 테스트 페이지
 * cheerio와 playwright로 구글 검색 결과 크롤링 테스트
 * 
 * @returns 테스트 페이지 컴포넌트
 */
export default function CrawlerTestPage() {
  const [searchKeyword, setSearchKeyword] = useState<string>('짱구');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [crawlerType, setCrawlerType] = useState<'cheerio' | 'playwright'>('cheerio');

  /**
   * 크롤링 테스트를 실행하는 함수
   * 
   * @async
   * @param keyword - 검색 키워드
   * @param type - 크롤러 타입 (cheerio 또는 playwright)
   * @returns 크롤링 결과
   */
  const runCrawlingTest = async (keyword: string, type: 'cheerio' | 'playwright') => {
    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      console.log(`[UI] ${type} 크롤링 테스트 시작:`, keyword);
      
      const response = await fetch('/api/crawler-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword,
          type
        }),
      });

      console.log('[UI] API 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('[UI] API 응답 데이터:', data);
      
      if (data.success) {
        setResults(data.results || []);
      } else {
        setError(data.error || '크롤링 실패');
      }
    } catch (err) {
      console.error('[UI] 크롤링 테스트 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      console.log('[UI] 크롤링 테스트 완료');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🕷️ 크롤링 테스트</h1>
        <p className="text-gray-600 mb-6">
          cheerio와 playwright를 사용한 구글 검색 결과 크롤링 테스트입니다.
          실제 웹 페이지를 크롤링하여 검색 결과를 수집합니다.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>테스트 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="searchKeyword">검색 키워드</Label>
              <Input
                id="searchKeyword"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="짱구"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                구글에서 검색할 키워드를 입력하세요.
              </p>
            </div>

            <div>
              <Label>크롤러 타입</Label>
              <div className="flex space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="cheerio"
                    checked={crawlerType === 'cheerio'}
                    onChange={(e) => setCrawlerType(e.target.value as 'cheerio')}
                    className="mr-2"
                  />
                  Cheerio (정적 HTML 파싱)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="playwright"
                    checked={crawlerType === 'playwright'}
                    onChange={(e) => setCrawlerType(e.target.value as 'playwright')}
                    className="mr-2"
                  />
                  Playwright (동적 브라우저)
                </label>
              </div>
            </div>
            
            <Button 
              onClick={() => runCrawlingTest(searchKeyword, crawlerType)}
              disabled={isLoading}
              className={`w-full ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>🔄 크롤링 중...</span>
                </div>
              ) : (
                `🚀 ${crawlerType === 'cheerio' ? 'Cheerio' : 'Playwright'} 크롤링 시작`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">❌ 오류 발생</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 크롤링 결과</CardTitle>
            <p className="text-sm text-gray-600">
              {results.length}개 검색 결과를 성공적으로 수집했습니다.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg mb-2">
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {result.title}
                    </a>
                  </h3>
                  <p className="text-gray-600 mb-2">{result.snippet}</p>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">URL:</span> {result.url}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">ℹ️ 테스트 정보</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Cheerio: 정적 HTML 파싱으로 빠른 크롤링</li>
          <li>• Playwright: 브라우저 자동화로 동적 콘텐츠 크롤링</li>
          <li>• 구글 검색 결과 1페이지를 크롤링합니다</li>
          <li>• 검색 결과의 제목, 설명, URL을 수집합니다</li>
        </ul>
      </div>
    </div>
  );
} 