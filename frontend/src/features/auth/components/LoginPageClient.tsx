'use client'

import { LoginContainer } from './LoginContainer'

/**
 * 로그인 페이지 클라이언트 컴포넌트
 * useSearchParams 등 클라이언트 전용 기능을 사용하는 컴포넌트
 * 
 * @returns JSX.Element
 */
export function LoginPageClient() {
  return <LoginContainer />
}