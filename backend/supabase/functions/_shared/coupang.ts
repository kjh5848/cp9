// _shared/coupang.ts
// 쿠팡 파트너스 Open API 호출 유틸 (HMAC 서명 + 요청 조립)

import { fail } from "./response.ts";

/** 환경변수 키: Supabase Edge Functions의 .env(.local)에서 주입 */
const ACCESS_KEY = Deno.env.get("COUPANG_ACCESS_KEY") ?? "";
const SECRET_KEY = Deno.env.get("COUPANG_SECRET_KEY") ?? "";

/** 왜
 *  쿠팡 파트너스는 Authorization 헤더에 들어갈 signed-date를 UTC yymmdd'T'HHmmss'Z' 포맷으로 요구한다.
 *  파라미터 없음, 반환값은 헤더에 바로 넣을 문자열.
 */
export function utcSignedDate(): string {
  // 예: 250810T03:12:45Z  (UTC 기준)
  const d = new Date();
  const utc = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yy = utc.getUTCFullYear().toString().slice(-2);
  const MM = pad(utc.getUTCMonth() + 1);
  const dd = pad(utc.getUTCDate());
  const HH = pad(utc.getUTCHours());
  const mm = pad(utc.getUTCMinutes());
  const ss = pad(utc.getUTCSeconds());
  return `${yy}${MM}${dd}T${HH}${mm}${ss}Z`;
}

/** 왜
 *  문서 규칙: message = signedDate + method + path + query
 *  query는 '?' 없이 원시 쿼리스트링 그대로. (문서 예시 준수)
 * 파라미터
 *  - method: "GET" | "POST" ...
 *  - path:   "/v2/providers/affiliate_open_api/apis/openapi/products/search" (도메인 제외)
 *  - query:  "keyword=무선+청소기&limit=30" (없으면 빈 문자열)
 * 리턴
 *  - Authorization 헤더 값 (CEA ...)
 */
export async function createAuthorization(
  method: string,
  path: string,
  query: string,
  signedDate?: string,
): Promise<string> {
  if (!ACCESS_KEY || !SECRET_KEY) {
    throw new Error("COUPANG keys are not configured");
  }
  const dt = signedDate ?? utcSignedDate();
  const message = `${dt}${method}${path}${query ?? ""}`;

  const algo = "HmacSHA256";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  const signature = [...new Uint8Array(sigBytes)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `CEA algorithm=${algo},access-key=${ACCESS_KEY},signed-date=${dt},signature=${signature}`;
}

/** 왜
 *  쿼리스트링을 "빌드한 그대로" 서명과 실제 요청에 동일 적용하려고 별도 함수로 고정한다.
 * 파라미터
 *  - params: 레코드 형태의 키/값. undefined/null은 제외.
 * 동작
 *  - URLSearchParams에 순서대로 넣어 encode한다. (우리가 만든 순서를 서명·요청 둘 다에 재사용)
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.append(k, String(v));
  }
  // URLSearchParams는 삽입 순서를 보존한다. 이 순서를 기준으로 서명/요청을 동일화.
  return sp.toString(); // 예: "keyword=%EB%AC%B4%EC%84%A0&limit=30"
}

/** 왜
 *  실제 GET 호출을 공통화. (베이스/패스/쿼리 → Authorization 생성 → fetch)
 * 파라미터
 *  - base: "https://api-gateway.coupang.com"
 *  - path: "/v2/providers/affiliate_open_api/apis/openapi/products/search"
 *  - query: "keyword=...&limit=..."
 * 리턴
 *  - fetch Response(JSON은 호출부에서 파싱)
 */
export async function signedGet(base: string, path: string, query: string): Promise<Response> {
  if (!ACCESS_KEY || !SECRET_KEY) {
    return fail("COUPANG_API_KEY_MISSING", "UNAUTHORIZED", 401) as unknown as Response;
  }
  const auth = await createAuthorization("GET", path, query);
  const url = `${base}${path}?${query}`;
  return fetch(url, {
    method: "GET",
    headers: {
      "Authorization": auth,
      "Content-Type": "application/json",
    },
  });
}