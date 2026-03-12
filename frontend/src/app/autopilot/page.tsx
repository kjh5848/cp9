import React from 'react';
import { AutopilotDashboardWidget } from '@/widgets/autopilot/ui/AutopilotDashboardWidget';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const metadata = {
  title: '오토파일럿 대시보드 | AI 큐레이터',
};

export default function AutopilotPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-[1400px]">
        <header className="mb-10 relative flex flex-col md:flex-row justify-center items-center z-20">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white mb-2 font-syne tracking-tight">AI 오토파일럿 대시보드</h1>
            <p className="text-slate-400 font-jakarta">자동 아이템 수집 및 발행 큐(Queue)를 제어하고, 페르소나를 할당하여 고도화된 스케줄링을 진행하세요.</p>
          </div>
          <div className="mt-4 md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 shrink-0">
            <Link href="/my-page" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 hover:text-white border border-slate-700 rounded-lg transition-colors shadow-lg">
              <span>기본 설정</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <AutopilotDashboardWidget />
      </div>
    </div>
  );
}
