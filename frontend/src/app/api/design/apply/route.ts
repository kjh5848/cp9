/**
 * 아티클 디자인 테마 재적용 API
 * POST: 기존 글의 HTML에서 <style> 태그를 교체하여 디자인만 변경합니다.
 * 글 본문(HTML body)은 유지하고 CSS만 교체합니다.
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/clients/prisma';
import { buildThemeStyles } from '@/shared/lib/build-theme-styles';

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
