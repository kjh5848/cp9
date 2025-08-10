'use client';

import { useState } from 'react';
import { ResearchItem, ResearchPack } from '@/shared/types/research';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { 
  Edit, 
  Check, 
  X, 
  FileText, 
  DollarSign, 
  Truck,
  Star,
  AlertTriangle,
  Tag
} from 'lucide-react';

interface ResearchCardProps {
  research: ResearchItem;
  onUpdate: (itemId: string, pack: ResearchPack) => Promise<void>;
  onGenerateSEO: (itemId: string) => void;
  hasDraft?: boolean;
}

export function ResearchCard({ research, onUpdate, onGenerateSEO, hasDraft }: ResearchCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editPack, setEditPack] = useState<ResearchPack>(research.pack);

  const handleSave = async () => {
    await onUpdate(research.itemId, editPack);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditPack(research.pack);
    setIsEditing(false);
  };

  const formatPrice = (price?: number | null) => {
    if (!price) return '가격 정보 없음';
    return `${price.toLocaleString()}원`;
  };

  if (isEditing) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">리서치 정보 편집</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={!editPack.title?.trim()}>
              <Check className="w-4 h-4 mr-1" />
              저장
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              취소
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 제목 */}
          <div>
            <label className="text-sm font-medium">제품 제목</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-md"
              value={editPack.title || ''}
              onChange={(e) => setEditPack(prev => ({ ...prev, title: e.target.value }))}
              placeholder="제품 제목을 입력하세요"
            />
          </div>

          {/* 가격 & 로켓배송 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">가격 (원)</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded-md"
                value={editPack.priceKRW || ''}
                onChange={(e) => setEditPack(prev => ({ 
                  ...prev, 
                  priceKRW: e.target.value ? Number(e.target.value) : null 
                }))}
                placeholder="가격을 입력하세요"
              />
            </div>
            <div>
              <label className="text-sm font-medium">로켓배송</label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={editPack.isRocket === null ? '' : editPack.isRocket ? 'true' : 'false'}
                onChange={(e) => setEditPack(prev => ({ 
                  ...prev, 
                  isRocket: e.target.value === '' ? null : e.target.value === 'true'
                }))}
              >
                <option value="">선택 안함</option>
                <option value="true">가능</option>
                <option value="false">불가능</option>
              </select>
            </div>
          </div>

          {/* 특징 */}
          <div>
            <label className="text-sm font-medium">주요 특징 (한 줄씩 입력)</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-md h-20"
              value={editPack.features?.join('\n') || ''}
              onChange={(e) => setEditPack(prev => ({ 
                ...prev, 
                features: e.target.value.split('\n').filter(f => f.trim())
              }))}
              placeholder="특징을 한 줄씩 입력하세요"
            />
          </div>

          {/* 장점 */}
          <div>
            <label className="text-sm font-medium">장점</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-md h-20"
              value={editPack.pros?.join('\n') || ''}
              onChange={(e) => setEditPack(prev => ({ 
                ...prev, 
                pros: e.target.value.split('\n').filter(p => p.trim())
              }))}
              placeholder="장점을 한 줄씩 입력하세요"
            />
          </div>

          {/* 단점 */}
          <div>
            <label className="text-sm font-medium">단점</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-md h-20"
              value={editPack.cons?.join('\n') || ''}
              onChange={(e) => setEditPack(prev => ({ 
                ...prev, 
                cons: e.target.value.split('\n').filter(c => c.trim())
              }))}
              placeholder="단점을 한 줄씩 입력하세요"
            />
          </div>

          {/* 키워드 */}
          <div>
            <label className="text-sm font-medium">키워드 (쉼표로 구분)</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-md"
              value={editPack.keywords?.join(', ') || ''}
              onChange={(e) => setEditPack(prev => ({ 
                ...prev, 
                keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
              }))}
              placeholder="키워드를 쉼표로 구분하여 입력하세요"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">{research.pack.title || research.itemId}</CardTitle>
          {hasDraft && <Badge variant="secondary">초안 생성됨</Badge>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-1" />
            수정
          </Button>
          <Button 
            size="sm" 
            onClick={() => onGenerateSEO(research.itemId)}
            disabled={!research.pack.title}
          >
            <FileText className="w-4 h-4 mr-1" />
            SEO 글 생성
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">{formatPrice(research.pack.priceKRW)}</span>
          </div>
          {research.pack.isRocket !== null && (
            <div className="flex items-center gap-2">
              <Truck className={`w-4 h-4 ${research.pack.isRocket ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-sm">
                로켓배송 {research.pack.isRocket ? '가능' : '불가능'}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* 특징 */}
        {research.pack.features && research.pack.features.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              주요 특징
            </h4>
            <ul className="text-sm space-y-1">
              {research.pack.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 장점 */}
        {research.pack.pros && research.pack.pros.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium mb-2 text-green-600">
              <Check className="w-4 h-4" />
              장점
            </h4>
            <ul className="text-sm space-y-1">
              {research.pack.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">+</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 단점 */}
        {research.pack.cons && research.pack.cons.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium mb-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              단점
            </h4>
            <ul className="text-sm space-y-1">
              {research.pack.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">-</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 키워드 */}
        {research.pack.keywords && research.pack.keywords.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
              <Tag className="w-4 h-4 text-purple-500" />
              키워드
            </h4>
            <div className="flex flex-wrap gap-1">
              {research.pack.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 메타 정보 */}
        <div className="pt-2 text-xs text-gray-500">
          <div>아이템 ID: {research.itemId}</div>
          <div>업데이트: {new Date(research.updatedAt).toLocaleString('ko-KR')}</div>
        </div>
      </CardContent>
    </Card>
  );
}