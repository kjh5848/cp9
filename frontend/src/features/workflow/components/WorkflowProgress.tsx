'use client';

import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { WorkflowStatus } from '../hooks/useWorkflow';

interface WorkflowProgressProps {
  status: WorkflowStatus;
  onReset?: () => void;
  onViewResult?: () => void;
  isRealtimeEnabled?: boolean;
  onToggleRealtime?: (enabled: boolean) => void;
}

/**
 * 워크플로우 진행 상황 표시 컴포넌트
 */
export default function WorkflowProgress({ 
  status, 
  onReset, 
  onViewResult,
  isRealtimeEnabled = true,
  onToggleRealtime
}: WorkflowProgressProps) {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '📋';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'pending':
        return '워크플로우 준비 중...';
      case 'running':
        return `진행 중: ${status.currentNode || '알 수 없음'}`;
      case 'completed':
        return '워크플로우 완료!';
      case 'failed':
        return '워크플로우 실패';
      default:
        return '대기 중';
    }
  };

  const getProgressBarColor = () => {
    switch (status.status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  // 노드별 한글 이름 매핑
  const nodeNames: Record<string, string> = {
    'coupangProductSearch': '쿠팡 상품 검색',
    'extractIds': '상품 ID 추출',
    'aiProductResearch': 'AI 상품 조사',
    'seoAgent': 'SEO 콘텐츠 생성',
    'wordpressPublisher': 'WordPress 발행'
  };

  if (status.status === 'idle') {
    return null;
  }

  return (
    <Card className="p-6 mt-4">
      <div className="space-y-4">
        {/* 상태 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getStatusIcon()}</span>
            <h3 className="text-lg font-semibold">{getStatusText()}</h3>
            {isRealtimeEnabled && (status.status === 'running' || status.status === 'pending') && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                실시간
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {status.threadId && (
              <span className="text-sm text-gray-500">
                ID: {status.threadId.slice(-8)}
              </span>
            )}
            {onToggleRealtime && (
              <button
                onClick={() => onToggleRealtime(!isRealtimeEnabled)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isRealtimeEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isRealtimeEnabled ? '실시간 ON' : '실시간 OFF'}
              </button>
            )}
          </div>
        </div>

        {/* 진행 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ width: `${status.progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            진행률: {status.progress}%
            {status.currentNode && status.status === 'running' && (
              <span className="ml-2 font-medium text-blue-600">
                현재: {nodeNames[status.currentNode] || status.currentNode}
              </span>
            )}
          </span>
          {status.estimatedTimeLeft && status.estimatedTimeLeft > 0 && (
            <span className="text-gray-500">
              예상 남은 시간: {Math.ceil(status.estimatedTimeLeft / 1000)}초
            </span>
          )}
        </div>

        {/* 완료된 노드들 */}
        {status.completedNodes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">완료된 단계:</h4>
            <div className="grid grid-cols-2 gap-2">
              {status.completedNodes.map((node, index) => (
                <div
                  key={node}
                  className="flex items-center gap-2 text-sm text-green-600"
                >
                  <span>✓</span>
                  <span>{nodeNames[node] || node}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">
              <strong>오류:</strong> {status.error}
            </p>
          </div>
        )}

        {/* 성공 결과 */}
        {status.status === 'completed' && status.result && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm mb-2">
              <strong>완료!</strong> 모든 단계가 성공적으로 완료되었습니다.
            </p>
            
            {/* 결과 요약 */}
            <div className="space-y-1 text-sm text-gray-600">
              {status.result.workflow.coupangProductSearch && (
                <div>
                  🔍 쿠팡 검색: {status.result.workflow.coupangProductSearch.totalFound}개 중 {status.result.workflow.coupangProductSearch.selectedProducts.length}개 랜덤 선택
                </div>
              )}
              {status.result.workflow.extractIds && status.result.workflow.extractIds.productIds.length > 0 && (
                <div>
                  🆔 상품 ID: {status.result.workflow.extractIds.productIds.length}개 추출
                </div>
              )}
              {status.result.workflow.aiProductResearch && (
                <div>
                  🤖 AI 조사: {status.result.workflow.aiProductResearch.enrichedData.length}개 상품 분석 완료
                </div>
              )}
              {status.result.workflow.seoAgent && (
                <div>
                  📝 SEO 글: "{status.result.workflow.seoAgent.title}" 생성 완료
                </div>
              )}
              {status.result.workflow.wordpressPublisher && (
                <div>
                  📰 WordPress: {status.result.workflow.wordpressPublisher.status === 'published' ? '발행 완료' : '발행 실패'}
                  {status.result.workflow.wordpressPublisher.postUrl && (
                    <a 
                      href={status.result.workflow.wordpressPublisher.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      글 보기 →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex gap-2 pt-2">
          {status.status === 'completed' && onViewResult && (
            <Button onClick={onViewResult} className="flex-1">
              결과 보기
            </Button>
          )}
          
          {(status.status === 'completed' || status.status === 'failed') && onReset && (
            <Button 
              onClick={onReset} 
              variant="outline"
              className={status.status === 'completed' ? '' : 'flex-1'}
            >
              다시 시작
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}