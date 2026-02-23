/**
 * Supabase 설정 유틸리티
 * 환경에 따라 적절한 Supabase 인스턴스를 사용하도록 관리
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

/**
 * 인증용 Supabase 설정 (항상 프로덕션 사용)
 * Google OAuth 콜백이 프로덕션 URL로 설정되어 있음
 */
export function getAuthSupabaseConfig(): SupabaseConfig {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_PRODUCTION!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PRODUCTION!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY_PRODUCTION!,
  };
}

/**
 * Edge Functions용 Supabase 설정
 * 개발 시에는 로컬 Supabase 사용
 */
export function getFunctionsSupabaseConfig(): SupabaseConfig {
  const isLocal = process.env.NEXT_PUBLIC_ENV === 'local';
  
  if (isLocal) {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL_LOCAL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY_LOCAL!,
    };
  }
  
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_PRODUCTION!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PRODUCTION!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY_PRODUCTION!,
  };
}

/**
 * 데이터베이스용 Supabase 설정 (항상 프로덕션 사용)
 * 로컬 DB는 마이그레이션과 테스트용
 */
export function getDBSupabaseConfig(): SupabaseConfig {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_PRODUCTION!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PRODUCTION!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY_PRODUCTION!,
  };
}

/**
 * 클라이언트용 Supabase 설정 (환경 변수 사용)
 */
export function getClientSupabaseConfig(): Pick<SupabaseConfig, 'url' | 'anonKey'> {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}

// Supabase 클라이언트 인스턴스를 위한 re-export
// infrastructure/api/supabase.ts의 인스턴스를 사용
export { supabase } from '@/infrastructure/api/supabase';