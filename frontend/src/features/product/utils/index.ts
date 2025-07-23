import { ProductItem, ProductFilterOptions, SortOption, CategoryOption, ImageSizeOption } from '../types';

/**
 * 숫자 포맷팅 함수
 * 
 * @param value - 포맷팅할 숫자 문자열
 * @returns 콤마가 포함된 포맷된 문자열
 * @example
 * formatNumber("1234567") // "1,234,567"
 */
export function formatNumber(value: string): string {
  // 숫자가 아닌 문자 제거
  const numericValue = value.replace(/[^\d]/g, '');
  
  if (numericValue === '') return '';
  
  // 숫자를 콤마로 구분하여 포맷팅
  return parseInt(numericValue, 10).toLocaleString();
}

/**
 * 포맷된 숫자 문자열을 숫자로 변환
 * 
 * @param value - 포맷된 숫자 문자열
 * @returns 변환된 숫자
 * @example
 * parseNumber("1,234,567") // 1234567
 */
export function parseNumber(value: string): number {
  // 콤마 제거 후 숫자로 변환
  const numericValue = value.replace(/[^\d]/g, '');
  return numericValue === '' ? 0 : parseInt(numericValue, 10);
}

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

/**
 * 쿠팡 카테고리 옵션 목록
 */
export const COUPANG_CATEGORIES: CategoryOption[] = [
  { value: '', label: '카테고리 선택' },
  { value: '1001', label: '여성패션' },
  { value: '1002', label: '남성패션' },
  { value: '1010', label: '뷰티' },
  { value: '1011', label: '출산/유아동' },
  { value: '1012', label: '식품' },
  { value: '1013', label: '주방용품' },
  { value: '1014', label: '생활용품' },
  { value: '1015', label: '홈인테리어' },
  { value: '1016', label: '가전디지털' },
  { value: '1017', label: '스포츠/레저' },
  { value: '1018', label: '자동차용품' },
  { value: '1019', label: '도서/음반/DVD' },
  { value: '1020', label: '완구/취미' },
  { value: '1021', label: '문구/오피스' },
  { value: '1024', label: '헬스/건강식품' },
  { value: '1025', label: '국내여행' },
  { value: '1026', label: '해외여행' },
  { value: '1029', label: '반려동물용품' },
  { value: '1030', label: '유아동패션' },
];

/**
 * 이미지 크기 옵션 목록
 */
export const IMAGE_SIZE_OPTIONS: ImageSizeOption[] = [256, 512, 768, 1024];

/**
 * 기본 검색 옵션
 */
export const DEFAULT_SEARCH_OPTIONS = {
  categoryId: '',
  imageSize: 512 as ImageSizeOption,
  bestLimit: 20,
  priceRange: [0, 5_000_000] as [number, number],
}; 