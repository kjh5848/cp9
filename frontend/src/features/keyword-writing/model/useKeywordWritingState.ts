import { useState, useMemo, useEffect } from "react";
import { DEFAULT_TEXT_MODEL, DEFAULT_IMAGE_MODEL } from "@/shared/config/model-options";
import type { WritingMode, GenerationResult } from "@/entities/keyword-writing/model/types";
import type { TitleCandidate } from "@/features/keyword-writing/api/keyword-api";
import type { CoupangProductResponse } from "@/shared/types/api";
import type { CoupangSearchMode } from "@/shared/constants/coupang-constants";
import { ARTICLE_TYPE_OPTIONS } from "@/entities/keyword-writing/model/types";
import { useUserSettingsViewModel } from "@/features/user-settings/model/useUserSettingsViewModel";

export function useKeywordWritingState() {
  const [mode, setMode] = useState<WritingMode>("keyword_first");
  const { articleSettings } = useUserSettingsViewModel();

  const [keyword, setKeyword] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedTitleIdx, setSelectedTitleIdx] = useState<number | null>(null);
  const [titles, setTitles] = useState<TitleCandidate[]>([]);
  const [persona, setPersona] = useState("IT");
  const [articleType, setArticleType] = useState("single");
  const [textModel, setTextModel] = useState(DEFAULT_TEXT_MODEL);
  const [imageModel, setImageModel] = useState(DEFAULT_IMAGE_MODEL);
  const [charLimit, setCharLimit] = useState("5000");
  const [titleModel, setTitleModel] = useState(DEFAULT_TEXT_MODEL);
  const [titleExamples, setTitleExamples] = useState("");
  const [titleExclusions, setTitleExclusions] = useState("");
  const [themeId, setThemeId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [publishTargets, setPublishTargets] = useState<any[]>([]);

  useEffect(() => {
    if (articleSettings?.defaultTitleModel) {
      setTitleModel(prev => prev === DEFAULT_TEXT_MODEL ? articleSettings.defaultTitleModel! : prev);
    }
  }, [articleSettings?.defaultTitleModel]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  const [coupangResults, setCoupangResults] = useState<CoupangProductResponse[]>([]);
  const [selectedProductMap, setSelectedProductMap] = useState<Map<number, CoupangProductResponse>>(new Map());

  const selectedProductsLength = selectedProductMap.size;
  useEffect(() => {
    const currentOption = ARTICLE_TYPE_OPTIONS.find(a => a.value === articleType);
    if (currentOption) {
      const isValid = selectedProductsLength >= currentOption.minItems && selectedProductsLength <= currentOption.maxItems;
      if (!isValid) {
        setArticleType("single");
      }
    }
  }, [selectedProductsLength, articleType]);

  const [isSearchingCoupang, setIsSearchingCoupang] = useState(false);
  const [coupangSearchTerm, setCoupangSearchTerm] = useState("");

  const [searchMode, setSearchMode] = useState<CoupangSearchMode>("keyword");
  const [categoryValue, setCategoryValue] = useState("");
  const [plBrandValue, setPlBrandValue] = useState("");
  const [linkValue, setLinkValue] = useState("");
  const [deepLinkResult, setDeepLinkResult] = useState<string | null>(null);

  const [stepA, setStepA] = useState(0);
  const [category, setCategory] = useState("all");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [suggestedKws, setSuggestedKws] = useState<any[]>([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [previouslyRecommended, setPreviouslyRecommended] = useState<string[]>([]);

  const [stepB, setStepB] = useState(0);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isExtractingKeywords, setIsExtractingKeywords] = useState(false);

  const selectedProductIds = useMemo(() => new Set(selectedProductMap.keys()), [selectedProductMap]);
  const selectedProducts = useMemo(() => Array.from(selectedProductMap.values()), [selectedProductMap]);

  return {
    mode, setMode,
    keyword, setKeyword,
    editedTitle, setEditedTitle,
    isEditingTitle, setIsEditingTitle,
    selectedTitleIdx, setSelectedTitleIdx,
    titles, setTitles,
    persona, setPersona,
    articleType, setArticleType,
    textModel, setTextModel,
    imageModel, setImageModel,
    charLimit, setCharLimit,
    titleModel, setTitleModel,
    titleExamples, setTitleExamples,
    titleExclusions, setTitleExclusions,
    themeId, setThemeId,
    publishTargets, setPublishTargets,
    isGenerating, setIsGenerating,
    generationResult, setGenerationResult,
    coupangResults, setCoupangResults,
    selectedProductMap, setSelectedProductMap,
    isSearchingCoupang, setIsSearchingCoupang,
    coupangSearchTerm, setCoupangSearchTerm,
    searchMode, setSearchMode,
    categoryValue, setCategoryValue,
    plBrandValue, setPlBrandValue,
    linkValue, setLinkValue,
    deepLinkResult, setDeepLinkResult,
    stepA, setStepA,
    category, setCategory,
    suggestedKws, setSuggestedKws,
    isLoadingKeywords, setIsLoadingKeywords,
    isLoadingTitles, setIsLoadingTitles,
    interests, setInterests,
    interestInput, setInterestInput,
    previouslyRecommended, setPreviouslyRecommended,
    stepB, setStepB,
    productSearchTerm, setProductSearchTerm,
    isExtractingKeywords, setIsExtractingKeywords,
    selectedProductIds,
    selectedProducts
  };
}
