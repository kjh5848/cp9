'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import ProductInput from '@/features/product/components/ProductInput';

export default function Home() {
  const { user, loading, signOut } = useAuth();

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
                    placeholder="예: 무선 이어폰"
                    className="w-full"
                  />
                </div>
                <Button className="w-full bg-[#ededed] text-[#171717] hover:bg-white hover:bg-opacity-90 transition-colors">자동 블로그 글 생성</Button>
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
