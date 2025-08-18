'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResearchItem } from '../types';

/**
 * 리서치 데이터를 관리하는 훅
 */
export function useResearchData() {
  const [data, setData] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // 임시 데이터 생성 (실제로는 API 호출)
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // URL 파라미터에서 선택된 상품 ID 가져오기
        const selectedIds = searchParams.get('ids')?.split(',') || [];
        
        // 임시 데이터 생성
        const mockData: ResearchItem[] = selectedIds.map((id, index) => ({
          id: `research-${id}`,
          productId: id,
          productName: `상품 ${index + 1} - 프리미엄 제품`,
          productImage: `https://picsum.photos/400/300?random=${index}`,
          productPrice: Math.floor(Math.random() * 100000) + 10000,
          productUrl: `https://example.com/product/${id}`,
          category: ['전자제품', '패션', '홈데코', '뷰티'][index % 4],
          analysis: {
            pros: [
              '우수한 품질과 내구성',
              '합리적인 가격대',
              '빠른 배송 서비스'
            ],
            cons: [
              '색상 옵션 제한적',
              '사용 설명서 부족'
            ],
            summary: '전반적으로 가성비가 뛰어난 제품으로, 일상 사용에 적합합니다. 품질 대비 가격이 매우 합리적이며, 사용자 만족도가 높은 편입니다.',
            rating: 4.2 + Math.random() * 0.8,
            keywords: ['프리미엄', '가성비', '인기상품', '베스트셀러', '추천']
          },
          seoContent: {
            title: `2024년 최고의 ${['전자제품', '패션', '홈데코', '뷰티'][index % 4]} 추천 - 상품 ${index + 1}`,
            description: '전문가가 선정한 최고의 제품을 만나보세요. 실사용 후기와 함께 장단점을 상세히 분석했습니다.',
            content: `
              <h2>제품 소개</h2>
              <p>이 제품은 2024년 가장 주목받는 ${['전자제품', '패션', '홈데코', '뷰티'][index % 4]} 중 하나입니다.</p>
              
              <h2>주요 특징</h2>
              <ul>
                <li>뛰어난 가성비</li>
                <li>우수한 품질</li>
                <li>사용자 친화적 디자인</li>
              </ul>
              
              <h2>사용 후기</h2>
              <p>실제 사용자들의 만족도가 매우 높으며, 재구매 의사가 90% 이상입니다.</p>
              
              <h2>구매 가이드</h2>
              <p>이 제품은 다음과 같은 분들께 추천합니다:</p>
              <ul>
                <li>품질을 중요시하는 분</li>
                <li>합리적인 가격을 원하는 분</li>
                <li>오래 사용할 제품을 찾는 분</li>
              </ul>
            `,
            tags: ['2024추천', '베스트상품', '가성비최고', '인기제품']
          },
          createdAt: new Date()
        }));

        // 실제로는 API 호출
        // const response = await fetch('/api/research/results', {
        //   method: 'POST',
        //   body: JSON.stringify({ ids: selectedIds })
        // });
        // const data = await response.json();

        setData(mockData);
        setError(null);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  return { data, loading, error };
}