'use client'

import { useAuth } from '@/features/auth/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuth()

  const handleAutoGenerate = async () => {
    // 자동 생성 로직
    console.log('자동 생성 시작')
  }

  const handleViewResult = () => {
    // 결과 보기 로직
    console.log('결과 보기')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          CP9 - AI-Powered Product Research
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI 기술을 활용한 상품 리서치부터 SEO 콘텐츠 생성까지 자동화
        </p>
        
        {user ? (
          <div className="space-y-4">
            <p className="text-lg">안녕하세요, {user.email}님!</p>
            <div className="flex justify-center space-x-4">
              <Link href="/product">
                <Button size="lg">상품 검색 시작</Button>
              </Link>
              <Link href="/research">
                <Button size="lg" variant="outline">리서치 관리</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg">서비스를 이용하려면 로그인해주세요</p>
            <Link href="/login">
              <Button size="lg">로그인</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 상품 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              키워드, 카테고리, URL 기반으로 쿠팡 상품을 검색하고 분석합니다.
            </p>
            <Link href="/product">
              <Button className="w-full">검색 시작</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🤖 AI 리서치</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Perplexity AI를 활용하여 상품에 대한 최신 시장 정보를 수집합니다.
            </p>
            <Link href="/research">
              <Button className="w-full" variant="outline">리서치 보기</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>✍️ SEO 콘텐츠</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              GPT 기반으로 SEO 최적화된 블로그 콘텐츠를 자동 생성합니다.
            </p>
            <Button className="w-full" variant="outline" disabled>
              곧 출시 예정
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
