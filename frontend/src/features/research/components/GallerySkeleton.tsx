'use client';

/**
 * 갤러리뷰 로딩 중 표시할 스켈레톤 컴포넌트
 * 실제 상품 카드와 유사한 구조로 디자인
 */
export function GallerySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="group">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 animate-pulse">
            {/* 헤더 영역 */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
            </div>
            
            {/* 상품 이미지 */}
            <div className="relative mb-4">
              <div className="aspect-square bg-gray-700 rounded-lg"></div>
              <div className="absolute top-2 right-2 h-6 w-16 bg-gray-600 rounded-full"></div>
            </div>
            
            {/* 상품 정보 */}
            <div className="mb-4 space-y-2">
              <div className="h-5 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
            
            {/* 가격 정보 */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            </div>
            
            {/* 분석 요약 */}
            <div className="mb-4">
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                <div className="h-3 bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
            
            {/* 키워드 태그들 */}
            <div className="flex flex-wrap gap-1 mb-4">
              {Array.from({ length: 3 }, (_, tagIndex) => (
                <div key={tagIndex} className="h-6 bg-gray-700 rounded-full w-16"></div>
              ))}
            </div>
            
            {/* 액션 버튼 */}
            <div className="h-10 bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 단일 상품 카드 스켈레톤
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
        <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
      </div>
      
      {/* 이미지 */}
      <div className="aspect-square bg-gray-700 rounded-lg mb-4"></div>
      
      {/* 컨텐츠 */}
      <div className="space-y-3">
        <div className="h-5 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
        <div className="h-10 bg-gray-700 rounded w-full"></div>
      </div>
    </div>
  );
}

/**
 * 리스트뷰용 스켈레톤
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
          <div className="flex items-center space-x-4">
            {/* 썸네일 */}
            <div className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0"></div>
            
            {/* 컨텐츠 */}
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
            
            {/* 가격 */}
            <div className="text-right space-y-2">
              <div className="h-6 bg-gray-700 rounded w-20"></div>
              <div className="h-4 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 헤더용 스켈레톤
 */
export function HeaderSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 bg-gray-700 rounded w-1/3"></div>
        <div className="h-6 bg-gray-700 rounded w-20"></div>
      </div>
      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
    </div>
  );
}