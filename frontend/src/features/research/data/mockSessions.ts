import { ResearchSession } from '../types';
import { mockProducts } from './mockProducts';

/**
 * 5개 리서치 세션 더미 데이터
 * 1: 3개, 2: 3개, 3: 3개, 4: 3개, 5: 3개
 */
export const mockSessions: ResearchSession[] = [
  {
    id: "1",
    title: "2024 가성비 노트북 TOP3",
    description: "50만원 이하 예산으로 구매할 수 있는 최고의 가성비 노트북 3종을 비교 분석했습니다. 학생부터 직장인까지 실용적인 선택지를 제시합니다.",
    products: [
      mockProducts[0], // 레노버 IdeaPad Slim 1
      mockProducts[1], // ASUS VivoBook 15
      mockProducts[2], // HP 15s
    ],
    total_products: 3,
    created_at: "2025-08-21",
    category_focus: "노트북"
  },

  {
    id: "2", 
    title: "프리미엄 스마트폰 완벽 비교",
    description: "2024년 최고급 스마트폰들의 성능, 카메라, 배터리를 심층 분석했습니다. 아이폰과 갤럭시 플래그십 모델을 중심으로 한 완벽한 구매 가이드입니다.",
    products: [
      mockProducts[0], // 레노버 IdeaPad Slim 1
      mockProducts[1], // ASUS VivoBook 15
      mockProducts[2], // HP 15s
    ],
    total_products: 3,
    created_at: "2025-08-20",
    category_focus: "노트북"
  },

  {
    id: "3",
    title: "무선 오디오 & 웨어러블 생태계",
    description: "무선 이어폰과 스마트워치로 구성된 완벽한 웨어러블 생태계를 분석했습니다. 애플과 삼성 생태계별 최적의 조합을 제시합니다.",
    products: [
      mockProducts[0], // 레노버 IdeaPad Slim 1
      mockProducts[1], // ASUS VivoBook 15
      mockProducts[2], // HP 15s
    ],
    total_products: 3,
    created_at: "2025-08-19",
    category_focus: "노트북"
  },

  {
    id: "4",
    title: "태블릿 & 노트북 생산성 세트",
    description: "업무와 학습을 위한 최적의 태블릿과 노트북 조합을 찾았습니다. 다양한 사용 환경에 맞는 생산성 기기 세팅을 제안합니다.",
    products: [
      mockProducts[0], // 레노버 IdeaPad Slim 1
      mockProducts[1], // ASUS VivoBook 15
      mockProducts[2], // HP 15s
    ],
    total_products: 3,
    created_at: "2025-08-18",
    category_focus: "노트북"
  },

  {
    id: "5",
    title: "2024 노트북 종합 리뷰",
    description: "올해 출시된 주요 노트북 3종의 종합적인 성능 분석 리포트입니다. 가성비부터 성능까지, 구매 전 꼭 알아야 할 모든 정보를 담았습니다.",
    products: mockProducts, // 3개 제품
    total_products: 3,
    created_at: "2025-08-17",
    category_focus: "노트북"
  }
];

/**
 * 세션 ID로 리서치 세션 찾기
 */
export const getResearchSessionById = (id: string): ResearchSession | undefined => {
  return mockSessions.find(session => session.id === id);
};

/**
 * 모든 리서치 세션 반환
 */
export const getAllResearchSessions = (): ResearchSession[] => {
  return mockSessions;
};