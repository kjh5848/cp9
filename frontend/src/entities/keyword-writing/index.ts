/**
 * [Entities/KeywordWriting] 도메인 공개 API
 * 키워드 글쓰기 도메인의 타입, 상수, UI 컴포넌트를 re-export 합니다.
 */

// 타입 및 상수
export type { WritingMode, WritingSettings, GenerationResult } from "./model/types";
export {
  CATEGORIES,
  PERSONA_OPTIONS,
  TONE_OPTIONS,
  ARTICLE_TYPE_OPTIONS,
  CHAR_LIMIT_OPTIONS,
} from "./model/types";

// UI 컴포넌트
export { StepIndicator } from "./ui/StepIndicator";
export { ProductGrid } from "./ui/ProductGrid";
export { TitleSelector } from "./ui/TitleSelector";
export { WritingSettingsForm } from "./ui/WritingSettingsForm";
export { FinalConfirmation } from "./ui/FinalConfirmation";
