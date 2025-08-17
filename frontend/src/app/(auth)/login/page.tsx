import { Suspense } from 'react';
import { LoginPageClient } from '@/features/auth/components';

/**
 * 로그인 페이지 로딩 폴백 컴포넌트
 */
function LoginPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg border shadow-sm p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">로딩 중</h3>
            <p className="text-sm text-gray-600">로그인 페이지를 준비하고 있습니다...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 로그인 페이지
 * Suspense 경계로 감싸서 useSearchParams 사용 시 SSR 에러 방지
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient />
    </Suspense>
  );
} 