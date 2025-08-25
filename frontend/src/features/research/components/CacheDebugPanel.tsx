'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/shared/ui';
import { useResearchCache } from '../hooks/useResearchCache';

interface CacheStats {
  size: number;
  hitCount: number;
  missCount: number;
  hitRate: string;
  lastCleanup: string;
}

/**
 * 개발 환경에서 캐시 상태를 모니터링하는 디버그 패널
 * 프로덕션에서는 숨김 처리
 */
export function CacheDebugPanel() {
  const { getCacheStats, cleanup, invalidateAll } = useResearchCache();
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 개발 환경에서만 표시
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  // 5초마다 캐시 통계 업데이트
  useEffect(() => {
    if (!isVisible) return;

    const updateStats = () => {
      const currentStats = getCacheStats();
      setStats(currentStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, [isVisible, getCacheStats]);

  if (!isVisible || !stats) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 bg-gray-800 text-white text-sm shadow-lg">
        <div className="mb-2">
          <h3 className="font-semibold text-green-400">캐시 상태</h3>
        </div>
        
        <div className="space-y-1 mb-3">
          <div>크기: {stats.size} 개</div>
          <div>히트: {stats.hitCount} 회</div>
          <div>미스: {stats.missCount} 회</div>
          <div>히트율: {stats.hitRate}</div>
          <div>정리: {stats.lastCleanup}</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={cleanup}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            정리
          </button>
          <button
            onClick={invalidateAll}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            전체삭제
          </button>
        </div>
      </Card>
    </div>
  );
}