"use client";

import React from "react";
import { LoginCard } from "@/widgets/auth-form/ui/LoginCard";

/**
 * [Login Page]
 * 로그인 위젯을 배치하는 페이지입니다.
 * 전체 배경은 Deep Tech 메인 테마를 따릅니다.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* 배경 장식 노드 */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />
      
      <div className="relative z-10 w-full px-4">
        <LoginCard />
      </div>

      <div className="absolute bottom-8 text-[10px] text-slate-600 font-medium tracking-widest uppercase">
        © 2026 CP9 Advanced Agentic Platform
      </div>
    </div>
  );
}