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
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  
  // 쿠팡 파트너스 API
  COUPANG_ACCESS_KEY: string;
  COUPANG_SECRET_KEY: string;
  
  // AI API
  OPENAI_API_KEY?: string;
  PERPLEXITY_API_KEY?: string;
  
  // Google OAuth
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  
  // WordPress
  WORDPRESS_API_KEY?: string;
  WORDPRESS_SITE_URL?: string;
  
  // Base URL
  NEXT_PUBLIC_BASE_URL: string;
  
  // LangGraph
  NEXT_PUBLIC_LANGGRAPH_API_URL?: string;
}

/**
 * 환경변수 가져오기 (필수값)
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV !== 'development') {
    throw new Error(`필수 환경변수 ${key}가 설정되지 않았습니다. Doppler 또는 .env.local 파일을 확인해주세요.`);
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
  
  // Supabase (필수)
  NEXT_PUBLIC_SUPABASE_URL: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY'),
  
  // 쿠팡 파트너스 API (필수)
  COUPANG_ACCESS_KEY: getRequiredEnv('COUPANG_ACCESS_KEY'),
  COUPANG_SECRET_KEY: getRequiredEnv('COUPANG_SECRET_KEY'),
  
  // AI API (선택)
  OPENAI_API_KEY: getOptionalEnv('OPENAI_API_KEY'),
  PERPLEXITY_API_KEY: getOptionalEnv('PERPLEXITY_API_KEY'),
  
  // Google OAuth (선택)
  GOOGLE_CLIENT_ID: getOptionalEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getOptionalEnv('GOOGLE_CLIENT_SECRET'),
  
  // WordPress (선택)
  WORDPRESS_API_KEY: getOptionalEnv('WORDPRESS_API_KEY'),
  WORDPRESS_SITE_URL: getOptionalEnv('WORDPRESS_SITE_URL'),
  
  // Base URL (필수)
  NEXT_PUBLIC_BASE_URL: getRequiredEnv('NEXT_PUBLIC_BASE_URL'),
  
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
 * 환경변수 검증 함수
 * 앱 시작 시 필수 환경변수가 모두 설정되어 있는지 확인
 */
export function validateEnvironment(): void {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'COUPANG_ACCESS_KEY',
    'COUPANG_SECRET_KEY',
    'NEXT_PUBLIC_BASE_URL',
  ];
  
  const missingVars = requiredVars.filter(key => !process.env[key]);
  
  if (missingVars.length > 0 && !isTest()) {
    console.error('🚨 다음 필수 환경변수가 설정되지 않았습니다:');
    missingVars.forEach(key => console.error(`  - ${key}`));
    console.error('\n💡 Doppler를 사용하여 환경변수를 주입하세요:');
    console.error('   doppler run -- npm run dev');
    console.error('\n또는 .env.local 파일에 환경변수를 설정하세요.');
    
    if (isProduction()) {
      throw new Error('필수 환경변수가 설정되지 않았습니다.');
    }
  }
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
    console.log(`  - WordPress: ${config.WORDPRESS_API_KEY ? '✅' : '❌'}`);
  }
}