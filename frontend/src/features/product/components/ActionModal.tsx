'use client';

import { Button } from '@/features/components/ui/button';
import { Card } from '@/features/components/ui/card';
import { ScaleOnHover, FadeInSection } from '@/features/components/ui/animated-sections';
import { Copy, Edit, X } from 'lucide-react';

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={handleBackdropClick}
    >
      <FadeInSection>
        <Card className="bg-gray-900 border-gray-700 p-6 max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                액션 선택
              </h3>
              <p className="text-sm text-gray-400">
                선택된 상품 {selectedCount}개에 대한 작업을 선택하세요
              </p>
            </div>
            <ScaleOnHover scale={1.1}>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </ScaleOnHover>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <ScaleOnHover scale={1.02}>
              <Button
                onClick={onCopy}
                className="w-full justify-start bg-gray-800 hover:bg-gray-700 border-gray-700 text-white p-4 h-auto"
                variant="outline"
              >
                <Copy className="w-5 h-5 mr-3 text-blue-400" />
                <div className="text-left">
                  <div className="font-medium">링크 복사</div>
                  <div className="text-sm text-gray-400">선택된 상품 링크를 클립보드에 복사</div>
                </div>
              </Button>
            </ScaleOnHover>
            
            <ScaleOnHover scale={1.02}>
              <Button
                onClick={onSeo}
                className="w-full justify-start bg-gray-800 hover:bg-gray-700 border-gray-700 text-white p-4 h-auto"
                variant="outline"
              >
                <Edit className="w-5 h-5 mr-3 text-green-400" />
                <div className="text-left">
                  <div className="font-medium">SEO 글 작성</div>
                  <div className="text-sm text-gray-400">AI가 상품을 분석하여 SEO 최적화 글을 생성</div>
                </div>
              </Button>
            </ScaleOnHover>
          </div>
          
          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <ScaleOnHover scale={1.05}>
              <Button 
                onClick={onClose} 
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                취소
              </Button>
            </ScaleOnHover>
          </div>
        </Card>
      </FadeInSection>
    </div>
  );
} 