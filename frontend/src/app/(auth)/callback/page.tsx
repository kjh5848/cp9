'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/infrastructure/api/supabase';
import { AuthLoadingSpinner, SimpleAuthLoadingSpinner } from '@/shared/components/advanced-ui';

function AuthCallbackComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL 해시에서 토큰 정보 확인 (OAuth 콜백의 경우)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        console.log('콜백 처리 시작');
        console.log('URL:', window.location.href);
        console.log('Hash params:', Object.fromEntries(hashParams));
        console.log('Search params:', Object.fromEntries(searchParams));
        
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
            
            console.log('세션 설정 성공:', data);
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
          console.log('세션 확인됨:', data.session.user.email);
          
          // returnTo 파라미터 확인 (여러 방법으로)
          let returnTo = searchParams.get('returnTo');
          console.log('URL returnTo:', returnTo);
          
          // OAuth state에서 returnTo 정보 확인
          if (!returnTo) {
            try {
              const state = searchParams.get('state') || hashParams.get('state');
              console.log('State 값:', state);
              if (state) {
                const stateData = JSON.parse(state);
                returnTo = stateData.returnTo;
                console.log('State에서 추출한 returnTo:', returnTo);
              }
            } catch (e) {
              console.log('State 파싱 실패:', e);
            }
          }
          
          // localStorage에서 확인 (fallback)
          if (!returnTo) {
            returnTo = localStorage.getItem('auth_returnTo');
            console.log('localStorage returnTo:', returnTo);
            if (returnTo) {
              localStorage.removeItem('auth_returnTo');
            }
          }
          
          const redirectPath = returnTo || '/product';
          console.log('최종 리디렉트 경로:', redirectPath);
          
          // AuthContext가 세션 변경을 감지할 시간을 주기 위해 조금 더 긴 지연
          setTimeout(() => {
            console.log('리디렉트 실행:', redirectPath);
            router.push(redirectPath);
          }, 500);
        } else {
          console.log('세션 없음 - 로그인 페이지로 이동');
          router.push('/login');
        }
      } catch (error) {
        console.error('콜백 처리 오류:', error);
        router.push('/login?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return <AuthLoadingSpinner type="callback" />;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<SimpleAuthLoadingSpinner message="인증 정보 로딩 중..." />}>
      <AuthCallbackComponent />
    </Suspense>
  );
} 