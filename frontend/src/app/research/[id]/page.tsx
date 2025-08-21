import { Metadata } from 'next';
import ResearchIdPageClient from '@/features/research/components/ResearchIdPageClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 리서치 상세 페이지 메타데이터 생성
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  // 실제로는 API 호출하여 세션 정보 가져오기
  const sessionTitles: Record<string, string> = {
    '1': '2024 가성비 노트북 TOP3',
    '2': '프리미엄 스마트폰 완벽 비교', 
    '3': '무선 오디오 & 웨어러블 생태계',
    '4': '태블릿 & 노트북 생산성 세트',
    '5': '2024 전자기기 종합 리뷰'
  };

  const sessionDescriptions: Record<string, string> = {
    '1': '50만원 이하 예산으로 구매할 수 있는 최고의 가성비 노트북 3종을 비교 분석했습니다.',
    '2': '2024년 최고급 스마트폰들의 성능, 카메라, 배터리를 심층 분석했습니다.',
    '3': '무선 이어폰과 스마트워치로 구성된 완벽한 웨어러블 생태계를 분석했습니다.',
    '4': '업무와 학습을 위한 최적의 태블릿과 노트북 조합을 찾았습니다.',
    '5': '올해 출시된 주요 전자기기들의 종합적인 성능 분석 리포트입니다.'
  };

  const title = sessionTitles[id] || '리서치 결과';
  const description = sessionDescriptions[id] || '상품 리서치 분석 결과를 확인하세요.';

  return {
    title: `${title} | CP9 리서치`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * 정적 파라미터 생성 (선택사항)
 */
export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ];
}

/**
 * 리서치 상세 페이지
 */
export default async function ResearchDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ResearchIdPageClient sessionId={id} />;
}