// _shared/response.ts
import { corsHeaders } from "./cors.ts";

const baseHeaders: HeadersInit = {
  ...corsHeaders,
  "content-type": "application/json; charset=utf-8", // 한글 깨짐 방지
};

export function ok<T>(data: T, init?: ResponseInit): Response {
  return new Response(
    JSON.stringify({ success: true, data }),
    { status: init?.status ?? 200, headers: { ...baseHeaders, ...(init?.headers || {}) } }
  );
}

export function fail(message: string, code?: string, status = 400, extra?: Record<string, unknown>): Response {
  const body: Record<string, unknown> = { success: false, error: message };
  if (code) body.code = code;
  if (extra) Object.assign(body, extra);

  return new Response(
    JSON.stringify(body),
    { status, headers: baseHeaders }
  );
}
