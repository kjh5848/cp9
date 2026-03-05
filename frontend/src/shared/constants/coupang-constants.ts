/**
 * [Shared/Constants] 쿠팡 관련 공유 상수
 * 카테고리, PL 브랜드 목록 등 여러 위젯에서 공통으로 사용하는 상수입니다.
 */

/** 쿠팡 상품 검색 모드 */
export type CoupangSearchMode = "keyword" | "link" | "category" | "pl_brand";

/** 카테고리 목록 */
export const COUPANG_CATEGORIES = [
  { id: "1001", name: "여성패션" },
  { id: "1002", name: "남성패션" },
  { id: "1010", name: "뷰티" },
  { id: "1011", name: "출산/유아동" },
  { id: "1012", name: "식품" },
  { id: "1013", name: "주방용품" },
  { id: "1014", name: "생활용품" },
  { id: "1015", name: "홈인테리어" },
  { id: "1016", name: "가전디지털" },
  { id: "1017", name: "스포츠/레저" },
  { id: "1018", name: "자동차용품" },
  { id: "1019", name: "도서/음반/DVD" },
  { id: "1020", name: "완구/취미" },
  { id: "1021", name: "문구/오피스" },
  { id: "1024", name: "헬스/건강식품" },
  { id: "1025", name: "국내여행" },
  { id: "1026", name: "해외여행" },
  { id: "1029", name: "반려동물용품" },
  { id: "1030", name: "유아동패션" },
] as const;

/** PL 브랜드 목록 */
export const COUPANG_PL_BRANDS = [
  { id: "1001", name: "탐사" },
  { id: "1002", name: "코멧" },
  { id: "1003", name: "Gomgom" },
  { id: "1004", name: "줌" },
  { id: "1006", name: "곰곰" },
  { id: "1007", name: "꼬리별" },
  { id: "1008", name: "베이스알파에센셜" },
  { id: "1010", name: "비타할로" },
  { id: "1011", name: "비지엔젤" },
] as const;

/** 검색 모드 라벨 */
export const SEARCH_MODE_LABELS: Record<CoupangSearchMode, string> = {
  keyword: "키워드 검색",
  link: "URL 변환",
  category: "카테고리",
  pl_brand: "PL 브랜드",
};
