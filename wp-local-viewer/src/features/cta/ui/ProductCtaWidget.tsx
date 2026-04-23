import React from 'react';
import { CtaCard } from '@/entities/cta/ui/CtaCard';
import type { CtaData } from '@/entities/cta/model/types';

interface ProductCtaWidgetProps {
  productUrl: string;
  productName?: string;
  imageUrl?: string;
  price?: number;
  isRocket?: boolean;
}

/**
 * [FSD Feature] 비즈니스 로직 및 상태 조작을 담당하는 Smart Component
 * 필요한 API(SWR) 및 로깅 상태 처리 후 Entity (CtaCard) 에 주입합니다.
 */
export const ProductCtaWidget: React.FC<ProductCtaWidgetProps> = (props) => {
  // TODO: 향후 클릭 로깅 추적, SWR을 이용한 실시간 가격 갱신 등의 로직 위치.
  // 현재는 props를 그대로 Entity(순수 UI) 포맷에 맞게 조립.
  
  const ctaData: CtaData = {
    ...props,
    themeType: 'A', // 외부 주입 또는 전역 설정에 따라 테마 A/B/C를 동적 렌더링 할 수 있습니다.
  };

  // 조건부 평가 렌더링 시 ? : null 패턴 준수
  return ctaData.productUrl ? <CtaCard data={ctaData} /> : null;
};
