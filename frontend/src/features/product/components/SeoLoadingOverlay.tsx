'use client';

/**
 * SEO 글 생성 로딩 오버레이 컴포넌트
 * AI SEO 글 생성 중에 표시되는 로딩 화면
 * 
 * @param isLoading - 로딩 상태
 * @returns JSX.Element
 * 
 * @example
 * ```tsx
 * <SeoLoadingOverlay isLoading={isSeoLoading} />
 * ```
 */
interface SeoLoadingOverlayProps {
  isLoading: boolean;
}

export default function SeoLoadingOverlay({ isLoading }: SeoLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold mb-2">AI SEO 글 생성 중...</h3>
        <p className="text-gray-600">선택된 상품을 분석하여 SEO 최적화 글을 작성하고 있습니다.</p>
      </div>
    </div>
  );
} 