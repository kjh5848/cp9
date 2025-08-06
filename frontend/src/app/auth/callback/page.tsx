'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/infrastructure/api/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('인증 오류:', error);
          router.push('/login?error=auth_failed');
          return;
        }

        if (data.session) {
          // 로그인 성공 시 returnTo 파라미터 확인 후 리디렉션
          const returnTo = searchParams.get('returnTo');
          const redirectPath = returnTo || '/product'; // 기본값은 product 페이지
          router.push(redirectPath);
        } else {
          // 세션이 없으면 로그인 페이지로 리디렉션
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