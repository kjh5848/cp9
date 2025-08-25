/**
 * Product API 클라이언트
 * 쿠팡 상품 검색, 카테고리, 딥링크 변환 등의 모든 API 호출을 담당
 */

import { BaseApiClient } from '../core/BaseApiClient';
import { ApiConfig } from '../core/config';
import type {
  KeywordSearchParams,
  CategorySearchParams,
  DeeplinkConversionParams,
  ProductSearchResponse,
  CategorySearchResponse,
  DeeplinkConversionResponse,
  BestCategoryResponse,
  ProductItem,
  ProductFilter,
  ProductSortOption,
  ApiProductSortOption,
  ProductStats,
} from '../types/product';

export class ProductApiClient extends BaseApiClient {
  constructor() {
    // Next.js API Routes 사용
    super('internal');
  }

  /**
   * 키워드로 상품 검색
   */
  async searchByKeyword(params: KeywordSearchParams): Promise<ProductSearchResponse> {
    console.log('[ProductApiClient] 키워드 검색:', {
      keyword: params.keyword,
      limit: params.limit,
      filters: {
        sortBy: params.sortBy,
        rocketShipping: params.rocketShipping,
        priceRange: params.minPrice || params.maxPrice ? [params.minPrice, params.maxPrice] : null
      }
    });

    const response = await this.post<ProductSearchResponse>(
      ApiConfig.ENDPOINTS.PRODUCTS.SEARCH,
      {
        keyword: params.keyword,
        limit: params.limit || 20,
        sortBy: params.sortBy || 'SCORE',
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        categoryId: params.categoryId,
        rocketShipping: params.rocketShipping,
      }
    );

    return response.data;
  }

  /**
   * 카테고리별 상품 검색 (베스트 상품)
   */
  async searchByCategory(params: CategorySearchParams): Promise<BestCategoryResponse> {
    console.log('[ProductApiClient] 카테고리 검색:', {
      categoryId: params.categoryId,
      limit: params.limit,
      filters: {
        sortBy: params.sortBy,
        rocketShipping: params.rocketShipping,
        priceRange: params.minPrice || params.maxPrice ? [params.minPrice, params.maxPrice] : null
      }
    });

    const response = await this.post<BestCategoryResponse>(
      ApiConfig.ENDPOINTS.PRODUCTS.BEST_CATEGORIES,
      {
        categoryId: params.categoryId,
        limit: params.limit || 20,
        sortBy: params.sortBy || 'SCORE',
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        rocketShipping: params.rocketShipping,
      }
    );

    return response.data;
  }

  /**
   * 딥링크 변환
   */
  async convertDeeplinks(params: DeeplinkConversionParams): Promise<DeeplinkConversionResponse> {
    console.log('[ProductApiClient] 딥링크 변환:', {
      urlCount: params.urls.length,
      hasTrackingCode: !!params.trackingCode,
      urls: params.urls.slice(0, 3).map(url => url.substring(0, 50) + '...')
    });

    const response = await this.post<DeeplinkConversionResponse>(
      ApiConfig.ENDPOINTS.PRODUCTS.DEEPLINK,
      {
        urls: params.urls,
        trackingCode: params.trackingCode,
        subId: params.subId,
      }
    );

    return response.data;
  }

  /**
   * 여러 키워드로 상품 검색 (배치 처리)
   */
  async searchByMultipleKeywords(
    keywords: string[],
    options?: {
      limit?: number;
      sortBy?: ApiProductSortOption;
      filter?: ProductFilter;
    }
  ): Promise<Array<ProductSearchResponse & { keyword: string }>> {
    console.log('[ProductApiClient] 다중 키워드 검색:', {
      keywordCount: keywords.length,
      keywords: keywords.slice(0, 5),
      options
    });

    // 병렬로 여러 키워드 검색 실행
    const searchPromises = keywords.map(async (keyword) => {
      const params: KeywordSearchParams = {
        keyword,
        limit: options?.limit,
        sortBy: options?.sortBy,
        minPrice: options?.filter?.minPrice,
        maxPrice: options?.filter?.maxPrice,
        rocketShipping: options?.filter?.rocketOnly,
      };

      const result = await this.searchByKeyword(params);
      return { ...result, keyword };
    });

    return Promise.all(searchPromises);
  }

  /**
   * 여러 카테고리로 상품 검색 (배치 처리)
   */
  async searchByMultipleCategories(
    categoryIds: string[],
    options?: {
      limit?: number;
      sortBy?: ApiProductSortOption;
      filter?: ProductFilter;
    }
  ): Promise<Array<BestCategoryResponse & { categoryId: string }>> {
    console.log('[ProductApiClient] 다중 카테고리 검색:', {
      categoryCount: categoryIds.length,
      categoryIds: categoryIds.slice(0, 5),
      options
    });

    const searchPromises = categoryIds.map(async (categoryId) => {
      const params: CategorySearchParams = {
        categoryId,
        limit: options?.limit,
        sortBy: options?.sortBy,
        minPrice: options?.filter?.minPrice,
        maxPrice: options?.filter?.maxPrice,
        rocketShipping: options?.filter?.rocketOnly,
      };

      const result = await this.searchByCategory(params);
      return { ...result, categoryId };
    });

    return Promise.all(searchPromises);
  }

  /**
   * 상품 상세 정보 조회 (딥링크를 통한)
   */
  async getProductDetails(productUrl: string): Promise<DeeplinkConversionResponse> {
    console.log('[ProductApiClient] 상품 상세 정보 조회:', {
      productUrl: productUrl.substring(0, 100) + '...'
    });

    return this.convertDeeplinks({
      urls: [productUrl]
    });
  }

  /**
   * 상품 리스트 통계 계산
   */
  calculateProductStats(products: ProductItem[]): ProductStats {
    if (products.length === 0) {
      return {
        totalProducts: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        rocketPercentage: 0,
        freeShippingPercentage: 0,
        averageRating: 0,
        averageReviewCount: 0,
        topCategories: [],
        topBrands: []
      };
    }

    const prices = products.map(p => p.productPrice).filter(p => p > 0);
    const rocketCount = products.filter(p => p.isRocket).length;
    const freeShippingCount = products.filter(p => p.isFreeShipping).length;
    const ratingsAvailable = products.filter(p => p.rating && p.rating > 0);
    const reviewsAvailable = products.filter(p => p.reviewCount && p.reviewCount > 0);

    // 카테고리별 집계
    const categoryMap = new Map<string, { name: string; count: number }>();
    products.forEach(p => {
      const existing = categoryMap.get(p.categoryId) || { name: p.categoryName, count: 0 };
      categoryMap.set(p.categoryId, { name: existing.name, count: existing.count + 1 });
    });

    // 브랜드별 집계
    const brandMap = new Map<string, number>();
    products.forEach(p => {
      if (p.brand) {
        brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
      }
    });

    return {
      totalProducts: products.length,
      averagePrice: prices.length > 0 ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length) : 0,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      rocketPercentage: Math.round((rocketCount / products.length) * 100),
      freeShippingPercentage: Math.round((freeShippingCount / products.length) * 100),
      averageRating: ratingsAvailable.length > 0 
        ? Math.round((ratingsAvailable.reduce((sum, p) => sum + (p.rating || 0), 0) / ratingsAvailable.length) * 10) / 10
        : 0,
      averageReviewCount: reviewsAvailable.length > 0
        ? Math.round(reviewsAvailable.reduce((sum, p) => sum + (p.reviewCount || 0), 0) / reviewsAvailable.length)
        : 0,
      topCategories: Array.from(categoryMap.entries())
        .map(([categoryId, data]) => ({
          categoryId,
          categoryName: data.name,
          count: data.count,
          percentage: Math.round((data.count / products.length) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topBrands: Array.from(brandMap.entries())
        .map(([brandName, count]) => ({
          brandName,
          count,
          percentage: Math.round((count / products.length) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    };
  }

  /**
   * 상품 리스트 필터링
   */
  filterProducts(products: ProductItem[], filter: ProductFilter): ProductItem[] {
    return products.filter(product => {
      // 가격 필터
      if (filter.minPrice && product.productPrice < filter.minPrice) return false;
      if (filter.maxPrice && product.productPrice > filter.maxPrice) return false;
      
      // 로켓배송 필터
      if (filter.rocketOnly && !product.isRocket) return false;
      
      // 무료배송 필터
      if (filter.freeShippingOnly && !product.isFreeShipping) return false;
      
      // 평점 필터
      if (filter.minRating && (!product.rating || product.rating < filter.minRating)) return false;
      
      // 리뷰 수 필터
      if (filter.minReviewCount && (!product.reviewCount || product.reviewCount < filter.minReviewCount)) return false;
      
      // 카테고리 필터
      if (filter.categories && filter.categories.length > 0 && !filter.categories.includes(product.categoryId)) return false;
      
      // 브랜드 필터
      if (filter.brands && filter.brands.length > 0 && !filter.brands.includes(product.brand || '')) return false;
      
      return true;
    });
  }

  /**
   * 상품 리스트 정렬
   */
  sortProducts(products: ProductItem[], sortBy: ProductSortOption): ProductItem[] {
    const sortedProducts = [...products];
    
    switch (sortBy) {
      case 'PRICE_ASC':
        return sortedProducts.sort((a, b) => a.productPrice - b.productPrice);
      
      case 'PRICE_DESC':
        return sortedProducts.sort((a, b) => b.productPrice - a.productPrice);
      
      case 'REVIEW':
        return sortedProducts.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      
      case 'RATING':
        return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      case 'DISCOUNT':
        return sortedProducts.sort((a, b) => (b.discountRate || 0) - (a.discountRate || 0));
      
      case 'SCORE':
      case 'SALE':
      case 'NEWEST':
      default:
        // 기본 정렬 (검색 결과 순서 유지)
        return sortedProducts;
    }
  }
}