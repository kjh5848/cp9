// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Deno 타입 선언 추가
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// ... existing code ...
/** ----- 타입 ----- */
type ResearchPack = {
  itemId: string;
  title?: string;
  priceKRW?: number | null;
  isRocket?: boolean | null;
  features?: string[];
  pros?: string[];
  cons?: string[];
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
};

type SeoDraft = {
  itemId: string;
  meta: { title: string; description: string; slug: string; tags?: string[] };
  markdown: string;
};

type ReqBody = {
  projectId: string;
  itemIds?: string[];
  promptVersion?: string;
  force?: boolean;
  maxWords?: number;           // 선택: 본문 길이 제한(대략)
};

/** ----- 공통 응답/헤더 ----- */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
  "Access-Control-Max-Age": "86400",
  "content-type": "application/json; charset=utf-8",
} as const;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: CORS });

/** ----- ENV & Supabase ----- */
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

/** ----- 서버 진입 ----- */
serve(async (req) => {
  if (req.method === "OPTIONS") return json(null, 204);
  if (req.method !== "POST") return json({ success: false, error: "METHOD_NOT_ALLOWED" }, 405);

  try {
    const body = await safeJson<ReqBody>(req);
    if (!body?.projectId) return json({ success: false, error: "PROJECT_ID_REQUIRED" }, 400);

    const projectId = body.projectId.trim();
    const promptVersion = body.promptVersion || "v1";
    const force = !!body.force;
    const maxWords = clamp(body.maxWords ?? 1100, 400, 2000); // 글 길이 가드(대략)

    // 1) ResearchPack 로드 (필요한 아이템만)
    const itemFilter = Array.isArray(body.itemIds) && body.itemIds.length > 0
      ? body.itemIds
      : null;

    let q = sb.from("research").select("item_id, pack").eq("project_id", projectId);
    if (itemFilter) q = q.in("item_id", itemFilter);

    const { data: packsRows, error: packsErr } = await q;
    if (packsErr) {
      console.error(packsErr);
      return json({ success: false, error: "DB_ERROR", detail: packsErr.message }, 500);
    }
    const packs: ResearchPack[] = (packsRows ?? []).map((r: any) => ({
      ...(r.pack || {}),
      itemId: r.item_id,
    }));
    if (packs.length === 0) return json({ success: false, error: "NO_RESEARCH_PACKS" }, 400);

    // 2) 이미 초안이 있는지 확인 (force=false면 스킵)
    const existingMap = new Map<string, true>();
    if (!force) {
      let dq = sb.from("drafts").select("item_id").eq("project_id", projectId);
      if (itemFilter) dq = dq.in("item_id", itemFilter);
      const { data: drafted } = await dq;
      (drafted ?? []).forEach((d: any) => existingMap.set(d.item_id, true));
    }

    // 3) 생성 루프
    const failed: string[] = [];
    let written = 0;

    for (const pack of packs) {
      if (!force && existingMap.has(pack.itemId)) continue;

      try {
        const draft = await makeDraft(pack, promptVersion, maxWords);

        // 과최적화 간단 후처리 (반복어 정리)
        draft.markdown = deRepeatKeywords(draft.markdown, pack.keywords ?? [], 0.06);

        // 저장 (upsert)
        const { error: upErr } = await sb
          .from("drafts")
          .upsert({
            project_id: projectId,
            item_id: pack.itemId,
            meta: draft.meta,
            markdown: draft.markdown,
            version: promptVersion,
            updated_at: new Date().toISOString(),
          }, { onConflict: "project_id,item_id" });

        if (upErr) throw upErr;
        written++;

      } catch (e) {
        console.error("write failed:", pack.itemId, e);
        failed.push(pack.itemId);
      }
    }

    return json({ success: true, data: { written, failed } });

  } catch (e) {
    console.error(e);
    return json({ success: false, error: "UNEXPECTED_ERROR" }, 500);
  }
});

/** ----- Draft 생성 (OpenAI Chat Completions) ----- */
async function makeDraft(pack: ResearchPack, v: string, maxWords: number): Promise<SeoDraft> {
  // 시스템/유저 메시지 구성
  const sys = [
    "당신은 SEO 카피라이터입니다.",
    "사용자에게는 ResearchPack으로 제공된 사실만 사용하세요.",
    "추정/창작/가격 임의 변경 금지. 없는 정보는 비워두거나 언급하지 마세요.",
    "출력은 반드시 JSON 하나만. 코드펜스/설명문 없이.",
  ].join(" ");

  const user = buildUserPrompt(pack, v, maxWords);

  // Chat Completions 호출 (gpt-4o-mini 예시)
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      temperature: 0.4,
      max_tokens: 1400,
    }),
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    throw new Error(`OpenAI ${resp.status}: ${t}`);
  }

  const json = await resp.json();
  const text: string = json?.choices?.[0]?.message?.content ?? "";
  const out = strictJson(text);

  // 안전 보강 & 기본값
  const meta = {
    title: String(out?.meta?.title ?? pack.metaTitle ?? pack.title ?? pack.itemId).slice(0, 80),
    description: String(out?.meta?.description ?? pack.metaDescription ?? "").slice(0, 160),
    slug: slugify(String(out?.meta?.slug ?? pack.slug ?? pack.title ?? pack.itemId)),
    tags: Array.isArray(out?.meta?.tags) ? out.meta.tags.slice(0, 8) : [],
  };

  let markdown = String(out?.markdown ?? "").trim();
  if (!markdown) {
    markdown = fallbackMarkdown(pack, meta);
  }

  return { itemId: pack.itemId, meta, markdown };
}

/** ----- 프롬프트 빌더 ----- */
function buildUserPrompt(pack: ResearchPack, v: string, maxWords: number) {
  // 섹션 가이드: H1=1, H2/H3 적정, 체크리스트/FAQ 포함
  return [
    `다음 ResearchPack을 기반으로 한국어 SEO 초안을 생성하세요.`,
    `리서치 데이터만 사용하고, 없는 사실은 적지 마세요.`,
    `최대 약 ${maxWords} 단어로, 간결하고 스캐너블하게.`,
    `메타블록 + 마크다운을 아래 JSON 스키마로 출력하세요.`,
    ``,
    `ResearchPack: ${JSON.stringify(pack)}`,
    ``,
    `출력 스키마(반드시 이 JSON 그대로):`,
    `{
      "meta": { "title": string, "description": string, "slug": string, "tags": string[] },
      "markdown": string
    }`,
    ``,
    `마크다운 규칙:`,
    `- H1은 1개: "# {제목}"`,
    `- H2/H3로 섹션 구성 (특징, 장단점, 추천 대상, 사용 팁, FAQ 등)`,
    `- 불릿/체크리스트 적극 활용`,
    `- 과도한 키워드 반복 금지 (자연스럽게)`,
    `- 가격/스펙은 리서치 값이 있을 때만`,
    ``,
    `prompt_version: ${v}`,
  ].join("\n");
}

/** ----- 유틸 ----- */
function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "item";
}

function strictJson(s: string): any {
  const cleaned = s
    .replace(/^\s*```json\s*/i, "")
    .replace(/^\s*```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try { return JSON.parse(cleaned); } catch { return {}; }
}

function fallbackMarkdown(p: ResearchPack, meta: SeoDraft["meta"]): string {
  const f = (arr?: string[]) => (arr && arr.length ? arr.map(x => `- ${x}`).join("\n") : "- (정보 없음)");
  return [
    `# ${meta.title}`,
    ``,
    meta.description ? `> ${meta.description}\n` : "",
    p.priceKRW != null ? `- 예상 가격: ${p.priceKRW.toLocaleString()}원` : "",
    p.isRocket != null ? `- 로켓배송: ${p.isRocket ? "가능" : "불가"}` : "",
    ``,
    `## 주요 특징`,
    f(p.features),
    ``,
    `## 장점`,
    f(p.pros),
    ``,
    `## 단점`,
    f(p.cons),
    ``,
    `## 이런 분께 추천`,
    p.keywords?.length ? `- ${p.keywords.join(", ")}` : "- (정보 없음)",
  ].filter(Boolean).join("\n");
}

function deRepeatKeywords(text: string, kws: string[], maxRatio = 0.06): string {
  if (!kws || kws.length === 0) return text;
  const total = Math.max(text.split(/\s+/).length, 1);
  for (const kw of kws) {
    const re = new RegExp(escapeRegExp(kw), "gi");
    const matches = text.match(re)?.length ?? 0;
    if (matches / total > maxRatio) {
      // 과도하면 일부를 제거(순차적으로 1/3만 남김)
      let kept = 0, target = Math.ceil((total * maxRatio) / Math.max(kw.split(/\s+/).length,1));
      text = text.replace(re, () => (++kept <= target ? kw : ""));
    }
  }
  return text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ");
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function safeJson<T>(req: Request): Promise<T | null> {
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  try {
    const txt = await req.text();
    if (!txt) return null;
    return JSON.parse(txt) as T;
  } catch { return null; }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}