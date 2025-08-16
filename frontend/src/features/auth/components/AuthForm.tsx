'use client';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useAuthForm } from '../hooks';

/**
 * 인증 폼 컴포넌트 (로그인/회원가입)
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
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    authState: { isLoading, isSignUp, message },
    toggleAuthMode,
    handleGoogleSignIn,
  } = useAuthForm();

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          {isSignUp ? '회원가입' : '로그인'}
        </CardTitle>
        <CardDescription>
          {isSignUp 
            ? '새 계정을 만들어 CP9를 시작하세요.' 
            : '이메일과 비밀번호로 로그인하세요.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              {...register('email', {
                required: '이메일을 입력해주세요.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: '유효한 이메일 형식이 아닙니다.',
                },
              })}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              {...register('password', {
                required: '비밀번호를 입력해주세요.',
                minLength: {
                  value: 6,
                  message: '비밀번호는 최소 6자 이상이어야 합니다.',
                },
                pattern: {
                  value: /(?=.*[a-zA-Z])/,
                  message: '비밀번호는 최소 1개의 영문자를 포함해야 합니다.',
                },
              })}
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting 
              ? '처리 중...' 
              : isSignUp 
                ? '회원가입' 
                : '로그인'
            }
          </Button>
        </form>
        
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            구글로 로그인
          </Button>
        </div>

        <div className="mt-4 text-center text-sm">
          {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
          <Button
            variant="link"
            className="ml-1 p-0 h-auto"
            onClick={toggleAuthMode}
            disabled={isLoading}
          >
            {isSignUp ? '로그인' : '회원가입'}
          </Button>
        </div>

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