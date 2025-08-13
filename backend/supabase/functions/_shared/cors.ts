// _shared/cors.ts
export const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*", // 운영 시 도메인 화이트리스트 권장
  "Access-Control-Allow-Headers": "authorization, x-client-version, content-type, accept-charset",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8",
};
