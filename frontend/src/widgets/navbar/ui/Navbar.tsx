"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
// TODO: Auth 기능 이관 시 경로 수정 필요
// import { useAuth } from "@/features/auth/model/useAuth"; 
import { cn } from "@/shared/lib/utils";

interface NavbarProps {
  className?: string;
}

/**
 * [Widgets Layer]
 * 전역 네비게이션 바 위젯입니다. 
 * Glassmorphism 디자인이 적용되어 있으며 고정(fixed) 위치를 가집니다.
 */
export const Navbar = ({ className }: NavbarProps) => {
  // 임시Mock 유저 데이터 (테스트를 위해 활성화)
  const user = { email: "admin@cp9.com" }; 
  const signOut = () => console.log("Sign out");

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "h-16 border-b border-white/10 bg-gray-950/50 backdrop-blur-xl",
      "flex items-center justify-between px-8",
      className
    )}>
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            C
          </div>
          <span className="text-lg font-bold text-white tracking-tight">CP9</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/keyword" className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            키워드 글쓰기
          </Link>
          <Link href="/product" className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            아이템 생성
          </Link>
          <Link href="/research" className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            글 목록 관리
          </Link>
          <Link href="/schedule" className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            스케줄 관리
          </Link>
          <Link href="/design" className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            디자인 설정
          </Link>
          <Link href="/personas" className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            페르소나 뱅크
          </Link>
          <Link href="/autopilot" className="px-4 py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
            오토파일럿
          </Link>
          <Link href="/my-page" className="px-4 py-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
            마이페이지
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{(user as any).email}</span>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 border-white/10 text-white hover:bg-white/5"
              onClick={signOut}
            >
              로그아웃
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button 
              size="sm" 
              className="h-8 bg-blue-600 hover:bg-blue-500 text-white px-5"
            >
              로그인
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};
