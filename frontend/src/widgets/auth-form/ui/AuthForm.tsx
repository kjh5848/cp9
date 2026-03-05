"use client";

import React from "react";
import { GlassCard } from "@/shared/ui/GlassCard";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { LogIn } from "lucide-react";

/**
 * [Widgets Layer]
 * 로그인 기능을 담당하는 위젯입니다.
 * Deep Tech 디자인이 반영된 Glassmorphism 카드를 사용합니다.
 */
export const AuthForm = () => {
  const handleLogin = (provider: string) => {
    console.log(`${provider} 로그인 시도...`);
    // TODO: Supabase OAuth 혹은 커스텀 API 연동
  };

  return (
    <GlassCard className="p-8 w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">CP9 Login</h2>
          <p className="text-sm text-slate-400">
            실시간 AI 자동화 도구로 비즈니스를 가속화하세요.
          </p>
        </div>

        <div className="w-full space-y-3 pt-4">
          <Button 
            className="w-full h-12 bg-white text-gray-950 hover:bg-slate-200 transition-all font-bold rounded-xl flex items-center justify-center gap-3"
            onClick={() => handleLogin("google")}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Google 계정으로 로그인 (Demo)
          </Button>
          
          <Button 
            variant="outline"
            className="w-full h-12 border-white/10 text-white hover:bg-white/5 font-medium rounded-xl transition-all"
            onClick={() => handleLogin("email")}
          >
            이메일 계정으로 계속하기
          </Button>
        </div>

        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          계속 진행함으로써 CP9의 서비스 이용약관 및 <br />
          개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </GlassCard>
  );
};
