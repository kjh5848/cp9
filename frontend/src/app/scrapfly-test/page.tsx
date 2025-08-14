'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card } from '@/shared/ui/card';

/**
 * 상품 데이터 타입
 */
interface ProductData {
  title?: string;
  image?: string;
  price?: number;
  rating?: number;
  reviews?: number;
  category?: string[];
  [key: string]: unknown;
}

/**
 * Scrapfly 크롤링 테스트 결과 타입
 */
interface TestResult {
  success: boolean;
  message?: string;
  data?: ProductData;
  error?: string;
  performance?: {
    scrapfly_duration?: number;
    total_duration?: number;
  };
  metadata?: {
    method: string;
    timestamp: string;
    url?: string;
  };
}

/**
 * Scrapfly 크롤링 테스트 페이지 컴포넌트
 */
export default function ScrapflyTestPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const sampleUrls = [
    'https://coupa.ng/cdwOaG', // 샘플 쿠팡 딥링크
    'https://coupa.ng/cdwObE',
    'https://coupa.ng/cdwOcM',
  ];

  const handleTest = async (testType: 'scrapfly' | 'basic' | 'direct' = 'scrapfly') => {
    if (!url.trim()) {
      alert('URL을 입력해주세요.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let apiEndpoint: string;
      switch (testType) {
        case 'direct':
          apiEndpoint = `/api/test/scrapfly-direct?url=${encodeURIComponent(url)}`;
          break;
        case 'basic':
          apiEndpoint = `/api/test/basic-scraping?url=${encodeURIComponent(url)}`;
          break;
        default:
          apiEndpoint = `/api/test/scrapfly?url=${encodeURIComponent(url)}`;
      }
        
      const response = await fetch(apiEndpoint);
      const data = await response.json();
      
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : '네트워크 오류',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSampleUrl = (sampleUrl: string) => {
    setUrl(sampleUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Scrapfly 크롤링 테스트
          </h1>
          <p className="text-gray-600">
            Scrapfly를 이용한 쿠팡 상품 크롤링 성능과 결과를 테스트합니다.
          </p>
        </div>

        {/* URL 입력 섹션 */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">테스트 URL 입력</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                쿠팡 딥링크 URL
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://coupa.ng/..."
                className="w-full"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">샘플 URL:</span>
              {sampleUrls.map((sampleUrl, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSampleUrl(sampleUrl)}
                  className="text-xs"
                >
                  샘플 {index + 1}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                onClick={() => handleTest('basic')}
                disabled={loading || !url.trim()}
                variant="outline"
              >
                {loading ? '크롤링 중...' : '🔧 기본 크롤링'}
              </Button>
              <Button
                onClick={() => handleTest('direct')}
                disabled={loading || !url.trim()}
                variant="secondary"
              >
                {loading ? '크롤링 중...' : '🌐 Scrapfly 직접 API'}
              </Button>
              <Button
                onClick={() => handleTest('scrapfly')}
                disabled={loading || !url.trim()}
              >
                {loading ? '크롤링 중...' : '🚀 Scrapfly SDK'}
              </Button>
            </div>
          </div>
        </Card>

        {/* 결과 섹션 */}
        {loading && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Scrapfly로 크롤링 중...</span>
            </div>
          </Card>
        )}

        {result && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">테스트 결과</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                result.success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.success ? '✅ 성공' : '❌ 실패'}
              </div>
            </div>

            {/* 성능 정보 */}
            {result.performance && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {result.performance.scrapfly_duration && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Scrapfly 처리 시간</div>
                    <div className="text-lg font-bold text-blue-900">
                      {result.performance.scrapfly_duration}ms
                    </div>
                  </div>
                )}
                {result.performance.total_duration && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">총 처리 시간</div>
                    <div className="text-lg font-bold text-purple-900">
                      {result.performance.total_duration}ms
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 성공 시 상품 정보 */}
            {result.success && result.data && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">크롤링된 상품 정보</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 상품 이미지 */}
                  {result.data.image && (
                    <div className="relative w-full h-64">
                      <Image 
                        src={result.data.image} 
                        alt={result.data.title || '상품 이미지'}
                        fill
                        className="object-cover rounded-lg border"
                        onError={() => {
                          // Next.js Image는 onError에서 src 변경 불가
                          console.warn('이미지 로드 실패:', result.data?.image);
                        }}
                      />
                    </div>
                  )}

                  {/* 상품 상세 정보 */}
                  <div className="space-y-3">
                    {result.data.title && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">상품명</label>
                        <p className="text-gray-900 font-medium">{result.data.title}</p>
                      </div>
                    )}

                    {result.data.price && result.data.price > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">가격</label>
                        <p className="text-2xl font-bold text-red-600">
                          {result.data.price.toLocaleString()}원
                        </p>
                      </div>
                    )}

                    {result.data.rating && result.data.rating > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">평점</label>
                        <p className="text-yellow-600 font-medium">
                          ⭐ {result.data.rating}/5
                        </p>
                      </div>
                    )}

                    {result.data.reviews && result.data.reviews > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">리뷰 수</label>
                        <p className="text-gray-600">{result.data.reviews.toLocaleString()}개</p>
                      </div>
                    )}

                    {result.data.category && result.data.category.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">카테고리</label>
                        <p className="text-gray-600">{result.data.category.join(' > ')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 전체 데이터 JSON */}
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    🔍 전체 크롤링 데이터 보기 (JSON)
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* 실패 시 오류 정보 */}
            {!result.success && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-900">오류 정보</h3>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-800">{result.error}</p>
                </div>
              </div>
            )}

            {/* 메타데이터 */}
            {result.metadata && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  📋 테스트 메타데이터
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(result.metadata, null, 2)}
                </pre>
              </details>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}