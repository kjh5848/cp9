import { User } from '@supabase/supabase-js';
import { AuthError } from '../types';

/**
 * 이메일 유효성 검사
 * @param email - 검증할 이메일 주소
 * @returns 유효한 이메일인지 여부
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 유효성 검사
 * @param password - 검증할 비밀번호
 * @returns 유효성 검사 결과와 에러 메시지
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' };
  }
  
  if (!/(?=.*[a-zA-Z])/.test(password)) {
    return { isValid: false, message: '비밀번호는 최소 1개의 영문자를 포함해야 합니다.' };
  }
  
  return { isValid: true };
};

/**
 * 비밀번호 확인 검증
 * @param password - 원본 비밀번호
 * @param confirmPassword - 확인 비밀번호
 * @returns 일치 여부
 */
export const validatePasswordConfirm = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Supabase 인증 에러를 사용자 친화적 메시지로 변환
 * @param error - Supabase 에러 객체
 * @returns 한국어 에러 메시지
 */
export const formatAuthError = (error: unknown): string => {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': '잘못된 이메일 또는 비밀번호입니다.',
    'Email not confirmed': '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
    'User already registered': '이미 가입된 이메일입니다.',
    'Signup not allowed for this email': '이 이메일로는 가입할 수 없습니다.',
    'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
    'Invalid email': '유효하지 않은 이메일 형식입니다.',
    'Email rate limit exceeded': '이메일 전송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
  };

  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = String(error.message);
    return errorMessages[errorMessage] || errorMessage;
  }

  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * 사용자 표시 이름 생성 (이메일의 @ 앞부분 사용)
 * @param email - 사용자 이메일
 * @returns 표시 이름
 */
export const getDisplayName = (email: string): string => {
  return email.split('@')[0];
};

/**
 * 인증 상태 확인
 * @param user - 사용자 객체
 * @param loading - 로딩 상태
 * @returns 인증 상태
 */
export const getAuthState = (user: User | null, loading: boolean): 'loading' | 'authenticated' | 'unauthenticated' => {
  if (loading) return 'loading';
  return user ? 'authenticated' : 'unauthenticated';
};

/**
 * 보안 리디렉션 URL 검증
 * @param url - 리디렉션 할 URL
 * @returns 안전한 URL인지 여부
 */
export const isValidRedirectUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // 같은 origin만 허용
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
}; 