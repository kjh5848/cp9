'use client'

import { cn } from '@/shared/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative backdrop-blur-xl bg-gray-900/40 border border-gray-800/50 rounded-2xl shadow-2xl',
        'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none',
        'after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-t after:from-black/20 after:to-transparent after:pointer-events-none',
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}