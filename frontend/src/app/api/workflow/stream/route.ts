/**
 * 워크플로우 실시간 상태 스트리밍 API (Server-Sent Events)
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface WorkflowStatusEvent {
  threadId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentNode?: string;
  progress: number;
  completedNodes: string[];
  result?: unknown;
  error?: string;
  estimatedTimeLeft?: number;
}

/**
 * SSE 스트림을 통한 워크플로우 상태 실시간 전송
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get('threadId');

  if (!threadId) {
    return new NextResponse('threadId is required', { status: 400 });
  }

  // SSE 스트림 생성
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // 주기적으로 상태 확인하는 함수
  let isActive = true;
  const pollStatus = async () => {
    while (isActive) {
      try {
        // Edge Function에서 상태 조회
        const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-workflow`;
        
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'status',
            threadId
          }),
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data) {
            const statusEvent: WorkflowStatusEvent = {
              threadId,
              status: result.data.status || 'running',
              currentNode: result.data.currentNode,
              progress: result.data.progress || 0,
              completedNodes: result.data.completedNodes || [],
              result: result.data.result,
              error: result.data.error,
              estimatedTimeLeft: result.data.estimatedTimeLeft
            };

            // SSE 형식으로 데이터 전송
            const sseData = `data: ${JSON.stringify(statusEvent)}\n\n`;
            await writer.write(encoder.encode(sseData));

            // 완료 또는 실패 시 스트림 종료
            if (statusEvent.status === 'completed' || statusEvent.status === 'failed') {
              isActive = false;
              await writer.write(encoder.encode('data: {"type": "close"}\n\n'));
              break;
            }
          }
        } else {
          // 에러 발생 시 에러 이벤트 전송
          const errorEvent = {
            threadId,
            status: 'failed' as const,
            progress: 0,
            completedNodes: [],
            error: '상태 조회 실패'
          };
          
          const sseData = `data: ${JSON.stringify(errorEvent)}\n\n`;
          await writer.write(encoder.encode(sseData));
          isActive = false;
          break;
        }

        // 2초마다 폴링
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('[workflow/stream] 상태 조회 오류:', error);
        
        const errorEvent = {
          threadId,
          status: 'failed' as const,
          progress: 0,
          completedNodes: [],
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        };
        
        const sseData = `data: ${JSON.stringify(errorEvent)}\n\n`;
        await writer.write(encoder.encode(sseData));
        isActive = false;
        break;
      }
    }
    
    // 스트림 종료
    await writer.close();
  };

  // 비동기적으로 폴링 시작
  pollStatus().catch(async (error) => {
    console.error('[workflow/stream] 폴링 오류:', error);
    await writer.close();
  });

  // SSE 헤더와 함께 스트림 반환
  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}