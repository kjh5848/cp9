import React from 'react';
import { PersonaManager } from '@/features/persona/ui/PersonaManager';

export const metadata = {
  title: '페르소나 관리 | AI 오토파일럿',
};

export default function PersonasPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-2 font-syne tracking-tight">페르소나 뱅크</h1>
          <p className="text-slate-400 font-jakarta">오토파일럿 봇이나 수동 글 작성 시 적용될 나만의 AI 자아(페르소나)를 커스텀하고 관리하세요.</p>
        </header>

        <PersonaManager />
      </div>
    </div>
  );
}
