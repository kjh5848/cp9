'use client';

import Image from 'next/image';
import { GlassCard, FadeInSection } from '@/shared/components/advanced-ui';
import { ResearchItem } from '../../types';
import { Calendar, Clock, Tag, Star, Share2, Printer } from 'lucide-react';

interface BlogViewProps {
  data: ResearchItem[];
}

/**
 * 블로그 뷰 컴포넌트
 * 읽기 최적화된 블로그 포스트 형태로 SEO 콘텐츠를 표시
 */
export default function BlogView({ data }: BlogViewProps) {
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
    <div className="max-w-4xl mx-auto space-y-12">
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

            {/* 대표 이미지 */}
            <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
              <Image
                src={item.productImage}
                alt={item.productName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
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
  );
}