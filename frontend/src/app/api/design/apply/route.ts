/**
 * 아티클 디자인 테마 재적용 API
 * POST: 기존 글의 HTML에서 <style> 태그를 교체하여 디자인만 변경합니다.
 * 글 본문(HTML body)은 유지하고 CSS만 교체합니다.
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { prisma } from '@/infrastructure/clients/prisma';
import { buildThemeStyles } from '@/shared/lib/build-theme-styles';
import { buildCtaHtml, CtaTemplateData } from '@/app/api/item-research/seo-cta-builder';

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

    // [New] 새 디자인 설정 기반으로 CTA 동적 치환
    let themeConfig: Record<string, any> = {};
    if (themeId) {
      const theme = await prisma.articleTheme.findUnique({ where: { id: themeId } });
      if (!theme) {
        return NextResponse.json({ error: '해당 테마를 찾을 수 없습니다.' }, { status: 404 });
      }
      themeConfig = JSON.parse(theme.config);
    }

    // CTA 생성용 데이터 재구성
    const ctaData: CtaTemplateData = {
      productName: pack.title || pack.itemName || '',
      productImage: pack.productImage || '',
      buyUrl: pack.buyUrl || pack.productUrl || '',
      persona: pack.persona || 'IT',
      productPrice: pack.priceKRW || 0,
      isRocket: pack.isRocket || false,
      itemId: itemId,
      projectId: projectId,
      articleType: pack.articleType || 'single',
      themeCtaConfig: themeConfig.cta, // 새 테마의 CTA 설정 주입
    };

    // 설정된 디자인/테마에 맞춰 새로운 CTA HTML 블록 3개(header, mid, footer) 생성
    const newCtaBlocks = buildCtaHtml(ctaData);

    // Cheerio를 사용하여 HTML 텍스트 내 기존 CTA 뼈대 제거 및 덮어치기
    const $ = cheerio.load(newContent, { xmlMode: false });
    
    // 만약 기존 HTML 안에 cp9-cta 블록들이 존재한다면 각각 새로운 블록으로 치환
    const $headerCta = $('.cp9-cta--header');
    if ($headerCta.length > 0) {
      if (newCtaBlocks.headerHtml.trim()) {
        $headerCta.replaceWith(newCtaBlocks.headerHtml);
      } else {
        $headerCta.remove();
      }
    }

    const $midCta = $('.cp9-cta--mid');
    if ($midCta.length > 0) {
      if (newCtaBlocks.midContentHtml.trim()) {
        $midCta.replaceWith(newCtaBlocks.midContentHtml);
      } else {
        $midCta.remove();
      }
    }

    const $footerCta = $('.cp9-cta--footer');
    if ($footerCta.length > 0) {
      if (newCtaBlocks.footerHtml.trim()) {
        $footerCta.replaceWith(newCtaBlocks.footerHtml);
      } else {
        $footerCta.remove();
      }
    }

    // 치환이 끝난 HTML을 문자열로 변환 (body/html 태그 래퍼 방지 위해 <body> 내부 파싱 사용 시 아래 방식 추천)
    // 최신 cheerio에서는 $("body").html()이 안전
    newContent = $('body').html() || $.html();

    // 새 테마 CSS 주입
    if (themeId && Object.keys(themeConfig).length > 0) {
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
