import React from 'react';
import { AutopilotDashboard } from '@/features/autopilot/ui/AutopilotDashboard';

export const metadata = {
  title: '오토파일럿 대시보드 | AI 큐레이터',
};

export default function AutopilotPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-2 font-syne tracking-tight">AI 오토파일럿 대시보드</h1>
          <p className="text-slate-400 font-jakarta">자동 아이템 수집 및 발행 큐(Queue)를 제어하고, 페르소나를 할당하여 고도화된 스케줄링을 진행하세요.</p>
        </header>

        <AutopilotDashboard />
      </div>
    </div>
  );
}
