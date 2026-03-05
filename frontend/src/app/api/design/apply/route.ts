/**
 * 아티클 디자인 테마 재적용 API
 * POST: 기존 글의 HTML에서 <style> 태그를 교체하여 디자인만 변경합니다.
 * 글 본문(HTML body)은 유지하고 CSS만 교체합니다.
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildThemeStyles(themeConfig: Record<string, any>): string {
  const h = themeConfig.heading || {};
  const b = themeConfig.bold || {};
  const bq = themeConfig.blockquote || {};
  const li = themeConfig.list || {};
  const tb = themeConfig.table || {};
  const cta = themeConfig.cta || {};
  const art = themeConfig.article || {};

  const css = `
/* CP9 아티클 테마 CSS */
.entry-content, .post-content, article {
  font-family: ${art.fontFamily || "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"};
  line-height: ${art.lineHeight || '1.8'};
  color: ${art.textColor || '#334155'};
  ${art.bgColor && art.bgColor !== 'transparent' ? `background-color: ${art.bgColor};` : ''}
}

/* 대제목 H2 */
.entry-content h2, .post-content h2, article h2 {
  color: ${h.h2Color || '#1a1a2e'};
  font-size: ${h.h2FontSize || '24px'};
  font-weight: 700;
  border-left: 4px solid ${h.h2BorderColor || '#2563eb'};
  padding-left: 12px;
  margin: 32px 0 16px;
  line-height: 1.4;
}

/* 소제목 H3 */
.entry-content h3, .post-content h3, article h3 {
  color: ${h.h3Color || '#1e293b'};
  font-size: ${h.h3FontSize || '20px'};
  font-weight: 600;
  border-bottom: 2px solid ${h.h3BorderColor || '#3b82f6'};
  padding-bottom: 8px;
  margin: 28px 0 12px;
  line-height: 1.4;
}

/* 볼드 강조 */
.entry-content strong, .post-content strong, article strong {
  color: ${b.color || '#1e293b'};
  font-weight: 700;
}

/* 인용구 */
.entry-content blockquote, .post-content blockquote, article blockquote {
  border-left: 4px solid ${bq.borderColor || '#2563eb'} !important;
  background-color: ${bq.bgColor || '#eff6ff'};
  color: ${bq.textColor || '#1e40af'};
  padding: 16px 20px;
  border-radius: 0 8px 8px 0;
  margin: 20px 0;
  font-style: italic;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
}

/* 목록 */
.entry-content ul, .post-content ul, article ul {
  padding-left: 20px;
}
.entry-content ul li::marker, .post-content ul li::marker, article ul li::marker {
  color: ${li.markerColor || '#2563eb'};
}
.entry-content ol li::marker, .post-content ol li::marker, article ol li::marker {
  color: ${li.markerColor || '#2563eb'};
  font-weight: 600;
}

/* 테이블 */
.entry-content table, .post-content table, article table {
  border-collapse: collapse;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${tb.borderColor || '#e2e8f0'};
}
.entry-content th, .post-content th, article th {
  background-color: ${tb.headerBg || '#1e293b'};
  color: ${tb.headerColor || '#fff'};
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
}
.entry-content td, .post-content td, article td {
  padding: 10px 14px;
  border-top: 1px solid ${tb.borderColor || '#e2e8f0'};
  font-size: 13px;
}
.entry-content tr:nth-child(even), .post-content tr:nth-child(even), article tr:nth-child(even) {
  background-color: ${tb.stripeBg || '#f8fafc'};
}

/* CTA 버튼 오버라이드 */
.cp9-cta__button {
  background: ${cta.buttonColor || '#2563eb'} !important;
  color: ${cta.buttonTextColor || '#fff'} !important;
  border-radius: ${cta.buttonRadius || '12px'} !important;
}
.cp9-cta__button--large {
  background: ${cta.buttonColor || '#2563eb'} !important;
  color: ${cta.buttonTextColor || '#fff'} !important;
  border-radius: ${cta.buttonRadius || '12px'} !important;
}
.cp9-cta__button--mid {
  background: ${cta.buttonColor || '#2563eb'} !important;
  color: ${cta.buttonTextColor || '#fff'} !important;
  border-radius: ${cta.buttonRadius || '12px'} !important;
}

/* 구분선 */
.entry-content hr, .post-content hr, article hr {
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
  margin: 32px 0;
}

/* 이미지 캡션 */
.entry-content figcaption, .post-content figcaption, article figcaption {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
  margin-top: 8px;
}
`.trim();

  return `<style type="text/css">\n${css}\n</style>\n`;
}

/**
 * 기존 HTML에서 <style> 태그를 제거합니다.
 */
function removeExistingStyleTags(html: string): string {
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>\s*/gi, '');
}

/**
 * POST: 기존 글에 새 테마를 적용합니다.
 * - themeId가 있으면 해당 테마 CSS 적용
 * - themeId가 null이면 스타일 태그 제거 (기본 스타일)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, itemId, themeId } = body;

    if (!projectId || !itemId) {
      return NextResponse.json({ error: 'projectId와 itemId는 필수입니다.' }, { status: 400 });
    }

    // 기존 리서치 데이터 조회
    const research = await prisma.research.findUnique({
      where: { projectId_itemId: { projectId, itemId } },
    });

    if (!research) {
      return NextResponse.json({ error: '해당 글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pack = JSON.parse(research.pack as string) as Record<string, any>;

    if (!pack.content) {
      return NextResponse.json({ error: '콘텐츠가 없는 글입니다.' }, { status: 400 });
    }

    // 기존 style 태그 제거
    let newContent = removeExistingStyleTags(pack.content);

    // 새 테마 CSS 주입
    if (themeId) {
      const theme = await prisma.articleTheme.findUnique({ where: { id: themeId } });
      if (!theme) {
        return NextResponse.json({ error: '해당 테마를 찾을 수 없습니다.' }, { status: 404 });
      }
      const themeConfig = JSON.parse(theme.config);
      const styleTag = buildThemeStyles(themeConfig);
      newContent = styleTag + newContent;
    }
    // themeId가 null이면 스타일 태그 없이 저장 (기본 스타일)

    // pack 업데이트
    pack.content = newContent;
    pack.appliedThemeId = themeId || null;

    await prisma.research.update({
      where: { projectId_itemId: { projectId, itemId } },
      data: { pack: JSON.stringify(pack) },
    });

    return NextResponse.json({
      success: true,
      themeId: themeId || null,
      contentLength: newContent.length,
    });
  } catch (error) {
    console.error('[Design Apply API] POST 에러:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
