/**
 * AI Workflow Edge Function - Modular Version
 * 모듈화된 AI 기반 워크플로우: extractIds → aiProductResearch → seoAgent → wordpressPublisher
 * 
 * @version 2.0.0
 * @author CP9 Team
 */

// @ts-ignore: Deno 모듈 import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// 모듈화된 컴포넌트 import
import { log } from './lib/logger.ts';
import { validateEnvironment } from './lib/environment.ts';
import { testPerplexityConnection } from './nodes/ai-research.ts';
import { executeAIWorkflow } from './workflows/ai-workflow.ts';
import type { 
  AIWorkflowRequest, 
  AIWorkflowResponse,
  EnvironmentConfig 
} from './types/index.ts';

// Deno 환경 타입 선언
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

/**
 * 메인 핸들러
 */
async function handleAIWorkflow(req: Request): Promise<Response> {
  // CORS 헤더 설정
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Content-Type', 'application/json');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // API Key 검증 추가
  const authHeader = req.headers.get('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  const expectedApiKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('EDGE_API_KEY');
  
  if (!apiKey || apiKey !== expectedApiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: '인증 실패',
        message: '유효한 API Key가 필요합니다.'
      }),
      { status: 401, headers }
    );
  }

  try {
    const request: AIWorkflowRequest = await req.json();
    
    if (!request.action) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'action이 필요합니다.',
          message: '유효하지 않은 요청입니다.'
        }),
        { status: 400, headers }
      );
    }

    let response: AIWorkflowResponse;

    switch (request.action) {
      case 'execute':
        response = await executeAIWorkflow(request);
        break;
      case 'test':
        // Perplexity API 연결 테스트 추가
        const config = validateEnvironment();
        const perplexityConnected = config.PERPLEXITY_API_KEY 
          ? await testPerplexityConnection(config.PERPLEXITY_API_KEY)
          : false;
          
        log('info', '테스트 모드 실행', {
          perplexityApiConnected: perplexityConnected,
          hasPerplexityKey: !!config.PERPLEXITY_API_KEY
        });
        
        // 테스트 모드 - 기본 데이터로 실행
        response = await executeAIWorkflow({
          ...request,
          urls: request.urls || ['https://www.coupang.com/vp/products/123456'],
          keyword: request.keyword || '테스트 상품'
        });
        break;
      case 'status':
        response = {
          success: true,
          message: 'AI 워크플로우 서비스가 정상적으로 동작 중입니다.',
          data: {
            threadId: 'status-check',
            workflow: {
              extractIds: { productIds: [], urls: [] },
              aiProductResearch: {
                enrichedData: [],
                researchSummary: {
                  totalProducts: 0,
                  keyword: '',
                  avgPrice: 0,
                  avgRating: 0,
                  rocketDeliveryRate: 0,
                  researchMethod: ''
                }
              },
              seoAgent: {
                title: '',
                content: '',
                keywords: [],
                summary: ''
              },
              wordpressPublisher: {
                postId: '',
                postUrl: '',
                status: ''
              }
            },
            metadata: {
              createdAt: Date.now(),
              updatedAt: Date.now(),
              currentNode: 'status',
              completedNodes: [],
              executionTime: 0
            }
          }
        };
        break;
      default:
        response = {
          success: false,
          error: '지원하지 않는 action입니다.',
          message: 'execute, test, status 중 하나를 선택해주세요.'
        };
    }

    return new Response(
      JSON.stringify(response),
      { status: response.success ? 200 : 400, headers }
    );

  } catch (error) {
    log('error', '요청 처리 실패', { error: String(error) });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        message: '요청 처리 중 오류가 발생했습니다.'
      }),
      { status: 500, headers }
    );
  }
}

// Edge Function 서버 시작
serve(handleAIWorkflow);
