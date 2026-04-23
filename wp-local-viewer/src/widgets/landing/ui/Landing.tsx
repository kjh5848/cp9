"use client";

import React, { useEffect, useState } from "react";
import { HeroSection } from "./HeroSection";
import { FeatureSection } from "./FeatureSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { CtaBottomSection } from "./CtaBottomSection";

/**
 * [Home Page]
 * 서비스 랜딩 페이지 위젯 컨테이너.
 * 분할된 4개의 각 섹션 컴포넌트를 FSD 구조 상에서 조립합니다.
 */
export function Landing() {
  /* 글로벌 마우스 parallax 효과 (히어로 및 전역 배경 글로우 오브) */
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        background: "#05080f",
        color: "#e2e8f0",
      }}
    >
      {/* ── Global Styles & Fonts 로드 ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Pretendard:wght@400;500;600;700&display=swap');

        /* 그리드 배경 */
        .cp9-grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* 딥 테크 글로우 오브 */
        .cp9-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.15;
          transition: transform 0.1s ease-out;
        }
      `}</style>
      
      {/* 노이즈 (Grain) 오버레이 필터 */}
      <svg
        className="pointer-events-none fixed inset-0 z-[1] h-full w-full opacity-[0.03] mix-blend-soft-light"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* 그리드 배경 */}
      <div className="cp9-grid-bg" />

      {/* 마우스 포지션 반응형 트래킹 글로우 오브 */}
      <div
        className="cp9-orb"
        style={{
          width: 600,
          height: 600,
          background: "#22d3ee",
          top: mouse.y - 300,
          left: mouse.x - 300,
          opacity: 0.1,
        }}
      />
      <div
        className="cp9-orb"
        style={{
          width: 500,
          height: 500,
          background: "#818cf8",
          top: "60%",
          right: "-10%",
          opacity: 0.15,
        }}
      />

      {/* ═══════════════ 레이어드 섹션 조립 ═══════════════ */}
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <CtaBottomSection />

      {/* ── 푸터 ── */}
      <footer
        className="relative z-10 flex items-center justify-between px-8 py-8 text-xs bg-black/40 backdrop-blur-sm font-mono"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          color: "#475569",
        }}
      >
        <span>© 2026 CP9. AI AUTOMATION TOOL.</span>
        <span>Powered by GPT-4o · Perplexity AI · Supabase</span>
      </footer>
    </div>
  );
}
