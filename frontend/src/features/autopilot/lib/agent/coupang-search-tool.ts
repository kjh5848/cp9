import { searchCoupangProducts } from '@/infrastructure/clients/coupang';

export interface CoupangSearchResult {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  categoryName: string;
  isRocket: boolean;
  isFreeShipping: boolean;
}

interface CoupangRawItem {
  productId: number | string;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  categoryName?: string;
  isRocket?: boolean;
  isFreeShipping?: boolean;
}

export interface SourcingConstraints {
  minPrice?: number | null;
  maxPrice?: number | null;
  isRocketOnly?: boolean | null;
}

/**
 * 에이전트가 사용할 수 있도록 쿠팡 검색 API를 래핑한 Tool 함수
 * @param query 검색 키워드 (예: "가성비 로봇청소기")
 * @param limit 반환할 최대 아이템 수 (기본 10구)
 * @param constraints 오토파일럿 가격/로켓 필터 레이어
 */
export async function searchCoupangProductsTool(
  query: string, 
  limit: number = 10,
  constraints?: SourcingConstraints
): Promise<CoupangSearchResult[]> {
  try {
    // 쿠팡 검색 API는 limit > 10일 때 간헐적으로 0건을 반환할 수 있으므로 10개만 요청합니다.
    const rawData = await searchCoupangProducts(query, 10);
    let mapped = rawData.map((item: CoupangRawItem) => ({
      productId: Number(item.productId),
      productName: item.productName,
      productPrice: item.productPrice,
      productImage: item.productImage,
      productUrl: item.productUrl,
      categoryName: item.categoryName || '',
      isRocket: item.isRocket || false,
      isFreeShipping: item.isFreeShipping || false,
    }));

    if (constraints) {
      if (constraints.isRocketOnly) {
        mapped = mapped.filter((item: CoupangSearchResult) => item.isRocket);
      }
      if (constraints.minPrice != null) {
        mapped = mapped.filter((item: CoupangSearchResult) => item.productPrice >= constraints.minPrice!);
      }
      if (constraints.maxPrice != null) {
        mapped = mapped.filter((item: CoupangSearchResult) => item.productPrice <= constraints.maxPrice!);
      }
    }

    return mapped.slice(0, limit);
  } catch (error) {
    console.error(`[CoupangSearchTool] 검색 실패 - query: ${query}`, error);
    return [];
  }
}
