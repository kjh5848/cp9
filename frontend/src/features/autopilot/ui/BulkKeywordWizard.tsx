import React from 'react';
import { AiResearchKeyword } from '@/entities/autopilot/model/types';
import { ResearchResultTable } from '@/entities/autopilot/ui/ResearchResultTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

export interface BulkKeywordWizardProps {
  topic: string;
  setTopic: (topic: string) => void;
  bulkCount: number;
  setBulkCount: (count: number) => void;
  personaId: string;
  handleResearch: () => void;
  isResearching: boolean;
  researchResults: AiResearchKeyword[];
  selectedKeywords: Set<string>;
  toggleAllKeywords: () => void;
  toggleKeywordSelection: (kw: string) => void;
  handleBulkSubmit: (selectedItems: AiResearchKeyword[]) => void;
  isQueueLoading: boolean;
  configNode?: React.ReactNode;
  quickPresetNode?: React.ReactNode;
  publishTargetNode?: React.ReactNode;
}

export function BulkKeywordWizard({
  topic,
  setTopic,
  bulkCount,
  setBulkCount,
  personaId,
  handleResearch,
  isResearching,
  researchResults,
  selectedKeywords,
  toggleAllKeywords,
  toggleKeywordSelection,
  handleBulkSubmit,
  isQueueLoading,
  configNode,
  quickPresetNode,
  publishTargetNode
}: BulkKeywordWizardProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-4 bg-slate-950/30 p-6 rounded-xl border border-slate-800/50">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-slate-300 tracking-tight">리서치 주제어 (데이터셋)</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">발굴 개수:</span>
            <Select value={bulkCount.toString()} onValueChange={(v) => setBulkCount(Number(v))}>
              <SelectTrigger className="w-24 bg-slate-950/50 border-slate-800/50 text-slate-200 h-8 text-xs">
                <SelectValue placeholder="개수" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10개</SelectItem>
                <SelectItem value="30">30개</SelectItem>
                <SelectItem value="50">50개</SelectItem>
                <SelectItem value="100">100개</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={`[주제어 입력 예시 - 구체적인 타겟/가격대/상황을 적어주시면 AI가 더 예리하게 분석합니다]

• 30만원대 노이즈캔슬링 헤드폰 추천
• 20대 여자친구 1주년 생일선물 베스트 5
• 1인가구 원룸 가성비 소형 가습기 비교
• 신혼부부 혼수 프리미엄 로봇청소기
• 반응속도 빠른 가성비 무선 게이밍 마우스
• 아이패드 프로 M4 생산성 높여주는 꿀템 케이스
• 직장인 손목 보호 버티컬 마우스 진짜 후기
• 자취방 밤 감성 살려주는 인테리어 무드등
• 50만원 이하 대학생 가성비 인강용 노트북
• 슬개골 탈구 예방용 미끄럼방지 강아지 매트
• 초보 캠퍼를 위한 10만원대 초경량 백패킹 텐트
• 홈카페 입문용 가성비 캡슐 에스프레소 머신
• 속건조 꽉 잡아주는 겨울철 악건성 수분크림 극약처방
• 직장인 다이어트 도시락 싸기 좋은 보온 용기
• 부모님 명절 효도 선물 100만원대 안마의자 비교`}
            className="w-full p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500 transition-colors text-slate-200 placeholder:text-slate-500 outline-none shadow-inner resize-none min-h-[250px] leading-relaxed [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          />
        </div>

        {/* 사용 가이드라인 (Pro Tip) */}
        <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-200/80 space-y-2 mt-2">
          <p className="font-semibold text-indigo-300 flex items-center gap-2">
            <span>💡</span> AI 엔진 200% 활용 비법 (Pro Tip)
          </p>
          <ul className="list-disc list-inside space-y-2 ml-1">
            <li>단일 단어 하나만 입력하기보다, <strong>[타겟 + 예산 + 상황]</strong>이 결합된 구체적인 주제를 여러 개 적어주세요.</li>
            <li>예시: <code className="bg-slate-900/80 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs shadow-sm">30만원대 헤드폰, 20대 여자친구 생일선물, 신혼 가전제품</code></li>
            <li>쉼표(,)나 줄바꿈으로 다양한 카테고리를 섞어 쓰시면, AI가 스스로 개수를 나누어 골고루 최적의 트래픽 키워드를 대량 발굴해 옵니다.</li>
            <li className="text-indigo-300/90 text-[13px] bg-indigo-900/20 p-2 rounded border border-indigo-500/10 list-none -ml-1 mt-1">
              💬 <span className="italic">"요즘 공기청정기, 우리집 고양이 사료 추천, 넷플릭스 빔프로젝터 비교"</span><br/>
              👉 AI가 이 난해한 목록을 보고 <span className="font-semibold text-indigo-200">"아, 이 사람은 가전, 반려동물, 홈시네마 총 3가지 타겟군을 원하네"</span> 라고 찰떡같이 파악해서 가장 최적화된 결과물을 뽑아냅니다!
            </li>
          </ul>
        </div>
        
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleResearch}
            disabled={isResearching || !topic || !personaId}
            className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 shadow-[0_4px_15px_rgba(147,51,234,0.3)] active:scale-[0.98] transition-all min-w-[200px]"
          >
            {isResearching ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                AI 마이닝 중...
              </span>
            ) : 'AI 키워드 대량 리서치 시작'}
          </button>
        </div>
      </div>

      <ResearchResultTable 
        researchResults={researchResults}
        selectedKeywords={selectedKeywords}
        toggleAllKeywords={toggleAllKeywords}
        toggleKeywordSelection={toggleKeywordSelection}
      />

      {researchResults.length > 0 && publishTargetNode && (
        <div className="mt-8 border-t border-slate-800/50 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">다중 플랫폼 발행 설정</h3>
          {publishTargetNode}
        </div>
      )}

      {researchResults.length > 0 ? (
        <div className="flex justify-end pt-6 mt-2 border-t border-slate-800/50">
          <button
            type="button"
            onClick={() => {
              const selectedItems = researchResults.filter(r => selectedKeywords.has(r.trafficKeyword));
              handleBulkSubmit(selectedItems);
            }}
            disabled={isQueueLoading || selectedKeywords.size === 0}
            className="px-8 py-4 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 disabled:opacity-50 shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),0_4px_10px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all flex items-center justify-center min-w-[200px]"
          >
            {isQueueLoading ? '추가 중...' : `${selectedKeywords.size}개 키워드 일괄 큐에 등록`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
