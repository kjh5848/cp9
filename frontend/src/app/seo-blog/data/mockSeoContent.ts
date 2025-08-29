/**
 * 쿠팡 상품 SEO 글 더미 데이터
 */

import { SeoContentItem } from '../types'

export const mockSeoContentItems: SeoContentItem[] = [
  {
    id: '1',
    title: '2024년 최고의 무선 이어폰 추천 - 성능과 가성비를 모두 잡은 5가지 선택',
    excerpt: '다양한 무선 이어폰을 직접 테스트해본 후기와 함께, 각각의 장단점을 분석하고 용도별 최적의 제품을 추천합니다.',
    content: '',
    productInfo: {
      productId: 7891234,
      productName: '삼성 갤럭시 버즈2 프로 무선 이어폰',
      productPrice: 189000,
      productImage: '/images/products/galaxy-buds-pro.jpg',
      categoryName: '전자제품',
      discountRate: 25,
      originalPrice: 252000,
      isRocket: true
    },
    seoScore: 94,
    keywords: ['무선이어폰', '갤럭시버즈', '노이즈캔슬링', '가성비', '추천'],
    publishedAt: '2024-08-28',
    readingTime: 12,
    author: {
      name: 'Tech Reviewer',
      avatar: '/avatars/tech-reviewer.jpg'
    },
    featured: true,
    seoTitle: '2024 무선 이어폰 추천 TOP 5 | 가성비 최고 제품 비교 리뷰',
    seoDescription: '전문가가 선정한 2024년 최고의 무선 이어폰 5가지를 실제 사용 후기와 함께 상세 비교 분석했습니다.',
    viewCount: 15420,
    likeCount: 892
  },
  {
    id: '2',
    title: '홈카페 완성! 커피머신 구매 가이드와 베스트 추천 제품',
    excerpt: '집에서도 카페 수준의 커피를 즐기고 싶다면? 전자동부터 반자동까지 다양한 커피머신의 특징과 추천 제품을 소개합니다.',
    content: '',
    productInfo: {
      productId: 6781234,
      productName: '드롱기 마그니피카 전자동 커피머신',
      productPrice: 798000,
      productImage: '/images/products/delonghi-coffee.jpg',
      categoryName: '생활용품',
      discountRate: 15,
      originalPrice: 939000,
      isRocket: true
    },
    seoScore: 88,
    keywords: ['커피머신', '홈카페', '전자동', '드롱기', '에스프레소'],
    publishedAt: '2024-08-27',
    readingTime: 15,
    author: {
      name: 'Coffee Expert',
      avatar: '/avatars/coffee-expert.jpg'
    },
    featured: true,
    seoTitle: '홈카페 커피머신 추천 | 전자동 vs 반자동 완벽 비교 가이드',
    seoDescription: '집에서 카페 수준의 커피를 만들어주는 최고의 커피머신들을 가격대별로 비교 분석했습니다.',
    viewCount: 12850,
    likeCount: 647
  },
  {
    id: '3',
    title: '건강한 다이어트의 시작, 에어프라이어 추천 및 활용법',
    excerpt: '기름 없이도 바삭하고 맛있게! 다양한 에어프라이어의 성능과 특징을 비교하고, 건강한 요리 레시피도 함께 소개합니다.',
    content: '',
    productInfo: {
      productId: 5671234,
      productName: '필립스 에어프라이어 XXL 대용량',
      productPrice: 299000,
      productImage: '/images/products/philips-airfryer.jpg',
      categoryName: '생활용품',
      discountRate: 30,
      originalPrice: 427000,
      isRocket: true
    },
    seoScore: 91,
    keywords: ['에어프라이어', '건강요리', '다이어트', '필립스', '대용량'],
    publishedAt: '2024-08-26',
    readingTime: 10,
    author: {
      name: 'Health Cook',
      avatar: '/avatars/health-cook.jpg'
    },
    featured: true,
    seoTitle: '에어프라이어 추천 TOP 7 | 건강한 다이어트 요리의 완벽한 선택',
    seoDescription: '기름 없이 바삭하고 맛있는 요리가 가능한 최고의 에어프라이어들을 상세 비교했습니다.',
    viewCount: 18760,
    likeCount: 1243
  },
  {
    id: '4',
    title: '겨울철 필수템! 가습기 선택 가이드와 추천 제품',
    excerpt: '건조한 겨울철 필수품인 가습기, 초음파식부터 자연증발식까지 각 방식의 장단점과 공간별 추천 제품을 알아보세요.',
    content: '',
    productInfo: {
      productId: 4561234,
      productName: '샤오미 스마트 항균 가습기 4L',
      productPrice: 79000,
      productImage: '/images/products/xiaomi-humidifier.jpg',
      categoryName: '생활용품',
      discountRate: 20,
      originalPrice: 99000,
      isRocket: false
    },
    seoScore: 86,
    keywords: ['가습기', '겨울철', '건조', '항균', '스마트'],
    publishedAt: '2024-08-25',
    readingTime: 8,
    author: {
      name: 'Home Appliance',
      avatar: '/avatars/home-appliance.jpg'
    },
    featured: false,
    seoTitle: '가습기 추천 2024 | 겨울철 건조함 해결하는 최고의 선택',
    seoDescription: '초음파식, 자연증발식 가습기의 장단점과 공간별 최적의 가습기 추천 가이드입니다.',
    viewCount: 9430,
    likeCount: 478
  },
  {
    id: '5',
    title: '재택근무 필수템, 모니터 암 추천과 설치 가이드',
    excerpt: '효율적인 작업 환경을 위한 모니터 암 선택 기준과 인기 제품들을 비교 분석했습니다. 설치 방법과 주의사항도 함께 안내해요.',
    content: '',
    productInfo: {
      productId: 3451234,
      productName: '허먼밀러 올린 모니터 암 듀얼',
      productPrice: 189000,
      productImage: '/images/products/herman-miller-arm.jpg',
      categoryName: '생활용품',
      discountRate: 10,
      originalPrice: 210000,
      isRocket: true
    },
    seoScore: 83,
    keywords: ['모니터암', '재택근무', '듀얼모니터', '인체공학', '사무용품'],
    publishedAt: '2024-08-24',
    readingTime: 11,
    author: {
      name: 'Office Setup',
      avatar: '/avatars/office-setup.jpg'
    },
    featured: false,
    seoTitle: '모니터 암 추천 | 재택근무 효율성 UP, 목 건강까지 챙기는 선택',
    seoDescription: '다양한 모니터 암의 특징과 설치법을 상세히 설명하고, 용도별 최적 제품을 추천합니다.',
    viewCount: 7260,
    likeCount: 324
  },
  {
    id: '6',
    title: '스킨케어 루틴 완성! K-뷰티 세럼 추천과 사용법',
    excerpt: 'K-뷰티의 핵심, 세럼의 종류별 효과와 피부 타입별 추천 제품을 소개합니다. 올바른 사용 순서와 레이어링 팁까지!',
    content: '',
    productInfo: {
      productId: 2341234,
      productName: '미샤 타임 레볼루션 나이트 리페어 세럼',
      productPrice: 35000,
      productImage: '/images/products/missha-serum.jpg',
      categoryName: '뷰티',
      discountRate: 40,
      originalPrice: 58000,
      isRocket: true
    },
    seoScore: 89,
    keywords: ['세럼', 'K뷰티', '스킨케어', '안티에이징', '미백'],
    publishedAt: '2024-08-23',
    readingTime: 9,
    author: {
      name: 'Beauty Guru',
      avatar: '/avatars/beauty-guru.jpg'
    },
    featured: false,
    seoTitle: 'K-뷰티 세럼 추천 BEST 10 | 피부 타입별 완벽 가이드',
    seoDescription: '한국 화장품의 자랑 세럼! 피부 고민별 최적의 세럼과 올바른 사용법을 알려드립니다.',
    viewCount: 11540,
    likeCount: 623
  },
  {
    id: '7',
    title: '반려견을 위한 최고의 선택, 강아지 사료 추천 가이드',
    excerpt: '우리 강아지의 건강을 생각한다면? 연령대별, 견종별 맞춤 사료와 영양성분 분석을 통한 올바른 사료 선택법을 알아보세요.',
    content: '',
    productInfo: {
      productId: 1231234,
      productName: '로얄캐닌 골든리트리버 어덜트 사료 12kg',
      productPrice: 89000,
      productImage: '/images/products/royal-canin-dog.jpg',
      categoryName: '반려용품',
      discountRate: 15,
      originalPrice: 105000,
      isRocket: true
    },
    seoScore: 92,
    keywords: ['강아지사료', '반려견', '영양', '건강', '견종별'],
    publishedAt: '2024-08-22',
    readingTime: 13,
    author: {
      name: 'Pet Care Expert',
      avatar: '/avatars/pet-expert.jpg'
    },
    featured: false,
    seoTitle: '강아지 사료 추천 | 견종별 맞춤 영양으로 건강한 반려생활',
    seoDescription: '수의사가 추천하는 견종별, 연령대별 최적의 강아지 사료와 올바른 급여법을 소개합니다.',
    viewCount: 8970,
    likeCount: 445
  },
  {
    id: '8',
    title: '홈트레이닝 완벽 가이드, 운동기구 추천과 루틴',
    excerpt: '집에서도 헬스장 못지않은 운동 효과를! 공간별 운동기구 추천과 전문 트레이너가 알려주는 홈트 루틴을 소개합니다.',
    content: '',
    productInfo: {
      productId: 9871234,
      productName: '바디보스 접이식 파워랙 홈짐세트',
      productPrice: 459000,
      productImage: '/images/products/power-rack-set.jpg',
      categoryName: '스포츠',
      discountRate: 20,
      originalPrice: 574000,
      isRocket: true
    },
    seoScore: 87,
    keywords: ['홈트레이닝', '운동기구', '헬스', '파워랙', '웨이트'],
    publishedAt: '2024-08-21',
    readingTime: 14,
    author: {
      name: 'Fitness Trainer',
      avatar: '/avatars/fitness-trainer.jpg'
    },
    featured: false,
    seoTitle: '홈트레이닝 운동기구 추천 | 집에서 만드는 완벽한 홈짐',
    seoDescription: '전문 트레이너가 선택한 공간별 최적의 홈트레이닝 운동기구와 효과적인 운동 루틴을 제공합니다.',
    viewCount: 13290,
    likeCount: 567
  }
]