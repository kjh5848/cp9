'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResearchItem, ResearchSession } from '../types';
import { CacheManager, CacheKeys, cachedCall } from '@/shared/utils/cache';

// 리서치 데이터 캐시 인스턴스 (5분 TTL)
const researchCache = new CacheManager(5 * 60 * 1000);

/**
 * 리서치 데이터를 관리하는 훅 (기존 호환성 유지)
 * 새로운 API 포맷 데이터를 기존 인터페이스로 변환
 */
export function useResearchData() {
  const [data, setData] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // 실제 API 응답을 레거시 포맷으로 변환하는 함수
  const convertApiResponseToLegacyFormat = (apiResponse: unknown): ResearchItem[] => {
    // 백엔드 API 응답 구조에 따라 변환
    if (typeof apiResponse === 'object' && apiResponse !== null && 'products' in apiResponse && Array.isArray((apiResponse as { products: unknown[] }).products)) {
      const response = apiResponse as { products: unknown[]; total_products?: number; created_at?: string; category_focus?: string };
      return response.products.map((product: unknown, index: number) => {
        const productObj = product as Record<string, unknown>;
        return {
          id: `research-${productObj.product_id || index + 1}`,
          productId: productObj.product_id?.toString() || `${index + 1}`,
          productName: productObj.product_name || '상품명 없음',
          productImage: productObj.product_image || `https://images.unsplash.com/photo-158312092641${index + 1}?w=400&h=300&fit=crop&auto=format`,
          productPrice: productObj.price_exact || 0,
          productUrl: productObj.deeplink_or_product_url || '#',
          category: productObj.category || '기타',
          analysis: {
            pros: productObj.reviews?.summary_positive || [],
            cons: productObj.reviews?.summary_negative || [],
            summary: productObj.seo?.meta_description || '분석 정보가 없습니다.',
            rating: productObj.reviews?.rating_avg || 4.0,
            keywords: productObj.seo?.keyword_cluster || []
          },
          seoContent: {
            title: productObj.seo?.title_variants?.[0] || productObj.product_name || '제목 없음',
            description: productObj.seo?.meta_description || '설명이 없습니다.',
            content: productObj.seo?.outline?.h2?.map((h2: string) => `<h2>${h2}</h2><p>${productObj.seo?.meta_description || ''}</p>`).join('\n') || '',
            tags: productObj.seo?.keyword_cluster || []
          },
          metadata: {
            totalItems: response.total_products || 1,
            researchDate: new Date(response.created_at || Date.now()),
            researchType: response.category_focus || '일반'
          },
          createdAt: new Date(productObj.captured_at || Date.now())
        };
      });
    }
    return [];
  };

  // 기존 더미 데이터 변환 함수 (fallback용)
  const convertToLegacyFormat = (session: ResearchSession): ResearchItem[] => {
    return session.products.map((product, index) => ({
      id: `${session.id}-product-${index + 1}`,
      productId: `${session.id}-${index + 1}`,
      productName: product.product_name,
      productImage: `https://images.unsplash.com/photo-158312092641${index + 1}?w=400&h=300&fit=crop&auto=format`, // 노트북 이미지
      productPrice: product.price_exact,
      productUrl: product.deeplink_or_product_url || `https://example.com/product/${index + 1}`,
      category: product.category,
      analysis: {
        pros: product.reviews.summary_positive,
        cons: product.reviews.summary_negative,
        summary: product.seo.meta_description,
        rating: product.reviews.rating_avg || 4.0,
        keywords: product.seo.keyword_cluster
      },
      seoContent: {
        title: product.seo.title_variants[0] || product.product_name,
        description: product.seo.meta_description,
        content: product.seo.outline.h2.map(h2 => `<h2>${h2}</h2><p>${product.seo.meta_description}</p>`).join('\n'),
        tags: product.seo.keyword_cluster
      },
      metadata: {
        totalItems: session.total_products,
        researchDate: new Date(session.created_at),
        researchType: session.category_focus
      },
      createdAt: new Date(session.created_at)
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // URL 파라미터에서 세션 ID 가져오기 (기본값: research-5)
        const sessionId = searchParams.get('session') || 'research-5';
        const selectedIds = searchParams.get('ids')?.split(',') || [];
        
        // 캐시 키 생성
        const cacheKey = CacheKeys.researchResults(sessionId, selectedIds);
        
        // 캐시된 API 호출
        const apiData = await cachedCall(
          cacheKey,
          async () => {
            const response = await fetch('/api/research/results', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sessionId, ids: selectedIds })
            });

            if (!response.ok) {
              throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.success || !data.data) {
              throw new Error(data.message || 'API 응답에 오류가 있습니다.');
            }
            
            return data;
          },
          researchCache
        );

        // API 응답을 레거시 포맷으로 변환
        const convertedData = convertApiResponseToLegacyFormat(apiData.data);
        setData(convertedData);
        
      } catch (err) {
        // HTTP 상태 코드별 에러 메시지 분류
        let errorMessage = '데이터를 불러오는데 실패했습니다';
        
        if (err instanceof Error) {
          const errorMsg = err.message.toLowerCase();
          
          // 네트워크 오류
          if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('connection')) {
            errorMessage = 'Network Error: 인터넷 연결을 확인해주세요.';
          }
          // HTTP 상태 코드별 분류
          else if (errorMsg.includes('400')) {
            errorMessage = 'Bad Request: 잘못된 요청입니다.';
          }
          else if (errorMsg.includes('401')) {
            errorMessage = 'Unauthorized: 로그인이 필요합니다.';
          }
          else if (errorMsg.includes('403')) {
            errorMessage = 'Forbidden: 접근 권한이 없습니다.';
          }
          else if (errorMsg.includes('404')) {
            errorMessage = 'Not Found: 요청한 리서치 데이터를 찾을 수 없습니다.';
          }
          else if (errorMsg.includes('429')) {
            errorMessage = 'Too Many Requests: 잠시 후 다시 시도해주세요.';
          }
          else if (errorMsg.includes('500')) {
            errorMessage = 'Server Error: 서버에 일시적인 문제가 발생했습니다.';
          }
          else if (errorMsg.includes('502')) {
            errorMessage = 'Bad Gateway: 서버 연결에 문제가 있습니다.';
          }
          else if (errorMsg.includes('503')) {
            errorMessage = 'Service Unavailable: 서비스가 일시적으로 사용할 수 없습니다.';
          }
          else if (errorMsg.includes('504')) {
            errorMessage = 'Gateway Timeout: 서버 응답 시간이 초과되었습니다.';
          }
          // API 응답 오류 메시지가 있는 경우
          else if (err.message && !err.message.startsWith('API Error:')) {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
        console.error('Failed to fetch research data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  return { data, loading, error };
}

/**
 * 특정 세션의 리서치 데이터만 가져오는 새로운 훅
 */
export function useResearchSessionData(sessionId: string) {
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 캐시 키 생성
        const cacheKey = CacheKeys.researchSession(sessionId);
        
        // 캐시된 API 호출
        const apiData = await cachedCall(
          cacheKey,
          async () => {
            const response = await fetch(`/api/research/sessions/${sessionId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });

            if (!response.ok) {
              throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.success || !data.data) {
              throw new Error(data.message || '세션 데이터를 찾을 수 없습니다.');
            }
            
            return data;
          },
          researchCache
        );
        
        setSession(apiData.data);
        
      } catch (err) {
        // HTTP 상태 코드별 에러 메시지 분류
        let errorMessage = '세션 데이터를 불러오는데 실패했습니다';
        
        if (err instanceof Error) {
          const errorMsg = err.message.toLowerCase();
          
          // 네트워크 오류
          if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('connection')) {
            errorMessage = 'Network Error: 인터넷 연결을 확인해주세요.';
          }
          // HTTP 상태 코드별 분류
          else if (errorMsg.includes('400')) {
            errorMessage = 'Bad Request: 잘못된 세션 요청입니다.';
          }
          else if (errorMsg.includes('401')) {
            errorMessage = 'Unauthorized: 로그인이 필요합니다.';
          }
          else if (errorMsg.includes('403')) {
            errorMessage = 'Forbidden: 세션 접근 권한이 없습니다.';
          }
          else if (errorMsg.includes('404')) {
            errorMessage = 'Not Found: 해당 리서치 세션을 찾을 수 없습니다.';
          }
          else if (errorMsg.includes('429')) {
            errorMessage = 'Too Many Requests: 잠시 후 다시 시도해주세요.';
          }
          else if (errorMsg.includes('500')) {
            errorMessage = 'Server Error: 서버에 일시적인 문제가 발생했습니다.';
          }
          else if (errorMsg.includes('502')) {
            errorMessage = 'Bad Gateway: 서버 연결에 문제가 있습니다.';
          }
          else if (errorMsg.includes('503')) {
            errorMessage = 'Service Unavailable: 서비스가 일시적으로 사용할 수 없습니다.';
          }
          else if (errorMsg.includes('504')) {
            errorMessage = 'Gateway Timeout: 서버 응답 시간이 초과되었습니다.';
          }
          // API 응답 오류 메시지가 있는 경우
          else if (err.message && !err.message.startsWith('API Error:')) {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
        console.error('Failed to fetch session data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  return { session, loading, error };
}