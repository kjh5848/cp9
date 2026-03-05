'use client';

import { AuthCallback } from '@/widgets/auth-callback/ui/AuthCallback';

/**
 * [Auth Callback Page]
 * OAuth 인증 콜백을 처리하는 페이지입니다.
 * Widget(AuthCallback)을 배치하는 얇은 껍데기 역할만 합니다.
 */
export default function AuthCallbackPage() {
  return <AuthCallback />;
}