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
        
        // 풍부한 더미 데이터 생성 (10개)
        const productData = [
          {
            name: 'Apple iPhone 15 Pro Max',
            category: '전자제품',
            price: 1690000,
            image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
            pros: ['A17 Pro 칩셋으로 뛰어난 성능', '48MP 메인 카메라 고화질', '티타늄 소재로 가벼운 무게', '120Hz ProMotion 디스플레이'],
            cons: ['높은 가격대', 'Lightning 케이블 미포함', '발열 이슈 간헐적 발생'],
            summary: '최신 A17 Pro 칩셋과 티타늄 디자인이 돋보이는 프리미엄 스마트폰. 카메라 성능이 특히 우수하며, 전문적인 사진 촬영이 가능합니다.',
            rating: 4.7,
            keywords: ['아이폰', '프리미엄', '카메라', '성능', 'iOS']
          },
          {
            name: 'Nike Air Max 270 운동화',
            category: '패션',
            price: 179000,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
            pros: ['Max Air 쿠셔닝으로 편안함', '가벼운 무게감', '다양한 컬러 옵션', '일상복과 잘 매칭'],
            cons: ['내구성이 다소 아쉬움', '사이즈가 작게 나옴', '흰색 계열 쉽게 더러워짐'],
            summary: '나이키의 대표적인 라이프스타일 스니커즈로, 뛰어난 쿠셔닝과 스타일리시한 디자인이 매력적입니다. 운동과 일상 모두에서 활용 가능합니다.',
            rating: 4.3,
            keywords: ['나이키', '운동화', '에어맥스', '쿠셔닝', '스타일']
          },
          {
            name: 'IKEA HEMNES 서랍장',
            category: '홈데코',
            price: 299000,
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
            pros: ['실용적인 수납공간', '견고한 소나무 소재', '클래식한 디자인', '조립 매뉴얼 상세함'],
            cons: ['조립 시간이 오래 걸림', '무게가 상당히 무거움', '이동 시 불편함'],
            summary: '북유럽 스타일의 실용적인 서랍장으로, 견고한 소재와 넉넉한 수납공간이 장점입니다. 침실이나 거실에 잘 어울리는 클래식한 디자인입니다.',
            rating: 4.1,
            keywords: ['이케아', '서랍장', '수납', '소나무', '북유럽']
          },
          {
            name: 'The Ordinary Niacinamide 10% + Zinc 1%',
            category: '뷰티',
            price: 12000,
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop',
            pros: ['저렴한 가격대', '피지 조절 효과 우수', '모공 관리에 도움', '간단한 성분으로 부작용 적음'],
            cons: ['즉각적인 효과 보기 어려움', '끈적한 질감', '일부 피부에 따가움'],
            summary: '니아신아마이드 10% 고함량으로 피지 조절과 모공 관리에 효과적인 세럼입니다. 가성비가 뛰어나며, 민감하지 않은 피부에 적합합니다.',
            rating: 4.0,
            keywords: ['디오디너리', '니아신아마이드', '세럼', '모공관리', '가성비']
          },
          {
            name: 'Sony WH-1000XM5 노이즈캔슬링 헤드폰',
            category: '전자제품',
            price: 449000,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
            pros: ['업계 최고 수준 노이즈캔슬링', '최대 30시간 배터리', 'LDAC 고음질 코덱 지원', '편안한 착용감'],
            cons: ['접이식 불가', '터치 조작 때때로 오작동', '가격대가 높음'],
            summary: '소니의 플래그십 노이즈캔슬링 헤드폰으로, 뛰어난 음질과 노이즈캔슬링 성능을 자랑합니다. 장시간 사용해도 편안하며, 음악 감상에 최적화되어 있습니다.',
            rating: 4.6,
            keywords: ['소니', '헤드폰', '노이즈캔슬링', '하이레스', '블루투스']
          },
          {
            name: 'Zara 오버사이즈 블레이저',
            category: '패션',
            price: 119000,
            image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=300&fit=crop',
            pros: ['트렌디한 오버핏', '다양한 스타일링 가능', '괜찮은 소재감', '합리적인 가격'],
            cons: ['품질 대비 가격이 아쉬움', '세탁 후 형태 변형', '사이즈 선택 어려움'],
            summary: '자라의 시그니처 오버사이즈 블레이저로, 캐주얼부터 비즈니스까지 다양하게 연출 가능합니다. 트렌디한 실루엣이 매력적인 아이템입니다.',
            rating: 3.8,
            keywords: ['자라', '블레이저', '오버사이즈', '트렌드', '비즈니스']
          },
          {
            name: '무인양품 라벤더 디퓨저',
            category: '홈데코',
            price: 35000,
            image: 'https://images.unsplash.com/photo-1544967919-6e2c3f0e6ac0?w=400&h=300&fit=crop',
            pros: ['자연스러운 라벤더 향', '심플한 미니멀 디자인', '적당한 향의 강도', '리필 가능'],
            cons: ['향의 지속력이 짧음', '스틱 교체 주기 짧음', '가격 대비 용량 적음'],
            summary: '무인양품의 시그니처 라벤더 향 디퓨저로, 은은하고 자연스러운 향이 특징입니다. 미니멀한 디자인으로 어떤 공간에도 잘 어울립니다.',
            rating: 4.2,
            keywords: ['무인양품', '디퓨저', '라벤더', '미니멀', '향수']
          },
          {
            name: 'Fenty Beauty Gloss Bomb',
            category: '뷰티',
            price: 28000,
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop',
            pros: ['촉촉한 발림성', '다양한 피부톤에 적합', '은은한 윤기감', '지속력 우수'],
            cons: ['끈적함이 다소 있음', '향이 강한 편', '가격 대비 용량 적음'],
            summary: '리한나의 펜티 뷰티 대표 립글로스로, 촉촉하고 윤기나는 입술 연출이 가능합니다. 다양한 피부톤에 잘 어울리는 범용성이 장점입니다.',
            rating: 4.4,
            keywords: ['펜티뷰티', '립글로스', '리한나', '윤기', '촉촉함']
          },
          {
            name: 'MacBook Air M2',
            category: '전자제품',
            price: 1590000,
            image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop',
            pros: ['M2 칩의 뛰어난 성능', '팬리스 설계로 조용함', '뛰어난 배터리 수명', '가벼운 휴대성'],
            cons: ['포트 개수 부족', '외장 모니터 연결 제한', '메모리 업그레이드 불가'],
            summary: 'Apple의 M2 칩을 탑재한 울트라북으로, 뛰어난 성능과 배터리 수명을 자랑합니다. 학업과 업무 모두에 적합한 만능 노트북입니다.',
            rating: 4.8,
            keywords: ['맥북', 'M2칩', 'macOS', '휴대성', '애플']
          },
          {
            name: 'Uniqlo 하이브리드 다운 재킷',
            category: '패션',
            price: 99000,
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
            pros: ['뛰어난 보온성', '가벼운 무게', '컴팩트한 수납 가능', '세탁기 사용 가능'],
            cons: ['바람막이 기능 부족', '정전기 발생', '디자인이 평범함'],
            summary: '유니클로의 혁신적인 하이브리드 다운으로, 가볍고 따뜻한 것이 특징입니다. 도시적인 라이프스타일에 최적화된 실용적인 아우터입니다.',
            rating: 4.5,
            keywords: ['유니클로', '다운재킷', '하이브리드', '보온', '가벼움']
          }
        ];

        // 10개의 풍부한 더미 데이터 생성
        const mockData: ResearchItem[] = productData.map((product, index) => ({
          id: `research-${index + 1}`,
          productId: `product-${index + 1}`,
          productName: product.name,
          productImage: product.image,
          productPrice: product.price,
          productUrl: `https://example.com/product/${index + 1}`,
          category: product.category,
          analysis: {
            pros: product.pros,
            cons: product.cons,
            summary: product.summary,
            rating: product.rating,
            keywords: product.keywords
          },
          seoContent: {
            title: `2024년 ${product.category} 베스트 선택: ${product.name} 완벽 리뷰`,
            description: `${product.name}에 대한 전문가의 상세한 분석과 실제 사용 후기를 확인하세요. 장단점부터 구매 가이드까지 완벽 정리했습니다.`,
            content: `
              <h2>${product.name} 제품 소개</h2>
              <p>2024년 ${product.category} 시장에서 주목받고 있는 ${product.name}에 대해 상세히 분석해보았습니다. 실제 사용자들의 후기와 전문가 의견을 종합하여 객관적인 평가를 제공합니다.</p>
              
              <h2>주요 장점</h2>
              <ul>
                ${product.pros.map(pro => `<li>${pro}</li>`).join('')}
              </ul>
              
              <h2>아쉬운 점</h2>
              <ul>
                ${product.cons.map(con => `<li>${con}</li>`).join('')}
              </ul>
              
              <h2>사용자 후기 분석</h2>
              <p>${product.summary}</p>
              <p>평균 평점 ${product.rating}점으로, 사용자들의 전반적인 만족도가 높은 편입니다. 특히 ${product.pros[0].toLowerCase()}이(가) 가장 높게 평가받고 있습니다.</p>
              
              <h2>구매 추천 대상</h2>
              <ul>
                <li>${product.category === '전자제품' ? '최신 기술을 중요시하는 분' : 
                     product.category === '패션' ? '트렌드에 민감한 분' :
                     product.category === '홈데코' ? '인테리어에 관심이 많은 분' :
                     '뷰티 케어에 관심이 많은 분'}</li>
                <li>품질과 기능성을 모두 고려하는 분</li>
                <li>${product.price > 500000 ? '프리미엄 제품을 선호하는 분' : '합리적인 가격대의 제품을 찾는 분'}</li>
              </ul>
              
              <h2>최종 평가</h2>
              <p>종합적으로 ${product.name}는 ${product.category} 분야에서 ${product.rating >= 4.5 ? '매우 추천할만한' : product.rating >= 4.0 ? '추천할만한' : '고려해볼만한'} 제품입니다. 특히 ${product.keywords.slice(0, 2).join(', ')}을(를) 중요하게 생각하신다면 만족하실 것입니다.</p>
            `,
            tags: [...product.keywords, '2024추천', 'AI분석', '사용자후기']
          },
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 최근 30일 내 랜덤
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