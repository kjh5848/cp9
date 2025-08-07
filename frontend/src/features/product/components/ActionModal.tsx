'use client';

import { Button } from '@/shared/ui/button';
import { useWorkflow } from '@/features/workflow/hooks/useWorkflow';

/**
 * 액션 선택 모달 컴포넌트
 * 선택된 상품에 대한 액션(링크 복사, SEO 글 작성)을 선택할 수 있는 모달
 * 
 * @param isOpen - 모달 열림 상태
 * @param onClose - 모달 닫기 핸들러
 * @param onCopy - 링크 복사 핸들러
 * @param onSeo - SEO 글 작성 핸들러
 * @param selectedCount - 선택된 상품 개수
 * @returns JSX.Element
 * 
 * @example
 * ```tsx
 * <ActionModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onCopy={handleCopyLinks}
 *   onSeo={handleGenerateSeo}
 *   selectedCount={selected.length}
 * />
 * ```
 */
interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: () => void;
  onSeo: () => void;
  selectedCount: number;
}

export default function ActionModal({ 
  isOpen, 
  onClose, 
  onCopy, 
  onSeo, 
  selectedCount 
}: ActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          선택된 상품 ({selectedCount}개)에 대한 액션을 선택하세요
        </h3>
        
        <div className="space-y-3">
          <Button
            onClick={onCopy}
            className="w-full justify-start"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            링크 복사
          </Button>
          
          <Button
            onClick={onSeo}
            className="w-full justify-start"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            SEO 글 작성 (AI 분석)
          </Button>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="ghost">
            취소
          </Button>
        </div>
      </div>
    </div>
  );
} 