'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/infrastructure/api/supabase'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/shared/components/custom-ui/input'
import { Label } from '@/shared/components/custom-ui/label'
import { AnimatedButton } from '@/shared/components/advanced-ui'
import { FadeInSection } from '@/shared/components/advanced-ui'

/**
 * 로그인 폼 컴포넌트
 * 이메일/비밀번호 로그인과 구글 OAuth 로그인 제공
 * 
 * @returns JSX.Element
 */
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw error
      }
      
      const returnTo = searchParams.get('returnTo')
      const redirectPath = returnTo || '/product'
      router.push(redirectPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const returnTo = searchParams.get('returnTo')
      
      // localStorage에 저장 (fallback)
      if (returnTo) {
        localStorage.setItem('auth_returnTo', returnTo)
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`,
          queryParams: returnTo ? { returnTo } : undefined,
        }
      })
      
      if (error) {
        throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '구글 로그인에 실패했습니다.')
      // 에러 시 localStorage 정리
      localStorage.removeItem('auth_returnTo')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 이메일/비밀번호 로그인 폼 (비활성화) */}
      <FadeInSection delay={100}>
        <form onSubmit={handleEmailLogin} className="space-y-5 opacity-40 pointer-events-none">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              disabled
              className="bg-gray-800/50 border-gray-700 text-gray-300 placeholder:text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                disabled
                className="bg-gray-800/50 border-gray-700 text-gray-300 placeholder:text-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <AnimatedButton
            type="submit"
            variant="outline"
            size="lg"
            className="w-full opacity-50"
            disabled
          >
            이메일로 로그인 (추후 구현 예정)
          </AnimatedButton>
        </form>
      </FadeInSection>

      {/* 구분선 */}
      <FadeInSection delay={200}>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-gray-900/90 text-gray-400">또는</span>
          </div>
        </div>
      </FadeInSection>

      {/* 구글 로그인 */}
      <FadeInSection delay={300}>
        <AnimatedButton
          variant="glow"
          size="lg"
          className="w-full relative group"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <div className="flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">
              {isLoading ? '로그인 중...' : '구글로 로그인'}
            </span>
          </div>
        </AnimatedButton>
      </FadeInSection>

      {/* 에러 메시지 */}
      {error && (
        <FadeInSection>
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </FadeInSection>
      )}

      {/* 회원가입 링크 */}
      <FadeInSection delay={400}>
        <p className="text-center text-sm text-gray-400">
          계정이 없으신가요?{' '}
          <a href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
            회원가입
          </a>
        </p>
      </FadeInSection>
    </div>
  )
}