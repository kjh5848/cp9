import { ProductItem, ProductFilterOptions, SortOption } from '../types';

/**
 * 숫자를 천 단위 쉼표가 포함된 문자열로 포맷
 * @param value - 포맷할 숫자 또는 문자열
 * @returns 쉼표가 포함된 형태의 문자열
 */
export const formatNumber = (value: string | number): string => {
  const stringValue = typeof value === 'number' ? value.toString() : value;
  // 숫자가 아닌 문자 제거
  const numericValue = stringValue.replace(/[^0-9]/g, '');
  // 빈 문자열이면 '0' 반환
  if (numericValue === '') return '0';
  // 천 단위 쉼표 추가
  return parseInt(numericValue).toLocaleString();
};

/**
 * 포맷된 문자열을 숫자로 변환
 * @param value - 변환할 문자열
 * @returns 숫자 값
 */
export const parseNumber = (value: string): number => {
  const numericValue = value.replace(/[^0-9]/g, '');
  return numericValue === '' ? 0 : parseInt(numericValue);
};

/**
 * 가격을 원화 형태로 포맷
 * @param price - 가격
 * @param showUnit - '원' 단위 표시 여부
 * @returns 포맷된 가격 문자열
 */
export const formatPrice = (price: number, showUnit: boolean = true): string => {
  const formatted = price.toLocaleString();
  return showUnit ? `${formatted}원` : formatted;
};

/**
 * 할인율 계산
 * @param originalPrice - 원래 가격
 * @param currentPrice - 현재 가격
 * @returns 할인율 (0-100)
 */
export const calculateDiscountRate = (originalPrice: number, currentPrice: number): number => {
  if (originalPrice <= 0 || currentPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * 상품 필터링
 * @param products - 상품 목록
 * @param filters - 필터 옵션
 * @returns 필터링된 상품 목록
 */
export const filterProducts = (products: ProductItem[], filters: ProductFilterOptions): ProductItem[] => {
  return products.filter((product) => {
    // 로켓배송 필터
    if (filters.rocketOnly && !product.isRocket && !product.rocketShipping) {
      return false;
    }

    // 가격 범위 필터
    const price = product.productPrice ?? 0;
    if (price < filters.priceMin || price > filters.priceMax) {
      return false;
    }

    // 카테고리 필터
    if (filters.categoryId && product.categoryId !== filters.categoryId) {
      return false;
    }

    return true;
  });
};

/**
 * 상품 정렬
 * @param products - 상품 목록
 * @param sortBy - 정렬 기준
 * @param sortOrder - 정렬 순서
 * @returns 정렬된 상품 목록
 */
export const sortProducts = (
  products: ProductItem[], 
  sortBy: 'price' | 'rating' | 'review' | 'discount' = 'price',
  sortOrder: SortOption = 'none'
): ProductItem[] => {
  if (sortOrder === 'none') return products;

  return [...products].sort((a, b) => {
    let aValue = 0;
    let bValue = 0;

    switch (sortBy) {
      case 'price':
        aValue = a.productPrice ?? 0;
        bValue = b.productPrice ?? 0;
        break;
      case 'rating':
        aValue = a.rating ?? 0;
        bValue = b.rating ?? 0;
        break;
      case 'review':
        aValue = a.reviewCount ?? 0;
        bValue = b.reviewCount ?? 0;
        break;
      case 'discount':
        aValue = a.discountRate ?? 0;
        bValue = b.discountRate ?? 0;
        break;
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });
};

/**
 * 쿠팡 상품 URL에서 상품 ID 추출
 * @param url - 쿠팡 상품 URL
 * @returns 상품 ID 또는 null
 */
export const extractProductId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const productIndex = pathParts.findIndex(part => part === 'products');
    
    if (productIndex !== -1 && pathParts[productIndex + 1]) {
      return pathParts[productIndex + 1];
    }
    
    return null;
  } catch {
    return null;
  }
};

/**
 * URL 유효성 검사
 * @param url - 검사할 URL
 * @returns 유효한 URL인지 여부
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 쿠팡 URL인지 확인
 * @param url - 검사할 URL
 * @returns 쿠팡 URL인지 여부
 */
export const isCoupangUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('coupang.com');
  } catch {
    return false;
  }
};

/**
 * 이미지 크기 문자열 생성
 * @param size - 이미지 크기
 * @returns "크기x크기" 형태의 문자열
 */
export const getImageSizeString = (size: number): string => {
  return `${size}x${size}`;
};

/**
 * 검색 키워드 정제
 * @param keyword - 원본 키워드
 * @returns 정제된 키워드
 */
export const sanitizeKeyword = (keyword: string): string => {
  return keyword.trim().replace(/\s+/g, ' ');
};

/**
 * 카테고리 ID 검증
 * @param categoryId - 카테고리 ID
 * @returns 유효한 카테고리 ID인지 여부
 */
export const isValidCategoryId = (categoryId: string): boolean => {
  return /^\d{4}$/.test(categoryId);
}; 