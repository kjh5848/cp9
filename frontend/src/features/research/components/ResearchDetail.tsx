'use client';

import { IntegratedProductData, CoupangProduct, ProductResult } from '../types';
import { GlassCard, FadeInSection } from '@/shared/components/advanced-ui';
import { 
  ProductImage, 
  PriceDisplay, 
  StatusBadge, 
  TabNavigation, 
  Tab 
} from '@/shared/components';
import { 
  Package, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  ExternalLink, 
  Share2
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface ResearchDetailProps {
  coupangProduct: CoupangProduct;
  researchResult?: ProductResult;
}

/**
 * 리서치 디테일 페이지 컴포넌트
 * 쿠팡 제품 데이터와 리서치 결과를 통합하여 표시
 */
export default function ResearchDetail({ 
  coupangProduct, 
  researchResult 
}: ResearchDetailProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // 통합 데이터 생성
  const integratedData: IntegratedProductData = useMemo(() => ({
    // 쿠팡 데이터 우선
    name: coupangProduct.productName,
    price: coupangProduct.productPrice,
    image: coupangProduct.productImage,
    url: coupangProduct.productUrl,
    category: coupangProduct.categoryName,
    productId: coupangProduct.productId,
    isRocket: coupangProduct.isRocket,
    isFreeShipping: coupangProduct.isFreeShipping,
    
    // 리서치 데이터 보완
    brand: researchResult?.brand,
    model: researchResult?.model_or_variant,
    specs: researchResult?.specs,
    reviews: researchResult?.reviews,
    sources: researchResult?.sources,
    capturedAt: researchResult?.captured_at,
    researchStatus: researchResult?.status
  }), [coupangProduct, researchResult]);

  // 탭 구성
  const tabs: Tab[] = [
    {
      id: 'overview',
      label: '기본 정보',
      icon: <Package className="w-4 h-4" />
    },
    {
      id: 'reviews',
      label: '리뷰 분석',
      icon: <Star className="w-4 h-4" />,
      disabled: !researchResult?.reviews || researchResult.reviews.review_count === 0
    },
    {
      id: 'specs',
      label: '상세 스펙',
      icon: <TrendingUp className="w-4 h-4" />,
      disabled: !researchResult?.specs || researchResult.specs.main.length === 0
    }
  ];

  const hasResearchData = researchResult && researchResult.status === 'success';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 제품 헤더 */}
      <FadeInSection>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20 border border-white/10">
          <div className="relative p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* 왼쪽: 제품 이미지 */}
              <div className="relative aspect-square max-w-md mx-auto">
                <ProductImage
                  src={integratedData.image}
                  alt={integratedData.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="rounded-xl"
                />
                
                {/* 배지 오버레이 */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {integratedData.isRocket && (
                    <StatusBadge type="rocket" size="md" />
                  )}
                  {integratedData.isFreeShipping && (
                    <StatusBadge type="freeShipping" size="md" />
                  )}
                </div>

                {/* 리서치 상태 배지 */}
                <div className="absolute top-4 right-4">
                  <StatusBadge 
                    type={hasResearchData ? "completed" : "custom"}
                    text={hasResearchData ? "분석 완료" : "기본 정보만"}
                    size="md" 
                  />
                </div>
              </div>

              {/* 오른쪽: 제품 정보 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                    {integratedData.category}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {integratedData.name}
                </h1>

                {integratedData.brand && (
                  <p className="text-lg text-gray-300">
                    브랜드: <span className="text-white font-medium">{integratedData.brand}</span>
                  </p>
                )}

                {integratedData.model && (
                  <p className="text-gray-400">
                    모델: {integratedData.model}
                  </p>
                )}

                <div className="py-4">
                  <PriceDisplay 
                    price={integratedData.price} 
                    size="xl" 
                    color="blue"
                  />
                </div>

                {/* 리뷰 정보 (있는 경우) */}
                {hasResearchData && integratedData.reviews && integratedData.reviews.rating_avg > 0 && (
                  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-medium">
                        {integratedData.reviews.rating_avg.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-300">
                      {integratedData.reviews.review_count}개 리뷰
                    </span>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-3 pt-4">
                  <a
                    href={integratedData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    쿠팡에서 보기
                  </a>

                  <button
                    onClick={() => navigator.share && navigator.share({
                      title: integratedData.name,
                      url: window.location.href
                    })}
                    className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="공유하기"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* 탭 네비게이션 */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="default"
        size="md"
      />

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && (
        <FadeInSection>
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">기본 정보</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* 왼쪽: 쿠팡 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">쿠팡 상품 정보</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">제품ID:</span>
                    <span className="text-white">{integratedData.productId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">카테고리:</span>
                    <span className="text-white">{integratedData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">가격:</span>
                    <PriceDisplay price={integratedData.price} color="blue" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">배송:</span>
                    <div className="flex gap-2">
                      {integratedData.isRocket && <StatusBadge type="rocket" size="sm" />}
                      {integratedData.isFreeShipping && <StatusBadge type="freeShipping" size="sm" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 리서치 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">분석 정보</h3>
                
                {hasResearchData ? (
                  <div className="space-y-3">
                    {integratedData.brand && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">브랜드:</span>
                        <span className="text-white">{integratedData.brand}</span>
                      </div>
                    )}
                    {integratedData.model && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">모델:</span>
                        <span className="text-white">{integratedData.model}</span>
                      </div>
                    )}
                    {integratedData.capturedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">분석일:</span>
                        <span className="text-white">{integratedData.capturedAt}</span>
                      </div>
                    )}
                    {integratedData.sources && integratedData.sources.length > 0 && (
                      <div>
                        <span className="text-gray-400">참고 출처:</span>
                        <div className="mt-1 space-y-1">
                          {integratedData.sources.slice(0, 3).map((source, index) => (
                            <a 
                              key={index}
                              href={source}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="block text-blue-400 text-sm hover:text-blue-300 truncate"
                            >
                              {source.length > 50 ? source.slice(0, 50) + '...' : source}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">분석 데이터 없음</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      이 제품에 대한 상세 분석 데이터가 아직 없습니다. 
                      기본적인 쿠팡 정보만 표시됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </FadeInSection>
      )}

      {activeTab === 'reviews' && hasResearchData && integratedData.reviews && (
        <FadeInSection>
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">리뷰 분석</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* 왼쪽: 평점 및 통계 */}
              <div className="space-y-6">
                <div className="text-center p-6 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                    <span className="text-4xl font-bold text-white">
                      {integratedData.reviews.rating_avg.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-gray-300">
                    {integratedData.reviews.review_count}개 리뷰 기반
                  </p>
                </div>

                {/* 장점 */}
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    주요 장점
                  </h3>
                  <div className="space-y-2">
                    {integratedData.reviews.summary_positive.map((positive, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">+</span>
                        <span className="text-gray-300">{positive}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 단점 및 인용 */}
              <div className="space-y-6">
                {/* 단점 */}
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    고려사항
                  </h3>
                  <div className="space-y-2">
                    {integratedData.reviews.summary_negative.map((negative, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">-</span>
                        <span className="text-gray-300">{negative}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 주목할 만한 리뷰 */}
                {integratedData.reviews.notable_reviews.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-3">주목할 만한 리뷰</h3>
                    <div className="space-y-3">
                      {integratedData.reviews.notable_reviews.map((review, index) => (
                        <div key={index} className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm mb-2">&ldquo;{review.quote}&rdquo;</p>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-400 text-xs">{review.source}</span>
                            {review.url && (
                              <a
                                href={review.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-xs"
                              >
                                원문 보기
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </FadeInSection>
      )}

      {activeTab === 'specs' && hasResearchData && integratedData.specs && (
        <FadeInSection>
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">상세 스펙</h2>
            
            {/* 주요 스펙 */}
            {integratedData.specs.main.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">주요 사양</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {integratedData.specs.main.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                      <span className="text-blue-400">•</span>
                      <span className="text-gray-300">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 상세 속성 */}
            {integratedData.specs.attributes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">상세 정보</h3>
                <div className="space-y-3">
                  {integratedData.specs.attributes.map((attr, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400">{attr.name}</span>
                      <span className="text-white font-medium">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 기타 정보 */}
            <div className="grid md:grid-cols-3 gap-4">
              {integratedData.specs.size_or_weight && (
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <h4 className="text-gray-400 text-sm mb-1">크기/무게</h4>
                  <p className="text-white font-medium">{integratedData.specs.size_or_weight}</p>
                </div>
              )}
              
              {integratedData.specs.options.length > 0 && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-2">옵션</h4>
                  <div className="flex flex-wrap gap-1">
                    {integratedData.specs.options.map((option, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {integratedData.specs.included_items.length > 0 && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-gray-400 text-sm mb-2">포함 구성품</h4>
                  <div className="space-y-1">
                    {integratedData.specs.included_items.map((item, index) => (
                      <div key={index} className="text-white text-sm">• {item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </FadeInSection>
      )}

      {/* 탭 데이터가 없는 경우 */}
      {((activeTab === 'reviews' && (!hasResearchData || !integratedData.reviews)) ||
        (activeTab === 'specs' && (!hasResearchData || !integratedData.specs))) && (
        <FadeInSection>
          <GlassCard className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">데이터를 준비 중입니다</h3>
            <p className="text-gray-300 mb-4">
              {activeTab === 'reviews' ? '리뷰 분석' : '상세 스펙'} 데이터가 아직 준비되지 않았습니다.
            </p>
            <p className="text-gray-400 text-sm">
              더 많은 정보는 쿠팡 상품 페이지를 확인해주세요.
            </p>
          </GlassCard>
        </FadeInSection>
      )}
    </div>
  );
}