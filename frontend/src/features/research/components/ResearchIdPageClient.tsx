'use client';

import { useResearchSession } from '../hooks/useResearchSession';
import ResearchDetail from './ResearchDetail';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FadeInSection } from '@/shared/components/advanced-ui';
import { CoupangProduct, ProductResult } from '../types';

interface ResearchIdPageClientProps {
  sessionId: string;
}

/**
 * 리서치 상세 페이지 클라이언트 컴포넌트
 */
export default function ResearchIdPageClient({ sessionId }: ResearchIdPageClientProps) {
  const { session, loading, error, refreshSession } = useResearchSession(sessionId);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <FadeInSection>
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">리서치 결과를 불러오는 중...</h2>
            <p className="text-gray-400">잠시만 기다려주세요</p>
          </div>
        </FadeInSection>
      </div>
    );
  }

  // 에러 상태
  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <FadeInSection>
          <div className="text-center max-w-md mx-auto p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">리서치를 찾을 수 없습니다</h2>
            <p className="text-gray-400 mb-6">
              {error || '요청하신 리서치 결과를 찾을 수 없습니다. URL을 확인해주세요.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={refreshSession}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
              <Link
                href="/research"
                className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                리서치 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </FadeInSection>
      </div>
    );
  }

  // 정상 상태 - 리서치 상세 표시
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/research"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            리서치 목록으로 돌아가기
          </Link>
        </div>

        {/* 리서치 상세 컴포넌트 */}
        {session.products.length > 0 ? (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{session.title}</h1>
              <p className="text-gray-300 max-w-3xl mx-auto">{session.description}</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                  {session.category_focus}
                </span>
                <span className="text-gray-400 text-sm">
                  {session.total_products}개 제품 분석
                </span>
                <span className="text-gray-400 text-sm">
                  {session.created_at} 생성
                </span>
              </div>
            </div>
            
            {/* 제품별 상세 정보 */}
            {session.products.map((product, index) => {
              // ResearchProduct를 ResearchDetail에 필요한 형태로 변환
              const coupangProduct = {
                productName: product.product_name,
                productImage: `/api/placeholder/400/400?text=${encodeURIComponent(product.product_name)}`,
                productPrice: product.price_exact,
                productUrl: product.deeplink_or_product_url || '#',
                productId: index + 1,
                isRocket: false,
                isFreeShipping: false,
                categoryName: product.category
              };

              const researchResult = {
                product_name: product.product_name,
                brand: product.brand,
                category: product.category,
                model_or_variant: product.model_or_variant,
                price_exact: product.price_exact,
                currency: product.currency,
                seller_or_store: product.seller_or_store || '',
                deeplink_or_product_url: product.deeplink_or_product_url || '',
                coupang_price: undefined,
                specs: {
                  main: product.specs_or_features.main_specs,
                  attributes: product.specs_or_features.attributes,
                  size_or_weight: product.specs_or_features.size_or_weight,
                  options: product.specs_or_features.color_options,
                  included_items: product.specs_or_features.included_items
                },
                reviews: {
                  rating_avg: 0,
                  review_count: 0,
                  summary_positive: [],
                  summary_negative: [],
                  notable_reviews: []
                },
                sources: [],
                captured_at: session.created_at,
                status: 'success' as const
              };

              return (
                <div key={product.product_name} className="mb-12">
                  <ResearchDetail 
                    coupangProduct={coupangProduct}
                    researchResult={researchResult}
                  />
                  {index < session.products.length - 1 && (
                    <div className="border-t border-gray-700 mt-12"></div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">이 세션에는 분석된 제품이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}