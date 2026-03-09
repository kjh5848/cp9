"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Sparkles } from "lucide-react";

export function CtaBottomSection() {
  return (
    <section className="relative z-10 px-6 py-32 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto max-w-2xl rounded-3xl p-12 relative overflow-hidden group"
        style={{
          background: "linear-gradient(135deg, rgba(34,211,238,0.05) 0%, rgba(129,140,248,0.05) 100%)",
          border: "1px solid rgba(34,211,238,0.15)",
        }}
      >
        {/* 호버 시 따라다니는 내부 글로우 배경 효과 등은 CSS로 대체 가능, 여기선 잔잔한 애니메이션 배포 */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(34,211,238,0.08),transparent,rgba(129,140,248,0.08))] opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center mb-6 text-cyan-400 border border-cyan-400/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2
            className="text-3xl font-bold mb-4 text-slate-50 font-syne"
            style={{ letterSpacing: "-0.01em" }}
          >
            모든 파이프라인을 단 하나로
          </h2>
          <p className="mb-10 text-base leading-relaxed text-slate-400 max-w-sm font-syne">
            로그인하고 첫 번째 상품 리서치를 자동화해 보세요.
            블로그 초안 발행까지 단 몇 분이면 충분합니다.
          </p>
          <Link href="/login">
            <Button variant="tech" size="lg" className="rounded-full px-10">
              지금 바로 시작하기
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
