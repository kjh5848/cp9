import { NextRequest, NextResponse } from 'next/server';
import { getFunctionsSupabaseConfig } from '@/shared/lib/supabase-config';

const config = getFunctionsSupabaseConfig();
const WRITE_FUNCTION_URL = `${config.url}/functions/v1/write`;

// POST - SEO 글 생성 요청 (write Edge Function 프록시)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, itemIds, promptVersion = 'v1', force = false, maxWords } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'PROJECT_ID_REQUIRED' },
        { status: 400 }
      );
    }

    // Supabase Edge Function 호출
    const response = await fetch(WRITE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        projectId,
        itemIds,
        promptVersion,
        force,
        maxWords
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Write API proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'PROXY_ERROR' },
      { status: 500 }
    );
  }
}