'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/api/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('세션 확인 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext - 인증 상태 변경:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // 로그인 성공 시 아이템 생성 페이지로 리디렉션 (콜백 페이지가 아닌 경우만)
        if (event === 'SIGNED_IN' && session && typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          
          // 로그인 페이지에 있거나 홈페이지에 있다면 아이템 생성 페이지로 이동
          if (currentPath === '/login' || currentPath === '/') {
            console.log('로그인 성공 - 아이템 생성 페이지로 이동');
            setTimeout(() => {
              router.push('/product');
            }, 500);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // signOut을 useCallback으로 최적화
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // 로그아웃 후 홈페이지로 리디렉트
      router.push('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }, [router]);

  const value = {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!session && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 