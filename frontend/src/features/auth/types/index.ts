import { User, Session } from '@supabase/supabase-js';

/**
 * 인증 컨텍스트 타입
 */
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

/**
 * 로그인 폼 데이터 타입
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * 회원가입 폼 데이터 타입
 */
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

/**
 * 인증 상태 타입
 */
export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * 인증 에러 타입
 */
export interface AuthError {
  message: string;
  code?: string;
}

/**
 * OAuth 제공자 타입
 */
export type OAuthProvider = 'google' | 'github' | 'kakao';

// re-export from supabase for convenience
export type { User, Session } from '@supabase/supabase-js'; 