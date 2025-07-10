import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Image
            src="/next.svg"
            alt="CP9 Logo"
            width={40}
            height={40}
            className="dark:invert"
          />
          <h1 className="text-lg font-bold text-gray-900">CP9</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="outline">로그인</Button>
          <Button>시작하기</Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            쿠팡 파트너스 자동 블로그 SaaS
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            키워드만 입력하면 쿠팡 상품 검색부터 워드프레스 초안까지 원-클릭으로 완성
          </p>
          
          {/* Keyword Input Form */}
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="text-lg">키워드 입력</CardTitle>
              <CardDescription>
                검색할 키워드를 입력하세요
              </CardDescription>
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
              <Button className="w-full">
                자동 블로그 글 생성
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg">
              무료로 시작하기
            </Button>
            <Button variant="outline" size="lg">
              데모 보기
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔍 스마트 상품 검색
                </CardTitle>
                <CardDescription>
                  키워드 입력 시 쿠팡 상품을 자동으로 검색하고 최적화합니다.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 AI 컨텐츠 생성
                </CardTitle>
                <CardDescription>
                  LLM을 활용한 고품질 블로그 컨텐츠 자동 생성 기능입니다.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
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
        </div>
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
