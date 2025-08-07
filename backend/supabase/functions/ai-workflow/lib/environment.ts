/**
 * 환경 변수 검증 및 관리 모듈
 * @module Environment
 */

// Deno 환경 타입 선언
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

/**
 * 환경 변수 설정 인터페이스
 */
export interface EnvironmentConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  PERPLEXITY_API_KEY?: string;
  WORDPRESS_URL?: string;
  WORDPRESS_USERNAME?: string;
  WORDPRESS_PASSWORD?: string;
  OPENAI_API_KEY?: string;
}

/**
 * 환경 변수 검증 함수
 */
export function validateEnvironment(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    SUPABASE_URL: Deno.env.get("SUPABASE_URL") || "",
    SUPABASE_ANON_KEY: Deno.env.get("SUPABASE_ANON_KEY") || "",
    PERPLEXITY_API_KEY: Deno.env.get("PERPLEXITY_API_KEY") || "",
    WORDPRESS_URL: Deno.env.get("WORDPRESS_URL") || "",
    WORDPRESS_USERNAME: Deno.env.get("WORDPRESS_USERNAME") || "",
    WORDPRESS_PASSWORD: Deno.env.get("WORDPRESS_PASSWORD") || "",
    OPENAI_API_KEY: Deno.env.get("OPENAI_API_KEY") || "",
  };

  // 필수 환경 변수 검증
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    throw new Error("필수 Supabase 환경 변수가 설정되지 않았습니다: SUPABASE_URL, SUPABASE_ANON_KEY");
  }

  return config;
}

/**
 * 쿠팡 API 설정 조회
 */
export function getCoupangConfig() {
  return {
    accessKey: Deno.env.get("COUPANG_ACCESS_KEY"),
    secretKey: Deno.env.get("COUPANG_SECRET_KEY")
  };
}