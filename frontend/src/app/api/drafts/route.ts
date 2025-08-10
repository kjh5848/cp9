import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// GET - 프로젝트의 초안 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const itemId = searchParams.get('itemId');

  if (!projectId) {
    return NextResponse.json(
      { success: false, error: 'PROJECT_ID_REQUIRED' },
      { status: 400 }
    );
  }

  try {
    let query = supabase
      .from('drafts')
      .select('project_id, item_id, meta, markdown, version, updated_at')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (itemId) {
      query = query.eq('item_id', itemId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Drafts fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'DATABASE_ERROR', detail: error.message },
        { status: 500 }
      );
    }

    const drafts = data?.map(item => ({
      projectId: item.project_id,
      itemId: item.item_id,
      meta: item.meta,
      markdown: item.markdown,
      version: item.version,
      updatedAt: item.updated_at
    })) || [];

    return NextResponse.json({
      success: true,
      data: drafts
    });

  } catch (error) {
    console.error('Drafts API error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}