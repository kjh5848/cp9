'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResearchItem, ResearchSession } from '../types';
import { getAllResearchSessions, getResearchSessionById } from '../data/mockSessions';

/**
 * 리서치 데이터를 관리하는 훅 (기존 호환성 유지)
 * 새로운 API 포맷 데이터를 기존 인터페이스로 변환
 */
export function useResearchData() {
  const [data, setData] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // 새로운 API 포맷을 기존 포맷으로 변환하는 함수
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
        
        // 시뮬레이션된 지연
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let session: ResearchSession | undefined;
        
        // 특정 세션 ID가 있으면 해당 세션, 없으면 전체 세션 중 하나
        if (sessionId && sessionId !== 'all') {
          session = getResearchSessionById(sessionId);
        }
        
        // 세션을 찾지 못했으면 기본 세션 사용
        if (!session) {
          const allSessions = getAllResearchSessions();
          session = allSessions[4]; // research-5 (10개 제품)
        }
        
        // 레거시 포맷으로 변환
        const convertedData = convertToLegacyFormat(session);
        
        // 실제로는 API 호출
        // const response = await fetch('/api/research/results', {
        //   method: 'POST',
        //   body: JSON.stringify({ sessionId, ids: selectedIds })
        // });
        // const data = await response.json();

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
        
        // 시뮬레이션된 지연
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const sessionData = getResearchSessionById(sessionId);
        
        if (!sessionData) {
          throw new Error('세션을 찾을 수 없습니다');
        }
        
        setSession(sessionData);
        
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