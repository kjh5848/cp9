import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { gptModel } from '@/infrastructure/clients/openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, itemIds, persona = 'IT', actionType = 'NOW', scheduledAt } = body;

    if (!projectId || !itemIds || itemIds.length === 0) {
      return NextResponse.json({ success: false, error: 'projectId and itemIds are required' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase client is not initialized' }, { status: 500 });
    }

    let successCount = 0;

    for (const itemId of itemIds) {
      // 1. 기존 리서치 데이터 조회
      const { data: existingItem, error: fetchError } = await supabase
        .from('ResearchItem')
        .select('*')
        .eq('projectId', projectId)
        .eq('itemId', itemId)
        .single();

      if (fetchError || !existingItem) {
        console.warn(`[WriteAPI] ResearchItem not found: ${itemId}`);
        continue;
      }

      const pack = existingItem.pack;
      const researchRaw = pack.researchRaw || `[Mock] ${pack.title} 리서치 데이터 부재`;

      if (actionType === 'SCHEDULE') {
        // [To-Do] 스케줄링 DB 테이블 및 백그라운드 큐 로직 필요 (현재는 상태값만 PENDING 표시용 업데이트 로그)
        console.log(`⏰ [WriteAPI] ${itemId}가 ${scheduledAt}에 예약되었습니다. (Persona: ${persona})`);
        successCount++;
        continue;
      }

      // 2. GPT 프롬프트 생성 (페르소나 및 티스토리 블로그 양식 적용)
      const personaInstructions: Record<string, string> = {
        'IT': 'IT 전문 블로거로서 스펙, 벤치마크, 기술적 장단점을 전문적이고 날카로운 시각으로 분석하세요.',
        'BEAUTY': '뷰티/패션 인플루언서로서 감성적인 어조, 트렌드, 색감과 질감을 강조하며 독자와 소통하듯 작성하세요.',
        'LIVING': '리빙 전문 크리에이터로서 실생활 활용도, 인테리어 조화, 가성비를 따뜻하고 친근한 말투로 리뷰하세요.',
        'HUNTER': '할인/가성비 제품 사냥꾼으로서 파격적인 가격 혜택, 단점조차 무마하는 가성비를 강조하여 구매 욕구를 자극하세요.'
      };

      const systemPrompt = `
당신은 최고의 티스토리(Tistory) 블로그 포스팅 전문가입니다.
다음의 지침을 완벽하게 따라 블로그 본문을 Markdown 포맷으로 작성하세요:

[블로그 작성 지침]
1. 글 구성 (서론 - 본론 - 결론 분리):
   - 서론: 독자의 이목을 끄는 도입부.
   - 본론: 제품의 핵심 특징, 장단점 비교, 리서치 내용 기반 상세 분석. (소제목 적극 활용)
   - 결론: 최종 평가 및 추천 대상 요약.
2. 가독성:
   - 적절한 인용구(Blockquote), 리스트(Bullet/Numbers), 강조(Bold)를 활용하세요.
3. 페르소나 및 톤앤매너:
   - ${personaInstructions[persona] || personaInstructions['IT']}
`;

      const userPrompt = `
[대상 상품]: ${pack.title}
[리서치 Raw Data]:
${researchRaw}

위 데이터를 바탕으로 SEO 최적화된 블로그 포스팅을 작성해 주세요. 제목은 H1 (#) 태그로 하나만 작성하고, 하위 구조는 H2 (##), H3 (###)를 사용하여 완성하세요.
`;

      console.log(`✍️ [WriteAPI] GPT SEO 글쓰기 시작 (Persona: ${persona}) - ${pack.title}`);
      
      let seoContent = '';
      try {
        const aiResponse = await gptModel.invoke(`${systemPrompt}\n\n${userPrompt}`);
        seoContent = aiResponse.content.toString();
      } catch (err) {
        console.error(`[WriteAPI] GPT API 호출 실패:`, err);
        seoContent = `# ${pack.title} 작성 실패\n\nAPI 오류로 글 생성을 실패했습니다.`;
      }

      // 3. DB 업데이트
      const updatedPack = {
        ...pack,
        content: seoContent
      };

      const { error: updateError } = await supabase
        .from('ResearchItem')
        .update({
          pack: updatedPack,
          updatedAt: new Date().toISOString()
        })
        .eq('projectId', projectId)
        .eq('itemId', itemId);

      if (updateError) {
        console.error(`[WriteAPI] Failed to update DB for ${itemId}:`, updateError);
      } else {
        successCount++;
        console.log(`✅ [WriteAPI] GPT 블로그 작성 완료 - ${itemId}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        written: successCount,
        actionType,
        persona
      }
    });

  } catch (error) {
    console.error('Write API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
