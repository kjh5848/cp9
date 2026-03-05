/**
 * [Features/KeywordWriting] 키워드 글쓰기 기능 공개 API
 * API 클라이언트와 ViewModel을 re-export 합니다.
 */

// API 클라이언트
export {
  suggestKeywords,
  generateTitles,
  extractKeywords,
  type SuggestedKeyword,
  type TitleCandidate,
  type KeywordExtractResult,
} from "./api/keyword-api";

// ViewModel
export { useKeywordWritingViewModel } from "./model/useKeywordWritingViewModel";
