'use client';

import Image from 'next/image';
import { GlassCard, FadeInSection } from '@/shared/components/advanced-ui';
import { ResearchItem } from '../../types';
import { Calendar, Clock, Tag, Star, Share2, Printer } from 'lucide-react';

interface BlogViewProps {
  data: ResearchItem[];
  currentSessionId?: string;
}

/**
 * 블로그 뷰 컴포넌트
 * 읽기 최적화된 블로그 포스트 형태로 SEO 콘텐츠를 표시
 */
export default function BlogView({ data, currentSessionId = '1' }: BlogViewProps) {
  // 전체 아이템 수
  const totalItems = data[0]?.metadata?.totalItems || data.length;

  // 읽기 시간 계산 (대략 분당 200단어)
  const calculateReadTime = (content?: string) => {
    if (!content) return 1;
    const words = content.split(' ').length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // 공유 기능
  const handleShare = async (item: ResearchItem) => {
    if (navigator.share) {
      await navigator.share({
        title: item.seoContent?.title || item.productName,
        text: item.seoContent?.description || item.analysis.summary,
        url: window.location.href
      });
    }
  };

  // 인쇄 기능
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 메인 히어로 이미지 */}
      <div className="relative h-96 mb-12 rounded-xl overflow-hidden">
        <Image
          src={data[0]?.productImage || 'https://images.unsplash.com/photo-1583312266058-cd8b5ac6ed2c?w=800&h=400&fit=crop&auto=format'}
          alt="2024 가성비 노트북 TOP3 리서치"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            2024 가성비 노트북 TOP3 완벽 가이드
          </h1>
          <p className="text-xl text-gray-200 mb-4">
            총 <span className="text-blue-400 font-bold">{totalItems}개</span> 제품에 대한 종합 분석 및 구매 가이드
          </p>
          <div className="flex items-center gap-4 text-gray-300">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(data[0]?.createdAt || new Date()).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>약 {Math.ceil(data.length * 3)}분 읽기</span>
            </div>
          </div>
        </div>
      </div>

      {/* 리서치 개요 - 통합 헤더 */}
      <div className="mb-12 p-8 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl border border-white/10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">📊 리서치 개요</h2>
          <p className="text-gray-300 mb-4">
            50만원대 예산으로 구매할 수 있는 최고의 가성비 노트북 3종을 심층 분석했습니다.
            학생부터 직장인까지 실용적인 선택지를 제시합니다.
          </p>
        </div>

        {/* 분석 제품 목록 - 이미지 포함 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((item, index) => (
            <div key={item.id} className="bg-white/5 rounded-lg overflow-hidden border border-white/10">
              <div className="relative h-32">
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-2 left-2">
                  <span className="w-8 h-8 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-xs font-medium">{item.analysis.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm line-clamp-1 mb-2">
                  {item.productName}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{item.category}</span>
                  <span className="text-sm text-indigo-400 font-bold">
                    ₩{item.productPrice.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.analysis.keywords.slice(0, 2).map((keyword, idx) => (
                    <span key={idx} className="px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded text-xs">
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 액션 버튼 */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>약 {Math.ceil(data.length * 3)}분 읽기</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="인쇄하기"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigator.share && navigator.share({
                  title: '2024 가성비 노트북 TOP3 완벽 가이드',
                  text: `총 ${totalItems}개 제품 분석 결과`,
                  url: window.location.href
                })}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="공유하기"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 개별 제품 리뷰 */}
      <div className="space-y-12">
      {data.map((item, index) => (
        <FadeInSection key={item.id} delay={index * 200}>
          <GlassCard className="p-8 bg-gray-800/30 print:bg-white print:text-black">
            {/* 헤더 */}
            <header className="mb-8 border-b border-gray-700 pb-6">
              {/* 카테고리 및 평점 */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                  {item.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-white font-medium">{item.analysis.rating}</span>
                </div>
              </div>

              {/* 제목 */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {item.seoContent?.title || item.productName}
              </h1>

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{calculateReadTime(item.seoContent?.content)}분 읽기</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-blue-400">
                    ₩{item.productPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </header>

            {/* 제품 이미지 갤러리 */}
            <div className="mb-8">
              <div className="relative h-64 md:h-80 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={item.productImage}
                  alt={`${item.productName} 메인 이미지`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-sm rounded-full">
                    메인 제품 이미지
                  </span>
                </div>
              </div>
              
              {/* 추가 이미지들 (데모용) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="relative h-24 rounded-lg overflow-hidden">
                  <Image
                    src={item.productImage}
                    alt={`${item.productName} 측면 이미지`}
                    fill
                    className="object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    sizes="150px"
                  />
                  <div className="absolute inset-0 flex items-end p-2">
                    <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">
                      측면
                    </span>
                  </div>
                </div>
                <div className="relative h-24 rounded-lg overflow-hidden">
                  <Image
                    src={item.productImage}
                    alt={`${item.productName} 키보드 이미지`}
                    fill
                    className="object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    sizes="150px"
                  />
                  <div className="absolute inset-0 flex items-end p-2">
                    <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">
                      키보드
                    </span>
                  </div>
                </div>
                <div className="relative h-24 rounded-lg overflow-hidden">
                  <Image
                    src={item.productImage}
                    alt={`${item.productName} 포트 이미지`}
                    fill
                    className="object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    sizes="150px"
                  />
                  <div className="absolute inset-0 flex items-end p-2">
                    <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">
                      포트
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 설명 */}
            {item.seoContent?.description && (
              <div className="mb-6 p-4 bg-gray-700/30 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-300 italic">
                  {item.seoContent.description}
                </p>
              </div>
            )}

            {/* 본문 콘텐츠 */}
            <article className="prose prose-invert max-w-none mb-8">
              {item.seoContent?.content ? (
                <div 
                  className="text-gray-300 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: item.seoContent.content.replace(/\n/g, '<br/>') }}
                />
              ) : (
                <div className="text-gray-300 leading-relaxed space-y-4">
                  <h2 className="text-xl font-bold text-white mb-3">제품 분석 요약</h2>
                  <p>{item.analysis.summary}</p>
                  
                  <h3 className="text-lg font-bold text-green-400 mt-6 mb-2">장점</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {item.analysis.pros.map((pro, idx) => (
                      <li key={idx}>{pro}</li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-bold text-red-400 mt-6 mb-2">단점</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {item.analysis.cons.map((con, idx) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            {/* 태그 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(item.seoContent?.tags || item.analysis.keywords).map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            {/* 푸터 액션 */}
            <footer className="flex items-center justify-between pt-6 border-t border-gray-700 print:hidden">
              <a
                href={item.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                상품 보러가기
              </a>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare(item)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="공유하기"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="인쇄하기"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </footer>
          </GlassCard>
        </FadeInSection>
      ))}
      </div>
    </div>
  );
}