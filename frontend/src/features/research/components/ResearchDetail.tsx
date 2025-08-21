'use client';

import { ResearchSession, ResearchProduct } from '../types';
import Image from 'next/image';
import { GlassCard, FadeInSection, AnimatedButton } from '@/shared/components/advanced-ui';
import { 
  Calendar, 
  Package, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  ExternalLink, 
  Share2, 
  Printer,
  ChevronDown,
  ChevronRight,
  Tag,
  DollarSign,
  Award,
  Users
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface ResearchDetailProps {
  session: ResearchSession;
}

/**
 * 리서치 세션 상세 페이지 컴포넌트
 * 새로운 API 포맷 데이터를 사용하여 완전한 상세 정보 표시
 */
export default function ResearchDetail({ session }: ResearchDetailProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'faqs'>('overview');

  const toggleProductExpansion = (index: number) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedProducts(newExpanded);
  };

  const expandAllProducts = () => {
    if (expandedProducts.size === session.products.length) {
      setExpandedProducts(new Set());
    } else {
      setExpandedProducts(new Set(Array.from({ length: session.products.length }, (_, i) => i)));
    }
  };

  // 평균 가격 계산
  const averagePrice = Math.round(
    session.products.reduce((sum, product) => sum + product.price_exact, 0) / session.products.length
  );

  // 평균 평점 계산
  const averageRating = (
    session.products.reduce((sum, product) => sum + (product.reviews.rating_avg || 0), 0) / 
    session.products.length
  ).toFixed(1);

  // 모든 브랜드 추출
  const brands = Array.from(new Set(session.products.map(p => p.brand)));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 헤더 */}
      <FadeInSection>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20 border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          <div className="relative p-8 md:p-12">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-6 h-6 text-blue-400" />
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                    {session.category_focus}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {session.title}
                </h1>
                <p className="text-lg text-gray-300 mb-6 max-w-3xl">
                  {session.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(session.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{session.total_products}개 제품</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>평균 ₩{averagePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>평균 {averageRating}점</span>
                  </div>
                </div>
              </div>
              
              {/* 액션 버튼 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigator.share && navigator.share({
                    title: session.title,
                    text: session.description,
                    url: window.location.href
                  })}
                  className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="공유하기"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="인쇄하기"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 통계 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{session.total_products}</div>
                <div className="text-sm text-gray-400">분석 제품</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{brands.length}</div>
                <div className="text-sm text-gray-400">브랜드</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">₩{averagePrice.toLocaleString()}</div>
                <div className="text-sm text-gray-400">평균 가격</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{averageRating}</div>
                <div className="text-sm text-gray-400">평균 평점</div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* 탭 네비게이션 */}
      <div className="flex items-center gap-1 bg-gray-800/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          제품 개요
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'comparison'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          비교 분석
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'faqs'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          FAQ
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">제품 상세 정보</h2>
            <AnimatedButton
              variant="outline"
              size="sm"
              onClick={expandAllProducts}
            >
              {expandedProducts.size === session.products.length ? '모두 접기' : '모두 펼치기'}
            </AnimatedButton>
          </div>

          <div className="space-y-4">
            {session.products.map((product, index) => {
              const isExpanded = expandedProducts.has(index);
              
              return (
                <FadeInSection key={index} delay={index * 100}>
                  <GlassCard className="overflow-hidden">
                    {/* 제품 헤더 */}
                    <button
                      onClick={() => toggleProductExpansion(index)}
                      className="w-full p-6 flex items-center gap-4 hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>

                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {product.product_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{product.brand}</span>
                          <span>{product.category}</span>
                          <span className="text-blue-400 font-medium">
                            ₩{product.price_exact.toLocaleString()}
                          </span>
                          {product.reviews.rating_avg && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{product.reviews.rating_avg}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {product.seo.keyword_cluster.slice(0, 3).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs">
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </button>

                    {/* 확장된 내용 */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-700">
                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                          {/* 왼쪽: 기본 정보 */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                기본 정보
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">모델:</span>
                                  <span className="text-white">{product.model_or_variant}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">가격:</span>
                                  <span className="text-blue-400 font-medium">₩{product.price_exact.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">재고:</span>
                                  <span className={`${
                                    product.availability === 'in_stock' ? 'text-green-400' : 
                                    product.availability === 'out_of_stock' ? 'text-red-400' : 
                                    'text-yellow-400'
                                  }`}>
                                    {product.availability === 'in_stock' ? '재고 있음' : 
                                     product.availability === 'out_of_stock' ? '품절' : 
                                     '재고 불명'}
                                  </span>
                                </div>
                                {product.specs_or_features.size_or_weight && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">크기/무게:</span>
                                    <span className="text-white">{product.specs_or_features.size_or_weight}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-white font-semibold mb-2">주요 스펙</h4>
                              <div className="space-y-1">
                                {product.specs_or_features.main_specs.map((spec, idx) => (
                                  <div key={idx} className="flex items-start">
                                    <span className="text-blue-400 mr-2">•</span>
                                    <span className="text-gray-300 text-sm">{spec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 상세 스펙 */}
                            {product.specs_or_features.attributes.length > 0 && (
                              <div>
                                <h4 className="text-white font-semibold mb-2">상세 스펙</h4>
                                <div className="space-y-1 text-sm">
                                  {product.specs_or_features.attributes.map((attr, idx) => (
                                    <div key={idx} className="flex justify-between">
                                      <span className="text-gray-400">{attr.name}:</span>
                                      <span className="text-white">{attr.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 오른쪽: 리뷰 및 분석 */}
                          <div className="space-y-4">
                            {/* 장단점 */}
                            <div>
                              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                장단점 분석
                              </h4>
                              
                              <div className="space-y-3">
                                <div>
                                  <h5 className="text-green-400 font-medium text-sm mb-2">장점</h5>
                                  <ul className="space-y-1">
                                    {product.reviews.summary_positive.map((pro, idx) => (
                                      <li key={idx} className="text-gray-300 text-sm flex items-start">
                                        <span className="text-green-400 mr-2">+</span>
                                        {pro}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h5 className="text-yellow-400 font-medium text-sm mb-2">단점</h5>
                                  <ul className="space-y-1">
                                    {product.reviews.summary_negative.map((con, idx) => (
                                      <li key={idx} className="text-gray-300 text-sm flex items-start">
                                        <span className="text-yellow-400 mr-2">-</span>
                                        {con}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* 타겟 사용자 */}
                            <div>
                              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                추천 대상
                              </h4>
                              <div className="space-y-1">
                                {product.positioning.target_audience.map((audience, idx) => (
                                  <div key={idx} className="flex items-start">
                                    <span className="text-blue-400 mr-2">•</span>
                                    <span className="text-gray-300 text-sm">{audience}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 핵심 특징 */}
                            <div>
                              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                핵심 특징
                              </h4>
                              <div className="space-y-1">
                                {product.positioning.unique_selling_points.map((usp, idx) => (
                                  <div key={idx} className="flex items-start">
                                    <span className="text-purple-400 mr-2">★</span>
                                    <span className="text-gray-300 text-sm">{usp}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="mt-6 flex flex-wrap gap-3">
                          {product.deeplink_or_product_url && (
                            <a 
                              href={product.deeplink_or_product_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              상품 페이지 방문
                            </a>
                          )}
                          
                          {product.seo.slug && (
                            <Link 
                              href={`/research/${session.id}/${product.seo.slug}`}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <Tag className="w-4 h-4" />
                              상세 리뷰 보기
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </GlassCard>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">제품 비교 분석</h2>
          
          {/* 비교 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-800/50 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700/50">
                  <th className="text-left p-4 text-gray-300 font-medium">제품</th>
                  <th className="text-left p-4 text-gray-300 font-medium">브랜드</th>
                  <th className="text-left p-4 text-gray-300 font-medium">가격</th>
                  <th className="text-left p-4 text-gray-300 font-medium">평점</th>
                  <th className="text-left p-4 text-gray-300 font-medium">핵심 특징</th>
                </tr>
              </thead>
              <tbody>
                {session.products.map((product, index) => (
                  <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/30">
                    <td className="p-4 text-white font-medium">{product.product_name}</td>
                    <td className="p-4 text-gray-300">{product.brand}</td>
                    <td className="p-4 text-blue-400 font-medium">₩{product.price_exact.toLocaleString()}</td>
                    <td className="p-4">
                      {product.reviews.rating_avg ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-white">{product.reviews.rating_avg}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">평점 없음</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {product.positioning.unique_selling_points.slice(0, 2).map((usp, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                            {usp}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 경쟁사 분석 */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">경쟁 제품 분석</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {session.products.slice(0, 4).map((product, index) => (
                <GlassCard key={index} className="p-4">
                  <h4 className="text-white font-semibold mb-2">{product.product_name}</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">경쟁사: </span>
                      <span className="text-gray-300">
                        {product.positioning.competitors.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">비교 포인트: </span>
                      <span className="text-gray-300">
                        {product.positioning.comparison_points.join(', ')}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">자주 묻는 질문</h2>
          
          <div className="space-y-4">
            {session.products.flatMap((product, productIndex) => 
              product.faqs.map((faq, faqIndex) => (
                <GlassCard key={`${productIndex}-${faqIndex}`} className="p-6">
                  <div className="mb-2">
                    <span className="text-xs text-blue-400 bg-blue-600/20 px-2 py-1 rounded-full">
                      {product.product_name}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-3">{faq.q}</h3>
                  <p className="text-gray-300">{faq.a}</p>
                </GlassCard>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}