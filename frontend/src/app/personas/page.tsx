import React from 'react';
import { PersonaManager } from '@/features/persona/ui/PersonaManager';

export const metadata = {
  title: '페르소나 관리 | AI 오토파일럿',
};

export default function AdminPersonasPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">페르소나 시스템 뱅크 🎭</h1>
        <p className="mt-2 text-gray-600">
          오토파일럿 봇이나 수동 글 작성 시 적용될 나만의 AI 자아(페르소나)를 관리하세요.
        </p>
      </div>

      <PersonaManager />
    </div>
  );
}
