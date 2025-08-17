'use client';

import { Button } from '@/shared/components/custom-ui/button';
import { Input } from '@/shared/components/custom-ui/input';
import { Label } from '@/shared/components/custom-ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/custom-ui/card';
import { useAuthForm } from '../hooks';

/**
 * 인증 폼 컴포넌트 (구글 OAuth 로그인)
 * 
 * @returns JSX.Element
 * 
 * @example
 * ```tsx
 * <AuthForm />
 * ```
 */
export default function AuthForm() {
  const {
    authState: { isLoading, message },
    handleGoogleSignIn,
  } = useAuthForm();

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          로그인
        </CardTitle>
        <CardDescription>
          구글 계정으로 CP9에 로그인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 이메일/비밀번호 로그인 폼 (비활성화) */}
        <div className="space-y-4 opacity-50 pointer-events-none">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              disabled
            />
          </div>
          
          <Button 
            type="button" 
            className="w-full" 
            disabled
          >
            이메일로 로그인 (추후 구현 예정)
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">또는</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : '구글로 로그인'}
        </Button>

        {message && (
          <div className={`mt-4 text-center text-sm ${
            message.includes('성공') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 