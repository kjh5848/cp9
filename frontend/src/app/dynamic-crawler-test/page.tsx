'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { ProductInfo } from '@/features/langgraph/types';

/**
 * dynamicCrawler 노드 테스트 페이지
 * Playwright를 사용한 실제 크롤링 기능을 테스트
 * 
 * @returns 테스트 페이지 컴포넌트
 */
export default function DynamicCrawlerTestPage() {
  const [productIds, setProductIds] = useState<string>('8374230481');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ProductInfo[]>([]);
  const [error, setError] = useState<string>('');

  /**
   * 크롤링 테스트를 실행하는 함수
   * 
   * @async
   * @param productIds - 상품 ID 목록 (쉼표로 구분)
   * @returns 크롤링 결과
   */
  const runCrawlingTest = async (productIds: string) => {
    // 로딩 상태 즉시 설정
    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const ids = productIds.split(',').map(id => id.trim()).filter(id => id);
      
      console.log('[UI] 크롤링 테스트 시작:', ids);
      
      const response = await fetch('/api/langgraph/dynamic-crawler-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: ids
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
      // 로딩 상태 해제
      setIsLoading(false);
      console.log('[UI] 크롤링 테스트 완료');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🕷️ Dynamic Crawler 테스트</h1>
        <p className="text-gray-600 mb-6">
          Playwright를 사용한 동적 크롤링 기능을 테스트합니다.
          실제 쿠팡 상품 페이지를 크롤링하여 상품 정보를 수집합니다.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>테스트 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productIds">상품 ID 목록 (쉼표로 구분)</Label>
              <Input
                id="productIds"
                value={productIds}
                onChange={(e) => setProductIds(e.target.value)}
                placeholder="123456,789012,345678"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                테스트할 쿠팡 상품 ID를 쉼표로 구분하여 입력하세요.
              </p>
            </div>
            
            <Button 
              onClick={() => runCrawlingTest(productIds)}
              disabled={isLoading}
              className={`w-full ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>🔄 크롤링 중...</span>
                </div>
              ) : (
                '🚀 크롤링 테스트 시작'
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
              {results.length}개 상품 정보를 성공적으로 수집했습니다.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((product, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg mb-2">{product.productName}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">상품 ID:</span>
                      <p className="text-gray-600">{product.productId}</p>
                    </div>
                    <div>
                      <span className="font-medium">가격:</span>
                      <p className="text-gray-600">{product.productPrice?.toLocaleString()}원</p>
                    </div>
                    <div>
                      <span className="font-medium">카테고리:</span>
                      <p className="text-gray-600">{product.categoryName}</p>
                    </div>
                    <div>
                      <span className="font-medium">평점:</span>
                      <p className="text-gray-600">{product.rating}/5.0</p>
                    </div>
                    <div>
                      <span className="font-medium">리뷰 수:</span>
                      <p className="text-gray-600">{product.reviewCount}개</p>
                    </div>
                    <div>
                      <span className="font-medium">로켓배송:</span>
                      <p className="text-gray-600">{product.isRocket ? '✅' : '❌'}</p>
                    </div>
                    <div>
                      <span className="font-medium">무료배송:</span>
                      <p className="text-gray-600">{product.isFreeShipping ? '✅' : '❌'}</p>
                    </div>
                    <div>
                      <span className="font-medium">상품 URL:</span>
                      <a 
                        href={product.productUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        링크
                      </a>
                    </div>
                  </div>
                  {product.description && (
                    <div className="mt-3">
                      <span className="font-medium">상품 설명:</span>
                      <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                    </div>
                  )}
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium">상품 스펙:</span>
                      <div className="mt-1">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{key}:</span> {value as string}
                          </div>
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

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">ℹ️ 테스트 정보</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Playwright 브라우저 자동화를 사용합니다</li>
          <li>• 실제 쿠팡 페이지를 크롤링합니다</li>
          <li>• JavaScript 렌더링 후 상품 정보를 수집합니다</li>
          <li>• 봇 차단 방지를 위한 사용자 에이전트를 설정합니다</li>
          <li>• 개별 상품 실패 시에도 전체 프로세스가 계속됩니다</li>
        </ul>
      </div>
    </div>
  );
} 