"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { ArrowRight } from "lucide-react";

/** 타이핑 텍스트 훅 */
export function useTyping(words: string[], speed = 80, pause = 1800) {
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

export function HeroSection() {
  const typing = useTyping(["상품 리서치", "SEO 콘텐츠", "시장 분석", "딥링크 생성"]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
  };

  return (
    <section className="relative z-10 flex flex-col justify-center px-6 pt-36 pb-32 min-h-[90vh]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center text-center max-w-7xl mx-auto w-full"
      >
        {/* 서비스 배지 */}
        <motion.div
          variants={itemVariants}
          className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs tracking-widest uppercase font-mono"
          style={{
            border: "1px solid rgba(34,211,238,0.35)",
            color: "#22d3ee",
            background: "rgba(34,211,238,0.07)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          AI-Powered Automation Platform
        </motion.div>

        {/* 메인 헤드라인 */}
        <motion.h1
          variants={itemVariants}
          className="mb-6 font-bold leading-tight font-syne"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 5rem)",
            letterSpacing: "-0.02em",
            maxWidth: 820,
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
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            className="inline-block w-[3px] h-[1em] bg-cyan-400 ml-1 align-middle"
          />
        </motion.h1>

        {/* 서브 카피 */}
        <motion.p
          variants={itemVariants}
          className="mb-10 max-w-xl text-lg leading-relaxed text-slate-400 font-syne mx-auto"
        >
          쿠팡 상품 데이터 수집부터 AI 리서치, SEO 블로그 자동 생성, 워드프레스 발행까지 —
          콘텐츠 파이프라인 전체를 <strong className="text-slate-200 font-medium">단 하나의 플랫폼</strong>으로
          완성하세요.
        </motion.p>

        {/* CTA 버튼 */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
          <Link href="/product">
            <Button variant="tech" size="lg" className="rounded-full px-8 opacity-90 hover:opacity-100 transition-opacity">
              무료로 시작하기 <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/research">
            <Button variant="glass" size="lg" className="rounded-full px-8">
              글 목록 관리 &rarr;
            </Button>
          </Link>
        </motion.div>

        {/* 지표 배지 */}
        <motion.div
          variants={itemVariants}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl mx-auto text-sm font-mono opacity-80"
          style={{ color: "#64748b" }}
        >
          {[
            ["쿠팡 파트너스 API", "연동 완료"],
            ["Perplexity AI", "시장 분석"],
            ["GPT-4o", "SEO 생성"],
            ["WordPress", "자동 발행"],
          ].map(([label, sub]) => (
            <div key={label} className="flex flex-col items-start gap-1 p-4 border-l border-white/5 bg-white/[0.02]">
              <span style={{ color: "#22d3ee", fontSize: 11, letterSpacing: "0.08em" }}>{sub}</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
