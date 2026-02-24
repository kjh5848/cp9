"use client";

import React, { useState } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { Calendar as CalendarIcon, Clock, PenTool, CheckCircle2 } from "lucide-react";
import { DraftDetailModal } from "@/features/research-analysis/ui/DraftDetailModal";

/**
 * [Widgets Layer]
 * 스케줄링 목록(예약된 포스팅, 완료된 포스팅 등)을 글로벌로 관리하고 확인하는 보드입니다.
 */
export const ScheduleBoard = () => {
  // TODO: 이후 스케줄 DB/API 연동
  const scheduledItems = [
    { id: "1", title: "삼성전자 건조기 BESPOKE 그랑데 AI", persona: "LIVING", date: "2024-05-10T14:00:00Z", status: "PENDING" },
    { id: "2", title: "Apple 2023 맥북 프로 14 M3", persona: "IT", date: "2024-05-11T09:30:00Z", status: "PENDING" },
  ];

  const completedItems = [
    { id: "3", title: "나이키 에어 포스 1 '07", persona: "BEAUTY", date: "2024-05-01T10:00:00Z", status: "COMPLETED" },
    { id: "4", title: "LG전자 스탠바이미 Go", persona: "IT", date: "2024-04-28T16:00:00Z", status: "COMPLETED" },
  ];

  const [previewItem, setPreviewItem] = useState<{ isOpen: boolean; title: string; markdown: string }>({
    isOpen: false,
    title: "",
    markdown: "",
  });

  const generateMockMarkdown = (title: string, persona: string) => {
    return `
# ${title} 완전 해부 리뷰

최근 많은 분들이 관심을 가지고 계신 **${title}** 제품을 직접 분석해보았습니다.
과연 소문만큼 좋은지, 가성비 측면에서는 어떤지 꼼꼼하게 따져볼게요.

> **💡 핵심 요약**
> * 가심비와 스펙을 모두 잡은 모델
> * 특히 디자인 적인 측면에서 훌륭함

## 1. 디자인 및 첫인상

우선 외관부터 살펴볼까요? 
마감 처리가 매우 깔끔하고, 어디에 두어도 인테리어를 해치지 않는 모던한 느낌을 줍니다.
특히 다음 세 가지 요소가 맘에 들었어요:
- **매트한 질감**의 고급스러움
- **직관적인 조작부** (누구나 쉽게 접근 가능)
- 컴팩트한 사이즈로 뛰어난 공간 활용도

## 2. 장단점 비교

어떤 제품이든 완벽할 수는 없겠죠? 객관적인 시선에서 바라본 장단점입니다.

### 장점 (Pros)
1. **압도적인 성능**: 동급 대비 처리 속도가 빠릅니다.
2. **연결성**: 다양한 스마트 기기와의 매끄러운 연동이 돋보입니다.

### 단점 (Cons)
1. **가격 장벽**: 초기 진입 비용이 다소 부담스러울 수 있습니다.
2. **무게**: 예상보다 약간 묵직한 편입니다.

---

## 3. 총평

결론적으로, ${title}은(는) **충분히 투자할 가치가 있는 제품**입니다. 
당장의 예산이 허락한다면, 삶의 질을 확 올려줄 최고의 선택이 될 수 있을 거라고 생각합니다.  
*(해당 리뷰는 ${persona} 페르소나 스타일을 예시로 적용한 것입니다.)*
    `;
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'PENDING') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">대기중</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">발행완료</span>;
  };

  const renderPersonaBadge = (persona: string) => {
    const map: Record<string, string> = {
      "IT": "💻 IT전문가",
      "LIVING": "🏠 살림고수",
      "BEAUTY": "✨ 뷰티쇼퍼",
      "HUNTER": "🔥 가성비헌터"
    };
    return (
      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
        {map[persona] || persona}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto py-8 px-4 md:px-8">
      {/* 헤더 영역 */}
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-500" />
          발행 스케줄 관리
        </h2>
        <p className="text-muted-foreground">
          예약된 SEO 포스트 발행 일정을 한눈에 확인하고 관리합니다.
        </p>
      </div>

      {/* 보드 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 대기중 (예약) 목록 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              발행 대기중
            </h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {scheduledItems.length}
            </span>
          </div>
          
          <div className="flex flex-col gap-4">
            {scheduledItems.map(item => (
              <GlassCard key={item.id} className="p-4 border-border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-foreground line-clamp-1 flex-1 pr-4">{item.title}</h4>
                    {renderStatusBadge(item.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    {renderPersonaBadge(item.persona)}
                    <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {new Date(item.date).toLocaleString('ko-KR', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-border text-muted-foreground hover:bg-muted">수정</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-destructive/20 text-destructive hover:bg-destructive/10">취소</Button>
                </div>
              </GlassCard>
            ))}
            {scheduledItems.length === 0 && (
              <div className="py-10 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border">
                예정된 스케줄이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 완료 목록 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              발행 완료
            </h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {completedItems.length}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {completedItems.map(item => (
              <GlassCard key={item.id} className="p-4 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-foreground opacity-90 line-clamp-1 flex-1 pr-4">{item.title}</h4>
                    {renderStatusBadge(item.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    {renderPersonaBadge(item.persona)}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {new Date(item.date).toLocaleString('ko-KR', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4 pt-3 border-t border-emerald-500/10">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                    onClick={() => {
                      setPreviewItem({
                        isOpen: true,
                        title: item.title,
                        markdown: generateMockMarkdown(item.title, item.persona)
                      });
                    }}
                  >
                    <PenTool className="w-3 h-3 mr-1" />
                    결과 보기
                  </Button>
                </div>
              </GlassCard>
            ))}
            {completedItems.length === 0 && (
              <div className="py-10 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border">
                발행 완료된 스케줄이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <DraftDetailModal
        isOpen={previewItem.isOpen}
        onClose={() => setPreviewItem((prev: typeof previewItem) => ({ ...prev, isOpen: false }))}
        title={previewItem.title}
        markdown={previewItem.markdown}
      />
    </div>
  );
};
