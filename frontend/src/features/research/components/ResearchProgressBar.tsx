'use client';

import { Card } from '@/shared/ui';
import { AlertCircle, CheckCircle, Clock, Loader2, Activity, Zap, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const [isAnimated, setIsAnimated] = useState(false);
  const [showCircular, setShowCircular] = useState(false);
  
  useEffect(() => {
    setIsAnimated(true);
  }, []);

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
  
  // Calculate circular progress values
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`mb-6 transition-all duration-1000 transform ${
      isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      {/* Glass morphism card with enhanced effects */}
      <div className={`relative overflow-hidden rounded-2xl ${config.bgColor} backdrop-blur-xl border ${config.borderColor} shadow-2xl`}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 animate-pulse" />
        
        <div className="relative p-6">
        {/* Enhanced header section with toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Animated icon with glow effect */}
            <div className="relative">
              {status === 'in_progress' && (
                <div className="absolute inset-0 bg-blue-500/50 rounded-full blur-xl animate-pulse" />
              )}
              <div className={`relative p-3 rounded-full ${config.bgColor} border ${config.borderColor} backdrop-blur-sm transition-all duration-300 hover:scale-110`}>
                <StatusIcon 
                  className={`w-6 h-6 ${config.color} ${config.animate ? 'animate-spin' : ''}`} 
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {config.message}
                {status === 'in_progress' && (
                  <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                )}
              </h3>
              {progressData?.currentItem && (
                <p className="text-sm text-gray-300 mt-1">
                  <span className="inline-flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    현재 처리 중: <span className="font-medium text-blue-300">{progressData.currentItem}</span>
                  </span>
                </p>
              )}
            </div>
          </div>
          
          {/* Toggle between linear and circular progress */}
          {progressData && (
            <div className="flex items-center gap-4">
              {/* Progress display toggle button */}
              <button
                onClick={() => setShowCircular(!showCircular)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                title={showCircular ? '리니어 보기' : '원형 보기'}
              >
                {showCircular ? <Zap className="w-4 h-4 text-yellow-400" /> : <Target className="w-4 h-4 text-blue-400" />}
              </button>
              
              {/* Progress display */}
              <div className="text-right">
                {showCircular ? (
                  /* Circular progress indicator */
                  <div className="relative w-24 h-24">
                    <svg className="transform -rotate-90 w-24 h-24">
                      {/* Background circle */}
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700/50"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${config.color} transition-all duration-700 ease-out`}
                      />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl font-bold ${config.color}`}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Linear percentage display */
                  <div>
                    <div className={`text-3xl font-bold ${config.color}`}>
                      {Math.round(percentage)}%
                    </div>
                    <div className="text-sm text-gray-400">
                      {progressData.current} / {progressData.total}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced multi-step progress bar */}
        {progressData && (
          <div className="space-y-3">
            {/* Stepped progress indicators */}
            <div className="flex items-center justify-between mb-2">
              {Array.from({ length: Math.min(progressData.total, 5) }, (_, i) => {
                const stepPercentage = (100 / progressData.total) * (i + 1);
                const isCompleted = percentage >= stepPercentage;
                const isActive = percentage >= stepPercentage - (100 / progressData.total) && percentage < stepPercentage;
                
                return (
                  <div key={i} className="flex items-center flex-1">
                    {/* Step indicator */}
                    <div className="relative">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                        transition-all duration-500 transform
                        ${
                          isCompleted ? 'bg-gradient-to-r from-green-500 to-green-400 text-white scale-110' :
                          isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-pulse scale-105' :
                          'bg-gray-700/50 text-gray-500'
                        }
                      `}>
                        {isCompleted ? '✓' : i + 1}
                      </div>
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-blue-500/50 animate-ping" />
                      )}
                    </div>
                    
                    {/* Connector line */}
                    {i < Math.min(progressData.total - 1, 4) && (
                      <div className="flex-1 h-1 mx-2 bg-gray-700/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ease-out ${
                            isCompleted ? 'bg-gradient-to-r from-green-500 to-green-400' :
                            isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                            'bg-transparent'
                          }`}
                          style={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Enhanced linear progress bar with shimmer effect */}
            <div className="relative w-full bg-gray-700/30 rounded-full h-4 overflow-hidden border border-gray-600/30 backdrop-blur-sm">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="h-full w-full bg-repeating-linear-gradient" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
                }} />
              </div>
              
              {/* Gradient progress bar */}
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                  status === 'completed' ? 'bg-gradient-to-r from-green-500 via-green-400 to-emerald-400' :
                  status === 'failed' ? 'bg-gradient-to-r from-red-500 via-red-400 to-orange-400' : 
                  'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                {/* Shimmer effect for active progress */}
                {status === 'in_progress' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer" />
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-sm animate-pulse" />
                  </>
                )}
              </div>
              
              {/* Percentage text overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white/80 drop-shadow-lg">
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
            
            {/* Enhanced progress details with animation */}
            <div className="flex justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                시작
              </span>
              <span className="flex items-center gap-2">
                {status === 'in_progress' && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
                <span className="font-medium text-blue-300">{progressData.current}</span>
                <span className="text-gray-500">/</span>
                <span className="font-medium">{progressData.total}</span>
                처리
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3 text-gray-500" />
                목표
              </span>
            </div>
          </div>
        )}
        
        {/* Enhanced footer with micro-interactions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-600/30">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            {status === 'in_progress' && (
              <>
                <Clock className="w-3 h-3 text-blue-400 animate-pulse" />
                <span>예상 완료: 약 2-3분</span>
              </>
            )}
            {status === 'completed' && (
              <>
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-green-400">모든 리서치가 성공적으로 완료되었습니다 ✨</span>
              </>
            )}
            {status === 'failed' && (
              <>
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-400">일부 항목에서 오류가 발생했습니다</span>
              </>
            )}
            {status === 'pending' && (
              <>
                <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                <span>곧 리서치가 시작됩니다</span>
              </>
            )}
          </div>
          {jobId && (
            <div className="group relative">
              <div className="text-xs text-gray-500 font-mono bg-gradient-to-r from-gray-800/50 to-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600/30 backdrop-blur-sm transition-all duration-200 hover:border-gray-500/50">
                <span className="opacity-50">ID:</span> <span className="text-gray-400">{jobId.slice(-8)}</span>
              </div>
              {/* Hover tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                전체 ID: {jobId}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      
      {/* Add shimmer animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}