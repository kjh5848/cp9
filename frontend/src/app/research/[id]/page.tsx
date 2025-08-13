'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Textarea } from '@/shared/ui/textarea';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { ResearchPack } from '@/shared/types/research';
import { ArrowLeft, Save, Package, TrendingUp, FileText, Search, AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [research, setResearch] = useState<ResearchPack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedResearch, setEditedResearch] = useState<ResearchPack | null>(null);

  useEffect(() => {
    fetchResearch();
  }, [id]);

  const fetchResearch = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/research/${id}`);
      if (!response.ok) throw new Error('Failed to fetch research');
      
      const data = await response.json();
      setResearch(data);
      setEditedResearch(data);
    } catch (error) {
      console.error('Error fetching research:', error);
      toast.error('리서치 데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedResearch) return;
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/research/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedResearch),
      });

      if (!response.ok) throw new Error('Failed to update research');
      
      const updated = await response.json();
      setResearch(updated);
      toast.success('리서치 데이터가 저장되었습니다');
    } catch (error) {
      console.error('Error saving research:', error);
      toast.error('저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof ResearchPack, value: any) => {
    if (!editedResearch) return;
    setEditedResearch({ ...editedResearch, [field]: value });
  };

  const addArrayItem = (field: 'features' | 'pros' | 'cons' | 'keywords', value: string) => {
    if (!editedResearch || !value.trim()) return;
    const current = editedResearch[field] || [];
    updateField(field, [...current, value.trim()]);
  };

  const removeArrayItem = (field: 'features' | 'pros' | 'cons' | 'keywords', index: number) => {
    if (!editedResearch) return;
    const current = editedResearch[field] || [];
    updateField(field, current.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">리서치 데이터 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!research || !editedResearch) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-center text-muted-foreground">리서치 데이터를 찾을 수 없습니다</p>
              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => router.push('/research')}
              >
                리서치 목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/research')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{editedResearch.title || '제목 없음'}</h1>
            <p className="text-sm text-muted-foreground">ID: {editedResearch.itemId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditedResearch(research)}
            disabled={isSaving}
          >
            원본으로 복원
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[100px]"
          >
            {isSaving ? (
              <>저장 중...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">제품명</Label>
                <Input
                  id="title"
                  value={editedResearch.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="제품명을 입력하세요"
                />
              </div>
              
              <div>
                <Label htmlFor="price">가격 (원)</Label>
                <Input
                  id="price"
                  type="number"
                  value={editedResearch.priceKRW || ''}
                  onChange={(e) => updateField('priceKRW', parseInt(e.target.value) || null)}
                  placeholder="가격을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL 슬러그</Label>
                <Input
                  id="slug"
                  value={editedResearch.slug || ''}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="url-slug"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRocket"
                  checked={editedResearch.isRocket || false}
                  onChange={(e) => updateField('isRocket', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isRocket" className="cursor-pointer">
                  로켓배송 상품
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* SEO Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">메타 제목</Label>
                <Input
                  id="metaTitle"
                  value={editedResearch.metaTitle || ''}
                  onChange={(e) => updateField('metaTitle', e.target.value)}
                  placeholder="SEO 제목"
                />
              </div>
              
              <div>
                <Label htmlFor="metaDescription">메타 설명</Label>
                <Textarea
                  id="metaDescription"
                  value={editedResearch.metaDescription || ''}
                  onChange={(e) => updateField('metaDescription', e.target.value)}
                  placeholder="SEO 설명"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                상세 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="features" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="features">주요 특징</TabsTrigger>
                  <TabsTrigger value="pros">장점</TabsTrigger>
                  <TabsTrigger value="cons">단점</TabsTrigger>
                  <TabsTrigger value="keywords">키워드</TabsTrigger>
                </TabsList>

                <TabsContent value="features" className="space-y-4">
                  <div className="space-y-2">
                    {editedResearch.features?.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="flex-1">{feature}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('features', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="새 특징 추가"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addArrayItem('features', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                          addArrayItem('features', input.value);
                          input.value = '';
                        }}
                      >
                        추가
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pros" className="space-y-4">
                  <div className="space-y-2">
                    {editedResearch.pros?.map((pro, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="flex-1">{pro}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('pros', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="새 장점 추가"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addArrayItem('pros', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                          addArrayItem('pros', input.value);
                          input.value = '';
                        }}
                      >
                        추가
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cons" className="space-y-4">
                  <div className="space-y-2">
                    {editedResearch.cons?.map((con, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="flex-1">{con}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('cons', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="새 단점 추가"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addArrayItem('cons', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                          addArrayItem('cons', input.value);
                          input.value = '';
                        }}
                      >
                        추가
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="keywords" className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {editedResearch.keywords?.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {keyword}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-4 w-4 p-0"
                          onClick={() => removeArrayItem('keywords', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="새 키워드 추가"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('keywords', (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                        addArrayItem('keywords', input.value);
                        input.value = '';
                      }}
                    >
                      추가
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}