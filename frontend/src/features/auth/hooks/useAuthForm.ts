import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/infrastructure/api/supabase';
import { formatAuthError } from '../utils';

interface AuthFormState {
  isLoading: boolean;
  message: string;
}

interface UseAuthFormReturn {
  // 인증 상태 관련
  authState: AuthFormState;
  
  // 액션 관련
  handleGoogleSignIn: () => Promise<void>;
  clearMessage: () => void;
}

/**
 * 인증 폼 관리를 위한 커스텀 훅 (구글 OAuth 전용)
 * 
 * @returns 인증 상태와 구글 로그인 액션
 * 
 * @example
 * ```tsx
 * const {
 *   authState: { isLoading, message },
 *   handleGoogleSignIn
 * } = useAuthForm();
 * ```
 */
function AuthFormComponent(): UseAuthFormReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 인증 상태 관리
  const [authState, setAuthState] = useState<AuthFormState>({
    isLoading: false,
    message: '',
  });

  // 메시지 초기화
  const clearMessage = useCallback(() => {
    setAuthState(prev => ({ ...prev, message: '' }));
  }, []);

  // 구글 OAuth 로그인
  const handleGoogleSignIn = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, message: '' }));

    try {
      // returnTo 파라미터를 여러 방법으로 전달
      const returnTo = searchParams.get('returnTo');
      console.log('Google OAuth 시작, returnTo:', returnTo);
      
      // localStorage에 저장 (fallback)
      if (returnTo) {
        localStorage.setItem('auth_returnTo', returnTo);
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `http://localhost:3000/auth/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`,
          queryParams: returnTo ? { returnTo } : undefined,
        },
      });
      if (error) throw error;
    } catch (error) {
      const errorMessage = formatAuthError(error);
      setAuthState(prev => ({ ...prev, message: errorMessage }));
      // 에러 시 localStorage 정리
      localStorage.removeItem('auth_returnTo');
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [searchParams, router]);

  return {
    // 인증 상태 관련
    authState,
    
    // 액션 관련
    handleGoogleSignIn,
    clearMessage,
  };
}

export function useAuthForm(): UseAuthFormReturn {
  return AuthFormComponent();
} 