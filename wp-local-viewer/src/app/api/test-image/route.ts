import { NextResponse } from 'next/server';
import { runImagePhase } from '@/app/api/item-research/pipeline/image-phase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const suggestions = body.suggestions || [];
    
    // Mock Context for runImagePhase
    const mockCtx: any = {
      articleType: 'single',
      imageModel: 'web-search', // test web search Option
      trace: {
        span: () => ({
          end: () => {}
        })
      },
      body: {
        productData: {
          productImage: 'https://thumbnail.coupangcdn.com/fallback.jpg',
        }
      }
    };
    
    const results = await runImagePhase(mockCtx, suggestions);
    return NextResponse.json({ success: true, results });
  } catch(error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
