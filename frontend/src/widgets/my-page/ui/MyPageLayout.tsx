"use client";

import React from 'react';
import { UserProfileWidget } from './UserProfileWidget';
import { DefaultArticleSettingsWidget } from './DefaultArticleSettingsWidget';
import { DefaultThemeWidget } from './DefaultThemeWidget';
import { ApiIntegrationSettingsWidget } from './ApiIntegrationSettingsWidget';

export const MyPageLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-jakarta selection:bg-cyan-500/30">
      {/* Global Background Particles / Noise */}
      <div className="fixed inset-0 bg-[url('/noise.svg')] mix-blend-overlay opacity-20 pointer-events-none z-0" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-24 flex flex-col gap-16">
        {/* Header - Asymmetrical Typography */}
        <header className="flex flex-col gap-4 border-l-4 border-cyan-500 pl-6 md:pl-10 ml-2 md:ml-4">
          <h1 className="text-4xl md:text-6xl font-syne font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
            마이페이지.
          </h1>
          <p className="text-slate-400 font-jakarta max-w-lg text-lg leading-relaxed">
            오토파일럿 구성, 전역 기본 설정 및 계정 설정을 한 곳에서 관리하세요.
          </p>
        </header>

        {/* Content Modules */}
        <main className="flex flex-col gap-10">
          <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-sm font-syne font-bold text-cyan-400 uppercase tracking-widest mb-4 ml-2">계정 정보</h2>
            <UserProfileWidget />
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
             <h2 className="text-sm font-syne font-bold text-cyan-400 uppercase tracking-widest mb-4 ml-2">생성 프로토콜</h2>
             <DefaultArticleSettingsWidget />
          </section>
          <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
             <h2 className="text-sm font-syne font-bold text-cyan-400 uppercase tracking-widest mb-4 ml-2">테마 및 컨텍스트</h2>
             <DefaultThemeWidget />
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
             <h2 className="text-sm font-syne font-bold text-cyan-400 uppercase tracking-widest mb-4 ml-2">API 연동</h2>
             <ApiIntegrationSettingsWidget />
          </section>
        </main>
      </div>
    </div>
  );
};
