'use client'

import { LoginCard } from '@/components/auth/LoginCard'
import { GradientBackground } from '@/components/ui/gradient-background'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <GradientBackground />
      <div className="relative z-10 w-full max-w-md">
        <LoginCard />
      </div>
    </div>
  );
} 