export const PERSONA_CTA_FILE: Record<string, string> = {
  'IT': 'cta-tech.html',
  'BEAUTY': 'cta-beauty.html',
  'LIVING': 'cta-living.html',
  'HUNTER': 'cta-hunter.html',
  'MASTER_CURATOR_H': 'cta-luxury.html',
};

export const CTA_VARIANTS: Record<string, { id: string; headerText: string; footerText: string; midText: string }[]> = {
  'IT': [
    { id: 'tech_v1', headerText: '스펙 및 최저가 확인', footerText: '최저가 확인하기', midText: '온라인 최저가 확인하기' },
    { id: 'tech_v2', headerText: '지금 바로 스펙 비교하기', footerText: '최저가로 구매하기', midText: '기술 스펙 비교 후 구매' },
  ],
  'BEAUTY': [
    { id: 'beauty_v1', headerText: '가장 저렴하게 쇼핑하기', footerText: '최저가 확인하기', midText: '최저가 바로 확인하기' },
    { id: 'beauty_v2', headerText: '나만의 뷰티템 장바구니 담기', footerText: '지금 바로 득템하기', midText: '핫딜 가격 확인하기' },
  ],
  'LIVING': [
    { id: 'living_v1', headerText: '지금 바로 최저가 확인하기', footerText: '최저가 바로가기', midText: '최저가 및 상세 정보 확인' },
    { id: 'living_v2', headerText: '살림 필수템 확인하기', footerText: '가성비 최고가로 구매하기', midText: '실사용 후기 보고 구매하기' },
  ],
  'HUNTER': [
    { id: 'hunter_v1', headerText: '품절 임박! 최저가 잡기', footerText: '할인가격 바로 구매', midText: '가장 저렴한 가격 확인하기' },
    { id: 'hunter_v2', headerText: '이 가격에 살 수 있을 때 잡기', footerText: '할인가 바로 구매하기', midText: '최저가 비교 후 구매하기' },
  ],
  'MASTER_CURATOR_H': [
    { id: 'luxury_v1', headerText: '프리미엄 최저가 확인하기', footerText: '상세 정보 지금 확인하기', midText: '할인가격 바로가기' },
    { id: 'luxury_v2', headerText: '큐레이터 추천가 확인하기', footerText: '프리미엄 딜 확인하기', midText: '엄선된 가격 확인하기' },
  ],
  'compare': [
    { id: 'compare_v1', headerText: '비교 후 최저가 확인하기', footerText: '비교 결과 1위 상품 구매하기', midText: '비교 분석 후 최저가 확인' },
    { id: 'compare_v2', headerText: '스펙 비교 결과 확인하기', footerText: '최종 추천 상품 바로 구매', midText: '전문가 비교 결과 보기' },
  ],
  'curation': [
    { id: 'curation_v1', headerText: '큐레이터 추천 상품 확인하기', footerText: '전체 추천 리스트 최저가 보기', midText: '추천 리스트 가격 확인' },
    { id: 'curation_v2', headerText: '에디터 추천 상품 보기', footerText: '엄선된 추천 목록 확인', midText: '엄선 아이템 가격 보기' },
  ],
};

export function selectVariant(persona: string, articleType?: string): { id: string; headerText: string; footerText: string; midText: string } {
  const variantKey = (articleType && articleType !== 'single' && CTA_VARIANTS[articleType])
    ? articleType
    : persona;
    const variants = CTA_VARIANTS[variantKey] || [
    { id: 'default_v1', headerText: '지금 바로 최저가 확인하기', footerText: '최저가 바로가기', midText: '최저가 가격 확인하기' },
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

export function getUrgencyText(): string {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) return '<span style="text-align:center;">야간 한정 특가가 곧 종료됩니다</span>';
  if (hour >= 6 && hour < 12) return '<span style="text-align:center;">오전 타임세일 진행 중</span>';
  if (hour >= 12 && hour < 18) return '<span style="text-align:center;">오늘의 특가, 재고 소진 시 종료</span>';
  return '<span style="text-align:center;">금일 마감 임박! 내일 가격이 변동될 수 있습니다</span>';
}

export function getSocialProofText(persona: string): string {
  const map: Record<string, string> = {
    'IT': '기술 블로거 92%가 추천한 제품',
    'BEAUTY': '뷰티 인플루언서 사이에서 화제인 아이템',
    'LIVING': '주부 커뮤니티 만족도 TOP 제품',
    'HUNTER': '가격 비교 사이트 최저가 기록 상품',
    'MASTER_CURATOR_H': '전문가 패널 만장일치 추천',
  };
  return map[persona] || '구매자 만족도가 높은 추천 상품';
}

export function buildPriceBlock(price: number, isRocket: boolean): string {
  const rocketBadge = isRocket ? '<span class="cp9-cta__rocket-badge">로켓배송</span>' : '';
  return `<div class="cp9-cta__price-block"><span class="cp9-cta__current-price">\${formatPrice(price)}</span>\${rocketBadge}</div>`;
}

export function addUtmParams(url: string, persona: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', 'cp9');
    urlObj.searchParams.set('utm_medium', 'cta');
    urlObj.searchParams.set('utm_campaign', persona.toLowerCase());
    return urlObj.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}utm_source=cp9&utm_medium=cta&utm_campaign=${persona.toLowerCase()}`;
  }
}
