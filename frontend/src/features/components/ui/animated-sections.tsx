'use client'

import React, { useEffect, useState, useRef } from 'react'

interface FadeInSectionProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeInSection({ children, delay = 0, className = '' }: FadeInSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  direction?: 'up' | 'down'
  amplitude?: number
  duration?: number
  className?: string
}

export function FloatingElement({
  children,
  direction = 'up',
  amplitude = 10,
  duration = 3,
  className = ''
}: FloatingElementProps) {
  return (
    <div
      className={`animate-float ${className}`}
      style={{
        animationDuration: `${duration}s`,
        '--float-amplitude': `${direction === 'up' ? -amplitude : amplitude}px`
      } as any}
    >
      {children}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(var(--float-amplitude));
          }
        }
        .animate-float {
          animation: float var(--duration, 3s) ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

interface ScaleOnHoverProps {
  children: React.ReactNode
  scale?: number
  className?: string
}

export function ScaleOnHover({ children, scale = 1.05, className = '' }: ScaleOnHoverProps) {
  return (
    <div
      className={`transition-transform duration-300 ease-out cursor-pointer ${className}`}
      style={{ 
        transform: 'scale(1)',
        transition: 'transform 0.3s ease-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `scale(${scale})`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {children}
    </div>
  )
}

interface StaggeredListProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export function StaggeredList({ children, staggerDelay = 100, className = '' }: StaggeredListProps) {
  // Children을 배열로 변환
  const childrenArray = React.Children.toArray(children)
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(childrenArray.length).fill(false))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          childrenArray.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems(prev => {
                const newState = [...prev]
                newState[index] = true
                return newState
              })
            }, index * staggerDelay)
          })
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [childrenArray.length, staggerDelay])

  return (
    <div ref={ref} className={className}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className={`transition-all duration-700 ease-out ${
            visibleItems[index]
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

interface PulseEffectProps {
  children: React.ReactNode
  intensity?: 'low' | 'medium' | 'high'
  color?: string
  className?: string
}

export function PulseEffect({ 
  children, 
  intensity = 'medium', 
  color = 'blue', 
  className = '' 
}: PulseEffectProps) {
  const intensityMap = {
    low: 'animate-pulse',
    medium: 'animate-pulse',
    high: 'animate-bounce'
  }

  const colorMap = {
    blue: 'shadow-blue-500/50',
    purple: 'shadow-purple-500/50',
    green: 'shadow-green-500/50',
    red: 'shadow-red-500/50'
  }

  return (
    <div className={`${intensityMap[intensity]} drop-shadow-lg ${colorMap[color]} ${className}`}>
      {children}
    </div>
  )
}