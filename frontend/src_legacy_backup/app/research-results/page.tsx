'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { 
  Loader2, 
  FileText, 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  CheckCircle2
} from 'lucide-react';
import { ResearchPack } from '@/shared/types/api';
import { toast } from 'react-hot-toast';

export default function ResearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<ResearchPack[]>([]);
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingSEO, setGeneratingSEO] = useState<Set<string>>(new Set());
  const [generatingAll, setGeneratingAll] = useState(false);

  useEffect(() => {
    const resultsParam = searchParams.get('results');
    const projectParam = searchParams.get('projectId');
    
    if (resultsParam && projectParam) {
      try {
        const parsedResults = JSON.parse(decodeURIComponent(resultsParam));
        setResults(parsedResults);
        setProjectId(projectParam);
      } catch (error) {
        console.error('결과 파싱 오류:', error);
        toast.error('결과 데이터를 불러올 수 없습니다');
        router.push('/product');
      }
    } else {
      router.push('/product');
    }
    
    setLoading(false);
  }, [searchParams, router]);

  const handleGenerateSEO = async (itemId: string) => {
    setGeneratingSEO(prev => new Set(prev).add(itemId));
    try {
      const response = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          itemIds: [itemId],
          force: false
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('SEO 글이 성공적으로 생성되었습니다!');
      } else {
        toast.error(result.error || 'SEO 글 생성에 실패했습니다');
      }
    } catch (error) {
      console.error('SEO 글 생성 오류:', error);
      toast.error('SEO 글 생성 중 오류가 발생했습니다');
    } finally {
      setGeneratingSEO(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleGenerateAllSEO = async () => {
    setGeneratingAll(true);
    try {
      const allItemIds = results.map(result => result.itemId);
      const response = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          itemIds: allItemIds,
          force: false
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`전체 SEO 글이 성공적으로 생성되었습니다! (${allItemIds.length}개 항목)`);
      } else {
        toast.error(result.error || '전체 SEO 글 생성에 실패했습니다');
      }
    } catch (error) {
      console.error('전체 SEO 글 생성 오류:', error);
      toast.error('전체 SEO 글 생성 중 오류가 발생했습니다');
    } finally {
      setGeneratingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">리서치 결과가 없습니다</h1>
          <Button onClick={() => router.push('/product')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            아이템 생성으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/product')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              아이템 생성으로 돌아가기
            </Button>
            <div>
              <h1 className="text-3xl font-bold">AI 리서치 완료 🎉</h1>
              <p className="text-gray-600 mt-1">
                {results.length}개 상품의 AI 분석이 완료되었습니다. 결과를 확인하고 SEO 글을 생성하세요.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => window.open(`/research?projectId=${projectId}`, '_blank')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            관리 페이지에서 편집
          </Button>
        </div>

        {/* 일괄 작업 */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  일괄 SEO 글 생성
                </h3>
                <p className="text-gray-600">
                  모든 리서치 결과에 대해 한 번에 SEO 최적화된 블로그 글을 생성합니다.
                </p>
              </div>
              <Button 
                onClick={handleGenerateAllSEO}
                disabled={generatingAll}
                size="lg"
                className="ml-4"
              >
                {generatingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                전체 SEO 글 생성 ({results.length}개)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 리서치 결과 목록 */}
      <div className="space-y-8">
        {results.map((result, index) => (
          <Card key={result.itemId} className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                      #{index + 1}
                    </Badge>
                    <CardTitle className="text-xl">{result.title}</CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    {result.priceKRW && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {result.priceKRW.toLocaleString()}원
                      </Badge>
                    )}
                    {result.isRocket && (
                      <Badge className="bg-orange-500 hover:bg-orange-600">
                        🚀 로켓배송
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={() => handleGenerateSEO(result.itemId)}
                  disabled={generatingSEO.has(result.itemId)}
                  size="lg"
                >
                  {generatingSEO.has(result.itemId) ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  SEO 글 생성
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* 상품 개요 */}
              {result.metaDescription && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    상품 개요
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {result.metaDescription}
                  </p>
                </div>
              )}

              <Separator />

              {/* 2열 레이아웃 */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* 왼쪽 열 */}
                <div className="space-y-6">
                  {/* 주요 기능 */}
                  {result.features && result.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        주요 기능
                      </h4>
                      <div className="space-y-2">
                        {result.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 관련 키워드 */}
                  {result.keywords && result.keywords.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        관련 키워드
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            #{keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 오른쪽 열 */}
                <div className="space-y-6">
                  {/* 주요 장점 */}
                  {result.pros && result.pros.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        주요 장점
                      </h4>
                      <div className="space-y-2">
                        {result.pros.map((pro, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span className="text-gray-700">{pro}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 단점 */}
                  {result.cons && result.cons.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-red-500" />
                        주의사항
                      </h4>
                      <div className="space-y-2">
                        {result.cons.map((con, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">⚠</span>
                            <span className="text-gray-700">{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 하단 메타 정보 */}
              <Separator />
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid sm:grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">SEO 제목:</span> {result.metaTitle}
                  </div>
                  <div>
                    <span className="font-medium">URL 슬러그:</span> {result.slug}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 하단 액션 */}
      <div className="mt-12 text-center space-y-4">
        <p className="text-gray-600">
          리서치 결과가 만족스럽지 않으신가요?
        </p>
        <div className="flex justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push('/product')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            새로운 리서치 시작
          </Button>
          <Button 
            onClick={() => window.open(`/research?projectId=${projectId}`, '_blank')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            상세 관리 페이지
          </Button>
        </div>
      </div>
    </div>
  );
}