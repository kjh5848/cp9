/**
 * AI 모델 옵션 공유 설정
 * - 키워드 글쓰기(KeywordWriting)와 아이템 생성(WriteActionModal)에서 공통으로 사용
 * - 모델 추가/변경 시 이 파일만 수정하면 양쪽 모두 반영됨
 */

export interface ModelOption {
  value: string;
  label: string;
  group: string; // 벤더 그룹 (optgroup 라벨)
}

export interface ImageModelOption {
  value: string;
  label: string;
}

/* ──────────────────────── 텍스트 모델 ──────────────────────── */

export const TEXT_MODEL_OPTIONS: ModelOption[] = [
  // OpenAI
  { value: "gpt-4o", label: "GPT-4o", group: "OpenAI" },
  { value: "gpt-4o-mini", label: "GPT-4o mini", group: "OpenAI" },
  { value: "o4-mini-2025-04-16", label: "o4-mini", group: "OpenAI" },
  { value: "gpt-5-pro-2025-10-06", label: "GPT-5 Pro", group: "OpenAI" },
  // Anthropic (Claude)
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 ⭐", group: "Anthropic (Claude)" },
  { value: "claude-opus-4-6", label: "Claude Opus 4.6", group: "Anthropic (Claude)" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", group: "Anthropic (Claude)" },
  // Google (Gemini)
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", group: "Google (Gemini)" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", group: "Google (Gemini)" },
  { value: "gemini-3-pro-preview", label: "Gemini 3 Pro Preview", group: "Google (Gemini)" },
];

/* ──────────────────────── 이미지 모델 ──────────────────────── */

export const IMAGE_MODEL_OPTIONS: ImageModelOption[] = [
  { value: "dall-e-3", label: "DALL-E 3 (OpenAI)" },
  { value: "nano-banana", label: "Nano Banana (Gemini 2.5 Flash Image) ⭐" },
  { value: "none", label: "사용 안 함" },
];

/* ──────────────────────── 기본값 ──────────────────────── */

export const DEFAULT_TEXT_MODEL = "claude-sonnet-4-6";
export const DEFAULT_IMAGE_MODEL = "dall-e-3";

/* ──────────────────────── 유틸리티 ──────────────────────── */

/** 텍스트 모델을 벤더 그룹별로 묶어 반환 */
export function getTextModelGroups(): { group: string; models: ModelOption[] }[] {
  const map = new Map<string, ModelOption[]>();
  for (const m of TEXT_MODEL_OPTIONS) {
    if (!map.has(m.group)) map.set(m.group, []);
    map.get(m.group)!.push(m);
  }
  return Array.from(map.entries()).map(([group, models]) => ({ group, models }));
}

/** 모델 value로 라벨 찾기 */
export function getModelLabel(value: string): string {
  const text = TEXT_MODEL_OPTIONS.find((m) => m.value === value);
  if (text) return text.label;
  const image = IMAGE_MODEL_OPTIONS.find((m) => m.value === value);
  if (image) return image.label;
  return value;
}
