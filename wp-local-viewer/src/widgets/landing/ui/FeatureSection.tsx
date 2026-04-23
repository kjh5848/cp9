"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, BrainCircuit, PenTool } from "lucide-react";
import { GlassCard } from "@/shared/ui/GlassCard";

const FEATURES = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "상품 리서치 자동화",
    desc: "쿠팡 API + Perplexity AI로 키워드·카테고리·URL 기반 상품 데이터를 실시간 수집하고 정제합니다.",
    accent: "#22d3ee",
  },
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: "AI 시장 분석",
    desc: "최신 시장 트렌드·경쟁사·소비자 리뷰를 GPT가 분석해 장단점·포지셔닝·인사이트를 제공합니다.",
    accent: "#818cf8",
  },
  {
    icon: <PenTool className="w-6 h-6" />,
    title: "SEO 콘텐츠 자동 생성",
    desc: "ResearchPack → GPT 기반 SEO 최적화 블로그 초안 자동 생성 후 워드프레스에 원클릭 발행합니다.",
    accent: "#34d399",
  },
];

export function FeatureSection() {
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
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
  };

  return (
    <section className="relative z-10 px-6 pb-32 pt-10 max-w-6xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="text-center mb-16">
          <motion.p
            variants={itemVariants}
            className="text-xs tracking-widest uppercase mb-3 font-mono"
            style={{ color: "#22d3ee" }}
          >
            Core Features
          </motion.p>
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-slate-50 font-syne"
            style={{ letterSpacing: "-0.01em" }}
          >
            모든 과정을 AI가 오토파일럿으로
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} variants={itemVariants}>
              <GlassCard
                className="group h-full flex flex-col items-start transition-all duration-300 hover:-translate-y-2 cursor-default border-white/5 hover:border-[var(--accent)]/50 bg-[#05080f]/40 backdrop-blur-xl relative overflow-hidden"
                style={{ "--accent": f.accent } as React.CSSProperties}
              >
                {/* 은은한 내부 조명 */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
                  style={{ background: f.accent }}
                />

                <div
                  className="mb-6 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10"
                  style={{ background: `linear-gradient(135deg, ${f.accent}18, transparent)`, color: f.accent }}
                >
                  {f.icon}
                </div>
                <h3
                  className="text-xl font-semibold mb-3 text-slate-100 font-syne"
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400 font-medium">
                  {f.desc}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
