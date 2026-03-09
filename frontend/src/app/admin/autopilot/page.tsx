import React from 'react';
import { AutopilotDashboard } from '@/features/autopilot/ui/AutopilotDashboard';

export const metadata = {
  title: '오토파일럿 대시보드 | AI 큐레이터',
};

export default function AdminAutopilotPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">AI 오토파일럿 대시보드 🚀</h1>
        <p className="mt-2 text-gray-600">
          자동 아이템 수집 및 발행 큐(Queue)를 모니터링하고 제어합니다. 페르소나를 할당하여 키워드를 스케줄링할 수 있습니다.
        </p>
      </div>

      <AutopilotDashboard />
    </div>
  );
}
