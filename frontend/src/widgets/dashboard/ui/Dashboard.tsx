"use client";

import React, { useState } from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { SearchBar } from "@/features/search-product/ui/SearchBar";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { ResearchCard } from "@/entities/research/ui/ResearchCard";
import { ResearchEditForm } from "@/features/research-analysis/ui/ResearchEditForm";
import { WorkflowProgressBar } from "@/features/workflow-progress/ui/WorkflowProgressBar";
import { ResearchItem, ResearchPack } from "@/entities/research/model/types";
import { useWorkflowViewModel } from "@/features/workflow-progress/model/useWorkflowViewModel";
import { Button } from "@/shared/ui/button";
import { Play } from "lucide-react";

// Mock Data
const dummyProduct = {
  productId: 1,
  productName: "초고속 무선 충전기 15W 거치형 스탠드",
  productPrice: 24500,
  productImage: "",
  productUrl: "#",
  categoryName: "가전/디지털",
  isRocket: true,
  isFreeShipping: true,
  brandName: "슈피겐",
};

const dummyResearch: ResearchItem = {
  projectId: "p1",
  itemId: "i123",
  updatedAt: new Date().toISOString(),
  pack: {
    itemId: "i123",
    title: "슈피겐 초고속 무선 충전기 15W 분석 리포트",
    priceKRW: 24500,
    isRocket: true,
    features: ["QI 인증", "안전 보호 칩셋", "LED 상태 표시"],
    pros: ["발열 제어 우수", "깔끔한 디자인"],
    cons: ["어댑터 미포함"],
    keywords: ["무선충전기", "슈피겐", "고속충전"],
  },
};

/**
 * [Widgets Layer]
 * 핵심 비지니스 도메인(상품, 리서치, 워크플로우)을 통합하여 보여주는 메인 대시보드 위젯입니다.
 */
export const Dashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [research, setResearch] = useState<ResearchItem>(dummyResearch);
  
  const { state: workflowState, startWorkflow } = useWorkflowViewModel({
    enabled: true,
    pollingInterval: 1000
  });

  const handleUpdateResearch = (newPack: ResearchPack) => {
    setResearch((prev) => ({
      ...prev,
      pack: newPack,
      updatedAt: new Date().toISOString(),
    }));
    setIsEditing(false);
  };

  const handleStartWorkflow = () => {
    startWorkflow("/api/workflow/start-demo", { projectId: "p1" });
  };

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-5xl mx-auto py-12 px-4 md:px-8">
      {/* 검색 및 헤더 영역 */}
      <div className="w-full flex flex-col items-center">
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Main Dashboard</h2>
        <p className="text-slate-400 mb-8 border-b border-white/10 pb-4 w-full text-center">
          모든 도메인 통합 관리 및 엔진 컨트롤
        </p>
        <SearchBar className="w-full shadow-blue-900/20 shadow-2xl" />
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 상품 영역 */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Product Data
          </h3>
          <ProductCard product={dummyProduct} />
          <ProductCard 
            product={{
              ...dummyProduct,
              productId: 2,
              productName: "ANC 5.3 노이즈 캔슬링 헤드폰",
              productPrice: 154000,
              isRocket: false,
              brandName: "소니"
            }} 
          />
        </div>

        {/* 리서치 및 워크플로우 영역 */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Analysis & Engine
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            {isEditing ? (
              <ResearchEditForm 
                initialPack={research.pack}
                onSave={handleUpdateResearch}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <ResearchCard 
                  research={research}
                  onEditClick={() => setIsEditing(true)}
                  hasDraft={true}
                />
                <div className="flex flex-col gap-6">
                  <WorkflowProgressBar state={workflowState} />
                  
                  <GlassCard className="p-5 flex flex-col gap-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Engine Control</h4>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      disabled={workflowState.status === "running"}
                      onClick={handleStartWorkflow}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run SEO Workflow
                    </Button>
                    <p className="text-[10px] text-slate-500 text-center italic">
                      Powered by AI Content Engine v1.0
                    </p>
                  </GlassCard>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
