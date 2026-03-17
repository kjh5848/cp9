import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Loader2, Plus, FastForward } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useUserSettingsViewModel } from '@/features/user-settings/model/useUserSettingsViewModel';
import { usePersonaViewModel } from '@/features/persona/model/usePersonaViewModel';

import { SharedArticleSettings } from '@/shared/ui/SharedArticleSettings';
import { SourcingCriteriaSection } from '@/entities/autopilot/ui/SourcingCriteriaSection';
import { ScheduleSettingsSection } from '@/entities/autopilot/ui/ScheduleSettingsSection';
import { PublishTargetSection, PublishTarget } from '@/shared/ui/PublishTargetSection';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';
import { DEFAULT_TEXT_MODEL, DEFAULT_IMAGE_MODEL } from '@/shared/config/model-options';
import { ThemeSwitcherTheme } from '@/entities/design/ui/ThemeSwitcher';

interface KeywordCartItem {
  id?: string;
  keyword: string;
  monthlySearchVol?: number | null;
  competition?: string | null;
  intent?: string | null;
  category?: string | null;
  mainKeyword?: string | null;
}

interface QuickCartScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  keywords: KeywordCartItem[];
  onSuccess: () => void;
}

export function QuickCartScheduleModal({ isOpen, onClose, keywords, onSuccess }: QuickCartScheduleModalProps) {
  const { personas, fetchPersonas } = usePersonaViewModel();
  const { themeSettings, articleSettings, profile, autopilotSettings } = useUserSettingsViewModel();

  const [isLoading, setIsLoading] = useState(false);

  // Settings State
  const [personaId, setPersonaId] = useState('');
  const [personaName, setPersonaName] = useState('');
  const [articleType, setArticleType] = useState('auto');
  const [textModel, setTextModel] = useState(DEFAULT_TEXT_MODEL);
  const [imageModel, setImageModel] = useState(DEFAULT_IMAGE_MODEL);
  const [charLimit, setCharLimit] = useState<string | number>('5000');
  
  const [themes, setThemes] = useState<ThemeSwitcherTheme[]>([]);
  const [themeId, setThemeId] = useState<string | null>(null);

  const [sortCriteria, setSortCriteria] = useState('salePriceAsc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isRocketOnly, setIsRocketOnly] = useState(false);

  const [intervalHours, setIntervalHours] = useState('24');
  const [publishTimes, setPublishTimes] = useState('');
  const [publishDays, setPublishDays] = useState('');
  const [jitterMinutes, setJitterMinutes] = useState('');
  const [dailyCap, setDailyCap] = useState('');
  const [activeTimeStart, setActiveTimeStart] = useState('0');
  const [activeTimeEnd, setActiveTimeEnd] = useState('-1');
  const [startDate, setStartDate] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const [publishTargets, setPublishTargets] = useState<PublishTarget[]>([]);

  const fetchThemesForModal = async () => {
    try {
      const res = await fetch('/api/design');
      const data = await res.json();
      const list = data.themes || [];
      setThemes(list);
      
      if (themeSettings?.themeId && list.some((t: ThemeSwitcherTheme) => t.id === themeSettings.themeId)) {
        setThemeId(themeSettings.themeId);
      } else {
        const defaultTheme = list.find((t: ThemeSwitcherTheme) => t.isDefault);
        if (defaultTheme) {
          setThemeId(defaultTheme.id);
        } else if (list.length > 0) {
          setThemeId(list[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch themes', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPersonas();
      fetchThemesForModal();

      const now = new Date();
      const tzOffset = now.getTimezoneOffset() * 60000;
      setStartDate(new Date(now.getTime() - tzOffset).toISOString().slice(0, 16));
    }
  }, [isOpen]);

  useEffect(() => {
    if (articleSettings?.defaultTextModel) setTextModel(articleSettings.defaultTextModel);
    if (articleSettings?.defaultImageModel) setImageModel(articleSettings.defaultImageModel);
    if (articleSettings?.presetWordCount) setCharLimit(articleSettings.presetWordCount);
    if (profile?.name) setPersonaName(profile.name);
    
    if (autopilotSettings) {
      if (autopilotSettings.sortCriteria) setSortCriteria(autopilotSettings.sortCriteria);
      if (autopilotSettings.isRocketOnly !== undefined) setIsRocketOnly(autopilotSettings.isRocketOnly);
      if (autopilotSettings.minPrice !== null && autopilotSettings.minPrice !== undefined) setMinPrice(String(autopilotSettings.minPrice));
      if (autopilotSettings.maxPrice !== null && autopilotSettings.maxPrice !== undefined) setMaxPrice(String(autopilotSettings.maxPrice));
      
      if (autopilotSettings.intervalHours !== null && autopilotSettings.intervalHours !== undefined) setIntervalHours(String(autopilotSettings.intervalHours));
      if (autopilotSettings.activeTimeStart !== null && autopilotSettings.activeTimeStart !== undefined) setActiveTimeStart(String(autopilotSettings.activeTimeStart));
      if (autopilotSettings.activeTimeEnd !== null && autopilotSettings.activeTimeEnd !== undefined) setActiveTimeEnd(String(autopilotSettings.activeTimeEnd));
      
      if (autopilotSettings.publishTimes) setPublishTimes(autopilotSettings.publishTimes);
      if (autopilotSettings.publishDays) setPublishDays(autopilotSettings.publishDays);
      if (autopilotSettings.jitterMinutes !== null && autopilotSettings.jitterMinutes !== undefined) setJitterMinutes(String(autopilotSettings.jitterMinutes));
      if (autopilotSettings.dailyCap !== null && autopilotSettings.dailyCap !== undefined) setDailyCap(String(autopilotSettings.dailyCap));
      
      if (autopilotSettings.publishTargets) {
        setPublishTargets(autopilotSettings.publishTargets as unknown as PublishTarget[]);
      }
    }
  }, [articleSettings, profile, autopilotSettings, isOpen]);

  useEffect(() => {
    if (personas && personas.length > 0 && !personaId) {
      setPersonaId(personas[0].id);
    }
  }, [personas, personaId]);

  const handleSubmit = async () => {
    if (!personaId || !themeId) {
      toast.error('페르소나와 테마를 모두 선택해주세요.');
      return;
    }
    if (!publishTargets || publishTargets.length === 0 || !publishTargets.some(t => t.enabled)) {
      toast.error('최소 1개 이상의 다중 플랫폼 발행을 설정해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      const items = keywords.map(kw => ({
        keyword: kw.keyword,
        trafficKeyword: kw.mainKeyword || null,
        searchIntent: kw.intent || null,
        personaId,
        themeId,
        articleType,
        textModel,
        imageModel,
        charLimit,
        sortCriteria,
        minPrice,
        maxPrice,
        isRocketOnly,
        intervalHours,
        activeTimeStart,
        activeTimeEnd,
        publishTimes,
        publishDays,
        jitterMinutes,
        dailyCap,
        publishTargets,
        startDate,
        expiresAt
      }));

      const response = await fetch('/api/autopilot/queue/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Failed to create schedules');
      }

      toast.success(`${keywords.length}개의 스케줄이 성공적으로 등록되었습니다.`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error('스케줄 등록 중 오류가 발생했습니다.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-0 border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
        <div className="flex flex-col gap-4 bg-slate-800/40 p-5 rounded-xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <FastForward className="w-5 h-5 text-emerald-400" />
              장바구니 키워드 빠른 스케줄 등록
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            선택한 {keywords.length}개의 장바구니 키워드를 오토파일럿 대기열에 일괄 등록합니다.
          </p>

          <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 text-sm text-slate-300 max-h-[100px] overflow-y-auto">
            <span className="font-semibold text-emerald-400">선택된 키워드: </span>
            {keywords.map(k => k.keyword).join(', ')}
          </div>

          <Accordion type="multiple" className="w-full space-y-4 mt-2">
            <AccordionItem value="article-settings" className="border border-slate-800/50 bg-slate-900/40 rounded-xl px-4 overflow-hidden data-[state=open]:bg-slate-900/60 transition-colors">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  기본 글 / 모델 설정
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2 border-t border-slate-800/50">
                <SharedArticleSettings
                  personas={personas}
                  persona={personaId}
                  setPersona={setPersonaId}
                  personaName={personaName}
                  setPersonaName={setPersonaName}
                  articleType={articleType}
                  setArticleType={setArticleType}
                  textModel={textModel}
                  setTextModel={setTextModel}
                  imageModel={imageModel}
                  setImageModel={setImageModel}
                  charLimit={charLimit}
                  setCharLimit={setCharLimit}
                  themes={themes}
                  themeId={themeId}
                  setThemeId={setThemeId}
                  hideArticleType={true}
                  hideTheme={false}
                  autoLoadMySettings={true}
                  hideQuickPreset={true}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sourcing-settings" className="border border-slate-800/50 bg-slate-900/40 rounded-xl px-4 overflow-hidden data-[state=open]:bg-slate-900/60 transition-colors">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  아이템 소싱 기준
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2 border-t border-slate-800/50">
                <SourcingCriteriaSection
                  sortCriteria={sortCriteria}
                  setSortCriteria={setSortCriteria}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  isRocketOnly={isRocketOnly}
                  setIsRocketOnly={setIsRocketOnly}
                  hideLoadMySettings={true}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="schedule-settings" className="border border-slate-800/50 bg-slate-900/40 rounded-xl px-4 overflow-hidden data-[state=open]:bg-slate-900/60 transition-colors">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  발행 스케줄 상세 설정
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2 border-t border-slate-800/50">
                <ScheduleSettingsSection
                  intervalHours={intervalHours}
                  setIntervalHours={setIntervalHours}
                  publishTimes={publishTimes}
                  setPublishTimes={setPublishTimes}
                  publishDays={publishDays}
                  setPublishDays={setPublishDays}
                  jitterMinutes={jitterMinutes}
                  setJitterMinutes={setJitterMinutes}
                  dailyCap={dailyCap}
                  setDailyCap={setDailyCap}
                  activeTimeStart={activeTimeStart}
                  setActiveTimeStart={setActiveTimeStart}
                  activeTimeEnd={activeTimeEnd}
                  setActiveTimeEnd={setActiveTimeEnd}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  expiresAt={expiresAt}
                  setExpiresAt={setExpiresAt}
                  hideLoadMySettings={true}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-4 border-t border-slate-800/50 pt-4">
             <h4 className="text-sm font-semibold text-slate-300 mb-3">다중 플랫폼 발행 설정</h4>
             <PublishTargetSection
                targets={publishTargets}
                onChange={setPublishTargets}
                hideLoadMySettings={true}
              />
          </div>

          <div className="flex justify-end pt-4 mt-2 border-t border-slate-700/50 gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || keywords.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-emerald-500 hover:to-teal-500 focus:ring-4 focus:ring-emerald-500/30 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {keywords.length}개 스케줄 일괄 등록
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
