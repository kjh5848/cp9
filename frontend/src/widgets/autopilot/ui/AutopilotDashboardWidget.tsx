'use client';

import React from 'react';
import { SharedArticleSettings } from '@/shared/ui/SharedArticleSettings';
import { SingleKeywordWizard } from '@/features/autopilot/ui/SingleKeywordWizard';
import { BulkKeywordWizard } from '@/features/autopilot/ui/BulkKeywordWizard';
import { SourcingCriteriaSection } from '@/entities/autopilot/ui/SourcingCriteriaSection';
import { ScheduleSettingsSection } from '@/entities/autopilot/ui/ScheduleSettingsSection';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/accordion';

// FSD ViewModel
import { useAutopilotDashboardViewModel } from '@/widgets/autopilot/model/useAutopilotDashboardViewModel';

export function AutopilotDashboardWidget() {
  const vm = useAutopilotDashboardViewModel();

  // Quick Preset
  const quickPresetNode = (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 hidden sm:inline-block">선택 시 설정값이 자동 입력됩니다.</span>
      <select
        className="bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2 py-1.5 outline-none border border-slate-700/50 focus:border-blue-500 transition-colors"
        value={vm.quickPreset}
        onChange={(e) => vm.handleQuickPresetChange(e.target.value)}
      >
        <option value="">간편설정 불러오기</option>
        <option value="my-settings">마이페이지 내 설정</option>
      </select>
    </div>
  );

  // 공통 설정 요소 (아코디언 형태)
  const configNodes = (
    <Accordion type="multiple" className="w-full space-y-4">
      <AccordionItem value="article-settings" className="border border-slate-800/50 bg-slate-900/40 rounded-xl px-4 overflow-hidden data-[state=open]:bg-slate-900/60 transition-colors">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            기본 글 / 모델 설정
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2 border-t border-slate-800/50">
          <SharedArticleSettings
            personas={vm.personas}
            persona={vm.personaId}
            setPersona={vm.setPersonaId}
            personaName={vm.personaName}
            setPersonaName={vm.setPersonaName}
            articleType={vm.articleType}
            setArticleType={vm.setArticleType}
            textModel={vm.textModel}
            setTextModel={vm.setTextModel}
            imageModel={vm.imageModel}
            setImageModel={vm.setImageModel}
            charLimit={vm.charLimit}
            setCharLimit={vm.setCharLimit}
            themes={vm.themes}
            themeId={vm.themeId}
            setThemeId={vm.setThemeId}
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
            sortCriteria={vm.sortCriteria}
            setSortCriteria={vm.setSortCriteria}
            minPrice={vm.minPrice}
            setMinPrice={vm.setMinPrice}
            maxPrice={vm.maxPrice}
            setMaxPrice={vm.setMaxPrice}
            isRocketOnly={vm.isRocketOnly}
            setIsRocketOnly={vm.setIsRocketOnly}
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
            intervalHours={vm.intervalHours}
            setIntervalHours={vm.setIntervalHours}
            activeTimeStart={vm.activeTimeStart}
            setActiveTimeStart={vm.setActiveTimeStart}
            activeTimeEnd={vm.activeTimeEnd}
            setActiveTimeEnd={vm.setActiveTimeEnd}
            startDate={vm.startDate}
            setStartDate={vm.setStartDate}
            expiresAt={vm.expiresAt}
            setExpiresAt={vm.setExpiresAt}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center relative z-10 px-2">
        <div>
          <h2 className="text-2xl font-bold font-syne tracking-tight text-white flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"></span>
            오토파일럿 대시보드
          </h2>
          <p className="text-sm text-slate-400 mt-2 ml-5">
            AI 리서치 기반 키워드 발굴부터 일괄 스케줄링까지 블로그 운영을 자동화합니다.
          </p>
        </div>
        <button
          onClick={vm.triggerCronManually}
          className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 hover:text-white border border-slate-700 transition-all font-syne"
        >
          임의 설정된 큐 배치 실행 시작
        </button>
      </div>

      {/* 큐 등록 폼 컨테이너 */}
      <div className="bg-slate-900/50 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.2)] border border-slate-800/50 p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-slate-800/50 mb-6 font-syne relative z-10">
          <button 
            type="button"
            onClick={() => vm.setInputMode('single')}
            className={`flex-1 py-3 text-sm font-semibold tracking-tight transition-colors border-b-2 ${vm.inputMode === 'single' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300 text-center'}`}
          >
            단일 키워드 등록
          </button>
          <button 
            type="button"
            onClick={() => vm.setInputMode('bulk')}
            className={`flex-1 py-3 text-sm font-semibold tracking-tight transition-colors border-b-2 ${vm.inputMode === 'bulk' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300 text-center'}`}
          >
            주제 기반 AI 리서치
          </button>
        </div>

        <div className="relative z-10 space-y-6">
          {vm.inputMode === 'single' ? (
            <SingleKeywordWizard 
              wizardStep={vm.wizardStep}
              setWizardStep={vm.setWizardStep}
              titleModel={vm.titleModel}
              setTitleModel={vm.setTitleModel}
              titleExamples={vm.titleExamples}
              setTitleExamples={vm.setTitleExamples}
              titleExclusions={vm.titleExclusions}
              setTitleExclusions={vm.setTitleExclusions}
              keyword={vm.keyword}
              setKeyword={vm.setKeyword}
              titleCount={vm.titleCount}
              setTitleCount={vm.setTitleCount}
              isGeneratingTitles={vm.isGeneratingTitles}
              handleGenerateTitles={vm.handleGenerateTitles}
              suggestedTitles={vm.suggestedTitles}
              setSuggestedTitles={vm.setSuggestedTitles}
              cartTitles={vm.cartTitles}
              setCartTitles={vm.setCartTitles}
              customTitleInput={vm.customTitleInput}
              setCustomTitleInput={vm.setCustomTitleInput}
              startDate={vm.startDate}
              intervalHours={vm.intervalHours}
              activeTimeStart={vm.activeTimeStart}
              activeTimeEnd={vm.activeTimeEnd}
              handleSingleSubmit={vm.handleSingleSubmit}
              isQueueLoading={vm.isQueueLoading}
              configNode={configNodes}
              quickPresetNode={quickPresetNode}
            />
          ) : (
            <>
              <BulkKeywordWizard 
                topic={vm.topic}
                setTopic={vm.setTopic}
                personaId={vm.personaId}
                handleResearch={vm.handleResearch}
                isResearching={vm.isResearching}
                researchResults={vm.researchResults}
                selectedKeywords={vm.selectedKeywords}
                toggleAllKeywords={vm.toggleAllKeywords}
                toggleKeywordSelection={vm.toggleKeywordSelection}
                handleBulkSubmit={vm.handleBulkSubmit}
                isQueueLoading={vm.isQueueLoading}
                configNode={configNodes}
                quickPresetNode={quickPresetNode}
              />
              {/* 대량 모드에서는 결과를 고른 후에 설정이 표시됨 */}
              <div className={`transition-all duration-500 pt-6 mt-6 border-t border-slate-800/50 ${
                vm.researchResults.length === 0 ? 'opacity-50 pointer-events-none hidden' : 'opacity-100 flex flex-col'
              }`}>
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-sm font-semibold text-slate-300">자동화 일괄 상세 설정 (모든 제목에 공통 적용)</h3>
                  {quickPresetNode}
                </div>
                {configNodes}
              </div>
            </>
          )}
        </div>

        {vm.queueError ? <p className="mt-4 text-sm font-medium text-red-400 relative z-10">{vm.queueError}</p> : null}
      </div>
    </div>
  );
}
