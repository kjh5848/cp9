import { ProductItem, DeepLinkResponse } from '../types';

/**
 * 타입 가드: ProductItem인지 확인
 * 
 * @param item - 확인할 아이템
 * @returns ProductItem인지 여부
 */
export function isProductItem(item: ProductItem | DeepLinkResponse): item is ProductItem {
  return 'productId' in item;
}

/**
 * 타입 가드: DeepLinkResponse인지 확인
 * 
 * @param item - 확인할 아이템
 * @returns DeepLinkResponse인지 여부
 */
export function isDeepLinkResponse(item: ProductItem | DeepLinkResponse): item is DeepLinkResponse {
  return 'originalUrl' in item;
}

/**
 * 아이템 ID를 생성하는 함수
 * 
 * @param item - 아이템
 * @param index - 인덱스
 * @returns 아이템 ID
 */
export function generateItemId(item: ProductItem | DeepLinkResponse, index: number): string {
  if (isProductItem(item)) {
    return item.productId.toString();
  } else if (isDeepLinkResponse(item)) {
    return item.originalUrl || index.toString();
  }
  return index.toString();
}

/**
 * 선택된 아이템들을 필터링하는 함수
 * 
 * @param filteredResults - 필터링된 결과
 * @param selected - 선택된 ID 배열
 * @returns 선택된 아이템들
 */
export function getSelectedItems(
  filteredResults: (ProductItem | DeepLinkResponse)[],
  selected: string[]
): (ProductItem | DeepLinkResponse)[] {
  return filteredResults.filter((_, index) => {
    const itemId = generateItemId(filteredResults[index], index);
    return selected.includes(itemId);
  });
}

/**
 * 상품 정보를 SEO 생성용 데이터로 변환하는 함수
 * 
 * @param item - 상품 아이템
 * @returns SEO 생성용 데이터
 */
export function convertToSeoData(item: ProductItem) {
  return {
    name: item.productName,
    price: item.productPrice,
    category: item.categoryName,
    url: item.productUrl,
    image: item.productImage
  };
} 