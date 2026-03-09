"use client";

import React from "react";
import { motion } from "framer-motion";

const STEPS = [
  { no: "01", label: "상품 검색", sub: "다양한 키워드 / 카테고리 / URL" },
  { no: "02", label: "AI 시장 분석", sub: "Perplexity 실시간 웹 검색" },
  { no: "03", label: "콘텐츠 생성", sub: "SEO 최적화 마크다운 초안" },
  { no: "04", label: "즉각 발행", sub: "WordPress 원클릭 동기화" },
];

export function HowItWorksSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative z-10 px-6 py-28" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-20"
        >
          <motion.p
            variants={itemVariants}
            className="text-xs tracking-widest uppercase mb-3 font-mono"
            style={{ color: "#818cf8" }}
          >
            How It Works
          </motion.p>
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-slate-50 font-syne"
            style={{ letterSpacing: "-0.01em" }}
          >
            4단계로 완성되는 논스톱 파이프라인
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="hidden md:flex items-start justify-between relative"
        >
          {/* 뒤에 깔리는 라인 애니메이션 */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute top-6 left-0 h-[1px] -z-10"
            style={{ background: "linear-gradient(90deg, rgba(34,211,238,0.3), rgba(129,140,248,0.5), rgba(34,211,238,0.3))" }}
          />

          {STEPS.map((s, i) => (
            <motion.div key={s.no} variants={itemVariants} className="flex flex-col items-center gap-4 text-center px-4" style={{ width: 160 }}>
              <div 
                className="w-14 h-14 rounded-full border border-cyan-400/40 flex items-center justify-center bg-[#05080f] shadow-[0_0_15px_rgba(34,211,238,0.15)] relative"
              >
                {/* 펄스 글로우 */}
                <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-ping opacity-20" />
                <span className="font-mono text-sm text-cyan-400">{s.no}</span>
              </div>
              <span
                className="font-semibold text-base text-slate-200 font-syne"
              >
                {s.label}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {s.sub}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* 모바일 렌더링 */}
        <div className="md:hidden flex flex-col gap-8">
          {STEPS.map((s, i) => (
            <motion.div 
              key={s.no} 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-5"
            >
              <div className="w-12 h-12 rounded-full border border-cyan-400/40 flex items-center justify-center bg-cyan-400/5 text-cyan-400 font-mono text-sm shrink-0">
                {s.no}
              </div>
              <div>
                <div className="font-semibold text-base text-slate-200 font-syne">
                  {s.label}
                </div>
                <div className="text-xs mt-1 text-slate-400 font-medium">
                  {s.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
