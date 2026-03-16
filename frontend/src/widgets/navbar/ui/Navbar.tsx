"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
// TODO: Auth 기능 이관 시 경로 수정 필요
// import { useAuth } from "@/features/auth/model/useAuth"; 
import { cn } from "@/shared/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useKeywordLabStore } from "@/entities/keyword-extraction/model/useKeywordLabStore";
import { CartViewerModal } from "@/features/keyword-extraction/ui/CartViewerModal";

interface NavbarProps {
  className?: string;
}

import { useSession, signOut } from "next-auth/react";

/**
 * [Widgets Layer]
 * 전역 네비게이션 바 위젯입니다. 
 * Glassmorphism 디자인이 적용되어 있으며 고정(fixed) 위치를 가집니다.
 */
export const Navbar = ({ className }: NavbarProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const { cartKeywords, isCartModalOpen, setIsCartModalOpen, fetchCartFromServer } = useKeywordLabStore();

  // Next.js Hydration Mismatch 방지 및 서버 연동
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    if (user) {
      fetchCartFromServer();
    }
  }, [user, fetchCartFromServer]);

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
          <Link href="/keyword-lab" className="px-4 py-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
            발굴소(Lab)
          </Link>
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
        {mounted && (
          <button
            onClick={() => setIsCartModalOpen(true)}
            className="relative p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartKeywords.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                {cartKeywords.length}
              </span>
            )}
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-3">
            {(user as any).role === "ADMIN" && (
              <Link href="/admin">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 font-bold tracking-wide"
                >
                  어드민
                </Button>
              </Link>
            )}
            <span className="text-xs text-slate-400">{user.email}</span>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 border-white/10 text-white hover:bg-white/5"
              onClick={() => {
                localStorage.removeItem('keyword-cart-storage');
                signOut({ callbackUrl: "/login" });
              }}
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

      <CartViewerModal 
        isOpen={isCartModalOpen}
        onOpenChange={setIsCartModalOpen}
      />
    </header>
  );
};
