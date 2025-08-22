'use client'

import { cn } from '@/shared/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'light'
}

export function GlassCard({ children, className, variant = 'default' }: GlassCardProps) {
  const baseClasses = 'relative backdrop-blur-xl rounded-2xl shadow-2xl'
  
  const variantClasses = {
    default: cn(
      'bg-gray-900/40 border border-gray-800/50',
      'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none',
      'after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-t after:from-black/20 after:to-transparent after:pointer-events-none'
    ),
    light: cn(
      'bg-white/15 border border-white/25',
      'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none',
      'after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-t after:from-white/5 after:to-transparent after:pointer-events-none'
    )
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}