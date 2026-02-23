import React from "react";
import { cn } from "@/shared/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Deep Tech & Dark Mode 기반의 UI 시스템 컴포넌트 (Glassmorphism 적용)
 * 배경 블러와 반투명 효과를 통해 확장 스크린에서 깊이감을 제공합니다.
 */
export const GlassCard = ({ children, className }: GlassCardProps) => {
  return (
    <div
      className={cn(
        // 배경을 반투명하게 하고, 뒷 배경을 블러 처리합니다.
        "bg-white/5 backdrop-blur-md",
        // 얇고 은은한 테두리로 유리의 외곽선을 표현합니다.
        "border border-white/10",
        // 모서리를 둥글게 처리하고 적절한 여백을 줍니다.
        "rounded-2xl p-6 shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
};
