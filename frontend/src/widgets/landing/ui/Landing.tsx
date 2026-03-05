"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ──────────────────────────────────────────────
   CP9 랜딩 페이지 위젯
   디자인 컨셉: 산업적·기술적 다크 테마 (딥 네이비 + 시안 액센트)
   - 고정 그리드 배경
   - 히어로 섹션: 타이핑 애니메이션 헤드라인
   - Feature 카드 3개 (glow 테두리)
   - How it works 스텝 플로우
   - CTA 섹션
────────────────────────────────────────────── */

/** 타이핑 텍스트 훅 */
function useTyping(words: string[], speed = 80, pause = 1800) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          setText(current.slice(0, charIdx + 1));
          if (charIdx + 1 === current.length) {
            setTimeout(() => setDeleting(true), pause);
          } else {
            setCharIdx((c) => c + 1);
          }
        } else {
          setText(current.slice(0, charIdx - 1));
          if (charIdx - 1 === 0) {
            setDeleting(false);
            setWordIdx((w) => (w + 1) % words.length);
            setCharIdx(0);
          } else {
            setCharIdx((c) => c - 1);
          }
        }
      },
      deleting ? speed / 2 : speed
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charIdx, deleting, wordIdx]);

  return text;
}

/* ── 아이콘 컴포넌트 (SVG 인라인) ── */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" strokeLinecap="round" />
  </svg>
);
const IconBrain = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
    <path d="M9.5 2a2.5 2.5 0 0 1 5 0v.5A2.5 2.5 0 0 1 17 5v.5a2.5 2.5 0 0 1 2 2.45V12a5 5 0 0 1-10 0V7.95A2.5 2.5 0 0 1 11 5.5V5A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M9 13H7a2 2 0 0 0 0 4h2M15 13h2a2 2 0 0 1 0 4h-2" />
    <path d="M12 19v3" strokeLinecap="round" />
  </svg>
);
const IconPen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
    <path d="M12 20h9" strokeLinecap="round" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Feature 카드 데이터 ── */
const FEATURES = [
  {
    icon: <IconSearch />,
    title: "상품 리서치 자동화",
    desc: "쿠팡 API + Perplexity AI로 키워드·카테고리·URL 기반 상품 데이터를 실시간 수집하고 ResearchPack으로 정제합니다.",
    accent: "#22d3ee",
  },
  {
    icon: <IconBrain />,
    title: "AI 시장 분석",
    desc: "최신 시장 트렌드·경쟁사·소비자 리뷰를 GPT가 분석해 장단점·포지셔닝·가격 인사이트를 제공합니다.",
    accent: "#818cf8",
  },
  {
    icon: <IconPen />,
    title: "SEO 콘텐츠 자동 생성",
    desc: "ResearchPack → GPT 기반 SEO 최적화 블로그 초안 자동 생성 후 워드프레스에 원클릭 발행합니다.",
    accent: "#34d399",
  },
];

/* ── How it works 스텝 ── */
const STEPS = [
  { no: "01", label: "상품 검색", sub: "키워드 / 카테고리 / URL" },
  { no: "02", label: "AI 리서치", sub: "Perplexity + GPT 분석" },
  { no: "03", label: "콘텐츠 생성", sub: "SEO 최적화 초안 작성" },
  { no: "04", label: "발행", sub: "WordPress 자동 배포" },
];

/* ── 메인 컴포넌트 ── */
export function Landing() {
  const typing = useTyping(["상품 리서치", "SEO 콘텐츠", "시장 분석", "딥링크 생성"]);
  const heroRef = useRef<HTMLDivElement>(null);

  /* 마우스 parallax 효과 (히어로 글로우 오브) */
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
        fontFamily: "'DM Mono', 'Fira Code', monospace",
      }}
    >
      {/* ── Google Fonts 로드 ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Space+Grotesk:wght@400;500;700&display=swap');

        /* 그리드 배경 */
        .cp9-grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* 글로우 오브 */
        .cp9-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.18;
          transition: transform 0.15s ease-out;
        }

        /* Feature 카드 호버 */
        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 32px;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          cursor: default;
        }
        .feature-card:hover {
          transform: translateY(-6px);
        }

        /* 스텝 라인 연결 */
        .step-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(34,211,238,0.4), rgba(130,80,255,0.4));
          margin: 0 12px;
        }

        /* 타이핑 커서 */
        .cursor {
          display: inline-block;
          width: 3px;
          height: 1em;
          background: #22d3ee;
          margin-left: 4px;
          vertical-align: middle;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }

        /* CTA 버튼 */
        .cta-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 15px;
          background: linear-gradient(135deg, #22d3ee, #818cf8);
          color: #05080f;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.02em;
        }
        .cta-btn-primary:hover {
          opacity: 0.88;
          transform: translateY(-2px);
        }

        .cta-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 15px;
          background: transparent;
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.2);
          cursor: pointer;
          transition: border-color 0.2s, transform 0.2s;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.02em;
        }
        .cta-btn-outline:hover {
          border-color: #22d3ee;
          transform: translateY(-2px);
        }

        /* 숫자 배지 */
        .step-badge {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 1px solid rgba(34,211,238,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #22d3ee;
          background: rgba(34,211,238,0.06);
          flex-shrink: 0;
        }

        /* Fade-in 애니메이션 */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .delay-1 { animation-delay: 0.15s; }
        .delay-2 { animation-delay: 0.3s; }
        .delay-3 { animation-delay: 0.45s; }
        .delay-4 { animation-delay: 0.6s; }
      `}</style>

      {/* 그리드 배경 */}
      <div className="cp9-grid-bg" />

      {/* 마우스 반응 글로우 오브들 */}
      <div
        className="cp9-orb"
        style={{
          width: 600,
          height: 600,
          background: "#22d3ee",
          top: mouse.y - 300,
          left: mouse.x - 300,
        }}
      />
      <div
        className="cp9-orb"
        style={{
          width: 500,
          height: 500,
          background: "#818cf8",
          top: "60%",
          right: "-5%",
        }}
      />

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        ref={heroRef}
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-36 pb-32"
      >
        {/* 서비스 배지 */}
        <div
          className="fade-up mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs tracking-widest uppercase"
          style={{
            border: "1px solid rgba(34,211,238,0.35)",
            color: "#22d3ee",
            background: "rgba(34,211,238,0.07)",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          AI-Powered Automation Platform
        </div>

        {/* 메인 헤드라인 */}
        <h1
          className="fade-up delay-1 mb-6 font-bold leading-tight"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(2.4rem, 6vw, 5rem)",
            letterSpacing: "-0.02em",
            maxWidth: 760,
          }}
        >
          AI가 자동화하는
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {typing}
          </span>
          <span className="cursor" />
        </h1>

        {/* 서브 카피 */}
        <p
          className="fade-up delay-2 mb-10 max-w-xl text-base leading-relaxed"
          style={{ color: "#94a3b8", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          쿠팡 상품 데이터 수집부터 AI 리서치, SEO 블로그 자동 생성, 워드프레스 발행까지 —
          콘텐츠 파이프라인 전체를 <strong style={{ color: "#e2e8f0" }}>단 하나의 플랫폼</strong>으로
          완성하세요.
        </p>

        {/* CTA 버튼 */}
        <div className="fade-up delay-3 flex flex-wrap gap-4 justify-center">
          <Link href="/product">
            <button className="cta-btn-primary">
              무료로 시작하기 <IconArrow />
            </button>
          </Link>
          <Link href="/research">
            <button className="cta-btn-outline">
              글 목록 관리 →
            </button>
          </Link>
        </div>

        {/* 지표 배지 */}
        <div
          className="fade-up delay-4 mt-16 flex flex-wrap gap-8 justify-center text-sm"
          style={{ color: "#64748b", fontFamily: "'DM Mono', monospace" }}
        >
          {[
            ["쿠팡 파트너스 API", "연동 완료"],
            ["Perplexity AI", "시장 분석"],
            ["GPT-4o", "SEO 생성"],
            ["WordPress", "자동 발행"],
          ].map(([label, sub]) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span style={{ color: "#22d3ee", fontSize: 11, letterSpacing: "0.08em" }}>{sub}</span>
              <span style={{ fontSize: 12 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="relative z-10 px-6 pb-28 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ color: "#22d3ee", fontFamily: "'DM Mono', monospace" }}
          >
            Core Features
          </p>
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.01em" }}
          >
            모든 과정을 AI가 처리합니다
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="feature-card"
              style={
                {
                  "--accent": f.accent,
                  animationDelay: `${i * 0.12}s`,
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = f.accent + "55";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${f.accent}22`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                className="mb-5 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: f.accent + "18", color: f.accent }}
              >
                {f.icon}
              </div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section
        className="relative z-10 px-6 py-24"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-xs tracking-widest uppercase mb-3"
              style={{ color: "#818cf8", fontFamily: "'DM Mono', monospace" }}
            >
              How It Works
            </p>
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.01em" }}
            >
              4단계로 완성되는 자동화 파이프라인
            </h2>
          </div>

          {/* 스텝 플로우 */}
          <div className="hidden md:flex items-start justify-between">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.no}>
                <div className="flex flex-col items-center gap-3 text-center" style={{ width: 120 }}>
                  <div className="step-badge">{s.no}</div>
                  <span
                    className="font-semibold text-sm"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {s.label}
                  </span>
                  <span className="text-xs" style={{ color: "#64748b" }}>
                    {s.sub}
                  </span>
                </div>
                {i < STEPS.length - 1 && <div className="step-line mt-6" />}
              </React.Fragment>
            ))}
          </div>

          {/* 모바일용 세로 스텝 */}
          <div className="md:hidden flex flex-col gap-6">
            {STEPS.map((s) => (
              <div key={s.no} className="flex items-center gap-5">
                <div className="step-badge">{s.no}</div>
                <div>
                  <div className="font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {s.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                    {s.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA BOTTOM ═══════════════ */}
      <section
        className="relative z-10 px-6 py-28 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="mx-auto max-w-2xl rounded-2xl p-12"
          style={{
            background: "linear-gradient(135deg, rgba(34,211,238,0.07) 0%, rgba(129,140,248,0.07) 100%)",
            border: "1px solid rgba(34,211,238,0.15)",
          }}
        >
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.01em" }}
          >
            지금 바로 시작하세요
          </h2>
          <p className="mb-8 text-sm leading-relaxed" style={{ color: "#94a3b8", fontFamily: "'Space Grotesk', sans-serif" }}>
            로그인하고 첫 번째 상품 리서치를 자동화해 보세요.
            SEO 최적화 블로그 초안까지 단 몇 분이면 완성됩니다.
          </p>
          <Link href="/login">
            <button className="cta-btn-primary">
              시작하기 <IconArrow />
            </button>
          </Link>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer
        className="relative z-10 flex items-center justify-between px-8 py-6 text-xs"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          color: "#475569",
          fontFamily: "'DM Mono', monospace",
        }}
      >
        <span>© 2025 CP9. All rights reserved.</span>
        <span>Powered by GPT-4o · Perplexity AI · Supabase</span>
      </footer>
    </div>
  );
}
