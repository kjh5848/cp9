'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/infrastructure/clients/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL 해시에서 토큰 정보 확인 (OAuth 콜백의 경우)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        console.log('콜백 처리 시작');
        
        // OAuth 토큰이 있으면 Supabase 세션 설정
        if (accessToken) {
          const refreshToken = hashParams.get('refresh_token');
          if (refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('세션 설정 오류:', error);
              router.push('/login?error=session_failed');
              return;
            }
          }
        }
        
        // 세션 확인
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('인증 오류:', error);
          router.push('/login?error=auth_failed');
          return;
        }

        if (data.session) {
          // returnTo 파라미터 확인 (여러 방법으로)
          let returnTo = searchParams.get('returnTo');
          
          // OAuth state에서 returnTo 정보 확인
          if (!returnTo) {
            try {
              const state = searchParams.get('state') || hashParams.get('state');
              if (state) {
                const stateData = JSON.parse(state);
                returnTo = stateData.returnTo;
              }
            } catch (e) {
              console.log('State 파싱 실패:', e);
            }
          }
          
          // localStorage에서 확인 (fallback)
          if (!returnTo) {
            returnTo = localStorage.getItem('auth_returnTo');
            if (returnTo) {
              localStorage.removeItem('auth_returnTo');
            }
          }
          
          const redirectPath = returnTo || '/product';
          
          // AuthContext가 세션 변경을 감지할 시간을 주기 위해 조금 더 긴 지연
          setTimeout(() => {
            router.push(redirectPath);
          }, 500);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('콜백 처리 오류:', error);
        router.push('/login?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">인증 처리 준비 중...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
 