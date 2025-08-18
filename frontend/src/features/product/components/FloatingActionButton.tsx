'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { AnimatedButton, PulseEffect, GlassCard } from '@/shared/components/advanced-ui';
import { Sparkles, X } from 'lucide-react';

interface FloatingActionButtonProps {
  selectedCount: number;
  loading: boolean;
  onAction: () => void;
  onClearSelection: () => void;
}

/**
 * 전역 플로팅 액션 버튼 컴포넌트
 * React Portal을 사용하여 document.body에 직접 렌더링
 * 
 * @param selectedCount - 선택된 아이템 개수
 * @param loading - 로딩 상태
 * @param onAction - 액션 버튼 클릭 핸들러
 * @param onClearSelection - 선택 해제 핸들러
 */
export default function FloatingActionButton({
  selectedCount,
  loading,
  onAction,
  onClearSelection
}: FloatingActionButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 클라이언트 사이드에서만 렌더링, 선택된 아이템이 있을 때만 표시
  if (!mounted || selectedCount === 0) return null;

  return createPortal(
    <div className={`
      fixed bottom-0 left-0 right-0 z-50
      p-4 md:p-6
      bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent
      backdrop-blur-xl
      transform transition-all duration-500 ease-out
      ${selectedCount > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      pointer-events-none
    `}>
      <div className="pointer-events-auto">
        <div className="max-w-7xl mx-auto flex justify-center">
          <PulseEffect>
            <GlassCard className="p-1 backdrop-blur-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 shadow-2xl">
              <AnimatedButton
                variant="glow"
                size="lg"
                onClick={onAction}
                disabled={loading}
                className="flex items-center gap-3 min-w-[250px] font-semibold text-lg shadow-lg"
              >
                <Sparkles className="w-6 h-6" />
                리서치 시작 ({selectedCount}개 선택됨)
              </AnimatedButton>
            </GlassCard>
          </PulseEffect>
        </div>
        
        {/* 선택 해제 버튼 */}
        <button
          onClick={onClearSelection}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
          title="모두 선택 해제"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>,
    document.body
  );
}