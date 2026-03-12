"use client";

import React from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { X, Settings, Clock, Tag, ShoppingCart, UserCircle, AlignLeft, Bot, Rocket, Database } from "lucide-react";

interface AutopilotConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any; // AutopilotQueue item
}

export const AutopilotConfigModal: React.FC<AutopilotConfigModalProps> = ({ isOpen, onClose, config }) => {
  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-lg p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-foreground">오토파일럿 설정</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-foreground px-1">{config.keyword}</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 font-medium">대기중</span>
              {config.isAutopilot && <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20 font-medium">자동화 엔진</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* AI 리서치 메타데이터 (있을 경우만 표시) */}
            {(config.trafficKeyword || config.coupangSearchTerm || config.searchIntent) && (
              <div className="col-span-2 flex flex-col gap-3 p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>AI 리서치 메타데이터 (Metadata)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {config.trafficKeyword && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">SEO 트래픽 타겟 키워드</span>
                      <span className="font-semibold text-indigo-100">{config.trafficKeyword}</span>
                    </div>
                  )}
                  {config.coupangSearchTerm && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">쿠팡 소싱용 상품명</span>
                      <span className="font-semibold text-indigo-100">{config.coupangSearchTerm}</span>
                    </div>
                  )}
                  {config.searchIntent && (
                    <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                      <span className="text-muted-foreground">유저 검색 의도 (Intent)</span>
                      <span className="font-medium text-indigo-200/80 leading-relaxed">{config.searchIntent}</span>
                    </div>
                  )}
                  {config.recommendedItemCount && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">추천 상품 개수</span>
                      <span className="font-semibold text-indigo-100">{config.recommendedItemCount}개 세팅</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* 소싱 기준 */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/50 border border-border">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>선별 기준 (Sourcing)</span>
              </div>
              <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                <li className="flex items-center justify-between">
                  <span>정렬</span>
                  <span className="text-foreground">
                    {config.sortCriteria === 'salePriceAsc' ? '가격낮은순 (가성비)' : 
                     config.sortCriteria === 'salePriceDesc' ? '가격높은순 (프리미엄)' : 
                     config.sortCriteria === 'RANK' ? '쿠팡 랭킹/인기순' : '쿠팡 랭킹/인기순'}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>최소 가격</span>
                  <span className="text-foreground">{config.minPrice ? `${config.minPrice.toLocaleString()}원 이상` : '제한 없음'}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>최대 가격</span>
                  <span className="text-foreground">{config.maxPrice ? `${config.maxPrice.toLocaleString()}원 이하` : '제한 없음'}</span>
                </li>
                {config.isRocketOnly && (
                  <li className="flex items-center gap-1 mt-1 font-medium text-blue-400">
                    <Rocket className="w-3 h-3" /> 로켓 배송 상품만
                  </li>
                )}
              </ul>
            </div>

            {/* 작성 기준 */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/50 border border-border">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <AlignLeft className="w-4 h-4 text-orange-400" />
                <span>작성 기준 (Writing)</span>
              </div>
              <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                <li className="flex items-center justify-between">
                  <span>글 유형</span>
                  <span className="text-foreground">
                    {config.articleType === 'single' ? '단일 상품 리뷰' :
                     config.articleType === 'compare' ? '딥다이브 비교 (3개)' :
                     config.articleType === 'list' ? '상위 추천 리스트 (5개)' :
                     'AI 자동 결정 (Auto)'}
                  </span>
                </li>
                <li className="flex flex-col gap-1">
                  <span>페르소나</span>
                  <span className="text-foreground px-2 py-1 bg-muted rounded-md w-fit">
                    {config.persona?.name || 'IT 전문가'}
                  </span>
                </li>
              </ul>
            </div>

            {/* 모델 설정 */}
            <div className="col-span-2 flex flex-col gap-3 p-4 rounded-xl bg-slate-900/50 border border-border">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>적용 AI 모델</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">텍스트 생성</span>
                  <span className="font-semibold text-foreground uppercase">{config.textModel}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">이미지 생성</span>
                  <span className="font-semibold text-foreground uppercase">{config.imageModel}</span>
                </div>
              </div>
            </div>

            {/* 스케줄러 정보 */}
            <div className="col-span-2 flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-border mt-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-muted-foreground">예정된 실행 시간</span>
              </div>
              <div className="text-sm font-semibold text-foreground bg-amber-500/10 text-amber-400 px-3 py-1 rounded-lg border border-amber-500/20">
                {new Date(config.nextRunAt || config.createdAt).toLocaleString('ko-KR', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
            {config.intervalHours && config.intervalHours > 0 && (
              <div className="col-span-2 flex items-center justify-between px-4 pb-2 text-xs text-muted-foreground -mt-3">
                <span>반복 주기</span>
                <span>{config.intervalHours}시간 간격으로 처리</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card/50 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="px-6 h-9">
            닫기
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
