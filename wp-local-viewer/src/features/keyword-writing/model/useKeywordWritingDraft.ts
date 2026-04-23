import { useEffect, useState } from "react";
import { useWriteDraftStore } from "@/entities/keyword-writing/model/useWriteDraftStore";
import type { CoupangProductResponse } from "@/shared/types/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StateReturn = any; // Will be properly typed when imported into ViewModel

export function useKeywordWritingDraft(state: StateReturn) {
  const [isDraftRestored, setIsDraftRestored] = useState(false);

  const draftMode = useWriteDraftStore(s => s.mode);
  const draftStepA = useWriteDraftStore(s => s.stepA);
  const draftStepB = useWriteDraftStore(s => s.stepB);
  const draftKeyword = useWriteDraftStore(s => s.keyword);
  const draftEditedTitle = useWriteDraftStore(s => s.editedTitle);
  const draftTitles = useWriteDraftStore(s => s.titles);
  const draftSelectedTitleIdx = useWriteDraftStore(s => s.selectedTitleIdx);
  const draftCartItems = useWriteDraftStore(s => s.cartItems);
  const draftSettings = useWriteDraftStore(s => s.settings);

  const setDraftMode = useWriteDraftStore(s => s.setMode);
  const setDraftStepA = useWriteDraftStore(s => s.setStepA);
  const setDraftStepB = useWriteDraftStore(s => s.setStepB);
  const setDraftKeyword = useWriteDraftStore(s => s.setKeyword);
  const setDraftEditedTitle = useWriteDraftStore(s => s.setEditedTitle);
  const setDraftTitles = useWriteDraftStore(s => s.setTitles);
  const setDraftSelectedTitleIdx = useWriteDraftStore(s => s.setSelectedTitleIdx);
  const setDraftCartItems = useWriteDraftStore(s => s.setCartItems);
  const updateDraftSettings = useWriteDraftStore(s => s.updateSettings);

  useEffect(() => {
    if (!isDraftRestored) {
      if (draftMode) state.setMode(draftMode);
      if (draftStepA !== undefined) state.setStepA(draftStepA);
      if (draftStepB !== undefined) state.setStepB(draftStepB);
      if (draftKeyword) state.setKeyword(draftKeyword);
      if (draftEditedTitle) state.setEditedTitle(draftEditedTitle);
      if (draftTitles && draftTitles.length > 0) state.setTitles(draftTitles);
      if (draftSelectedTitleIdx !== null && draftSelectedTitleIdx !== undefined) state.setSelectedTitleIdx(draftSelectedTitleIdx);
      
      const restoredMap = new Map<number, CoupangProductResponse>();
      if (draftCartItems && Object.keys(draftCartItems).length > 0) {
        Object.values(draftCartItems).forEach(item => restoredMap.set(item.productId, item));
      }
      state.setSelectedProductMap(restoredMap);

      if (draftSettings) {
        state.setPersona(draftSettings.persona);
        state.setArticleType(draftSettings.articleType);
        state.setTextModel(draftSettings.textModel);
        state.setImageModel(draftSettings.imageModel);
        state.setCharLimit(draftSettings.charLimit);
      }
      setIsDraftRestored(true);
    }
  }, [
    draftMode, draftStepA, draftStepB, draftKeyword, draftEditedTitle, draftTitles, 
    draftSelectedTitleIdx, draftCartItems, draftSettings, isDraftRestored, state
  ]);

  useEffect(() => {
    if (isDraftRestored) {
      setDraftMode(state.mode);
      setDraftStepA(state.stepA);
      setDraftStepB(state.stepB);
      setDraftKeyword(state.keyword);
      setDraftEditedTitle(state.editedTitle);
      setDraftTitles(state.titles);
      setDraftSelectedTitleIdx(state.selectedTitleIdx);
      
      const newCartItems: Record<number, CoupangProductResponse> = {};
      state.selectedProductMap.forEach((val: CoupangProductResponse, key: number) => { newCartItems[key] = val; });
      setDraftCartItems(newCartItems);

      updateDraftSettings({
        persona: state.persona, 
        articleType: state.articleType, 
        textModel: state.textModel, 
        imageModel: state.imageModel, 
        charLimit: state.charLimit
      });
    }
  }, [
    state.mode, state.stepA, state.stepB, state.keyword, state.editedTitle, state.titles, 
    state.selectedTitleIdx, state.selectedProductMap, state.persona, state.articleType, 
    state.textModel, state.imageModel, state.charLimit, isDraftRestored, 
    setDraftMode, setDraftStepA, setDraftStepB, setDraftKeyword, setDraftEditedTitle, 
    setDraftTitles, setDraftSelectedTitleIdx, setDraftCartItems, updateDraftSettings
  ]);

  return { isDraftRestored };
}
