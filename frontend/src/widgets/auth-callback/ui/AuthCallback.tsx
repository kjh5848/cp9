'use client';

import { Suspense } from 'react';
import { useAuthCallbackViewModel } from '@/features/auth-callback/model/useAuthCallbackViewModel';

/**
 * [Widgets/AuthCallback Layer]
 * OAuth 콜백 처리 위젯입니다.
 * ViewModel에서 세션 처리를 수행하고, 로딩 UI를 표시합니다.
 */
function AuthCallbackContent() {
  // ViewModel이 세션 처리 및 리다이렉트를 담당
  useAuthCallbackViewModel();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          인증 처리 중...
        </h2>
        <p className="text-gray-600">
          잠시만 기다려 주세요.
        </p>
      </div>
    </div>
  );
}

/**
 * AuthCallback 위젯 (Suspense 포함)
 */
export function AuthCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">인증 처리 준비 중...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
