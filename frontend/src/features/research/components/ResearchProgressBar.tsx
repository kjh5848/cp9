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
    <Card className={`p-4 ${config.bgColor} border ${config.borderColor} mb-6`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <StatusIcon 
            className={`w-5 h-5 ${config.color} ${config.animate ? 'animate-spin' : ''}`} 
          />
          <div>
            <h3 className="font-medium text-white">{config.message}</h3>
            {progressData?.currentItem && (
              <p className="text-sm text-gray-400">현재: {progressData.currentItem}</p>
            )}
          </div>
        </div>
        
        {progressData && (
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {Math.round(percentage)}%
            </div>
            <div className="text-sm text-gray-400">
              {progressData.current} / {progressData.total}
            </div>
          </div>
        )}
      </div>
      
      {/* 진행률 바 */}
      {progressData && (
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ease-out ${
              status === 'completed' ? 'bg-green-500' :
              status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      
      {/* Job ID 표시 (디버그용) */}
      {jobId && (
        <div className="mt-2 text-xs text-gray-500">
          Job ID: {jobId}
        </div>
      )}
    </Card>
  );
}