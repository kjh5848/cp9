'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { useWorkflow } from '@/features/workflow/hooks/useWorkflow'

interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  onCopy: () => void
  onSeo: () => void
  selectedCount: number
}

export default function ActionModal({ 
  isOpen, 
  onClose, 
  onCopy, 
  onSeo, 
  selectedCount 
}: ActionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center">
            선택된 {selectedCount}개 상품에 대한 작업
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600 mb-4">
            어떤 작업을 수행하시겠습니까?
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={onCopy} 
              className="w-full"
              variant="outline"
            >
              📋 링크 복사
            </Button>
            
            <Button 
              onClick={onSeo} 
              className="w-full"
            >
              리서치 & SEO 글 작성 (AI 분석)
            </Button>
          </div>
          
          <Button 
            onClick={onClose} 
            variant="ghost" 
            className="w-full"
          >
            취소
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 