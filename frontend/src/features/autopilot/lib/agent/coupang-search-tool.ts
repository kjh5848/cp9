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

/**
 * 에이전트가 사용할 수 있도록 쿠팡 검색 API를 래핑한 Tool 함수
 * @param query 검색 키워드 (예: "가성비 로봇청소기")
 * @param limit 반환할 최대 아이템 수 (기본 10구)
 */
export async function searchCoupangProductsTool(query: string, limit: number = 10): Promise<CoupangSearchResult[]> {
  try {
    const rawData = await searchCoupangProducts(query, limit);
    return rawData.map((item: CoupangRawItem) => ({
      productId: Number(item.productId),
      productName: item.productName,
      productPrice: item.productPrice,
      productImage: item.productImage,
      productUrl: item.productUrl,
      categoryName: item.categoryName || '',
      isRocket: item.isRocket || false,
      isFreeShipping: item.isFreeShipping || false,
    }));
  } catch (error) {
    console.error(`[CoupangSearchTool] 검색 실패 - query: ${query}`, error);
    return [];
  }
}
