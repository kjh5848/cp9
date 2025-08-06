import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/infrastructure/api/supabase';
import { LoginFormData } from '../types';
import { validateEmail, validatePassword, formatAuthError } from '../utils';

interface AuthFormState {
  isLoading: boolean;
  isSignUp: boolean;
  message: string;
}

interface UseAuthFormReturn {
  // 폼 관련
  register: ReturnType<typeof useForm<LoginFormData>>['register'];
  handleSubmit: (e: React.FormEvent) => void;
  formState: ReturnType<typeof useForm<LoginFormData>>['formState'];
  reset: ReturnType<typeof useForm<LoginFormData>>['reset'];
  
  // 인증 상태 관련
  authState: AuthFormState;
  
  // 액션 관련
  toggleAuthMode: () => void;
  handleGoogleSignIn: () => Promise<void>;
  clearMessage: () => void;
}

/**
 * 인증 폼 관리를 위한 커스텀 훅
 * 
 * @returns 폼 상태와 액션들을 포함한 객체
 * 
 * @example
 * ```tsx
 * const {
 *   register,
 *   handleSubmit,
 *   formState: { errors, isSubmitting },
 *   toggleAuthMode,
 *   handleGoogleSignIn
 * } = useAuthForm();
 * ```
 */
export function useAuthForm(): UseAuthFormReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 폼 상태 관리
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState,
    reset,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  // 인증 상태 관리
  const [authState, setAuthState] = useState<AuthFormState>({
    isLoading: false,
    isSignUp: false,
    message: '',
  });

  // 메시지 초기화
  const clearMessage = useCallback(() => {
    setAuthState(prev => ({ ...prev, message: '' }));
  }, []);

  // 인증 모드 토글 (로그인/회원가입)
  const toggleAuthMode = useCallback(() => {
    setAuthState(prev => ({ 
      ...prev, 
      isSignUp: !prev.isSignUp,
      message: '' 
    }));
    reset();
  }, [reset]);

  // 이메일/비밀번호 로그인/회원가입
  const handleAuthSubmit = useCallback(async (data: LoginFormData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, message: '' }));

    try {
      // 이메일 유효성 검사
      if (!validateEmail(data.email)) {
        throw new Error('유효하지 않은 이메일 형식입니다.');
      }

      // 비밀번호 유효성 검사 (회원가입 시에만)
      if (authState.isSignUp) {
        const passwordValidation = validatePassword(data.password);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.message);
        }
      }

      if (authState.isSignUp) {
        // 회원가입
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        setAuthState(prev => ({ 
          ...prev, 
          message: '회원가입 성공! 이메일을 확인해주세요.' 
        }));
      } else {
        // 로그인
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        setAuthState(prev => ({ 
          ...prev, 
          message: '로그인 성공!' 
        }));
        // 로그인 성공 후 리디렉트
        setTimeout(() => {
          const returnTo = searchParams.get('returnTo');
          const redirectPath = returnTo || '/product';
          router.push(redirectPath);
        }, 1000);
      }
    } catch (error) {
      const errorMessage = formatAuthError(error);
      setAuthState(prev => ({ ...prev, message: errorMessage }));
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [authState.isSignUp, router, searchParams]);

  // 구글 OAuth 로그인
  const handleGoogleSignIn = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, message: '' }));

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      const errorMessage = formatAuthError(error);
      setAuthState(prev => ({ ...prev, message: errorMessage }));
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    // 폼 관련
    register,
    handleSubmit: (e: React.FormEvent) => {
      e.preventDefault();
      handleFormSubmit(handleAuthSubmit)(e);
    },
    formState,
    reset,
    
    // 인증 상태 관련
    authState,
    
    // 액션 관련
    toggleAuthMode,
    handleGoogleSignIn,
    clearMessage,
  };
} 