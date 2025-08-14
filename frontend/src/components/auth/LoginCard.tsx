'use client'

import { LoginForm } from './LoginForm'
import { GlassCard } from '@/components/ui/glass-card'
import { Sparkles } from 'lucide-react'

export function LoginCard() {
  return (
    <GlassCard className="w-full max-w-md mx-auto">
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">AI-Powered Product Research Platform</p>
        </div>
        
        <LoginForm />
      </div>
    </GlassCard>
  )
}