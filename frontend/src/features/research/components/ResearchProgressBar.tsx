'use client';

import { Card } from '@/shared/ui';
import { AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';

interface ResearchProgressBarProps {
  status: string;
  progressData: {
    current: number;
    total: number;
    percentage: number;
    currentItem?: string;
  } | null;
  jobId?: string | null;
  estimatedTime?: string;
}

/**
 * 리서치 진행률 표시 컴포넌트
 * WebSocket으로 실시간 업데이트되는 진행 상황 표시
 */
export default function ResearchProgressBar({ 
  status, 
  progressData, 
  jobId 
}: ResearchProgressBarProps) {
  if (!jobId && status === 'pending') {
    // job_id가 없고 대기 상태면 표시하지 않음
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          message: '리서치 시작 대기 중...'
        };
      case 'in_progress':
        return {
          icon: Loader2,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          message: '리서치 진행 중...',
          animate: true
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          message: '리서치 완료!'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          message: '리서치 실패'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          message: '상태 확인 중...'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;
  const percentage = progressData?.percentage || 0;

  return (
    <div className="mb-6">
      <Card className={`p-6 ${config.bgColor} border ${config.borderColor} backdrop-blur-sm shadow-lg`}>
        {/* 헤더 섹션 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* 아이콘과 상태 메시지 */}
            <div className={`p-3 rounded-full ${config.bgColor} border ${config.borderColor}`}>
              <StatusIcon 
                className={`w-6 h-6 ${config.color} ${config.animate ? 'animate-spin' : ''}`} 
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{config.message}</h3>
              {progressData?.currentItem && (
                <p className="text-sm text-gray-300 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    현재 처리 중: <span className="font-medium">{progressData.currentItem}</span>
                  </span>
                </p>
              )}
            </div>
          </div>
          
          {/* 진행률 표시 */}
          {progressData && (
            <div className="text-right">
              <div className={`text-2xl font-bold ${config.color}`}>
                {Math.round(percentage)}%
              </div>
              <div className="text-sm text-gray-400">
                {progressData.current} / {progressData.total} 완료
              </div>
            </div>
          )}
        </div>
        
        {/* 고급 진행률 바 */}
        {progressData && (
          <div className="space-y-2">
            {/* 진행률 바 배경 */}
            <div className="relative w-full bg-gray-700/50 rounded-full h-3 overflow-hidden border border-gray-600/30">
              {/* 그라디언트 진행률 바 */}
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                  status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                  status === 'failed' ? 'bg-gradient-to-r from-red-500 to-red-400' : 
                  'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                {/* 진행률 바 애니메이션 효과 */}
                {status === 'in_progress' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                )}
              </div>
            </div>
            
            {/* 진행률 세부 정보 */}
            <div className="flex justify-between text-xs text-gray-400">
              <span>시작</span>
              <span className="flex items-center gap-1">
                {status === 'in_progress' && (
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></span>
                )}
                {progressData.current}개 처리됨
              </span>
              <span>{progressData.total}개 목표</span>
            </div>
          </div>
        )}
        
        {/* 추가 정보 및 Job ID */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-600/30">
          <div className="text-xs text-gray-400">
            {status === 'in_progress' && '예상 완료 시간: 약 2-3분'}
            {status === 'completed' && '✨ 모든 리서치가 성공적으로 완료되었습니다'}
            {status === 'failed' && '⚠️ 일부 항목에서 오류가 발생했습니다'}
            {status === 'pending' && '🚀 곧 리서치가 시작됩니다'}
          </div>
          {jobId && (
            <div className="text-xs text-gray-500 font-mono bg-gray-800/50 px-2 py-1 rounded">
              ID: {jobId.slice(-8)}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}