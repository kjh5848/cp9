'use client';

import { useState, useEffect } from 'react';
import { useResearch } from '@/features/research/hooks/useResearch';
import { ResearchCard } from '@/features/research/components/ResearchCard';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Loader2, Search, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ResearchPage() {
  const [projectId, setProjectId] = useState('');
  const [drafts, setDrafts] = useState<Set<string>>(new Set());
  const { research, loading, error, fetchResearch, updateResearch, generateSEO, refreshResearch } = useResearch();

  // 초안 존재 여부 확인
  const fetchDrafts = async (projectId: string) => {
    try {
      const response = await fetch(`/api/drafts?projectId=${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        const draftItemIds = result.data.map((draft: any) => draft.itemId);
        setDrafts(new Set(draftItemIds));
      }
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
    }
  };

  const handleSearch = async () => {
    if (!projectId.trim()) {
      toast.error('프로젝트 ID를 입력해주세요');
      return;
    }
    
    await fetchResearch(projectId.trim());
    await fetchDrafts(projectId.trim());
  };

  const handleRefresh = async () => {
    if (!projectId.trim()) return;
    await refreshResearch();
    await fetchDrafts(projectId.trim());
  };

  const handleGenerateSEO = async (itemId: string) => {
    if (!projectId.trim()) return;

    const result = await generateSEO({
      projectId: projectId.trim(),
      itemIds: [itemId],
      force: false
    });

    if (result?.success) {
      // 초안 목록 새로고침
      await fetchDrafts(projectId.trim());
    }
  };

  const handleGenerateAllSEO = async () => {
    if (!projectId.trim() || research.length === 0) return;

    const result = await generateSEO({
      projectId: projectId.trim(),
      force: false
    });

    if (result?.success) {
      await fetchDrafts(projectId.trim());
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">리서치 결과 관리</h1>
        <p className="text-gray-600 mb-6">
          프로젝트의 리서치 결과를 확인하고 편집한 후 SEO 글 생성을 요청할 수 있습니다.
        </p>

        {/* 프로젝트 검색 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              프로젝트 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="프로젝트 ID를 입력하세요 (예: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee)"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                검색
              </Button>
              {research.length > 0 && (
                <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  새로고침
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 일괄 작업 */}
        {research.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>일괄 작업</span>
                <span className="text-sm font-normal text-gray-500">
                  총 {research.length}개 아이템, {drafts.size}개 초안 생성됨
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={handleGenerateAllSEO} disabled={loading}>
                  <FileText className="w-4 h-4 mr-2" />
                  전체 SEO 글 생성
                </Button>
                <Button 
                  variant="outline"
                  onClick={async () => {
                    const result = await generateSEO({
                      projectId: projectId.trim(),
                      force: true
                    });
                    if (result?.success) {
                      await fetchDrafts(projectId.trim());
                    }
                  }}
                  disabled={loading}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  전체 SEO 글 재생성 (강제)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 에러 표시 */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">오류: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>리서치 데이터를 불러오는 중...</span>
        </div>
      )}

      {/* 리서치 결과 없음 */}
      {!loading && research.length === 0 && projectId && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">해당 프로젝트의 리서치 결과를 찾을 수 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">
              먼저 상품 검색을 실행하여 리서치 데이터를 생성해주세요.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 리서치 카드 목록 */}
      <div className="space-y-6">
        {research.map((item) => (
          <ResearchCard
            key={item.itemId}
            research={item}
            onUpdate={async (itemId, pack) => {
              await updateResearch(projectId, itemId, pack);
            }}
            onGenerateSEO={handleGenerateSEO}
            hasDraft={drafts.has(item.itemId)}
          />
        ))}
      </div>
    </div>
  );
}