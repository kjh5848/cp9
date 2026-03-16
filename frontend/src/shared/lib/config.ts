/**
 * 환경변수 설정 관리
 * Doppler를 통해 주입된 환경변수를 타입 안전하게 관리
 */

// 환경변수 타입 정의
interface EnvironmentConfig {
  // 환경 구분
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_ENV: 'local' | 'staging' | 'production';
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  
  // 쿠팡 파트너스 API
  COUPANG_ACCESS_KEY?: string;
  COUPANG_SECRET_KEY?: string;
  
  // AI API
  OPENAI_API_KEY?: string;
  PERPLEXITY_API_KEY?: string;
  
  // Google OAuth
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  
  // WordPress (Application Password 인증)
  WORDPRESS_SITE_URL?: string;
  WORDPRESS_USERNAME?: string;
  WORDPRESS_APP_PASSWORD?: string;
  
  // Base URL
  NEXT_PUBLIC_BASE_URL?: string;
  
  // LangGraph
  NEXT_PUBLIC_LANGGRAPH_API_URL?: string;
}

/**
 * 환경변수 가져오기 (필수값)
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV !== 'development') {
    console.warn(`[빌드타임 경고] 필수 환경변수 ${key}가 설정되지 않았습니다.`);
    // throw new Error(`필수 환경변수 ${key}가 설정되지 않았습니다...`);
  }
  return value || '';
}

/**
 * 환경변수 가져오기 (선택값)
 */
function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

/**
 * 환경변수 설정 객체
 * Doppler를 통해 주입된 환경변수를 중앙에서 관리
 */
export const config: EnvironmentConfig = {
  // 환경 구분
  NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
  NEXT_PUBLIC_ENV: (process.env.NEXT_PUBLIC_ENV as EnvironmentConfig['NEXT_PUBLIC_ENV']) || 'local',
  
  // Supabase (선택)
  NEXT_PUBLIC_SUPABASE_URL: getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getOptionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY'),
  
  // 쿠팡 파트너스 API (선택)
  COUPANG_ACCESS_KEY: getOptionalEnv('COUPANG_ACCESS_KEY'),
  COUPANG_SECRET_KEY: getOptionalEnv('COUPANG_SECRET_KEY'),
  
  // AI API (선택)
  OPENAI_API_KEY: getOptionalEnv('OPENAI_API_KEY'),
  PERPLEXITY_API_KEY: getOptionalEnv('PERPLEXITY_API_KEY'),
  
  // Google OAuth (선택)
  GOOGLE_CLIENT_ID: getOptionalEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getOptionalEnv('GOOGLE_CLIENT_SECRET'),
  
  // WordPress (Application Password 인증 - 선택)
  WORDPRESS_SITE_URL: getOptionalEnv('WORDPRESS_SITE_URL'),
  WORDPRESS_USERNAME: getOptionalEnv('WORDPRESS_USERNAME'),
  WORDPRESS_APP_PASSWORD: getOptionalEnv('WORDPRESS_APP_PASSWORD'),
  
  // Base URL (선택)
  NEXT_PUBLIC_BASE_URL: getOptionalEnv('NEXT_PUBLIC_BASE_URL'),
  
  // LangGraph (선택)
  NEXT_PUBLIC_LANGGRAPH_API_URL: getOptionalEnv('NEXT_PUBLIC_LANGGRAPH_API_URL', '/api/langgraph'),
};

/**
 * 환경 체크 함수
 */
export function isDevelopment(): boolean {
  return config.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return config.NODE_ENV === 'production';
}

export function isTest(): boolean {
  return config.NODE_ENV === 'test';
}

/**
 * 환경변수 검증 함수 (유저별 DB 설정을 사용하므로 필수 체크 완화)
 */
export function validateEnvironment(): void {
  // 사용하지 않음
}

/**
 * 환경변수 정보 출력 (디버깅용)
 */
export function printEnvironmentInfo(): void {
  if (isDevelopment()) {
    console.log('📋 환경변수 설정 정보:');
    console.log(`  - NODE_ENV: ${config.NODE_ENV}`);
    console.log(`  - NEXT_PUBLIC_ENV: ${config.NEXT_PUBLIC_ENV}`);
    console.log(`  - Supabase URL: ${config.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}`);
    console.log(`  - Coupang API: ${config.COUPANG_ACCESS_KEY ? '✅' : '❌'}`);
    console.log(`  - Perplexity API: ${config.PERPLEXITY_API_KEY ? '✅' : '❌'}`);
    console.log(`  - WordPress: ${config.WORDPRESS_USERNAME ? '✅' : '❌'}`);
  }
}