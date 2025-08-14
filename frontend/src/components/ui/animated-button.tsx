'use client'

import { cn } from '@/shared/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'gradient' | 'outline' | 'glow'
  size?: 'sm' | 'md' | 'lg'
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = 'default', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl overflow-hidden group'
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg'
    }

    const variantStyles = {
      default: cn(
        'bg-gray-800 text-white border border-gray-700',
        'hover:bg-gray-700 hover:border-gray-600',
        'active:scale-95'
      ),
      gradient: cn(
        'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
        'hover:from-blue-600 hover:to-purple-700',
        'active:scale-95',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0',
        'hover:before:opacity-100 before:transition-opacity'
      ),
      outline: cn(
        'bg-transparent text-white border-2 border-gray-600',
        'hover:bg-gray-800/50 hover:border-gray-500',
        'active:scale-95'
      ),
      glow: cn(
        'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
        'shadow-lg shadow-blue-500/25',
        'hover:shadow-xl hover:shadow-purple-500/30',
        'active:scale-95'
      )
    }

    const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none'

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          disabled && disabledStyles,
          className
        )}
        disabled={disabled}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}
      </button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'