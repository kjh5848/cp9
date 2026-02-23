'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/shared/lib/supabase-config'

interface LoginFormData {
  email: string
  password: string
}

interface AuthFormState {
  isLoading: boolean
  isSignUp: boolean
  message: string
}

interface UseAuthFormReturn {
  // 폼 관련
  register: ReturnType<typeof useForm<LoginFormData>>['register']
  handleSubmit: (e: React.FormEvent) => void
  formState: ReturnType<typeof useForm<LoginFormData>>['formState']
  reset: ReturnType<typeof useForm<LoginFormData>>['reset']
  
  // 인증 상태 관련
  authState: AuthFormState
  
  // 액션 관련
  toggleAuthMode: () => void
  handleGoogleSignIn: () => Promise<void>
  clearMessage: () => void
}

export function useAuthForm(returnTo?: string): UseAuthFormReturn {
  const [authState, setAuthState] = useState<AuthFormState>({
    isLoading: false,
    isSignUp: false,
    message: ''
  })

  const { register, handleSubmit: handleFormSubmit, formState, reset } = useForm<LoginFormData>()

  const toggleAuthMode = () => {
    setAuthState(prev => ({
      ...prev,
      isSignUp: !prev.isSignUp,
      message: ''
    }))
  }

  const clearMessage = () => {
    setAuthState(prev => ({ ...prev, message: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      setAuthState(prev => ({ ...prev, message: '이메일과 비밀번호를 입력해주세요.' }))
      return
    }

    setAuthState(prev => ({ ...prev, isLoading: true, message: '' }))

    try {
      if (authState.isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })

        if (error) throw error

        setAuthState(prev => ({
          ...prev,
          message: '가입 확인 이메일을 확인해주세요.',
          isLoading: false
        }))
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        // 로그인 성공 시 리디렉션
        if (returnTo) {
          window.location.href = returnTo
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '인증 오류가 발생했습니다.'
      setAuthState(prev => ({
        ...prev,
        message: errorMessage,
        isLoading: false
      }))
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, message: '' }))

    try {
      console.log('Google OAuth 시작')
      console.log('- returnTo:', returnTo)
      console.log('- baseUrl:', typeof window !== 'undefined' ? window.location.origin : 'server-side')

      // 동적 베이스 URL 처리 (포트 3000/3001/3002 등 자동 감지)
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'http://localhost:3000'
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${baseUrl}/auth/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      setAuthState(prev => ({ ...prev, message: 'Google 로그인을 진행합니다...', isLoading: false }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google 로그인 오류가 발생했습니다.'
      setAuthState(prev => ({
        ...prev,
        message: errorMessage,
        isLoading: false
      }))
    }
  }

  return {
    register,
    handleSubmit,
    formState,
    reset,
    authState,
    toggleAuthMode,
    handleGoogleSignIn,
    clearMessage
  }
} 