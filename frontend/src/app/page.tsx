'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useWorkflow } from "@/features/workflow";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { WorkflowProgress } from "@/features/workflow";

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const { 
    workflowStatus, 
    executeWorkflow, 
    resetWorkflow, 
    isLoading,
    isRealtimeEnabled,
    toggleRealtimeUpdates 
  } = useWorkflow();
  const [keyword, setKeyword] = useState('');

  // 원클릭 블로그 생성 함수
  const handleAutoGenerate = async () => {
    if (!keyword.trim()) {
      alert('키워드를 입력해주세요');
      return;
    }

    try {
      await executeWorkflow({
        keyword: keyword.trim(),
        config: {
          enablePerplexity: true,
          enableWordPress: true,
          maxProducts: 5
        }
      });
    } catch (error) {
      console.error('워크플로우 실행 오류:', error);
    }
  };

  // 결과 보기 함수
  const handleViewResult = () => {
    if (workflowStatus.result?.workflow.wordpressPublisher?.postUrl) {
      window.open(workflowStatus.result.workflow.wordpressPublisher.postUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-stretch px-2 py-6">
        <section className="w-full max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            쿠팡 파트너스 자동 블로그 SaaS
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            키워드만 입력하면 쿠팡 상품 검색부터 워드프레스 초안까지 원-클릭으로
            완성
          </p>

          {/* Keyword Input Form */}
          {user ? (
            <Card className="max-w-md mx-auto mb-8 hover:bg-white hover:bg-opacity-90 hover:shadow-md transition-colors bg-white text-[#171717]">
              <CardHeader>
                <CardTitle className="text-lg">키워드 입력</CardTitle>
                <CardDescription>검색할 키워드를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyword">키워드</Label>
                  <Input
                    id="keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="예: 무선 이어폰"
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  onClick={handleAutoGenerate}
                  disabled={isLoading || !keyword.trim()}
                  className="w-full bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? '생성 중...' : '자동 블로그 글 생성'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-md mx-auto mb-8 hover:bg-white hover:bg-opacity-90 hover:shadow-md transition-colors bg-white text-[#171717]">
              <CardHeader>
                <CardTitle className="text-lg">로그인이 필요합니다</CardTitle>
                <CardDescription>
                  CP9를 사용하려면 먼저 로그인해주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login">
                  <Button className="w-full bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors">로그인하고 시작하기</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* 워크플로우 진행 상황 */}
          <WorkflowProgress 
            status={workflowStatus}
            onReset={resetWorkflow}
            onViewResult={handleViewResult}
            isRealtimeEnabled={isRealtimeEnabled}
            onToggleRealtime={toggleRealtimeUpdates}
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Button size="lg" className="bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors">내 블로그 글 보기</Button>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg" className="bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors">무료로 시작하기</Button>
                </Link>
                <Button variant="outline" size="lg" className="bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors">데모 보기</Button>
              </>
            )}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:bg-white hover:bg-opacity-90 hover:shadow-md transition-colors bg-white text-[#171717]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔍 스마트 상품 검색
                </CardTitle>
                <CardDescription>
                  키워드 입력 시 쿠팡 상품을 자동으로 검색하고 최적화합니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:bg-white hover:bg-opacity-90 hover:shadow-md transition-colors bg-white text-[#171717]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 AI 컨텐츠 생성
                </CardTitle>
                <CardDescription>
                  LLM을 활용한 고품질 블로그 컨텐츠 자동 생성 기능입니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:bg-white hover:bg-opacity-90 hover:shadow-md transition-colors bg-white text-[#171717]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📝 자동 발행
                </CardTitle>
                <CardDescription>
                  워드프레스 등 다양한 플랫폼에 자동으로 포스팅합니다.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-6 px-6 py-8 bg-white border-t border-gray-200">
        <a
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          href="https://nextjs.org/learn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          문서
        </a>
        <a
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          GitHub
        </a>
      </footer>
    </div>
  );
}
