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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 인증되지 않은 경우 (리디렉션 진행 중)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // 인증된 경우
  return <>{children}</>;
}