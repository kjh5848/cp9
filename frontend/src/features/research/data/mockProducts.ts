import { ResearchProduct } from '../types';

/**
 * 3개 제품 더미 데이터 (제공받은 예시 데이터 기반)
 */
export const mockProducts: ResearchProduct[] = [
  {
    product_name: "레노버 IdeaPad Slim 1 15.6",
    brand: "Lenovo",
    category: "노트북",
    model_or_variant: "Ryzen 3 7000 / Radeon 610M",
    price_exact: 489000,
    currency: "KRW",
    price_last_verified: "2025-08-22",
    availability: "in_stock",
    seller_or_store: "쿠팡(더미)",
    deeplink_or_product_url: "",

    specs_or_features: {
      main_specs: ["AMD Ryzen 3 7000 시리즈", "Radeon 610M", "15.6\" FHD(1920×1080)"],
      attributes: [
        { name: "RAM", value: "8GB (구성에 따라 상이)" },
        { name: "Storage", value: "256GB NVMe SSD (구성에 따라 상이)" }
      ],
      size_or_weight: "약 1.6kg",
      materials: ["플라스틱"],
      color_options: ["실버"],
      included_items: ["어댑터", "설명서"]
    },

    seo: {
      focus_keyword: "레노버 ideapad slim 1 15.6",
      keyword_cluster: ["가성비 노트북", "사무용 노트북", "학생 노트북", "15.6형 노트북"],
      lsi_terms: ["Ryzen 3 7000", "Radeon 610M", "문서작업 노트북"],
      search_intent: "comparison",
      title_variants: [
        "레노버 IdeaPad Slim 1 15.6, 48만9천원 가성비 체크",
        "학생·사무용 끝판왕? Slim 1 15.6 핵심 포인트",
        "레노버 Slim 1 15.6 실사용 장단점 7가지"
      ],
      h1: "레노버 IdeaPad Slim 1 15.6: 48만9천원에 괜찮을까?",
      meta_title: "레노버 IdeaPad Slim 1 15.6 리뷰 | 48만9천원 가성비",
      meta_description: "Ryzen 3 7000과 Radeon 610M 기반, 15.6형 FHD 디스플레이를 갖춘 레노버 Slim 1. 48만9천원 기준 핵심 스펙·장단점·사용자 대상·경쟁 모델을 비교합니다.",
      slug: "lenovo-ideapad-slim1-15-489000",
      outline: {
        h2: ["핵심 스펙 요약", "실사용 체감과 한계", "추천 대상/비추천 대상", "경쟁 모델 비교", "FAQ"],
        h3_map: {
          "핵심 스펙 요약": ["CPU/GPU", "디스플레이", "메모리/저장장치"],
          "실사용 체감과 한계": ["문서·웹", "스트리밍", "라이트 편집"]
        }
      },
      hooks: ["같은 가격대에서 이만한 밸런스가 또 있을까?", "필수만 담은 실속형 15.6형"],
      cta: ["최신 가격·재고 확인", "15.6형 가성비 비교표 보기"],
      internal_link_candidates: ["가성비 노트북 TOP5", "Ryzen 7000 노트북 비교"],
      external_authorities: ["Lenovo 공식", "AMD 공식", "Notebookcheck"],
      image_alts: {
        main: "레노버 IdeaPad Slim 1 15.6 전면",
        gallery: ["좌측 포트", "키보드 레이아웃", "디스플레이 각도"]
      },
      jsonld_suggestions: { product: true, faq: true, review: false }
    },

    positioning: {
      use_cases: ["대학생 과제/온라인 강의", "재택 문서작업", "영상 스트리밍"],
      target_audience: ["가성비 중시 사용자", "입문자/세컨드 노트북"],
      unique_selling_points: ["저렴한 가격", "필수 스펙의 균형"],
      comparison_points: ["가격", "휴대성", "일상 성능"],
      competitors: ["HP 15s Ryzen3", "ASUS VivoBook 15", "삼성 갤럭시북 Go"]
    },

    reviews: {
      rating_avg: null,
      review_count: null,
      summary_positive: ["가격 대비 반응속도 준수", "타이핑 편의 무난"],
      summary_negative: ["게임·고사양 작업 한계", "메모리 확장성 제한"],
      notable_reviews: []
    },

    faqs: [
      { q: "메모리 업그레이드 가능한가요?", a: "일부 구성은 온보드로 제한적입니다.", source: "" },
      { q: "영상 편집은 가능한가요?", a: "가벼운 컷 편집 정도만 권장됩니다.", source: "" }
    ],

    sources: ["https://example.com/lenovo/spec", "https://example.com/review1", "https://example.com/retailer"],
    captured_at: "2025-08-22"
  },

  {
    product_name: "ASUS VivoBook 15 X1504",
    brand: "ASUS",
    category: "노트북",
    model_or_variant: "15.6\" FHD / Core i5 13세대(더미) / Iris Xe",
    price_exact: 599000,
    currency: "KRW",
    price_last_verified: "2025-08-22",
    availability: "in_stock",
    seller_or_store: "쿠팡(더미)",
    deeplink_or_product_url: "",

    specs_or_features: {
      main_specs: ["Intel Core i5 13세대(더미)", "Iris Xe 그래픽", "15.6\" FHD"],
      attributes: [
        { name: "RAM", value: "8GB 또는 16GB (구성별)" },
        { name: "Storage", value: "512GB NVMe (구성별)" }
      ],
      size_or_weight: "약 1.7kg",
      materials: ["플라스틱/메탈 혼합(더미)"],
      color_options: ["실버", "그레이"],
      included_items: ["어댑터", "설명서"]
    },

    seo: {
      focus_keyword: "asus vivobook 15 x1504",
      keyword_cluster: ["업무용 노트북", "인텔 i5 노트북", "15.6형 노트북"],
      lsi_terms: ["Iris Xe 성능", "VivoBook 발열/소음"],
      search_intent: "commercial",
      title_variants: [
        "ASUS VivoBook 15 X1504, 59만9천원에 업무용으로 충분?",
        "i5 13세대 기반 VivoBook 15 핵심 체크",
        "VivoBook 15 X1504 실사용 포인트와 비교"
      ],
      h1: "ASUS VivoBook 15 X1504: 59만9천원 업무·학습용 밸런스",
      meta_title: "ASUS VivoBook 15 X1504 리뷰 | i5 13세대·가성비 15.6형",
      meta_description: "i5 13세대와 FHD 15.6형 디스플레이를 갖춘 ASUS VivoBook 15 X1504. 59만9천원 기준 성능·휴대성·경쟁 모델 대비 포인트를 정리합니다.",
      slug: "asus-vivobook-15-x1504-599000",
      outline: {
        h2: ["핵심 스펙", "업무/학습 체감", "디자인/휴대성", "경쟁 모델 비교", "FAQ"],
        h3_map: {
          "업무/학습 체감": ["문서·스프레드시트", "화상회의", "가벼운 코딩"]
        }
      },
      hooks: ["업무/학습 양쪽을 잡는 15.6형", "인텔 플랫폼 선호자에게 무난한 선택"],
      cta: ["최신 가격 확인", "경쟁 모델 비교 이동"],
      internal_link_candidates: ["인텔 노트북 추천", "업무·학습 노트북 가이드"],
      external_authorities: ["ASUS 공식", "Intel 공식", "전문 리뷰 매체(더미)"],
      image_alts: {
        main: "ASUS VivoBook 15 X1504 전면",
        gallery: ["포트 구성", "키보드/넘패드", "힌지 각도"]
      },
      jsonld_suggestions: { product: true, faq: true, review: false }
    },

    positioning: {
      use_cases: ["업무, 문서/스프레드시트", "원격회의", "학습/과제"],
      target_audience: ["인텔 플랫폼 선호", "사무·학습 사용자"],
      unique_selling_points: ["무난한 성능/호환성", "가격 대비 균형"],
      comparison_points: ["CPU세대", "메모리 구성", "무게/휴대성"],
      competitors: ["Lenovo V15", "HP 15s", "Acer Aspire 5"]
    },

    reviews: {
      rating_avg: null,
      review_count: null,
      summary_positive: ["호환성 우수", "문서·화상회의 안정적"],
      summary_negative: ["게이밍 성능 제한", "발열/팬 소음 구간 존재"],
      notable_reviews: []
    },

    faqs: [
      { q: "메모리 듀얼채널 구성 가능한가요?", a: "일부 구성에서 가능(모델별 상이).", source: "" },
      { q: "PD 충전 지원하나요?", a: "구성에 따라 다를 수 있습니다.", source: "" }
    ],

    sources: ["https://example.com/asus/spec", "https://example.com/review2", "https://example.com/retailer"],
    captured_at: "2025-08-22"
  },

  {
    product_name: "HP 15s (Ryzen 5 구성)",
    brand: "HP",
    category: "노트북",
    model_or_variant: "15.6\" FHD / Ryzen 5 7000(더미) / Radeon iGPU",
    price_exact: 649000,
    currency: "KRW",
    price_last_verified: "2025-08-22",
    availability: "in_stock",
    seller_or_store: "쿠팡(더미)",
    deeplink_or_product_url: "",

    specs_or_features: {
      main_specs: ["AMD Ryzen 5 7000 시리즈(더미)", "Radeon iGPU", "15.6\" FHD"],
      attributes: [
        { name: "RAM", value: "16GB (구성에 따라 상이)" },
        { name: "Storage", value: "512GB NVMe (구성에 따라 상이)" }
      ],
      size_or_weight: "약 1.69kg",
      materials: ["플라스틱/알루미늄(더미)"],
      color_options: ["실버"],
      included_items: ["어댑터", "설명서"]
    },

    seo: {
      focus_keyword: "hp 15s ryzen 5",
      keyword_cluster: ["가성비 15.6 노트북", "라이젠5 노트북", "사무·학습 노트북"],
      lsi_terms: ["배터리 시간", "업무 성능", "발열/소음"],
      search_intent: "transactional",
      title_variants: [
        "HP 15s Ryzen 5, 64만9천원에 이 구성이면 충분?",
        "HP 15s 실사용 포인트: 성능·휴대성·가격 밸런스",
        "라이젠5 기반 HP 15s, 이 가격대 대안과 비교"
      ],
      h1: "HP 15s (Ryzen 5): 64만9천원 사무/학습용 밸런스형",
      meta_title: "HP 15s Ryzen 5 리뷰 | 64만9천원 급 균형형 15.6형",
      meta_description: "Ryzen 5 기반 15.6형 HP 15s. 64만9천원 기준 성능·휴대성·배터리와 경쟁 모델 대비 포인트를 정리하고, 추천 대상/비추천 대상을 안내합니다.",
      slug: "hp-15s-ryzen5-649000",
      outline: {
        h2: ["핵심 스펙", "업무/학습 체감", "배터리/휴대성", "경쟁 모델 비교", "FAQ"],
        h3_map: {
          "업무/학습 체감": ["멀티태스킹", "웹/오피스", "간단한 크리에이티브"]
        }
      },
      hooks: ["동가격대 균형형 대표주자", "라이젠5의 실사용 퍼포먼스"],
      cta: ["최신 가격 확인", "경쟁 모델 비교표"],
      internal_link_candidates: ["라이젠 노트북 비교", "15.6형 추천 모음"],
      external_authorities: ["HP 공식", "AMD 공식", "전문 리뷰(더미)"],
      image_alts: {
        main: "HP 15s 전면",
        gallery: ["좌우 포트", "키보드 상단", "디스플레이 힌지"]
      },
      jsonld_suggestions: { product: true, faq: true, review: false }
    },

    positioning: {
      use_cases: ["사무/학습", "원격회의", "라이트 편집"],
      target_audience: ["균형형 성능·가격 선호", "학생/직장인"],
      unique_selling_points: ["라이젠5 기반 멀티태스킹", "합리적 가격대 구성"],
      comparison_points: ["CPU 등급", "메모리/저장장치", "무게/휴대성"],
      competitors: ["Lenovo IdeaPad Slim 1(고급 구성)", "ASUS VivoBook 15", "Acer Aspire 5"]
    },

    reviews: {
      rating_avg: null,
      review_count: null,
      summary_positive: ["멀티태스킹 여유", "가성비 우수"],
      summary_negative: ["고사양 게임 한계", "패널 품질 구성별 편차"],
      notable_reviews: []
    },

    faqs: [
      { q: "램 업그레이드 가능한가요?", a: "일부 구성 듀얼채널/슬롯 제공(모델별 상이).", source: "" },
      { q: "USB-C 충전 되나요?", a: "구성별 상이하며 PD 지원 여부 확인 필요.", source: "" }
    ],

    sources: ["https://example.com/hp/spec", "https://example.com/review3", "https://example.com/retailer"],
    captured_at: "2025-08-22"
  }
];