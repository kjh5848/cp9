/**
 * Edge Functions 공통 서버 유틸리티
 * 서버 설정, 에러 처리, 요청 검증 등 공통 기능 제공
 */

import { corsHeaders } from "./cors.ts";
import { ok, fail } from "./response.ts";

// Deno 환경 타입 선언
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

/**
 * CORS 헤더 설정 (Headers 객체용)
 */
export function setCorsHeaders(headers: Headers): void {
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
}

/**
 * OPTIONS 요청 처리
 */
export function handleOptionsRequest(): Response {
  const headers = new Headers();
  setCorsHeaders(headers);
  return new Response(null, { headers });
}

/**
 * JSON 요청 본문 안전 파싱
 */
export async function safeJsonParse<T>(req: Request): Promise<T | null> {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null;
    }

    const text = await req.text();
    if (!text.trim()) {
      return null;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    console.error("JSON parsing error:", error);
    return null;
  }
}

/**
 * 필수 환경 변수 검증
 */
export function validateEnvVars(required: string[]): string[] {
  const missing: string[] = [];
  
  for (const envVar of required) {
    if (!Deno.env.get(envVar)) {
      missing.push(envVar);
    }
  }
  
  return missing;
}

/**
 * 공통 에러 핸들러
 */
export function handleError(error: unknown, context: string): Response {
  const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
  
  console.error(`${context} 오류:`, error);
  
  return fail(
    `서버 오류: ${errorMessage}`,
    "INTERNAL_ERROR",
    500,
    { context, timestamp: Date.now() }
  );
}

/**
 * 요청 검증 미들웨어 타입
 */
export interface RequestValidator<T> {
  (data: unknown): data is T;
}

/**
 * 요청 데이터 검증
 */
export function validateRequest<T>(
  data: unknown,
  validator: RequestValidator<T>
): { isValid: true; data: T } | { isValid: false; error: string } {
  try {
    if (validator(data)) {
      return { isValid: true, data };
    }
    return { isValid: false, error: "요청 데이터 형식이 올바르지 않습니다." };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : "검증 오류" 
    };
  }
}

/**
 * 공통 서버 설정
 */
export const SERVER_CONFIG = {
  DEFAULT_TIMEOUT: 30000, // 30초
  MAX_RETRIES: 3,
  RATE_LIMIT: {
    WINDOW: 60 * 1000, // 1분
    MAX_REQUESTS: 100
  }
} as const;

/**
 * HTTP 메서드 검증
 */
export function validateMethod(req: Request, allowedMethods: string[]): boolean {
  return allowedMethods.includes(req.method);
}

/**
 * Edge Function 공통 래퍼
 * CORS, 에러 처리, 메서드 검증을 자동으로 처리
 */
export function createEdgeFunctionHandler(
  handler: (req: Request) => Promise<Response>,
  options: {
    allowedMethods?: string[];
    requireAuth?: boolean;
    rateLimited?: boolean;
  } = {}
) {
  const {
    allowedMethods = ["POST"],
    requireAuth = false,
    rateLimited = false
  } = options;

  return async (req: Request): Promise<Response> => {
    try {
      // OPTIONS 요청 처리
      if (req.method === "OPTIONS") {
        return handleOptionsRequest();
      }

      // 메서드 검증
      if (!validateMethod(req, allowedMethods)) {
        return fail("Method not allowed", "METHOD_NOT_ALLOWED", 405);
      }

      // TODO: 인증 검증 (requireAuth가 true인 경우)
      // TODO: 속도 제한 (rateLimited가 true인 경우)

      // 실제 핸들러 실행
      const response = await handler(req);
      
      // 응답에 CORS 헤더 추가
      setCorsHeaders(response.headers);
      
      return response;

    } catch (error) {
      return handleError(error, "Edge Function");
    }
  };
}