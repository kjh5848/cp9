'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResearchItem, ResearchSession } from '../types';
// Mock data imports removed - now using real API calls

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
  const convertApiResponseToLegacyFormat = (apiResponse: any): ResearchItem[] => {
    // 백엔드 API 응답 구조에 따라 변환
    if (Array.isArray(apiResponse.products)) {
      return apiResponse.products.map((product: any, index: number) => ({
        id: `research-${product.product_id || index + 1}`,
        productId: product.product_id?.toString() || `${index + 1}`,
        productName: product.product_name || '상품명 없음',
        productImage: product.product_image || `https://images.unsplash.com/photo-158312092641${index + 1}?w=400&h=300&fit=crop&auto=format`,
        productPrice: product.price_exact || 0,
        productUrl: product.deeplink_or_product_url || '#',
        category: product.category || '기타',
        analysis: {
          pros: product.reviews?.summary_positive || [],
          cons: product.reviews?.summary_negative || [],
          summary: product.seo?.meta_description || '분석 정보가 없습니다.',
          rating: product.reviews?.rating_avg || 4.0,
          keywords: product.seo?.keyword_cluster || []
        },
        seoContent: {
          title: product.seo?.title_variants?.[0] || product.product_name || '제목 없음',
          description: product.seo?.meta_description || '설명이 없습니다.',
          content: product.seo?.outline?.h2?.map((h2: string) => `<h2>${h2}</h2><p>${product.seo?.meta_description || ''}</p>`).join('\n') || '',
          tags: product.seo?.keyword_cluster || []
        },
        metadata: {
          totalItems: apiResponse.total_products || 1,
          researchDate: new Date(apiResponse.created_at || Date.now()),
          researchType: apiResponse.category_focus || '일반'
        },
        createdAt: new Date(product.captured_at || Date.now())
      }));
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
        
        // 실제 API 호출
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

        const apiData = await response.json();
        
        if (!apiData.success || !apiData.data) {
          throw new Error(apiData.message || 'API 응답에 오류가 있습니다.');
        }

        // API 응답을 레거시 포맷으로 변환
        const convertedData = convertApiResponseToLegacyFormat(apiData.data);
        setData(convertedData);
        
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다');
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
        
        // 실제 API 호출
        const response = await fetch(`/api/research/sessions/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const apiData = await response.json();
        
        if (!apiData.success || !apiData.data) {
          throw new Error(apiData.message || '세션 데이터를 찾을 수 없습니다.');
        }
        
        setSession(apiData.data);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다');
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