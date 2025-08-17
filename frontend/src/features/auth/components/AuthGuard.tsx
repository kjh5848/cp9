'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * 인증된 사용자만 접근할 수 있도록 보호하는 컴포넌트
 * 
 * @param children - 보호할 컴포넌트들
 * @param redirectTo - 리디렉션할 경로 (기본값: '/login')
 * @returns 인증된 경우 children, 아닌 경우 로딩 상태
 * 
 * @example
 * <AuthGuard>
 *   <ProtectedComponent />
 * </AuthGuard>
 */
export function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('AuthGuard - 상태 체크:', { loading, isAuthenticated, path: window.location.pathname });
    
    if (!loading && !isAuthenticated) {
      // 현재 페이지 경로를 저장하고 로그인 페이지로 리디렉트
      const currentPath = window.location.pathname;
      const redirectUrl = redirectTo + (currentPath !== '/' ? `?returnTo=${encodeURIComponent(currentPath)}` : '');
      console.log('AuthGuard - 로그인 페이지로 리디렉트:', redirectUrl);
      router.push(redirectUrl);
    } else if (!loading && isAuthenticated) {
      console.log('AuthGuard - 인증됨, 페이지 접근 허용');
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  // 로딩 중이거나 인증되지 않은 경우
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg border shadow-sm p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">인증 확인 중</h3>
              <p className="text-sm text-gray-600">잠시만 기다려 주세요...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 (리디렉션 진행 중)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg border shadow-sm p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">로그인이 필요합니다</h3>
              <p className="text-sm text-gray-600 mb-4">로그인 페이지로 이동 중입니다.</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 인증된 경우
  return <>{children}</>;
}