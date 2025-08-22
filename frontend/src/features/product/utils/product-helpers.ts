import { ProductItem, DeepLinkResponse, GroupedProductItem, ProductVariant } from '../types';

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

/**
 * URL에서 vendorItemId와 itemId 추출하는 함수
 * 
 * @param url - 상품 URL
 * @returns vendorItemId와 itemId
 */
function extractIdsFromUrl(url: string): { vendorItemId: string; itemId: string } {
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  const vendorItemId = urlParams.get('vendorItemId') || '';
  const itemId = urlParams.get('itemId') || '';
  
  return { vendorItemId, itemId };
}

/**
 * 중복된 productId를 가진 상품들을 그룹화하는 함수
 * 
 * @param products - 상품 목록
 * @returns 그룹화된 상품 목록
 */
export function groupProductsByProductId(products: ProductItem[]): GroupedProductItem[] {
  const productMap = new Map<number, ProductItem[]>();
  
  // productId별로 그룹화
  products.forEach(product => {
    const existing = productMap.get(product.productId) || [];
    productMap.set(product.productId, [...existing, product]);
  });
  
  // 그룹화된 결과를 GroupedProductItem 배열로 변환
  const groupedProducts: GroupedProductItem[] = [];
  
  productMap.forEach((productGroup, productId) => {
    // 가격순으로 정렬 (오름차순)
    const sortedGroup = [...productGroup].sort((a, b) => a.productPrice - b.productPrice);
    const mainItem = sortedGroup[0]; // 최저가 상품을 메인으로
    
    // 변형 상품들 생성
    const variants: ProductVariant[] = sortedGroup.map(item => {
      const { vendorItemId, itemId } = extractIdsFromUrl(item.productUrl);
      return {
        item,
        vendorItemId,
        itemId,
        priceDiff: item.productPrice - mainItem.productPrice
      };
    });
    
    // 가격 범위 계산
    const prices = sortedGroup.map(p => p.productPrice);
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
    
    groupedProducts.push({
      productId,
      mainItem,
      variants,
      priceRange,
      variantCount: productGroup.length
    });
  });
  
  return groupedProducts;
}

/**
 * GroupedProductItem을 일반 ProductItem 배열로 변환
 * (기존 호환성 유지를 위한 헬퍼 함수)
 * 
 * @param groupedProducts - 그룹화된 상품 목록
 * @returns 단일 상품 목록
 */
export function flattenGroupedProducts(groupedProducts: GroupedProductItem[]): ProductItem[] {
  return groupedProducts.map(group => {
    const mainItem = { ...group.mainItem };
    
    // 변형이 여러개 있는 경우 상품명에 정보 추가
    if (group.variantCount > 1) {
      const priceInfo = `${group.priceRange.min.toLocaleString()}원 ~ ${group.priceRange.max.toLocaleString()}원`;
      mainItem.productName = `${mainItem.productName} (${group.variantCount}개 옵션: ${priceInfo})`;
    }
    
    return mainItem;
  });
} 