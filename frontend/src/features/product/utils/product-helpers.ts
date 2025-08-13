import { ProductItem, DeepLinkResponse } from '@/shared/types/api'

/**
 * 아이템이 ProductItem인지 확인하는 타입 가드
 * @param item - 확인할 아이템
 * @returns ProductItem인지 여부
 */
export function isProductItem(item: ProductItem | DeepLinkResponse): item is ProductItem {
  return 'productId' in item && 'productName' in item
}

/**
 * 아이템이 DeepLinkResponse인지 확인하는 타입 가드
 * @param item - 확인할 아이템
 * @returns DeepLinkResponse인지 여부
 */
export function isDeepLinkResponse(item: ProductItem | DeepLinkResponse): item is DeepLinkResponse {
  return 'originalUrl' in item && 'shortenUrl' in item
}

/**
 * 아이템의 고유 ID를 생성합니다
 * @param item - 아이템
 * @param index - 배열 인덱스
 * @returns 고유 ID
 */
export function generateItemId(item: ProductItem | DeepLinkResponse, index: number): string {
  if (isProductItem(item)) {
    return `product-${index}`
  } else if (isDeepLinkResponse(item)) {
    return `deeplink-${index}`
  }
  return `unknown-${index}`
}

/**
 * 선택된 아이템들을 가져옵니다
 * @param filteredResults - 필터링된 결과 배열
 * @param selected - 선택된 ID 배열
 * @returns 선택된 아이템 배열
 */
export function getSelectedItems(
  filteredResults: (ProductItem | DeepLinkResponse)[],
  selected: string[]
): (ProductItem | DeepLinkResponse)[] {
  return selected
    .map(selectedId => {
      // ID에서 인덱스 추출
      const indexMatch = selectedId.match(/-(.+)$/)
      if (!indexMatch) return null
      
      const index = parseInt(indexMatch[1])
      if (isNaN(index) || index >= filteredResults.length) return null
      
      return filteredResults[index]
    })
    .filter((item): item is ProductItem | DeepLinkResponse => item !== null)
}

/**
 * ProductItem을 SEO 데이터로 변환합니다
 * @param item - ProductItem
 * @returns SEO 데이터
 */
export function convertToSeoData(item: ProductItem) {
  return {
    title: item.productName,
    price: item.productPrice,
    category: item.categoryName,
    url: item.productUrl,
    image: item.productImage,
    isRocket: item.isRocket,
    isFreeShipping: item.isFreeShipping
  }
} 