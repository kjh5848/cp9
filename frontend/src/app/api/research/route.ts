export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDBSupabaseConfig } from '@/shared/lib/supabase-config';

const config = getDBSupabaseConfig();
config.url = config.url || 'https://placeholder.supabase.co';
config.serviceRoleKey = config.serviceRoleKey || 'placeholder';
const supabase = createClient(config.url, config.serviceRoleKey, {
  auth: { persistSession: false }
});

// GET - 프로젝트의 리서치 데이터 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const itemId = searchParams.get('itemId');

  // if (!projectId) {
  //   return NextResponse.json(
  //     { success: false, error: 'PROJECT_ID_REQUIRED' },
  //     { status: 400 }
  //   );
  // }

  if (config.url === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Supabase URL이 누락되어 Mock 리서치 데이터를 반환합니다.');
    return NextResponse.json({
      success: true,
      data: [{
        projectId: projectId,
        itemId: itemId || 'mock_item_01',
        pack: {
          title: "Mock 상품 리서치 결과",
          content: "# 테스트 상품 분석\n이 데이터는 Supabase 연동이 되지 않아 제공되는 임시 조회 결과입니다.",
          thumbnailPrompt: "Mock Thumbnail",
          thumbnailUrl: null,
          researchRaw: "[Mock Raw Data]"
        },
        updatedAt: new Date().toISOString()
      }]
    });
  }

  try {
    let query = supabase
      .from('research')
      .select('project_id, item_id, pack, updated_at')
      .order('updated_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (itemId) {
      query = query.eq('item_id', itemId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Research fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'DATABASE_ERROR', detail: error.message },
        { status: 500 }
      );
    }

    const research = data?.map(item => ({
      projectId: item.project_id,
      itemId: item.item_id,
      pack: item.pack,
      updatedAt: item.updated_at
    })) || [];

    return NextResponse.json({
      success: true,
      data: research
    });

  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// PUT - 리서치 데이터 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, itemId, pack } = body;

    if (!projectId || !itemId || !pack) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    if (config.url === 'https://placeholder.supabase.co') {
      console.warn('⚠️ Supabase URL이 누락되어 데이터베이스 업데이트를 스킵합니다.');
      return NextResponse.json({
        success: true,
        message: 'Mock update successful (Skipped DB Update)'
      });
    }

    const { error } = await supabase
      .from('research')
      .update({
        pack,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .eq('item_id', itemId);

    if (error) {
      console.error('Research update error:', error);
      return NextResponse.json(
        { success: false, error: 'UPDATE_FAILED', detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Research updated successfully'
    });

  } catch (error) {
    console.error('Research update API error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
