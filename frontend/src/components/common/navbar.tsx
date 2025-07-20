'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import { useAuth } from '@/features/auth/contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src="/next.svg" alt="CP9 Logo" width={40} height={40} className="dark:invert" />
        </Link>
        <Link href="/">
          <h1 className="text-lg font-bold text-gray-900">CP9</h1>
        </Link>
      </div>
      <nav className="flex items-center gap-4">
        <Link href="/product">
          <Button variant="outline">아이템 생성</Button>
        </Link>
        {user ? (
          <>
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" onClick={signOut}>로그아웃</Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="outline">로그인</Button>
          </Link>
        )}
      </nav>
    </header>
  );
}