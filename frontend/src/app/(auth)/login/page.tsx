import { Suspense } from 'react';
import { LoginPageClient } from '@/features/auth/components';
import { AuthLoadingSpinner } from '@/shared/components/advanced-ui';

/**
 * 로그인 페이지
 * Suspense 경계로 감싸서 useSearchParams 사용 시 SSR 에러 방지
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoadingSpinner type="login" />}>
      <LoginPageClient />
    </Suspense>
  );
} 